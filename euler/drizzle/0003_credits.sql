CREATE TABLE "user_credits" (
	"user_id" text PRIMARY KEY NOT NULL,
	"credits" integer DEFAULT 20 NOT NULL,
	"last_credit_reset" timestamp
);
--> statement-breakpoint
ALTER TABLE "user_credits" ADD CONSTRAINT "user_credits_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
INSERT INTO "user_credits" ("user_id", "credits")
SELECT "id", 20 FROM "user";
--> statement-breakpoint
UPDATE "user_credits" SET "credits" = 500
WHERE "user_id" IN (
  SELECT "reference_id" FROM "subscription"
  WHERE "plan" = 'creator' AND "status" IN ('active', 'trialing')
);
--> statement-breakpoint
UPDATE "user_credits" SET "credits" = 1000
WHERE "user_id" IN (
  SELECT "reference_id" FROM "subscription"
  WHERE "plan" = 'pro' AND "status" IN ('active', 'trialing')
);
