import { pgTable, serial, text, timestamp, jsonb, boolean, integer, uuid } from "drizzle-orm/pg-core";

export const companies = pgTable("companies", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
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
    name: text("name").notNull(),
    email: text("email").notNull(),
    score: integer("score"), // Null if not finished or just a simpler way to store final score
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const responses = pgTable("responses", {
    id: serial("id").primaryKey(),
    participantId: uuid("participant_id").references(() => participants.id),
    answers: jsonb("answers"), // Store full simple { questionId: answer } map
    createdAt: timestamp("created_at").defaultNow(),
});
