import type { ClassConstructor } from 'class-transformer';
import type { Track } from 'common/types/requests/releases';
import { execFile } from 'node:child_process';
import { mkdir, readdir } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { plainToInstance } from 'class-transformer';
import { validate, validateOrReject } from 'class-validator';
import { CONFIGS } from 'configs/constants';
import { Pagination } from './requests/pagination.dto';

const AUDIO_FILE_EXTENSIONS = new Set([
  '.aac',
  '.flac',
  '.m4a',
  '.mp3',
  '.ogg',
  '.opus',
  '.wav',
]);

export const isAudioFile = (filePath: string) => AUDIO_FILE_EXTENSIONS.has(extname(filePath).toLowerCase());

export const walkFiles = async (directoryPath: string): Promise<string[]> => {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const filePaths: string[] = [];

  for (const entry of entries) {
    const entryPath = join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      filePaths.push(...await walkFiles(entryPath));
      continue;
    }

    if (entry.isFile()) {
      filePaths.push(entryPath);
    }
  }

  return filePaths;
};

export const execFileAsync = promisify(execFile);

export const sanitize = (s: string) =>
  s.replace(/\s+/g, ' ')
    .trim()
    .replace(/[<>:"/\\|?*-]/g, '')
    .replace(/^\.+|\.+$/g, '');

export const buildDTO = async <DTO extends ClassConstructor<any>>(ClassDTO: DTO, obj: object, throwError: boolean = true) => {
  const dto = plainToInstance(ClassDTO, obj);

  if (throwError) {
    await validateOrReject(dto);
  }
  if (!throwError) {
    await validate(dto).then((errors) => {
      errors.forEach((error) => {
        (dto as any)[error.property] = undefined;
      });
    });
  }

  return dto as InstanceType<DTO>;
};

export const buildPagination = async (params: object) => {
  const pagination = await buildDTO(Pagination, params, false);
  if (!pagination.page)
    pagination.page = 1;
  if (!pagination.perPage)
    pagination.perPage = 18;
  if (pagination.perPage > 100)
    pagination.perPage = 100;
  return pagination;
};

export const paginationFilters = (pagination: Pagination) => `LIMIT ${pagination.perPage} OFFSET ${(pagination.page - 1) * pagination.perPage}`;

export const makeTrackPath = async (track: Track) => {
  const absoluteLibraryPath = resolve(CONFIGS.DOWNLOAD_PATH);
  const artist = sanitize(track.album_artist);
  const album = sanitize(track.album);
  const title = sanitize(track.title);

  const outputDir = join(absoluteLibraryPath, artist, album);
  await mkdir(outputDir, { recursive: true });

  const trackPath = join(outputDir, `${track.track}. ${title}`);
  track.trackPath = trackPath;
  return trackPath;
};
