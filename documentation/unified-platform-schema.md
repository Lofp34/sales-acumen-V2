# Schema unifie v1 (Conventions + Presence + Attestations + Satisfaction + Validation)

## Principes
- Une **entreprise** peut avoir plusieurs **formations** (dossiers).
- Un **participant** peut etre reutilise sur plusieurs formations.
- Les **documents** (PDF/ZIP) sont stockes dans **Vercel Blob** et references en base.
- Les **questionnaires en ligne** (validation des connaissances) sont distincts des PDFs.
- Auth admin **par mot de passe unique** (env var), pas de table utilisateurs admin.

## Entites principales

### companies
Informations client.
- id (pk)
- name (obligatoire)
- address (optionnel)
- contact_name, contact_email, contact_phone (optionnel)
- created_at

### trainings (dossier formation)
Noyau central pour tout relier.
- id (pk)
- company_id (fk -> companies.id)
- title (ex: "Techniques de vente avancees")
- program (optionnel: parcours)
- location
- duration (ex: "40 heures")
- date_start, date_end (dates principales)
- dates_list (jsonb, optionnel, pour presence sur plusieurs jours)
- instructor (intervenant)
- provider_name (organisme de formation)
- signatory_name
- convention_date
- amount_ht, amount_tva, amount_ttc (optionnel)
- status ("draft" | "active" | "closed")
- created_at

### participants
Une seule fiche par participant (reutilisable).
- id (pk)
- company_id (fk -> companies.id)
- first_name
- last_name
- email (optionnel si inconnu)
- phone (optionnel)
- created_at
Contrainte: unique(company_id, email) recommandee (non imposee en v1)

### training_participants
Relation N-N entre formations et participants.
- training_id (fk -> trainings.id)
- participant_id (fk -> participants.id)
- role ("participant" par defaut)
- created_at
Contrainte: unique(training_id, participant_id)

### documents
Archive des fichiers generes (PDF/ZIP).
- id (pk)
- training_id (fk -> trainings.id)
- participant_id (nullable, pour documents par participant)
- doc_type (enum: "convention" | "presence_sheet" | "attestation" | "satisfaction_pdf" | "bundle_zip")
- file_name
- blob_url (Vercel Blob)
- blob_path (optionnel)
- status ("generated" | "archived" | "error")
- meta (jsonb, ex: {service: "python", version: "v1"})
- created_at

### questionnaires
Questionnaires en ligne (validation des connaissances).
- id (pk)
- training_id (fk -> trainings.id)
- type ("validation")
- title
- description
- content (jsonb)
- created_at

### questionnaire_sessions
Liens publics pour les apprenants.
- id (pk)
- training_id (fk -> trainings.id)
- questionnaire_id (fk -> questionnaires.id)
- slug (unique)
- status ("active" | "closed")
- created_at

### submissions
Reponses des apprenants.
- id (pk)
- questionnaire_session_id (fk -> questionnaire_sessions.id)
- participant_id (fk -> participants.id)
- score, percentage
- answers (jsonb)
- completed_at
- created_at

## Couverture fonctionnelle (verification)
- Convention PDF -> trainings + documents(doc_type="convention")
- Presence PDF -> trainings + training_participants + documents(doc_type="presence_sheet")
- Attestations -> trainings + participants + documents(doc_type="attestation")
- Satisfaction PDF -> trainings + participants + documents(doc_type="satisfaction_pdf")
- Validation en ligne -> questionnaires + questionnaire_sessions + submissions
- Archivage -> documents.blob_url (Vercel Blob)

## Notes d'implementation
- dates_list en jsonb suffit pour la presence multi-jours (pas besoin d'une table separee).
- On stocke l'URL Blob pour telechargement direct + l'archive.
- Le schema est concu pour garder les generateurs existants sans reecriture.
