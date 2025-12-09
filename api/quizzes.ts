import { db } from './db';
import { quizzes } from './schema';
import { desc } from 'drizzle-orm';

export default async function handler(req, res) {
    const token = req.headers['x-admin-token'];
    if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        if (req.method === 'GET') {
            const allQuizzes = await db.select().from(quizzes).orderBy(desc(quizzes.createdAt));
            return res.status(200).json(allQuizzes);
        }

        if (req.method === 'POST') {
            const { title, description, content } = req.body;
            if (!title || !content) return res.status(400).json({ error: 'Title and Content required' });

            const [newQuiz] = await db.insert(quizzes).values({
                title,
                description,
                content
            }).returning();
            return res.status(201).json(newQuiz);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
