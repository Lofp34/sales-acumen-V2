import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QuizWelcome } from "@/components/QuizWelcome";
import { QuizQuestion } from "@/components/QuizQuestion";
import { QuizResults } from "@/components/QuizResults";
import { toast } from "sonner";

interface Question {
  id: string;
  question_number: number;
  theme: string;
  question_text: string;
  choices: { value: string; label: string }[];
  correct_answer: string;
}

export default function Quiz() {
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState("");
  const [responses, setResponses] = useState<
    { questionId: string; answer: string; isCorrect: boolean }[]
  >([]);
  const [stage, setStage] = useState<"welcome" | "quiz" | "results">("welcome");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQuestionnaire();
  }, []);

  const loadQuestionnaire = async () => {
    try {
      const { data: questionnaireData, error: qError } = await supabase
        .from("questionnaires")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (qError) throw qError;
      if (!questionnaireData) {
        toast.error("Aucun questionnaire trouvé");
        setIsLoading(false);
        return;
      }

      const { data: questionsData, error: questError } = await supabase
        .from("questions")
        .select("*")
        .eq("questionnaire_id", questionnaireData.id)
        .order("question_number");

      if (questError) throw questError;

      setQuestionnaire(questionnaireData);
      setQuestions(questionsData as any);
    } catch (error) {
      console.error("Error loading questionnaire:", error);
      toast.error("Erreur lors du chargement du questionnaire");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = async (newSessionId: string, newParticipantId: string) => {
    setSessionId(newSessionId);
    setParticipantId(newParticipantId);

    // Get participant name
    const { data } = await supabase
      .from("participants")
      .select("first_name")
      .eq("id", newParticipantId)
      .single();

    if (data) {
      setParticipantName(data.first_name);
    }

    setStage("quiz");
  };

  const handleNext = async () => {
    if (!selectedAnswer || !sessionId) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;

    // Save response
    const newResponse = {
      questionId: currentQuestion.id,
      answer: selectedAnswer,
      isCorrect,
    };

    setResponses([...responses, newResponse]);

    try {
      await supabase.from("responses").insert({
        session_id: sessionId,
        question_id: currentQuestion.id,
        answer: selectedAnswer,
        is_correct: isCorrect,
      });
    } catch (error) {
      console.error("Error saving response:", error);
    }

    // Move to next question or finish
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer("");
    } else {
      await finishQuiz();
    }
  };

  const finishQuiz = async () => {
    const score = responses.filter((r) => r.isCorrect).length + 
                  (selectedAnswer === questions[currentQuestionIndex].correct_answer ? 1 : 0);
    const percentage = (score / questions.length) * 100;

    try {
      await supabase
        .from("quiz_sessions")
        .update({
          completed_at: new Date().toISOString(),
          score,
          percentage,
        })
        .eq("id", sessionId);

      setStage("results");
    } catch (error) {
      console.error("Error finishing quiz:", error);
      toast.error("Erreur lors de l'enregistrement des résultats");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!questionnaire || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Aucun questionnaire disponible</p>
        </div>
      </div>
    );
  }

  if (stage === "welcome") {
    return <QuizWelcome questionnaire={questionnaire} onStart={handleStart} />;
  }

  if (stage === "quiz") {
    const currentQuestion = questions[currentQuestionIndex];
    return (
      <QuizQuestion
        question={currentQuestion}
        currentQuestion={currentQuestionIndex}
        totalQuestions={questions.length}
        selectedAnswer={selectedAnswer}
        onAnswerChange={setSelectedAnswer}
        onNext={handleNext}
        isLastQuestion={currentQuestionIndex === questions.length - 1}
      />
    );
  }

  const score = responses.filter((r) => r.isCorrect).length +
                (selectedAnswer === questions[currentQuestionIndex]?.correct_answer ? 1 : 0);
  const percentage = (score / questions.length) * 100;

  return (
    <QuizResults
      score={score}
      totalQuestions={questions.length}
      percentage={percentage}
      participantName={participantName}
    />
  );
}
