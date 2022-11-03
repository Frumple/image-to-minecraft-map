import pako from 'pako';

export async function fetchFromFile(path: string): Promise<string> {
  return await fetch(path).then(stream => stream.text());
}

export function downloadDataAsFile(data: any, contentType: string, fileName: string) {
  const blob = new Blob([data], { type: contentType });
  const link = document.createElement('a');
  link.download = fileName;
  link.href = URL.createObjectURL(blob);
  link.click();
}

export function gzipData(data: Uint8Array) {
  // TODO: Replace pako with the Compressed Streams API when it becomes more widely supported (and is just asz performant)

  // At the time of this writing, the Compressed Streams API is supported by Chrome, but not Firefox or Safari.
  // Firefox: Currently in the "worth prototyping" stage (https://github.com/mozilla/standards-positions/issues/207)
  // Safari: Implemented in Safari Technology Preview 152 (https://webkit.org/blog/13137/release-notes-for-safari-technology-preview-152)

  return pako.gzip(data);
}

export function getFileSizeTextInReadableUnits(sizeInBytes: number): string {
   if (sizeInBytes < 1024) {
     return `${sizeInBytes} bytes`;
   } else if (sizeInBytes < 1048576) {
    const sizeInKilobytes = roundToTwoDecimals(sizeInBytes / 1024);
    return `${sizeInKilobytes} kB`
   } else {
    const sizeInMegabytes = roundToTwoDecimals(sizeInBytes / 1048576);
    return `${sizeInMegabytes} MB`
   }
}

// TODO: Move this to a number helpers module
function roundToTwoDecimals(num: number) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}