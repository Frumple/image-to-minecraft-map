export interface UploadedFile {
  data: string;
  name: string;
  type: string;
  size: number;
}

export async function fetchFromFile(path: string): Promise<string> {
  return await fetch(path).then(stream => stream.text());
}

export async function readAsDataUrlAsync(file: File): Promise<UploadedFile> {
  return new Promise<UploadedFile>((resolve, reject) => {
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