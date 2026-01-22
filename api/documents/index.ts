import { and, desc, eq } from "drizzle-orm";
import { db } from "../db.js";
import { documents } from "../schema.js";

export default async function handler(req, res) {
  const token = req.headers["x-admin-token"];
  if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { trainingId, docType } = req.query;
    let query = db.select().from(documents).orderBy(desc(documents.createdAt));
    const conditions = [];

    if (trainingId) {
      const idValue = parseInt(String(trainingId), 10);
      if (!Number.isNaN(idValue)) {
        conditions.push(eq(documents.trainingId, idValue));
      }
    }
    if (docType && typeof docType === "string") {
      conditions.push(eq(documents.docType, docType));
    }

    const data = conditions.length
      ? await query.where(and(...conditions))
      : await query;
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
