/*
  Warnings:

  - You are about to drop the `DailyActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserStats` table. If the table is not empty, all the data it contains will be lost.
*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "DailyActivity";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UserStats";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "VocabWord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "headword" TEXT NOT NULL,
    "lemma" TEXT NOT NULL,
    "pos" TEXT NOT NULL,
    "cefr" TEXT NOT NULL,
    "freqRank" INTEGER,
    "definitionEn" TEXT NOT NULL,
    "definitionZh" TEXT NOT NULL,
    "exampleEn" TEXT NOT NULL,
    "ipa" TEXT,
    "audioUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VocabTopic" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "VocabWordTopic" (
    "wordId" TEXT NOT NULL,
    "topicId" INTEGER NOT NULL,

    PRIMARY KEY ("wordId", "topicId"),
    CONSTRAINT "VocabWordTopic_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "VocabWord" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VocabWordTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "VocabTopic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VocabLevel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "VocabWordLevel" (
    "wordId" TEXT NOT NULL,
    "levelId" INTEGER NOT NULL,

    PRIMARY KEY ("wordId", "levelId"),
    CONSTRAINT "VocabWordLevel_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "VocabWord" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VocabWordLevel_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "VocabLevel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "VocabWord_headword_idx" ON "VocabWord"("headword");
-- CreateIndex
CREATE INDEX "VocabWord_cefr_idx" ON "VocabWord"("cefr");
-- CreateIndex
CREATE UNIQUE INDEX "VocabWord_lemma_pos_key" ON "VocabWord"("lemma", "pos");
-- CreateIndex
CREATE UNIQUE INDEX "VocabTopic_code_key" ON "VocabTopic"("code");
-- CreateIndex
CREATE UNIQUE INDEX "VocabLevel_code_key" ON "VocabLevel"("code");
