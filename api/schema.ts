import { pgTable, serial, text, timestamp, jsonb, integer, uuid } from "drizzle-orm/pg-core";

export const companies = pgTable("companies", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    address: text("address"),
    contactName: text("contact_name"),
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const quizzes = pgTable("quizzes", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    content: jsonb("content").notNull(), // Stores the questions structure
    createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
    id: serial("id").primaryKey(),
    companyId: integer("company_id").references(() => companies.id),
    quizId: integer("quiz_id").references(() => quizzes.id),
    slug: text("slug").unique().notNull(), // For the public URL
    status: text("status").default('active'), // active, closed
    createdAt: timestamp("created_at").defaultNow(),
});

export const participants = pgTable("participants", {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: integer("session_id").references(() => sessions.id),
    companyId: integer("company_id").references(() => companies.id),
    name: text("name").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    email: text("email"),
    phone: text("phone"),
    score: integer("score"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const trainings = pgTable("trainings", {
    id: serial("id").primaryKey(),
    companyId: integer("company_id").references(() => companies.id),
    title: text("title").notNull(),
    program: text("program"),
    location: text("location"),
    duration: text("duration"),
    dateStart: text("date_start"),
    dateEnd: text("date_end"),
    datesList: jsonb("dates_list"),
    instructor: text("instructor"),
    providerName: text("provider_name"),
    signatoryName: text("signatory_name"),
    conventionDate: text("convention_date"),
    amountHt: text("amount_ht"),
    amountTva: text("amount_tva"),
    amountTtc: text("amount_ttc"),
    status: text("status").default("draft"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const trainingParticipants = pgTable("training_participants", {
    trainingId: integer("training_id").references(() => trainings.id).notNull(),
    participantId: uuid("participant_id").references(() => participants.id).notNull(),
    role: text("role").default("participant"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
    id: serial("id").primaryKey(),
    trainingId: integer("training_id").references(() => trainings.id),
    participantId: uuid("participant_id").references(() => participants.id),
    docType: text("doc_type").notNull(),
    fileName: text("file_name").notNull(),
    blobUrl: text("blob_url").notNull(),
    blobPath: text("blob_path"),
    status: text("status").default("generated"),
    meta: jsonb("meta"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const responses = pgTable("responses", {
    id: serial("id").primaryKey(),
    participantId: uuid("participant_id").references(() => participants.id),
    answers: jsonb("answers"), // Store full simple { questionId: answer } map
    createdAt: timestamp("created_at").defaultNow(),
});
