# OpenBeats

<img width="1896" height="915" alt="image" src="https://github.com/user-attachments/assets/9d2b4dc4-c84d-465f-984f-1e1424390382" />

The project is focused on self hosting and aims to provide a web UI to make the management of a musical library easy and seamless across devices

## Features

- [x] Mobile Responsive Web UI so the library can be managed on the go 
- [x] Easily add, delete or replace files in your collection
- [x] Automatic Metadata tagging using [musicbrainz](https://musicbrainz.org) database
- [x] Automatic [rsgain](https://github.com/complexlogic/rsgain) so supported players play songs with adjust volume during playback

## Installing

The recommended way to run OpenBeats is with Docker Compose. The repository includes a [`docker-compose-example.yml`](https://github.com/TiagoSimionato/OpenBeats/blob/main/docker-compose-example.yml) that mounts your music library into the container and exposes the app on port `5334`.

Before starting, create a `.env` file next to `docker-compose.yml` and set at least the path to your library:

```env
LIBRARY_PATH=/path/to/your/library
```

Optional variables you may want to define:

```env
DEFAULT_USER=admin
DEFAULT_PASSWORD=change-me
AUTH_SECRET=insert-a-long-random-string
CACHE_PATH=/opt/openbeats
```

If `DEFAULT_PASSWORD` is not provided, the app will generate a random default password on first startup and print it in the logs.
Refer to [CONFIGS.md](https://github.com/TiagoSimionato/OpenBeats/blob/main/CONFIGS.md) for available `env` configuration options

Then start the stack:

```bash
docker compose up -d
```

## Development

To work on the app locally, you need the following tools installed:

- [yt-dlp binary](https://github.com/yt-dlp/yt-dlp)
- [ffmpeg binary](https://ffmpeg.org/)
- [rsgain](https://github.com/complexlogic/rsgain)
- Node.js and a package manager

Install dependencies:

```bash
yarn
```

Run the app in development mode:

```bash
yarn dev
```
### Useful project scripts

```bash
yarn build
yarn start
yarn lint
yarn tsc
```

- `yarn build` creates a production build
- `yarn start` runs the production app
- `yarn lint` checks code quality
- `yarn tsc` runs the TypeScript compiler

### Notes

- The Docker app mounts your library into `/data` inside the container.
- The app stores its local cache and SQLite database under `CACHE_PATH`, which defaults to `/opt/openbeats`.
- If you plan to use custom credentials, define `DEFAULT_USER` and `DEFAULT_PASSWORD` in `.env` before the first run to avoid the generated password flow.

### Exporting and importing a Docker image

If you want to save the built image and load it elsewhere:

```
docker save -o openbeats.tar openbeats
docker load -i openbeats.tar
```
