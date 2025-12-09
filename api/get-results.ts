import { db } from '../src/db/index';
import { participants, responses, sessions, companies, quizzes } from '../src/db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req, res) {
    const token = req.headers['x-admin-token'];
    if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { sessionId } = req.query;
    if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });

    try {
        // Fetch Session + Company + Quiz Info
        const sessionInfo = await db.select({
            company: companies.name,
            quizTitle: quizzes.title,
            date: sessions.createdAt
        })
            .from(sessions)
            .leftJoin(companies, eq(sessions.companyId, companies.id))
            .leftJoin(quizzes, eq(sessions.quizId, quizzes.id))
            .where(eq(sessions.id, parseInt(sessionId)))
            .limit(1);

        // Fetch Participants and their Responses
        const parts = await db.select({
            id: participants.id,
            name: participants.name,
            email: participants.email,
            score: participants.score,
            completedAt: participants.completedAt,
        })
            .from(participants)
            .where(eq(participants.sessionId, parseInt(sessionId)));

        // Fetch responses for these participants
        // Ideally we join, but iterating is fine for reasonable size
        const results = [];
        for (const p of parts) {
            const resp = await db.select().from(responses).where(eq(responses.participantId, p.id));
            results.push({
                participant: p,
                responses: resp
            });
        }

        return res.status(200).json({
            info: sessionInfo[0],
            results
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
