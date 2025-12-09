import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Award, TrendingUp } from "lucide-react";

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  percentage: number;
  participantName: string;
}

export const QuizResults = ({
  score,
  totalQuestions,
  percentage,
  participantName,
}: QuizResultsProps) => {
  const getResultMessage = () => {
    if (percentage >= 80) {
      return {
        title: "Excellent !",
        message: "Vous avez une excellente maîtrise des concepts présentés.",
        icon: Award,
        color: "text-accent",
      };
    } else if (percentage >= 60) {
      return {
        title: "Bien",
        message: "Bonne compréhension globale avec quelques points à renforcer.",
        icon: TrendingUp,
        color: "text-primary",
      };
    } else {
      return {
        title: "À améliorer",
        message: "Certains concepts mériteraient d'être approfondis lors des sessions de coaching.",
        icon: TrendingUp,
        color: "text-warning",
      };
    }
  };

  const result = getResultMessage();
  const ResultIcon = result.icon;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-secondary to-background">
      <Card className="w-full max-w-2xl p-8 shadow-[var(--shadow-elevated)]">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-hover mb-4`}>
            <ResultIcon className={`w-10 h-10 ${result.color === 'text-accent' ? 'text-accent-foreground' : 'text-primary-foreground'}`} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Questionnaire terminé !</h1>
          <p className="text-muted-foreground">
            Merci {participantName}, voici vos résultats
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="text-center p-6 rounded-lg bg-secondary/50">
            <div className="text-5xl font-bold mb-2">
              {score}/{totalQuestions}
            </div>
            <div className="text-xl mb-4">
              <span className={`font-semibold ${result.color}`}>
                {percentage.toFixed(0)}%
              </span>
            </div>
            <Progress value={percentage} className="h-3" />
          </div>

          <Card className="p-6 border-2">
            <h2 className={`text-xl font-semibold mb-2 ${result.color}`}>
              {result.title}
            </h2>
            <p className="text-muted-foreground">{result.message}</p>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/10 border border-accent/20">
              <CheckCircle2 className="w-8 h-8 text-accent" />
              <div>
                <div className="text-2xl font-bold">{score}</div>
                <div className="text-sm text-muted-foreground">Correctes</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <XCircle className="w-8 h-8 text-destructive" />
              <div>
                <div className="text-2xl font-bold">{totalQuestions - score}</div>
                <div className="text-sm text-muted-foreground">Incorrectes</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            Vos résultats ont été archivés et seront utilisés pour identifier les points à renforcer lors des sessions de coaching.
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="w-full"
          >
            Retour à l'accueil
          </Button>
        </div>
      </Card>
    </div>
  );
};
