import { createDownloadUrlFromData, getMapFilename } from '@helpers/file-helpers';
import { Settings } from '@models/settings';

export interface MapFileDownload {
  buffer: ArrayBuffer,
  url: string,
  filename: string,
  fileSizeInBytes: number
}

export function createMapFileDownloads(data: readonly ArrayBuffer[][], settings: Settings): MapFileDownload[] {
  const mapFileDownloads: MapFileDownload[] = [];
  let mapId = settings.mapId;

  for (let y = 0; y < settings.numberOfMapsVertical; y++) {
    for (let x = 0; x < settings.numberOfMapsHorizontal; x++) {
      const buffer = data[x][y];
      const download = {
        buffer: buffer,
        url: createDownloadUrlFromData(buffer, 'application/octet-stream'),
        filename: getMapFilename(mapId),
        fileSizeInBytes: buffer.byteLength
      };

      mapFileDownloads.push(download);
      mapId++;
    }
  }

  return mapFileDownloads;
}