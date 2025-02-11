-- CreateTable
CREATE TABLE "MeetupParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MeetupParticipant_meetupId_fkey" FOREIGN KEY ("meetupId") REFERENCES "Meetup" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MeetupParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MeetupParticipant_userId_idx" ON "MeetupParticipant"("userId");

-- CreateIndex
CREATE INDEX "MeetupParticipant_meetupId_idx" ON "MeetupParticipant"("meetupId");

-- CreateIndex
CREATE UNIQUE INDEX "MeetupParticipant_meetupId_userId_key" ON "MeetupParticipant"("meetupId", "userId");
