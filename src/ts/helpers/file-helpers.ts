export async function fetchFromFile(path: string): Promise<string> {
  return await fetch(path).then(stream => stream.text());
}