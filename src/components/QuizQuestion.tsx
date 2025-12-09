import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface Choice {
  value: string;
  label: string;
}

interface Question {
  id: string;
  question_number: number;
  theme: string;
  question_text: string;
  choices: Choice[];
}

interface QuizQuestionProps {
  question: Question;
  currentQuestion: number;
  totalQuestions: number;
  selectedAnswer: string;
  onAnswerChange: (value: string) => void;
  onNext: () => void;
  isLastQuestion: boolean;
}

export const QuizQuestion = ({
  question,
  currentQuestion,
  totalQuestions,
  selectedAnswer,
  onAnswerChange,
  onNext,
  isLastQuestion,
}: QuizQuestionProps) => {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-secondary to-background">
      <div className="w-full max-w-3xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="px-3 py-1">
              {question.theme}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} sur {totalQuestions}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="p-8 shadow-[var(--shadow-elevated)]">
          <h2 className="text-2xl font-semibold mb-8 leading-relaxed">
            {question.question_text}
          </h2>

          <RadioGroup value={selectedAnswer} onValueChange={onAnswerChange}>
            <div className="space-y-3">
              {question.choices.map((choice) => (
                <div
                  key={choice.value}
                  className={`flex items-start space-x-3 rounded-lg border-2 p-4 transition-all cursor-pointer hover:border-primary/50 ${
                    selectedAnswer === choice.value
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                  onClick={() => onAnswerChange(choice.value)}
                >
                  <RadioGroupItem
                    value={choice.value}
                    id={choice.value}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor={choice.value}
                    className="flex-1 cursor-pointer text-base leading-relaxed"
                  >
                    {choice.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          <div className="flex justify-end mt-8">
            <Button
              onClick={onNext}
              disabled={!selectedAnswer}
              size="lg"
              className="min-w-[160px]"
            >
              {isLastQuestion ? "Terminer" : "Question suivante"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
