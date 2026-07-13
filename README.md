# OpenBeats

The project goal is to provide a simple and pratical way to manage music libraries for self hosted systems by providing a modern and friendly web user interface.

## Installing

There is a `docker-compose.yml` with the important configuration part to use as example. It is important to provide your local `LIBRARY_PATH`. The default way is to create a `.env` file on the same folder as the `docker-compose.yml` and provide the path to your local libray there, such as 

```
LIBRARY_PATH=/path/to/your/library
```

Cloning the repo and running:

```bash
docker compose up -d
```

Should build the app image from local `Dockerfile` and start the app at port 5334

## Roadmap

Below there is a list of planned upcoming changes as reference

- Release page
  - Delete local tracks (entire release or a single track) (delete cover cache) (delete folder if empty)
  - Add missing track from a release
  - Replace/Update Metadata from files
  - Replace track file
  - Add or change cover (upload file or from cover art archive)
- Library page
  - filter releases by name
  - choose sorting
  - pagination
- Generate auth secret during docker build
- Search keywords blacklist
- Run `yt-dlp --update`
- Progress bug with multiple tracks
- Query artist tracks
- Query for single  or few tracks
- Handle Sign in error
- Connect with navidrome and perform a library scan after an update
- Parallel downloads
- Remove unused svg
- Find duplicate tracks
- Server side queue
- Open large cover modal on click
- Cancel downloads
- Validation endpoint returns are correct
- Save file path template
- Clear cover cache

## Development

There are a few requirements to run the project:

- [yt-dlp binary](https://github.com/yt-dlp/yt-dlp)
- [ffmpeg binary](https://ffmpeg.org/)
- Python env with ytmusicapi installed
- Node and the package manager of your choice (yarn in this example)

Install dependencies by simply running:

```bash
yarn
```

Then, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
