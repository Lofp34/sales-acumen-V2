import { put } from "@vercel/blob";
import { and, eq } from "drizzle-orm";
import { db } from "../../db.js";
import {
  companies,
  documents,
  participants,
  trainingParticipants,
  trainings,
} from "../../schema.js";

function requireText(value: unknown, label: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Champ requis: ${label}`);
  }
  return value.trim();
}

function sanitizeFileName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function splitParticipants(raw: string) {
  return raw
    .replace(/,/g, "\n")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts.slice(-1)[0],
  };
}

function resolvePdfServiceUrl() {
  const base = process.env.PDF_SERVICE_CONVENTION_URL;
  if (!base) {
    throw new Error("Missing PDF_SERVICE_CONVENTION_URL.");
  }
  if (base.endsWith("/api/generate")) {
    return base;
  }
  return `${base.replace(/\/$/, "")}/api/generate`;
}

export default async function handler(req, res) {
  const token = req.headers["x-admin-token"];
  if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = req.body ?? {};

    const companyName = requireText(payload.companyName, "Entreprise cliente");
    const companyAddress = requireText(payload.companyAddress, "Adresse");
    const representativeFirstName = requireText(
      payload.representativeFirstName,
      "Prenom du representant"
    );
    const representativeLastName = requireText(
      payload.representativeLastName,
      "Nom du representant"
    );
    const representativeRole = requireText(
      payload.representativeRole,
      "Qualite du representant"
    );
    const trainingName = requireText(payload.trainingName, "Nom de la formation");
    const duration = requireText(payload.duration, "Duree");
    const dateStart = requireText(payload.dateStart, "Date de debut");
    const dateEnd = requireText(payload.dateEnd, "Date de fin");
    const location = requireText(payload.location, "Lieu");
    const instructor = requireText(payload.instructor, "Intervenant");
    const participantsRaw = requireText(payload.participants, "Participants");
    const conventionDate = requireText(payload.conventionDate, "Date de la convention");

    const amountHtRaw = String(payload.amountHt ?? "")
      .replace(",", ".")
      .replace(/\s+/g, "");
    const amountHtValue = Number(amountHtRaw);
    if (Number.isNaN(amountHtValue) || amountHtValue <= 0) {
      return res.status(400).json({ error: "Montant HT invalide." });
    }
    const amountTvaValue = Number((amountHtValue * 0.2).toFixed(2));
    const amountTtcValue = Number((amountHtValue + amountTvaValue).toFixed(2));

    let companyId: number;
    const [existingCompany] = await db
      .select()
      .from(companies)
      .where(eq(companies.name, companyName))
      .limit(1);

    if (existingCompany) {
      companyId = existingCompany.id;
      if (companyAddress && existingCompany.address !== companyAddress) {
        await db
          .update(companies)
          .set({ address: companyAddress })
          .where(eq(companies.id, companyId));
      }
    } else {
      const [company] = await db
        .insert(companies)
        .values({ name: companyName, address: companyAddress })
        .returning();
      companyId = company.id;
    }

    const [training] = await db
      .insert(trainings)
      .values({
        companyId,
        title: trainingName,
        location,
        duration,
        dateStart,
        dateEnd,
        instructor,
        conventionDate,
        amountHt: amountHtValue.toFixed(2),
        amountTva: amountTvaValue.toFixed(2),
        amountTtc: amountTtcValue.toFixed(2),
        status: "active",
      })
      .returning();

    const participantNames = Array.from(
      new Set(splitParticipants(participantsRaw))
    );
    const participantIds: string[] = [];

    for (const fullName of participantNames) {
      const [existingParticipant] = await db
        .select()
        .from(participants)
        .where(
          and(
            eq(participants.companyId, companyId),
            eq(participants.name, fullName)
          )
        )
        .limit(1);

      let participantId: string;
      if (existingParticipant) {
        participantId = existingParticipant.id;
      } else {
        const { firstName, lastName } = splitFullName(fullName);
        const [participant] = await db
          .insert(participants)
          .values({
            companyId,
            name: fullName,
            firstName,
            lastName,
            email: null,
          })
          .returning();
        participantId = participant.id;
      }

      participantIds.push(participantId);
    }

    for (const participantId of participantIds) {
      await db.insert(trainingParticipants).values({
        trainingId: training.id,
        participantId,
      });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error("Missing BLOB_READ_WRITE_TOKEN.");
    }

    const pdfServiceUrl = resolvePdfServiceUrl();
    const pdfResponse = await fetch(pdfServiceUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName,
        companyAddress,
        representativeFirstName,
        representativeLastName,
        representativeRole,
        trainingName,
        duration,
        dateStart,
        dateEnd,
        location,
        instructor,
        participants: participantsRaw,
        amountHt: amountHtValue,
        conventionDate,
      }),
    });

    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text();
      return res.status(500).json({
        error: "Convention PDF generation failed.",
        details: errorText,
      });
    }

    const arrayBuffer = await pdfResponse.arrayBuffer();
    const fileName = `convention-${sanitizeFileName(companyName)}-${training.id}.pdf`;
    const blob = await put(fileName, Buffer.from(arrayBuffer), {
      access: "public",
      contentType: "application/pdf",
    });

    const [doc] = await db
      .insert(documents)
      .values({
        trainingId: training.id,
        docType: "convention",
        fileName,
        blobUrl: blob.url,
        blobPath: blob.pathname,
        status: "generated",
        meta: {
          companyName,
          companyAddress,
          representativeFirstName,
          representativeLastName,
          representativeRole,
          trainingName,
          duration,
          dateStart,
          dateEnd,
          location,
          instructor,
          participants: participantsRaw,
          amountHt: amountHtValue.toFixed(2),
          amountTva: amountTvaValue.toFixed(2),
          amountTtc: amountTtcValue.toFixed(2),
          conventionDate,
          serviceUrl: pdfServiceUrl,
        },
      })
      .returning();

    return res.status(200).json({
      documentId: doc.id,
      trainingId: training.id,
      blobUrl: blob.url,
      fileName,
    });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Erreur inattendue.";
    return res.status(500).json({ error: message });
  }
}
