/*
  Warnings:

  - Made the column `locationId` on table `Meetup` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Meetup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL DEFAULT 'Untitled Meetup',
    "description" TEXT NOT NULL DEFAULT '',
    "startTime" DATETIME NOT NULL,
    "locationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "Meetup_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Meetup_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Meetup" ("createdAt", "description", "id", "locationId", "ownerId", "startTime", "title", "updatedAt") SELECT "createdAt", "description", "id", "locationId", "ownerId", "startTime", "title", "updatedAt" FROM "Meetup";
DROP TABLE "Meetup";
ALTER TABLE "new_Meetup" RENAME TO "Meetup";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
