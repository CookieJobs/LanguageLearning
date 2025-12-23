-- input: 无
-- output: 无
-- pos: 系统/通用
-- 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
-- CreateTable
CREATE TABLE "WordMastery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "partOfSpeech" TEXT NOT NULL,
    "example" TEXT NOT NULL,
    "userSentence" TEXT NOT NULL,
    "masteredAt" DATETIME NOT NULL,
    CONSTRAINT "WordMastery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
