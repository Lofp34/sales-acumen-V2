# Contrat API unifie v1

Ce document definit les endpoints et contrats pour unifier:
- conventions
- presence / attestation / satisfaction (PDF)
- validation des connaissances (quiz en ligne)

## Auth admin (mot de passe unique)
L admin se connecte avec un mot de passe unique (env var). Un token est renvoye et stocke cote client.

### POST /api/auth/login
Body JSON:
{
  "password": "..."
}
Response 200:
{
  "token": "..."
}
Errors: 401 si mot de passe invalide.

Header admin pour les endpoints proteges:
`x-admin-token: <token>`

---

## Entites (admin)

### Companies
GET /api/companies
POST /api/companies

### Trainings (dossiers formation)
GET /api/trainings
POST /api/trainings
PATCH /api/trainings/:id

### Participants
GET /api/participants?companyId=...
POST /api/participants

### Training participants
POST /api/trainings/:id/participants
Body JSON:
{
  "participantIds": ["..."],
  "participants": [{ "firstName": "...", "lastName": "...", "email": "..." }]
}
Response: liste finale des participants rattaches

---

## Documents (PDF/ZIP) + Vercel Blob

### POST /api/documents/generate/convention
But: generer la convention PDF depuis le service convention.
Body JSON:
{
  "companyName": "...",
  "companyAddress": "...",
  "representativeFirstName": "...",
  "representativeLastName": "...",
  "representativeRole": "...",
  "trainingName": "...",
  "duration": "...",
  "dateStart": "YYYY-MM-DD",
  "dateEnd": "YYYY-MM-DD",
  "location": "...",
  "instructor": "...",
  "participants": "Alice Dupont, Bob Martin",
  "amountHt": "6950",
  "conventionDate": "YYYY-MM-DD"
}
Flow:
1) creer training + participants si besoin
2) appeler service convention (JSON)
3) stocker le PDF sur Vercel Blob
4) creer un record documents
Response 200:
{
  "documentId": "...",
  "trainingId": "...",
  "blobUrl": "...",
  "fileName": "convention-xxxx.pdf"
}

### POST /api/documents/generate/training-bundle
But: generer ZIP (presence + satisfaction + attestations) via service Python.
Body JSON:
{
  "trainingId": "...",
  "logo": "file|optional"
}
Flow:
1) recuperer training + participants
2) appeler service Python /api/generate (multipart form)
3) stocker ZIP sur Vercel Blob
4) creer record documents (doc_type="bundle_zip")
Response 200:
{
  "documentId": "...",
  "blobUrl": "...",
  "fileName": "documents_formation.zip"
}

### GET /api/documents?trainingId=...
Liste les documents archives.

---

## Questionnaires (validation des connaissances)

### POST /api/questionnaires
Body JSON:
{
  "trainingId": "...",
  "title": "...",
  "description": "...",
  "content": { ... } // questions
}

### POST /api/questionnaire-sessions
Body JSON:
{
  "trainingId": "...",
  "questionnaireId": "..."
}
Response:
{
  "slug": "..."
}

### GET /api/get-session?slug=...
Public (sans auth). Retourne quiz + meta.

### POST /api/submit-response
Public (sans auth).
Body JSON:
{
  "sessionId": "...",
  "name": "...",
  "email": "...",
  "score": 7,
  "answers": [...]
}

### GET /api/get-results?sessionId=...
Admin (auth). Export CSV possible.

---

## Services PDF (existant, conserves)

### Service presence/satisfaction/attestation (Python)
POST /api/generate (multipart/form-data)
Fields:
- data (json): { company, training, duration, location, dates, participants, provider, signatory }
- logo (file, optional)
Response: ZIP binaire

### Service convention (Next)
POST /api/generate (application/json)
Fields:
companyName, companyAddress, representativeFirstName, representativeLastName, representativeRole,
trainingName, duration, dateStart, dateEnd, location, instructor, participants,
amountHt, conventionDate
Response: PDF binaire

---

## Erreurs standard
Format:
{
  "error": "message",
  "details": "optionnel"
}

---

## Variables d'environnement (portail)
- ADMIN_PASSWORD
- DATABASE_URL (Neon)
- BLOB_READ_WRITE_TOKEN (Vercel Blob)
- PDF_SERVICE_PRESENCE_URL
- PDF_SERVICE_CONVENTION_URL

---

## Notes
- L archivage est dans Vercel Blob; Neon stocke uniquement l URL + metadata.
- Les services PDF restent inchanges: on les appelle depuis le portail.
