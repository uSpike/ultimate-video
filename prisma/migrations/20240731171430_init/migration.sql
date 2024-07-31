-- CreateTable
CREATE TABLE "Player" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "genderMatch" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PlayerLine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "tournamentId" INTEGER NOT NULL,
    CONSTRAINT "PlayerLine_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "opponent" TEXT NOT NULL,
    "tournamentId" INTEGER NOT NULL,
    "videoFile" TEXT NOT NULL,
    CONSTRAINT "Game_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GamePoint" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "lineId" INTEGER NOT NULL,
    "startTime" INTEGER NOT NULL,
    "endTime" INTEGER NOT NULL,
    "offenseDefense" TEXT NOT NULL,
    CONSTRAINT "GamePoint_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GamePoint_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "PlayerLine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GamePointAction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "time" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "pointId" INTEGER NOT NULL,
    "primaryPlayerId" INTEGER,
    "secondaryPlayerId" INTEGER,
    CONSTRAINT "GamePointAction_pointId_fkey" FOREIGN KEY ("pointId") REFERENCES "GamePoint" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GamePointAction_primaryPlayerId_fkey" FOREIGN KEY ("primaryPlayerId") REFERENCES "Player" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "GamePointAction_secondaryPlayerId_fkey" FOREIGN KEY ("secondaryPlayerId") REFERENCES "Player" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_PlayerToTournament" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_PlayerToTournament_A_fkey" FOREIGN KEY ("A") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PlayerToTournament_B_fkey" FOREIGN KEY ("B") REFERENCES "Tournament" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_PlayerToPlayerLine" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_PlayerToPlayerLine_A_fkey" FOREIGN KEY ("A") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PlayerToPlayerLine_B_fkey" FOREIGN KEY ("B") REFERENCES "PlayerLine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_GamePointToPlayer" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_GamePointToPlayer_A_fkey" FOREIGN KEY ("A") REFERENCES "GamePoint" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_GamePointToPlayer_B_fkey" FOREIGN KEY ("B") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_name_key" ON "Player"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerLine_name_tournamentId_key" ON "PlayerLine"("name", "tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "Tournament_name_key" ON "Tournament"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Game_videoFile_tournamentId_key" ON "Game"("videoFile", "tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "_PlayerToTournament_AB_unique" ON "_PlayerToTournament"("A", "B");

-- CreateIndex
CREATE INDEX "_PlayerToTournament_B_index" ON "_PlayerToTournament"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PlayerToPlayerLine_AB_unique" ON "_PlayerToPlayerLine"("A", "B");

-- CreateIndex
CREATE INDEX "_PlayerToPlayerLine_B_index" ON "_PlayerToPlayerLine"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GamePointToPlayer_AB_unique" ON "_GamePointToPlayer"("A", "B");

-- CreateIndex
CREATE INDEX "_GamePointToPlayer_B_index" ON "_GamePointToPlayer"("B");
