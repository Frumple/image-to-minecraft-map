import isRunningInJsdom from '@helpers/is-running-in-jsdom';

import { UploadWorker } from '@workers/upload-worker';

import mitt, { Emitter } from 'mitt';

export function createUploadWorker() {
  if (isRunningInJsdom) {
    return new FakeWorker();
  }

  return new Worker(
    new URL('/src/ts/workers/upload-worker-starter.ts', import.meta.url),
    {type: 'module'}
  );
}

type Events = {
  message: object;
}

class FakeWorker {
  uploadWorker: UploadWorker;

  outerEmitter: Emitter<Events>;
  innerEmitter: Emitter<Events>;

  addEventListener: Function;

  constructor() {
    console.log('outer constructor');
    this.uploadWorker = new UploadWorker();

    this.outerEmitter = mitt();
    this.innerEmitter = mitt();

    this.addEventListener = this.outerEmitter.on;

    // @ts-ignore
    this.innerEmitter.on('message', this.uploadWorker.onMessageReceived);

    this.uploadWorker.workerGlobalScope.postMessage = (data: any) => {
      this.outerEmitter.emit('message', { data });
    }
  }

  postMessage(data: any) {
    console.log('outer postMessage');
    console.log(this.innerEmitter.all);
    this.innerEmitter.emit('message', { data });
  }
}
