# Project Status (MVP)

## Objectif
Fournir une application simple pour creer des questionnaires post-formation, envoyer un lien aux apprenants, et recuperer des resultats exportables.

## Perimetre (scope)
- In: Administration (entreprises, questionnaires, sessions), lien public apprenant, collecte des resultats, export CSV, generation IA.
- Out: Auth avancée, multi-roles, analytics avancees, personnalisation profonde du parcours apprenant.

## Ce qui est en place
- Admin: creation entreprises, questionnaires, sessions, liens publics, export CSV.
- Parcours apprenant via lien public /start/:slug.
- API serverless (Neon + Drizzle) et generation IA.
- Endpoint /api/health pour verifier l'acces DB.

## Decisions prises
- Suppression du flux Supabase legacy /quiz pour simplifier l'architecture.
- Health check minimaliste cote API pour diagnostiquer la DB.

## Risques / Blocages
- Variables d'environnement Neon doivent etre configurees sur Vercel.
- Tables DB doivent exister (migrations Drizzle) sinon erreurs runtime.

## Prochaine etape (proposee)
1) Verifier /api/health en production apres redeploiement.
2) Confirmer la creation d'entreprise et session via l'admin.
3) Ajouter un bouton pour fermer une session (status=closed).

## Journal des evolutions
- 2026-01-22: Retire le flux Supabase legacy, ajoute /api/health.
- 2026-01-22: Corrige l'import Link manquant sur la page d'accueil.
- 2026-01-22: Migration de l'API Gemini vers le SDK officiel @google/genai.
- 2026-01-22: Rend l'affichage du quiz public plus robuste si le format des questions varie.
