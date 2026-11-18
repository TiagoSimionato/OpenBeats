-- CreateTable
CREATE TABLE "tb_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "tb_releases" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "album" TEXT NOT NULL,
    "album_artist" TEXT NOT NULL,
    "release_type" TEXT NOT NULL,
    "release_date" TEXT,
    "original_year" INTEGER,
    "publisher" TEXT,
    "track_count" INTEGER NOT NULL,
    "disc_total" INTEGER NOT NULL,
    "tmed" TEXT,
    "music_brainz_album_release_country" TEXT,
    "music_brainz_album_status" TEXT,
    "music_brainz_album_artist_id" TEXT NOT NULL,
    "music_brainz_album_id" TEXT NOT NULL,
    "music_brainz_artist_id" TEXT NOT NULL,
    "music_brainz_release_group_id" TEXT NOT NULL,
    "cover_path" TEXT
);

-- CreateTable
CREATE TABLE "tb_tracks" (
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
    CONSTRAINT "tb_tracks_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "tb_releases" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tb_failed_tracks" (
    "release_id" TEXT NOT NULL,
    "track_id" TEXT NOT NULL,
    "title" TEXT,
    "artist" TEXT,
    "reason" TEXT NOT NULL,

    PRIMARY KEY ("track_id", "release_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tb_users_username_key" ON "tb_users"("username");
