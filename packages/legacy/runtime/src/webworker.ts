import { transform } from '@grootio/core';
import { WebWorkerInputMessage, WebWorkerOutputMessage, WebWorkerType } from './types';

const defaultOptions: WebWorkerType = {
} as any;

const options: WebWorkerType = Object.assign(
  { ...defaultOptions },
  JSON.parse((self as any).name)
);

// fix tsWorker
(self as any).define = function () {
  // console.log('')
};

(self as any).importScripts(options.tsWorkerUrl);

const transpileModule = (self as any).ts.transpileModule;

(self as any).postMessage('ok');

self.addEventListener('message', (event) => {
  const { type, metadata, path } = event.data as WebWorkerInputMessage;
  if (type === 'transformCode') {
    const code = transform(metadata, transpileModule);
    const message: WebWorkerOutputMessage = {
      type: 'emitCode',
      path,
      code,
    };

    (self as any).postMessage(message);
  }
});


