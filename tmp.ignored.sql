PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id"                    TEXT PRIMARY KEY NOT NULL,
    "checksum"              TEXT NOT NULL,
    "finished_at"           DATETIME,
    "migration_name"        TEXT NOT NULL,
    "logs"                  TEXT,
    "rolled_back_at"        DATETIME,
    "started_at"            DATETIME NOT NULL DEFAULT current_timestamp,
    "applied_steps_count"   INTEGER UNSIGNED NOT NULL DEFAULT 0
);
INSERT INTO _prisma_migrations VALUES('3a7b4531-1a52-49f1-942f-83b08b0401c2','919aeb7d0afbe00f3f22b074d0b88bee949e41c729fb0725311aff4f5ef50d23',1738957189995,'20230914194400_init',NULL,NULL,1738957189984,1);
INSERT INTO _prisma_migrations VALUES('755bea58-3d58-4fc5-ad94-1996a8c1c2bd','fa58c729de06818f3ca7d05a4be8bc2d07b1eae338be4f4531e2e1d8cd7ed575',1738957190001,'20250109030859_add_meetup_id_to_location',NULL,NULL,1738957189998,1);
INSERT INTO _prisma_migrations VALUES('eaf24c62-b7f7-4f94-9d79-b935f2570286','2641474e740a3b4c23f83fa4e1d71bd70780411a874ac69fdfe52fd3ce9e0b32',1738957190006,'20250109210620_npx_prisma_db_push',NULL,NULL,1738957190004,1);
INSERT INTO _prisma_migrations VALUES('e6a33001-9404-44ca-bb20-4091f061e6e5','aafe1e6ee5d0171c934c9661e2fa6624f8559175450597df12858a3cca31125c',1738957190007,'20250112205148_add_start_time_to_meetup',NULL,NULL,1738957190006,1);
INSERT INTO _prisma_migrations VALUES('65081bdb-1135-43b1-8698-b9b420b069a4','e2a2d48d382b39c86b0998a5a96ce69d65accf92fc41b2eeb625ae76c3aff85e',1738957190009,'20250124044904_required_location_for_meetups',NULL,NULL,1738957190008,1);
INSERT INTO _prisma_migrations VALUES('89190e89-e0f7-4627-b0e4-64e919379cc7','3528948319f0eeb4b3745bb014227497b8177fc8e5f5639bce2c8172f915b6be',1738957190010,'20250124045016_remove_hours',NULL,NULL,1738957190009,1);
INSERT INTO _prisma_migrations VALUES('cfe93d03-e887-4cdf-abb0-a31dd574de7e','7f2f7e045547318f581f4333d7fd00213a737267287c130a65f4fe001ee5b4d4',1738957190013,'20250125232453_move_location_data',NULL,NULL,1738957190011,1);
INSERT INTO _prisma_migrations VALUES('d291d784-cd37-4ebf-82de-4441853731f1','9d0e7b04c1be32eae33ec5e724c25ed7779b1e157f0d0c6d10cf2fd030979a6d',1738957190016,'20250207192535_add_meetup_entity',NULL,NULL,1738957190014,1);
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "Note_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "NoteImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "altText" TEXT,
    "contentType" TEXT NOT NULL,
    "blob" BLOB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "noteId" TEXT NOT NULL,
    CONSTRAINT "NoteImage_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "UserImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "altText" TEXT,
    "contentType" TEXT NOT NULL,
    "blob" BLOB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "UserImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "Password" (
    "hash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expirationDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "Permission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "access" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO Permission VALUES('clnf2zvli0000pcou3zzzzome','create','user','own','',1696625465526,1696625465526);
INSERT INTO Permission VALUES('clnf2zvll0001pcouly1310ku','create','user','any','',1696625465529,1696625465529);
INSERT INTO Permission VALUES('clnf2zvll0002pcouka7348re','read','user','own','',1696625465530,1696625465530);
INSERT INTO Permission VALUES('clnf2zvlm0003pcouea4dee51','read','user','any','',1696625465530,1696625465530);
INSERT INTO Permission VALUES('clnf2zvlm0004pcou2guvolx5','update','user','own','',1696625465531,1696625465531);
INSERT INTO Permission VALUES('clnf2zvln0005pcoun78ps5ap','update','user','any','',1696625465531,1696625465531);
INSERT INTO Permission VALUES('clnf2zvlo0006pcouyoptc5jp','delete','user','own','',1696625465532,1696625465532);
INSERT INTO Permission VALUES('clnf2zvlo0007pcouw1yzoyam','delete','user','any','',1696625465533,1696625465533);
INSERT INTO Permission VALUES('clnf2zvlp0008pcou9r0fhbm8','create','note','own','',1696625465533,1696625465533);
INSERT INTO Permission VALUES('clnf2zvlp0009pcouj3qib9q9','create','note','any','',1696625465534,1696625465534);
INSERT INTO Permission VALUES('clnf2zvlq000apcouxnspejs9','read','note','own','',1696625465535,1696625465535);
INSERT INTO Permission VALUES('clnf2zvlr000bpcouf4cg3x72','read','note','any','',1696625465535,1696625465535);
INSERT INTO Permission VALUES('clnf2zvlr000cpcouy1vp6oeg','update','note','own','',1696625465536,1696625465536);
INSERT INTO Permission VALUES('clnf2zvls000dpcouvzwjjzrq','update','note','any','',1696625465536,1696625465536);
INSERT INTO Permission VALUES('clnf2zvls000epcou4ts5ui8f','delete','note','own','',1696625465537,1696625465537);
INSERT INTO Permission VALUES('clnf2zvlt000fpcouk29jbmxn','delete','note','any','',1696625465538,1696625465538);
INSERT INTO Permission VALUES('cm6v6b067000g10mxzudytn6r','create','meetup','own','',1738957346720,1738957346720);
INSERT INTO Permission VALUES('cm6v6b069000h10mx5szomrrh','create','meetup','any','',1738957346721,1738957346721);
INSERT INTO Permission VALUES('cm6v6b06a000i10mxwrgug26j','read','meetup','own','',1738957346722,1738957346722);
INSERT INTO Permission VALUES('cm6v6b06a000j10mxnmh7dury','read','meetup','any','',1738957346723,1738957346723);
INSERT INTO Permission VALUES('cm6v6b06b000k10mxid7hv02d','update','meetup','own','',1738957346723,1738957346723);
INSERT INTO Permission VALUES('cm6v6b06c000l10mx7yot39l6','update','meetup','any','',1738957346724,1738957346724);
INSERT INTO Permission VALUES('cm6v6b06c000m10mx0idb2nh2','delete','meetup','own','',1738957346725,1738957346725);
INSERT INTO Permission VALUES('cm6v6b06d000n10mxcke1lo65','delete','meetup','any','',1738957346725,1738957346725);
CREATE TABLE IF NOT EXISTS "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO Role VALUES('clnf2zvlw000gpcour6dyyuh6','admin','',1696625465540,1696625465540);
INSERT INTO Role VALUES('clnf2zvlx000hpcou5dfrbegs','user','',1696625465542,1696625465542);
CREATE TABLE IF NOT EXISTS "Verification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL,
    "digits" INTEGER NOT NULL,
    "period" INTEGER NOT NULL,
    "charSet" TEXT NOT NULL,
    "expiresAt" DATETIME
);
CREATE TABLE IF NOT EXISTS "Connection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerName" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Connection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "_PermissionToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO _PermissionToRole VALUES('clnf2zvll0001pcouly1310ku','clnf2zvlw000gpcour6dyyuh6');
INSERT INTO _PermissionToRole VALUES('clnf2zvlm0003pcouea4dee51','clnf2zvlw000gpcour6dyyuh6');
INSERT INTO _PermissionToRole VALUES('clnf2zvln0005pcoun78ps5ap','clnf2zvlw000gpcour6dyyuh6');
INSERT INTO _PermissionToRole VALUES('clnf2zvlo0007pcouw1yzoyam','clnf2zvlw000gpcour6dyyuh6');
INSERT INTO _PermissionToRole VALUES('clnf2zvlp0009pcouj3qib9q9','clnf2zvlw000gpcour6dyyuh6');
INSERT INTO _PermissionToRole VALUES('clnf2zvlr000bpcouf4cg3x72','clnf2zvlw000gpcour6dyyuh6');
INSERT INTO _PermissionToRole VALUES('clnf2zvls000dpcouvzwjjzrq','clnf2zvlw000gpcour6dyyuh6');
INSERT INTO _PermissionToRole VALUES('clnf2zvlt000fpcouk29jbmxn','clnf2zvlw000gpcour6dyyuh6');
INSERT INTO _PermissionToRole VALUES('clnf2zvli0000pcou3zzzzome','clnf2zvlx000hpcou5dfrbegs');
INSERT INTO _PermissionToRole VALUES('clnf2zvll0002pcouka7348re','clnf2zvlx000hpcou5dfrbegs');
INSERT INTO _PermissionToRole VALUES('clnf2zvlm0004pcou2guvolx5','clnf2zvlx000hpcou5dfrbegs');
INSERT INTO _PermissionToRole VALUES('clnf2zvlo0006pcouyoptc5jp','clnf2zvlx000hpcou5dfrbegs');
INSERT INTO _PermissionToRole VALUES('clnf2zvlp0008pcou9r0fhbm8','clnf2zvlx000hpcou5dfrbegs');
INSERT INTO _PermissionToRole VALUES('clnf2zvlq000apcouxnspejs9','clnf2zvlx000hpcou5dfrbegs');
INSERT INTO _PermissionToRole VALUES('clnf2zvlr000cpcouy1vp6oeg','clnf2zvlx000hpcou5dfrbegs');
INSERT INTO _PermissionToRole VALUES('clnf2zvls000epcou4ts5ui8f','clnf2zvlx000hpcou5dfrbegs');
INSERT INTO _PermissionToRole VALUES('cm6v6b069000h10mx5szomrrh','clnf2zvlw000gpcour6dyyuh6');
INSERT INTO _PermissionToRole VALUES('cm6v6b06a000j10mxnmh7dury','clnf2zvlw000gpcour6dyyuh6');
INSERT INTO _PermissionToRole VALUES('cm6v6b06c000l10mx7yot39l6','clnf2zvlw000gpcour6dyyuh6');
INSERT INTO _PermissionToRole VALUES('cm6v6b06d000n10mxcke1lo65','clnf2zvlw000gpcour6dyyuh6');
INSERT INTO _PermissionToRole VALUES('cm6v6b067000g10mxzudytn6r','clnf2zvlx000hpcou5dfrbegs');
INSERT INTO _PermissionToRole VALUES('cm6v6b06a000i10mxwrgug26j','clnf2zvlx000hpcou5dfrbegs');
INSERT INTO _PermissionToRole VALUES('cm6v6b06b000k10mxid7hv02d','clnf2zvlx000hpcou5dfrbegs');
INSERT INTO _PermissionToRole VALUES('cm6v6b06c000m10mx0idb2nh2','clnf2zvlx000hpcou5dfrbegs');
CREATE TABLE IF NOT EXISTS "_RoleToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "Location" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'USA'
);
CREATE TABLE IF NOT EXISTS "Meetup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "locationId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Meetup_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Meetup_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE INDEX "Note_ownerId_idx" ON "Note"("ownerId");
CREATE INDEX "Note_ownerId_updatedAt_idx" ON "Note"("ownerId", "updatedAt");
CREATE INDEX "NoteImage_noteId_idx" ON "NoteImage"("noteId");
CREATE UNIQUE INDEX "UserImage_userId_key" ON "UserImage"("userId");
CREATE UNIQUE INDEX "Password_userId_key" ON "Password"("userId");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE UNIQUE INDEX "Permission_action_entity_access_key" ON "Permission"("action", "entity", "access");
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");
CREATE UNIQUE INDEX "Verification_target_type_key" ON "Verification"("target", "type");
CREATE UNIQUE INDEX "Connection_providerName_providerId_key" ON "Connection"("providerName", "providerId");
CREATE UNIQUE INDEX "_PermissionToRole_AB_unique" ON "_PermissionToRole"("A", "B");
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");
CREATE UNIQUE INDEX "_RoleToUser_AB_unique" ON "_RoleToUser"("A", "B");
CREATE INDEX "_RoleToUser_B_index" ON "_RoleToUser"("B");
CREATE UNIQUE INDEX "Location_street_key" ON "Location"("street");
COMMIT;
