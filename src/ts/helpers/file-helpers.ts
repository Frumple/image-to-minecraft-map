export interface ImageFromFile {
  data: string;
  name: string;
  size: number;
  type: string;
}

export async function fetchFromFile(path: string): Promise<string> {
  return await fetch(path).then(stream => stream.text());
}

export async function convertFilesToImages(files: File[]) {
  return Promise.all(
    files.map(f => { return readAsDataURLPromise(f) })
  );
}

function readAsDataURLPromise(file: File) {
  return new Promise<ImageFromFile>((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.addEventListener('load', () => {
      return resolve({
        data: fileReader.result as string,
        name: file.name,
        size: file.size,
        type: file.type
      });
    });
    fileReader.readAsDataURL(file);
  })
}