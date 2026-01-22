import { sql } from "drizzle-orm";
import { db } from "./db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ ok: false, error: "Missing DATABASE_URL" });
  }

  try {
    const result = await db.execute(sql`select 1 as ok`);
    const ok = Array.isArray(result) ? result[0]?.ok === 1 : true;

    return res.status(200).json({
      ok: true,
      db: ok,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: "DB connection failed" });
  }
}
