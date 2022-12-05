import { roundToDecimalPlaces } from '@helpers/number-helpers';

import pako from 'pako';

export async function fetchText(path: string | URL): Promise<string> {
  return await fetch(path)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Fetch response was not OK: ${response.status}`);
      }
      return response.text();
    })
    .catch(error => { throw error; });
}

export async function fetchBlob(path: string | URL): Promise<Blob> {
  return await fetch(path)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Fetch response was not OK: ${response.status}`);
      }
      return response.blob();
    })
    .catch(error => { throw error; });
}

export function createDownloadUrlFromData(data: any, contentType: string) {
  const blob = new Blob([data], { type: contentType });
  return URL.createObjectURL(blob);
}

export function downloadDataAsFile(data: any, contentType: string, fileName: string) {
  const link = document.createElement('a');
  link.href = createDownloadUrlFromData(data, contentType);
  link.download = fileName;
  link.click();
}

export function gzipData(data: Uint8Array) {
  // TODO: Replace pako with the Compressed Streams API when it becomes more widely supported (and is just as performant)

  // At the time of this writing, the Compressed Streams API is supported by Chrome, but not Firefox or Safari.
  // Firefox: Currently in the "worth prototyping" stage (https://github.com/mozilla/standards-positions/issues/207)
  // Safari: Implemented in Safari Technology Preview 152 (https://webkit.org/blog/13137/release-notes-for-safari-technology-preview-152)

  return pako.gzip(data);
}

export function getFileSizeTextInReadableUnits(sizeInBytes: number): string {
   if (sizeInBytes < 1024) {
     return `${sizeInBytes} bytes`;
   } else if (sizeInBytes < 1048576) {
    const sizeInKilobytes = roundToDecimalPlaces(sizeInBytes / 1024, 2);
    return `${sizeInKilobytes} kB`
   } else {
    const sizeInMegabytes = roundToDecimalPlaces(sizeInBytes / 1048576, 2);
    return `${sizeInMegabytes} MB`
   }
}

export function getMapFilename(mapId: number) {
  return `map_${mapId}.dat`;
}