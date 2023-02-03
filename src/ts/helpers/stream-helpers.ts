export async function readEntireStream(stream: ReadableStream): Promise<Blob> {
  const reader = stream.getReader();
  let buffer = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      return new Blob(buffer);
    }
    buffer.push(value);
  }
}