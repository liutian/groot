import { getContext } from "context";

let loaderPromise: Promise<any>;

export const monacoLoader = (path?: string) => {

  let vsPath = path;
  if (!vsPath) {
    const packageUrl = getContext().extPackageUrl
    const url = new URL(packageUrl)
    vsPath = `${packageUrl.replace(url.pathname, '')}/monaco-editor/vs`
  }

  return loaderPromise || (loaderPromise = new Promise((resolve) => {
    const scriptEle = document.createElement('script');

    scriptEle.addEventListener('load', () => {
      (window['require'] as any).config({ paths: { vs: vsPath } });

      (window['require'] as any)(['vs/editor/editor.main'], () => {
        resolve(null);
      });
    });

    scriptEle.src = `${vsPath}/loader.js`;
    document.head.appendChild(scriptEle);
  }))
}