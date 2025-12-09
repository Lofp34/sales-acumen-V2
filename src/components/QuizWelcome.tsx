import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClipboardList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuizWelcomeProps {
  questionnaire: {
    id: string;
    title: string;
    description: string | null;
  };
  onStart: (sessionId: string, participantId: string) => void;
}

export const QuizWelcome = ({ questionnaire, onStart }: QuizWelcomeProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Veuillez entrer une adresse email valide");
      return;
    }

    setIsLoading(true);

    try {
      // Create or get participant
      const { data: existingParticipant } = await supabase
        .from("participants")
        .select("id")
        .eq("email", email)
        .single();

      let participantId = existingParticipant?.id;

      if (!participantId) {
        const { data: newParticipant, error: participantError } = await supabase
          .from("participants")
          .insert({
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            email: email.trim(),
            company: company.trim() || null,
          })
          .select("id")
          .single();

        if (participantError) throw participantError;
        participantId = newParticipant.id;
      }

      // Get total questions count
      const { count } = await supabase
        .from("questions")
        .select("*", { count: "exact", head: true })
        .eq("questionnaire_id", questionnaire.id);

      // Create quiz session
      const { data: session, error: sessionError } = await supabase
        .from("quiz_sessions")
        .insert({
          questionnaire_id: questionnaire.id,
          participant_id: participantId,
          total_questions: count || 0,
        })
        .select("id")
        .single();

      if (sessionError) throw sessionError;

      toast.success("Questionnaire démarré !");
      onStart(session.id, participantId);
    } catch (error) {
      console.error("Error starting quiz:", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-secondary to-background">
      <Card className="w-full max-w-2xl p-8 shadow-[var(--shadow-elevated)]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-hover mb-4">
            <ClipboardList className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{questionnaire.title}</h1>
          {questionnaire.description && (
            <p className="text-muted-foreground max-w-xl mx-auto">
              {questionnaire.description}
            </p>
          )}
        </div>

        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jean"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Dupont"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email professionnel *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jean.dupont@entreprise.fr"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Entreprise</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Ovea"
            />
          </div>
        </div>

        <Button
          onClick={handleStart}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? "Démarrage..." : "Commencer le questionnaire"}
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-4">
          * Champs obligatoires
        </p>
      </Card>
    </div>
  );
};
