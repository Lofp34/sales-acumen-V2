ALTER TABLE "companies" ADD COLUMN "address" text;
ALTER TABLE "companies" ADD COLUMN "contact_name" text;
ALTER TABLE "companies" ADD COLUMN "contact_email" text;
ALTER TABLE "companies" ADD COLUMN "contact_phone" text;

ALTER TABLE "participants" ADD COLUMN "company_id" integer;
ALTER TABLE "participants" ADD COLUMN "first_name" text;
ALTER TABLE "participants" ADD COLUMN "last_name" text;
ALTER TABLE "participants" ADD COLUMN "phone" text;
ALTER TABLE "participants" ALTER COLUMN "email" DROP NOT NULL;

CREATE TABLE "trainings" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"title" text NOT NULL,
	"program" text,
	"location" text,
	"duration" text,
	"date_start" text,
	"date_end" text,
	"dates_list" jsonb,
	"instructor" text,
	"provider_name" text,
	"signatory_name" text,
	"convention_date" text,
	"amount_ht" text,
	"amount_tva" text,
	"amount_ttc" text,
	"status" text DEFAULT 'draft',
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "training_participants" (
	"training_id" integer NOT NULL,
	"participant_id" uuid NOT NULL,
	"role" text DEFAULT 'participant',
	"created_at" timestamp DEFAULT now(),
	PRIMARY KEY ("training_id","participant_id")
);

CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"training_id" integer,
	"participant_id" uuid,
	"doc_type" text NOT NULL,
	"file_name" text NOT NULL,
	"blob_url" text NOT NULL,
	"blob_path" text,
	"status" text DEFAULT 'generated',
	"meta" jsonb,
	"created_at" timestamp DEFAULT now()
);

ALTER TABLE "participants" ADD CONSTRAINT "participants_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "trainings" ADD CONSTRAINT "trainings_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "training_participants" ADD CONSTRAINT "training_participants_training_id_trainings_id_fk" FOREIGN KEY ("training_id") REFERENCES "public"."trainings"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "training_participants" ADD CONSTRAINT "training_participants_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "documents" ADD CONSTRAINT "documents_training_id_trainings_id_fk" FOREIGN KEY ("training_id") REFERENCES "public"."trainings"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "documents" ADD CONSTRAINT "documents_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE no action ON UPDATE no action;
