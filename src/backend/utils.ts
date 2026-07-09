import { execFile } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { promisify } from 'node:util';

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
  s
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[<>:"/\\|?*-]/g, '')
    .replace(/\.+$/g, '');

export const padTrack = (n: number) => String(n ?? 0).padStart(2, '0');
