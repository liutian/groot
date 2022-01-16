import { transform } from '@groot/core';
import { InputMessage, OutputMessage } from './types';

const defaultOptions: optionsType = {
  tsWorkerUrl:
    'https://typescript.azureedge.net/cdn/4.3.4/monaco/min/vs/language/typescript/tsWorker.js',
};

const options: optionsType = Object.assign(
  {},
  defaultOptions,
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
  const { type, metadata, path } = event.data as InputMessage;
  if (type === 'transformCode') {
    const code = transform(metadata, { transpileModule });
    const message: OutputMessage = {
      type: 'emitCode',
      path,
      code,
    };

    (self as any).postMessage(message);
  }
});

type optionsType = {
  tsWorkerUrl: string;
};
