import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createQuiz, generateQuiz } from "@/lib/api"; // We will fix the export in api.ts
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export function CreateQuiz({ onCreated }: { onCreated: () => void }) {
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    // For saving
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleGenerate = async () => {
        if (!text) return toast.error("Veuillez entrer du texte");
        setLoading(true);
        try {
            const quiz = await generateQuiz(text);
            setGeneratedQuiz(quiz);
            setTitle(quiz.title || "Nouveau Quiz");
            setDescription(quiz.description || "Questionnaire généré par AI");
            toast.success("Quiz généré avec succès !");
        } catch (e: any) {
            toast.error("Erreur lors de la génération: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await createQuiz(title, generatedQuiz.questions || generatedQuiz.content, description);
            toast.success("Quiz sauvegardé !");
            setGeneratedQuiz(null);
            setText("");
            onCreated();
        } catch (e: any) {
            toast.error("Erreur sauvegarde: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4 p-4 border rounded-md">
            {!generatedQuiz ? (
                <>
                    <h3 className="font-semibold text-lg">Générer un Quiz avec l'IA</h3>
                    <p className="text-sm text-gray-500">Collez le script de votre formation ou un résumé ici.</p>
                    <Textarea
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Contenu de la formation..."
                        className="min-h-[200px]"
                    />
                    <Button onClick={handleGenerate} disabled={loading}>
                        {loading && <Loader2 className="animate-spin mr-2" />}
                        Générer le questionnaire
                    </Button>
                </>
            ) : (
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Revoir et Sauvegarder</h3>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Titre</label>
                        <Input value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Input value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div className="bg-muted p-4 rounded-md max-h-[300px] overflow-auto">
                        <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(generatedQuiz, null, 2)}</pre>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setGeneratedQuiz(null)}>Annuler</Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving && <Loader2 className="animate-spin mr-2" />}
                            Sauvegarder le Quiz
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
