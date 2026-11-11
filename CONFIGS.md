# Configuration variables

These environment variables are used by the app and can be set in a `.env` file or passed to Docker Compose.

| Variable | Description | Default |
|----------|-------------|---------|
| `LIBRARY_PATH` | Path to the music library mounted into the Docker container. This is the folder that OpenBeats reads from and manages. | required in Docker Compose |
| `DOWNLOAD_PATH` | Folder where downloaded or imported tracks are stored. In the app, this is the main media destination. Does not have to be set if using Docker Compose | `/data` |
| `CACHE_PATH` | Location for the app cache, database, covers, thumbnails, and generated files. Does not have to be set if using Docker Compose, configure the volume as shown in the example file instead | `/opt/openbeats` |
| `FFMPEG_BIN` | Custom executable path for `ffmpeg`. Use this if `ffmpeg` is not in your `PATH`. | `ffmpeg` |
| `FFPROBE_BIN` | Custom executable path for `ffprobe`. Used for metadata inspection. | `ffprobe` |
| `RSGAIN_BIN` | Custom executable path for `rsgain`. Used for loudness normalization. | `rsgain` |
| `PYTHON_BIN` | Optional override for the Python executable used by helper tooling. | none |
| `YT_DLP_BIN` | Custom executable path for `yt-dlp`. Use this if the binary is installed elsewhere. | `yt-dlp` |
| `ALLOWED_DEV_ORIGINS` | JSON array of origins allowed when developing on another machine or testing from a different host. Example: `["http://localhost:3000"]` | `[]` |
| `DEFAULT_USER` | Username for the default admin account created on first startup. | `admin` |
| `DEFAULT_PASSWORD` | Password for the default admin account. If omitted, the app will generate a random one and print it in the logs. | generated automatically if unset |
| `AUTH_SECRET` | Secret used by NextAuth for session/signing security. Set this to a strong random value. | fallback development secret |
| `LOG_INCOMING_REQUESTS` | Enables request logging for debugging incoming HTTP traffic. | `false` |
