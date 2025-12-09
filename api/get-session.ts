import { db } from './_db/index';
import { sessions, quizzes, companies } from './_db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { slug } = req.query;

    if (!slug || Array.isArray(slug)) {
        return res.status(400).json({ error: 'Invalid slug' });
    }

    try {
        const sessionData = await db.select({
            id: sessions.id,
            status: sessions.status,
            quizContent: quizzes.content,
            quizTitle: quizzes.title,
            quizDescription: quizzes.description,
            companyName: companies.name
        })
            .from(sessions)
            .leftJoin(quizzes, eq(sessions.quizId, quizzes.id))
            .leftJoin(companies, eq(sessions.companyId, companies.id))
            .where(eq(sessions.slug, slug))
            .limit(1);

        if (sessionData.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const session = sessionData[0];

        if (session.status !== 'active') {
            return res.status(403).json({ error: 'Session is closed' });
        }

        return res.status(200).json(session);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
