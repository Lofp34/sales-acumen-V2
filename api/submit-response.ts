import { db } from './db';
import { participants, responses } from './schema';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { sessionId, name, email, answers, score } = req.body;

    if (!sessionId || !name || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // 1. Create Participant
        const [newParticipant] = await db.insert(participants).values({
            sessionId: parseInt(sessionId),
            name,
            email,
            score: score || 0,
            completedAt: new Date()
        }).returning();

        // 2. Create Response Record
        await db.insert(responses).values({
            participantId: newParticipant.id,
            answers: answers // JSON of their choices
        });

        return res.status(200).json({ success: true, participantId: newParticipant.id });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to submit response' });
    }
}
