/*
  Warnings:

  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `city` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zip` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Address_locationId_key";

-- DropIndex
DROP INDEX "Address_street_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Address";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Location" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'USA'
);
INSERT INTO "new_Location" ("id", "name") SELECT "id", "name" FROM "Location";
DROP TABLE "Location";
ALTER TABLE "new_Location" RENAME TO "Location";
CREATE UNIQUE INDEX "Location_street_key" ON "Location"("street");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
