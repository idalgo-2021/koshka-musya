-- Create extension "pgcrypto"
CREATE EXTENSION "pgcrypto" WITH SCHEMA "public" VERSION "1.3";
-- Create "listing_types" table
CREATE TABLE "public"."listing_types" (
  "id" serial NOT NULL,
  "slug" text NOT NULL,
  "name" text NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "listing_types_slug_key" UNIQUE ("slug")
);
-- Create "listings" table
CREATE TABLE "public"."listings" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "description" text NULL,
  "listing_type_id" integer NOT NULL,
  "address" text NULL,
  "city" text NULL,
  "country" text NULL,
  "latitude" double precision NULL,
  "longitude" double precision NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "is_active" boolean NOT NULL DEFAULT true,
  "code" uuid NOT NULL,
  "main_picture" text NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "listings_listing_type_id_fkey" FOREIGN KEY ("listing_type_id") REFERENCES "public"."listing_types" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create index "listings_code_uniq_key" to table: "listings"
CREATE UNIQUE INDEX "listings_code_uniq_key" ON "public"."listings" ("code");
-- Create "roles" table
CREATE TABLE "public"."roles" (
  "id" serial NOT NULL,
  "name" character varying(50) NOT NULL,
  "description" text NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "roles_name_key" UNIQUE ("name")
);
-- Create "users" table
CREATE TABLE "public"."users" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "username" character varying(50) NOT NULL,
  "email" character varying(255) NULL,
  "password_hash" character varying(255) NOT NULL,
  "role_id" integer NULL DEFAULT 3,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  CONSTRAINT "users_email_key" UNIQUE ("email"),
  CONSTRAINT "users_username_key" UNIQUE ("username"),
  CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles" ("id") ON UPDATE NO ACTION ON DELETE RESTRICT
);
-- Create "assignment_statuses" table
CREATE TABLE "public"."assignment_statuses" (
  "id" serial NOT NULL,
  "slug" text NOT NULL,
  "name" text NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "assignment_statuses_slug_key" UNIQUE ("slug")
);
-- Create "assignments" table
CREATE TABLE "public"."assignments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "listing_id" uuid NOT NULL,
  "purpose" text NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "expires_at" timestamp NOT NULL,
  "reporter_id" uuid NOT NULL,
  "accepted_at" timestamp NULL,
  "deadline" timestamp NULL,
  "status_id" integer NOT NULL DEFAULT 1,
  "code" uuid NOT NULL,
  "declined_at" timestamp NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "assignments_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "assignments_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "public"."users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "assignments_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "public"."assignment_statuses" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create index "assignments_code_uniq_key" to table: "assignments"
CREATE UNIQUE INDEX "assignments_code_uniq_key" ON "public"."assignments" ("code");
-- Create "answer_types" table
CREATE TABLE "public"."answer_types" (
  "id" serial NOT NULL,
  "slug" text NOT NULL,
  "name" text NOT NULL,
  "meta" jsonb NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "answer_types_slug_key" UNIQUE ("slug")
);
-- Create "media_requirements" table
CREATE TABLE "public"."media_requirements" (
  "id" serial NOT NULL,
  "slug" text NOT NULL,
  "name" text NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "media_requirements_slug_key" UNIQUE ("slug")
);
-- Create "checklist_sections" table
CREATE TABLE "public"."checklist_sections" (
  "id" serial NOT NULL,
  "listing_type_id" integer NOT NULL,
  "slug" text NOT NULL,
  "title" text NOT NULL,
  "sort_order" integer NOT NULL DEFAULT 0,
  PRIMARY KEY ("id"),
  CONSTRAINT "checklist_sections_listing_type_id_slug_key" UNIQUE ("listing_type_id", "slug"),
  CONSTRAINT "checklist_sections_listing_type_id_fkey" FOREIGN KEY ("listing_type_id") REFERENCES "public"."listing_types" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);
-- Create "checklist_items" table
CREATE TABLE "public"."checklist_items" (
  "id" serial NOT NULL,
  "listing_type_id" integer NOT NULL,
  "answer_type_id" integer NOT NULL,
  "slug" text NOT NULL,
  "title" text NOT NULL,
  "description" text NULL,
  "media_requirement_id" integer NOT NULL DEFAULT 1,
  "media_allowed_types" text[] NOT NULL DEFAULT ARRAY['image'::text],
  "media_max_files" smallint NOT NULL DEFAULT 1,
  "section_id" integer NOT NULL,
  "sort_order" integer NOT NULL DEFAULT 0,
  "is_active" boolean NOT NULL DEFAULT true,
  PRIMARY KEY ("id"),
  CONSTRAINT "checklist_items_answer_type_id_fkey" FOREIGN KEY ("answer_type_id") REFERENCES "public"."answer_types" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "checklist_items_listing_type_id_fkey" FOREIGN KEY ("listing_type_id") REFERENCES "public"."listing_types" ("id") ON UPDATE NO ACTION ON DELETE CASCADE,
  CONSTRAINT "checklist_items_media_requirement_id_fkey" FOREIGN KEY ("media_requirement_id") REFERENCES "public"."media_requirements" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "checklist_items_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."checklist_sections" ("id") ON UPDATE NO ACTION ON DELETE RESTRICT,
  CONSTRAINT "checklist_items_media_max_files_check" CHECK (media_max_files >= 0)
);
-- Create "report_statuses" table
CREATE TABLE "public"."report_statuses" (
  "id" serial NOT NULL,
  "slug" text NOT NULL,
  "name" text NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "report_statuses_slug_key" UNIQUE ("slug")
);
-- Create "reports" table
CREATE TABLE "public"."reports" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "assignment_id" uuid NOT NULL,
  "listing_id" uuid NOT NULL,
  "reporter_id" uuid NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL,
  "submitted_at" timestamp NULL,
  "status_id" integer NOT NULL DEFAULT 1,
  "checklist_schema" jsonb NULL,
  "purpose" text NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "reports_assignment_id_key" UNIQUE ("assignment_id"),
  CONSTRAINT "reports_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "reports_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "public"."users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "reports_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "public"."report_statuses" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
