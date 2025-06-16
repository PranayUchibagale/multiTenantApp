BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "customer" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "email" varchar NOT NULL, "phone" varchar NOT NULL, "createdByTenantId" integer NOT NULL, "isSynced" boolean NOT NULL DEFAULT (0), "updated_at" datetime NOT NULL, "is_deleted" boolean NOT NULL DEFAULT (0));
COMMIT;
