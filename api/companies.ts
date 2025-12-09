import { db } from '../src/db/index'; // Adjust path if needed during build
import { companies } from '../src/db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req, res) {
    // Simple auth check
    const token = req.headers['x-admin-token'];
    if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        if (req.method === 'GET') {
            const allCompanies = await db.select().from(companies).orderBy(companies.name);
            return res.status(200).json(allCompanies);
        }

        if (req.method === 'POST') {
            const { name } = req.body;
            if (!name) return res.status(400).json({ error: 'Name required' });

            const [newCompany] = await db.insert(companies).values({ name }).returning();
            return res.status(201).json(newCompany);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
