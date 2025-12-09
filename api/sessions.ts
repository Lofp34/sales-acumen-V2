import { db } from './_db/index';
import { sessions, companies, quizzes } from './_db/schema';
import { desc, eq } from 'drizzle-orm';

function generateSlug(length = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export default async function handler(req, res) {
    const token = req.headers['x-admin-token'];
    if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        if (req.method === 'GET') {
            // Join with companies and quizzes for nice display
            const allSessions = await db.select({
                id: sessions.id,
                slug: sessions.slug,
                status: sessions.status,
                createdAt: sessions.createdAt,
                companyName: companies.name,
                quizTitle: quizzes.title
            })
                .from(sessions)
                .leftJoin(companies, eq(sessions.companyId, companies.id))
                .leftJoin(quizzes, eq(sessions.quizId, quizzes.id))
                .orderBy(desc(sessions.createdAt));

            return res.status(200).json(allSessions);
        }

        if (req.method === 'POST') {
            const { companyId, quizId } = req.body;
            if (!companyId || !quizId) return res.status(400).json({ error: 'Company and Quiz required' });

            const slug = generateSlug();

            const [newSession] = await db.insert(sessions).values({
                companyId,
                quizId,
                slug,
                status: 'active'
            }).returning();
            return res.status(201).json(newSession);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
