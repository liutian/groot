import { getContext } from "context";

let loaderPromise: Promise<any>;

export const monacoLoader = (path = `${getContext().extPackageUrl}/monaco-editor/vs`) => {

  return loaderPromise || (loaderPromise = new Promise((resolve) => {
    const scriptEle = document.createElement('script');

    scriptEle.addEventListener('load', () => {
      (window['require'] as any).config({ paths: { vs: path } });

      (window['require'] as any)(['vs/editor/editor.main'], () => {
        resolve(null);
      });
    });

    scriptEle.src = `${path}/loader.js`;
    document.head.appendChild(scriptEle);
  }))
}