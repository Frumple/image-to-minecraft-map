export interface UploadedImage {
  data: string;
  name: string;
  type: string;
  size: number;
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
  return new Promise<UploadedImage>((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.addEventListener('load', () => {
      return resolve({
        data: fileReader.result as string,
        name: file.name,
        type: file.type,
        size: file.size
      });
    });
    fileReader.readAsDataURL(file);
  })
}