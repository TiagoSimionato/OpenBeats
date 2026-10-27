# OpenBeats

<img width="1896" height="915" alt="image" src="https://github.com/user-attachments/assets/9d2b4dc4-c84d-465f-984f-1e1424390382" />

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

## Development

There are a few requirements to run the project:

- [yt-dlp binary](https://github.com/yt-dlp/yt-dlp)
- [ffmpeg binary](https://ffmpeg.org/)
- [rsgain](https://github.com/complexlogic/rsgain)
- Node and the package manager of your choice (yarn in this example)

Install dependencies by simply running:

```bash
yarn
```

Then, run the development server:

```bash
yarn dev
```

```
docker save -o openbeats.tar openbeats
docker load -i openbeats.tar
```
