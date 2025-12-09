
-- Migration: 20251030143734

-- Migration: 20251029100550
-- Create enum for question types
CREATE TYPE question_type AS ENUM ('multiple_choice');

-- Create questionnaires table
CREATE TABLE public.questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id UUID REFERENCES public.questionnaires(id) ON DELETE CASCADE NOT NULL,
  question_number INTEGER NOT NULL,
  theme TEXT NOT NULL,
  question_text TEXT NOT NULL,
  type question_type DEFAULT 'multiple_choice',
  choices JSONB NOT NULL, -- Array of {label: string, value: string}
  correct_answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create participants table
CREATE TABLE public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(email)
);

-- Create quiz sessions table
CREATE TABLE public.quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id UUID REFERENCES public.questionnaires(id) ON DELETE CASCADE NOT NULL,
  participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  score INTEGER,
  total_questions INTEGER,
  percentage DECIMAL(5,2)
);

-- Create responses table
CREATE TABLE public.responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.quiz_sessions(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access (participants taking quiz)
CREATE POLICY "Questionnaires are viewable by everyone"
  ON public.questionnaires FOR SELECT
  USING (true);

CREATE POLICY "Questions are viewable by everyone"
  ON public.questions FOR SELECT
  USING (true);

-- RLS Policies for participants (can create their own data)
CREATE POLICY "Anyone can create participant"
  ON public.participants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can create quiz session"
  ON public.quiz_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update their own quiz session"
  ON public.quiz_sessions FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can create responses"
  ON public.responses FOR INSERT
  WITH CHECK (true);

-- RLS Policies for admin access (will need authentication later)
CREATE POLICY "Anyone can view all participants"
  ON public.participants FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view all quiz sessions"
  ON public.quiz_sessions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view all responses"
  ON public.responses FOR SELECT
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_questions_questionnaire ON public.questions(questionnaire_id);
CREATE INDEX idx_quiz_sessions_participant ON public.quiz_sessions(participant_id);
CREATE INDEX idx_quiz_sessions_questionnaire ON public.quiz_sessions(questionnaire_id);
CREATE INDEX idx_responses_session ON public.responses(session_id);
CREATE INDEX idx_responses_question ON public.responses(question_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for questionnaires
CREATE TRIGGER update_questionnaires_updated_at
  BEFORE UPDATE ON public.questionnaires
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the initial questionnaire
INSERT INTO public.questionnaires (title, description) VALUES
('Évaluation - Sensibilisation à l''Action Commerciale', 'Ce questionnaire vise à évaluer la compréhension et l''intégration des concepts clés présentés lors de la session de sensibilisation à l''action commerciale chez ID-Solutions.');

-- Get the questionnaire ID for inserting questions
DO $$
DECLARE
  q_id UUID;
BEGIN
  SELECT id INTO q_id FROM public.questionnaires WHERE title = 'Évaluation - Sensibilisation à l''Action Commerciale' LIMIT 1;
  
  -- Insert questions for Thématique 1
  INSERT INTO public.questions (questionnaire_id, question_number, theme, question_text, choices, correct_answer) VALUES
  (q_id, 1, 'Stratégie et Objectifs', 
   'Quel est l''un des principaux enjeux stratégiques de l''Alignement Commercial chez ID-Solutions, tel que défini dans le support de formation ?',
   '[
     {"value": "A", "label": "A. Développer de nouvelles technologies brevetées."},
     {"value": "B", "label": "B. Créer une expérience client fluide et cohérente à chaque point de contact, via la synchronisation stratégique."},
     {"value": "C", "label": "C. Recruter 70% de la part de marché COVID."},
     {"value": "D", "label": "D. Augmenter la capacité de production à 2 millions de kits par semaine."}
   ]'::jsonb,
   'B'),
   
  (q_id, 2, 'Stratégie et Objectifs',
   'L''objectif principal de l''entraînement intensif des deux prochaines sessions est de...',
   '[
     {"value": "A", "label": "A. Partager les meilleures pratiques uniquement."},
     {"value": "B", "label": "B. Déployer concrètement la méthode dans le quotidien opérationnel."},
     {"value": "C", "label": "C. Élaborer ensemble une démarche commerciale inclusive couvrant l''intégralité de la chaîne de valeur (du produit à la fidélisation)."},
     {"value": "D", "label": "D. Définir les forces d''ID-Solutions."}
   ]'::jsonb,
   'C'),
   
  -- Thématique 2
  (q_id, 3, 'Psychologie de la Vente et Influence',
   'Selon le support de formation, la décision d''achat est-elle principalement guidée par la seule logique ?',
   '[
     {"value": "A", "label": "A. Oui, car la vente repose sur l''adéquation rationnelle du besoin et de la solution."},
     {"value": "B", "label": "B. Non, elle est souvent plus complexe et fortement soumise aux biais cognitifs et aux facteurs psychologiques."},
     {"value": "C", "label": "C. Non, seuls les décideurs réputés irrationnels sont influencés par les émotions."},
     {"value": "D", "label": "D. Oui, si l''on maîtrise parfaitement la Pyramide de la Vente."}
   ]'::jsonb,
   'B'),
   
  (q_id, 4, 'Psychologie de la Vente et Influence',
   'Selon les travaux de Daniel Kahneman (Prix Nobel), lequel des systèmes de pensée est majoritairement à l''œuvre dans nos décisions d''achat, même les plus sensibles ?',
   '[
     {"value": "A", "label": "A. Le Système 2 (lent, analytique et réfléchi)."},
     {"value": "B", "label": "B. Le Système 1 (rapide, intuitif, émotionnel)."},
     {"value": "C", "label": "C. Le Système Logique."},
     {"value": "D", "label": "D. Le Système d''Autorité."}
   ]'::jsonb,
   'B'),
   
  (q_id, 5, 'Psychologie de la Vente et Influence',
   'Parmi les propositions suivantes, laquelle ne fait pas partie des six principes d''influence identifiés par Robert Cialdini ?',
   '[
     {"value": "A", "label": "A. Réciprocité."},
     {"value": "B", "label": "B. Preuve sociale."},
     {"value": "C", "label": "C. Menace de liberté."},
     {"value": "D", "label": "D. Autorité."}
   ]'::jsonb,
   'C'),
   
  (q_id, 6, 'Psychologie de la Vente et Influence',
   'Quel est l''objectif éthique de l''utilisation des mécanismes d''influence et des biais cognitifs dans la démarche commerciale ID-Solutions ?',
   '[
     {"value": "A", "label": "A. Manipuler le client pour qu''il prenne une décision rapide."},
     {"value": "B", "label": "B. Guider le client vers la meilleure décision et adapter l''approche afin de servir ses intérêts de manière optimale."},
     {"value": "C", "label": "C. Vendre de façon agressive pour augmenter le chiffre d''affaires."},
     {"value": "D", "label": "D. Exercer une pression maximale grâce à la rareté et l''autorité."}
   ]'::jsonb,
   'B'),
   
  -- Thématique 3
  (q_id, 7, 'Structuration de l''Entretien Commercial',
   'À quoi sert principalement la "Pyramide de la Vente" mentionnée dans le support ?',
   '[
     {"value": "A", "label": "A. À identifier les concurrents."},
     {"value": "B", "label": "B. À définir les forces d''ID-Solutions."},
     {"value": "C", "label": "C. À structurer chaque étape de l''entretien commercial pour maximiser l''efficacité et renforcer la confiance."},
     {"value": "D", "label": "D. À garantir l''authenticité des arguments uniquement."}
   ]'::jsonb,
   'C'),
   
  (q_id, 8, 'Structuration de l''Entretien Commercial',
   'Lors de l''Atelier Stop & Go consacré à la Prise de Contact, l''objectif personnel principal pour chaque participant était d''établir la confiance sur quels trois axes ?',
   '[
     {"value": "A", "label": "A. L''innovation, la certification et l''agilité."},
     {"value": "B", "label": "B. L''ancienneté, la production et le marché."},
     {"value": "C", "label": "C. L''humanité (relationnel), l''organisation (méthode) et l''expertise métier (connaissances ID-Solutions)."},
     {"value": "D", "label": "D. L''autorité, la sympathie et la cohérence."}
   ]'::jsonb,
   'C'),
   
  (q_id, 9, 'Structuration de l''Entretien Commercial',
   'Parmi ces six étapes d''une prise de contact réussie, laquelle est la cinquième et nécessite la confirmation de l''interlocuteur ?',
   '[
     {"value": "A", "label": "A. Bris de glace."},
     {"value": "B", "label": "B. Cadre de la rencontre."},
     {"value": "C", "label": "C. Plan de l''entretien."},
     {"value": "D", "label": "D. Validation (confirmer l''accord sur le cadre et le timing)."}
   ]'::jsonb,
   'D'),
   
  (q_id, 10, 'Structuration de l''Entretien Commercial',
   'La structure d''un pitch clair et percutant doit répondre à trois questions essentielles pour l''interlocuteur. Quelles sont-elles ?',
   '[
     {"value": "A", "label": "A. Qui nous sommes, ce que nous faisons, où nous allons."},
     {"value": "B", "label": "B. À qui nous nous adressons, grâce à quoi (valeur ajoutée spécifique), ce qui leur permet de (bénéfices concrets)."},
     {"value": "C", "label": "C. Les forces d''ID-Solutions, les enjeux de leurs clients, les avantages concurrentiels."},
     {"value": "D", "label": "D. Le temps alloué, le déroulé, la première question découverte."}
   ]'::jsonb,
   'B');
END $$;

