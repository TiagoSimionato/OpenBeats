-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tb_tracks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "release_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT,
    "artist_sort" TEXT,
    "genre" TEXT,
    "download_path" TEXT NOT NULL,
    "disc" INTEGER NOT NULL,
    "track_number" INTEGER NOT NULL,
    "ts02" TEXT,
    "music_brainz_release_track_id" TEXT NOT NULL,
    "music_brainz_track_id" TEXT NOT NULL,
    CONSTRAINT "tb_tracks_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "tb_releases" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_tb_tracks" ("artist", "artist_sort", "disc", "download_path", "genre", "id", "music_brainz_release_track_id", "music_brainz_track_id", "release_id", "title", "track_number", "ts02") SELECT "artist", "artist_sort", "disc", "download_path", "genre", "id", "music_brainz_release_track_id", "music_brainz_track_id", "release_id", "title", "track_number", "ts02" FROM "tb_tracks";
DROP TABLE "tb_tracks";
ALTER TABLE "new_tb_tracks" RENAME TO "tb_tracks";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
