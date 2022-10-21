export async function fetchFromFile(path: string): Promise<string> {
  return await fetch(path).then(stream => stream.text());
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