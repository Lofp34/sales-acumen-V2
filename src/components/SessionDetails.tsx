import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface ResponseDetail {
  id: string;
  answer: string;
  is_correct: boolean;
  answered_at: string;
  questions: {
    question_number: number;
    question_text: string;
    theme: string;
    choices: any;
    correct_answer: string;
  };
}

interface SessionDetailsProps {
  sessionId: string;
  participantName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SessionDetails = ({
  sessionId,
  participantName,
  open,
  onOpenChange,
}: SessionDetailsProps) => {
  const [responses, setResponses] = useState<ResponseDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open && sessionId) {
      loadResponses();
    }
  }, [open, sessionId]);

  const loadResponses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("responses")
        .select(
          `
          *,
          questions (
            question_number,
            question_text,
            theme,
            choices,
            correct_answer
          )
        `
        )
        .eq("session_id", sessionId)
        .order("answered_at", { ascending: true });

      if (error) throw error;
      setResponses(data || []);
    } catch (error) {
      console.error("Error loading responses:", error);
      toast.error("Erreur lors du chargement des réponses");
    } finally {
      setIsLoading(false);
    }
  };

  const getAnswerLabel = (choices: any, value: string) => {
    if (!Array.isArray(choices)) return value;
    const choice = choices.find((c: any) => c.value === value);
    return choice ? choice.label : value;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails des réponses - {participantName}</DialogTitle>
          <DialogDescription>
            Visualisation détaillée de toutes les réponses données
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {responses.map((response) => (
              <div
                key={response.id}
                className="border rounded-lg p-4 bg-card"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">
                        Question {response.questions.question_number}
                      </Badge>
                      <Badge className="bg-primary/10 text-primary">
                        {response.questions.theme}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-sm mb-3">
                      {response.questions.question_text}
                    </h3>
                  </div>
                  <div className="ml-4">
                    {response.is_correct ? (
                      <CheckCircle2 className="w-6 h-6 text-accent" />
                    ) : (
                      <XCircle className="w-6 h-6 text-destructive" />
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="font-semibold min-w-[140px]">
                      Réponse donnée :
                    </span>
                    <span className={response.is_correct ? "text-accent font-medium" : "text-destructive font-medium"}>
                      {getAnswerLabel(response.questions.choices, response.answer)}
                    </span>
                  </div>
                  
                  {!response.is_correct && (
                    <div className="flex gap-2">
                      <span className="font-semibold min-w-[140px]">
                        Bonne réponse :
                      </span>
                      <span className="text-accent font-medium">
                        {getAnswerLabel(response.questions.choices, response.questions.correct_answer)}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 text-muted-foreground">
                    <span className="font-semibold min-w-[140px]">
                      Répondu le :
                    </span>
                    <span>
                      {new Date(response.answered_at).toLocaleString("fr-FR")}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {responses.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Aucune réponse enregistrée pour cette session
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
