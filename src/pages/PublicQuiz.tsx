import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSessionBySlug, submitResponse } from "@/lib/api";
import { QuizWelcome } from "@/components/QuizWelcome";
import { QuizQuestion } from "@/components/QuizQuestion";
import { QuizResults } from "@/components/QuizResults";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function PublicQuiz() {
    const { slug } = useParams();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stage, setStage] = useState<"login" | "welcome" | "quiz" | "results">("login");

    // Participant
    const [participant, setParticipant] = useState({ name: "", email: "" });

    // Quiz State
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState("");
    const [answers, setAnswers] = useState<any[]>([]); // { questionId, answer, isCorrect }
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (slug) loadSession();
    }, [slug]);

    const loadSession = async () => {
        try {
            const data = await getSessionBySlug(slug!);
            setSession(data);
            // Transform questions to match UI components if needed
            // Gemini structure: { title, description, questions: [{ question, options: [], correctAnswerIndex }] }
            // Stored in `data.quizContent`
            const rawQs = data.quizContent.questions || [];
            const mappedQs = rawQs.map((q: any, idx: number) => ({
                id: `q-${idx}`,
                question_text: q.question,
                question_number: idx + 1,
                theme: "General",
                choices: q.options.map((opt: string) => ({ value: opt, label: opt })),
                correct_answer: q.options[q.correctAnswerIndex]
            }));
            setQuestions(mappedQs);
        } catch (e) {
            toast.error("Session introuvable ou fermée");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!participant.name || !participant.email) return toast.error("Champs requis");
        setStage("welcome");
    };

    const handleStart = () => {
        setStage("quiz");
    };

    const handleNext = async () => {
        const currentQ = questions[currentIdx];
        const isCorrect = selectedAnswer === currentQ.correct_answer;

        const newAnswer = {
            questionId: currentQ.id,
            answer: selectedAnswer,
            isCorrect
        };
        const newAnswers = [...answers, newAnswer];
        setAnswers(newAnswers);

        if (currentIdx < questions.length - 1) {
            setCurrentIdx(currentIdx + 1);
            setSelectedAnswer("");
        } else {
            // Finish
            const finalScore = newAnswers.filter(a => a.isCorrect).length;
            setScore(finalScore);
            setStage("results");

            // Submit to Backend
            try {
                await submitResponse({
                    sessionId: session.id,
                    name: participant.name,
                    email: participant.email,
                    score: finalScore,
                    answers: newAnswers
                });
                toast.success("Résultats sauvegardés !");
            } catch (e) {
                console.error(e);
                toast.error("Erreur sauvegarde résultats");
            }
        }
    };

    if (loading) return <div className="flex justify-center p-10">Chargement...</div>;
    if (!session) return <div className="flex justify-center p-10">Session introuvable. Vérifiez le lien.</div>;

    if (stage === "login") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-md p-6 space-y-4">
                    <h1 className="text-2xl font-bold text-center">{session.companyName} - Formation</h1>
                    <p className="text-center text-muted-foreground">{session.quizTitle}</p>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nom / Prénom</Label>
                            <Input
                                value={participant.name}
                                onChange={e => setParticipant({ ...participant, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={participant.email}
                                onChange={e => setParticipant({ ...participant, email: e.target.value })}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full">Commencer</Button>
                    </form>
                </Card>
            </div>
        );
    }

    if (stage === "welcome") {
        // Reusing Card UI for Welcome
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary to-background p-4">
                <Card className="max-w-2xl w-full p-8 text-center space-y-6">
                    <h1 className="text-3xl font-bold">{session.quizTitle}</h1>
                    <div className="text-muted-foreground">
                        {session.quizDescription || "Bonne chance pour ce questionnaire !"}
                    </div>
                    <div className="py-4">
                        <p className="font-semibold">Participant: {participant.name}</p>
                        <p className="text-sm text-gray-500">{participant.email}</p>
                    </div>
                    <Button size="lg" onClick={handleStart} className="w-full">
                        Commencer le questionnaire
                    </Button>
                </Card>
            </div>
        );
    }

    if (stage === "results") {
        return <QuizResults
            score={score}
            totalQuestions={questions.length}
            percentage={(score / questions.length) * 100}
            participantName={participant.name}
        />;
    }

    // Quiz Stage
    const currentQ = questions[currentIdx];
    return (
        <QuizQuestion
            question={currentQ}
            currentQuestion={currentIdx}
            totalQuestions={questions.length}
            selectedAnswer={selectedAnswer}
            onAnswerChange={setSelectedAnswer}
            onNext={handleNext}
            isLastQuestion={currentIdx === questions.length - 1}
        />
    );
}
