# Project Status (MVP)

## Objectif
Unifier conventions, presence, attestations, satisfaction et validation dans une seule application admin avec UX homogene, liens apprenants, et archivage.

## Perimetre (scope)
- In: portail admin unique, liens apprenants sans compte, generation PDF via services existants, archivage Vercel Blob, Neon partage, export CSV/ZIP.
- Out: multi-roles, auth apprenant, analytics avancees, refonte des moteurs PDF.

## Ce qui est en place
- App actuelle: admin (entreprises, questionnaires, sessions), liens apprenants, export CSV.
- Parcours apprenant via /start/:slug + generation quiz IA.
- Generateur presence/satisfaction/attestation (Python) -> ZIP.
- Generateur convention (Next.js) -> PDF.
- Schema unifie v1 defini (voir documentation/unified-platform-schema.md).
- Contrat API unifie v1 defini (voir documentation/unified-platform-api.md).

## Inventaire (champs sources)
- Presence/attestation/satisfaction: company, training, duration, location, dates, participants, provider, signatory, logo (optionnel).
- Satisfaction PDF: company, training_program, training_center, start_date, end_date, participants, logo.
- Convention: companyName, companyAddress, representativeFirstName/LastName/Role, trainingName, duration, dateStart, dateEnd, location, instructor, participants, amountHt, conventionDate.

## Architecture cible
- Portail React (UX actuelle) avec modules documents + questionnaires.
- Services PDF conserves (Python/Next) exposes en API.
- Neon partage pour metadata + Vercel Blob pour fichiers.

## Schema v1 (propose)
- companies, trainings, participants, training_participants, documents, questionnaires, submissions.

## Decisions prises
- Auth admin unique (mot de passe).
- Neon partage pour toutes les donnees.
- Vercel Blob pour archive des PDFs.
- Ne pas reecrire les moteurs PDF existants.

## Risques / Blocages
- Fonctions Python Vercel: taille deps / timeouts.
- Normalisation des champs (noms/format dates) entre services.
- Stockage Blob: politique de retention et acces.

## Prochaine etape (proposee)
1) Valider le schema v1 (tables + champs requis).
2) Valider le contrat API (documentation/unified-platform-api.md).
3) Prototyper un module (convention) avec archivage Blob.
4) Ajouter les variables Vercel (BLOB_READ_WRITE_TOKEN, PDF_SERVICE_CONVENTION_URL).

## Journal des evolutions
- 2026-01-22: Retire le flux Supabase legacy, ajoute /api/health.
- 2026-01-22: Corrige l'import Link manquant sur la page d'accueil.
- 2026-01-22: Migration de l'API Gemini vers le SDK officiel @google/genai.
- 2026-01-22: Rend l'affichage du quiz public plus robuste si le format des questions varie.
- 2026-01-22: Demarrage etat projet unifie + inventaire des champs sources.
- 2026-01-22: Schema unifie v1 documente.
- 2026-01-22: Contrat API unifie v1 documente.
- 2026-01-22: Prototype module convention (UI + API + archivage) en cours.
