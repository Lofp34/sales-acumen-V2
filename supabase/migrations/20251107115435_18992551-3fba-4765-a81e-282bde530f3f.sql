-- Ajouter les politiques RLS pour permettre la suppression des sessions et des réponses
CREATE POLICY "Anyone can delete responses"
ON public.responses
FOR DELETE
USING (true);

CREATE POLICY "Anyone can delete quiz sessions"
ON public.quiz_sessions
FOR DELETE
USING (true);