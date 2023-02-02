
export const loadRemoteModule = (remotePackage: string, remoteModule: string, remoteUrl: string, sharedScope = 'default') => {
  return getOrLoadModule(remotePackage, remoteUrl, sharedScope).then((container: any) => {
    return container.get(remoteModule).then((factory) => {
      const Module = factory();
      return Module;
    })
  })
};

function getOrLoadModule(remotePackage: string, remoteUrl: string, shareScope: string,) {

  return new Promise((resolve, reject) => {
    if (!window[remotePackage]) {
      let scriptEle = document.querySelector(`[data-groot-extension="${remotePackage}"]`) as HTMLScriptElement;

      if (scriptEle) {
        scriptEle.onload = onScriptLoad(remotePackage, shareScope, resolve, reject, scriptEle.onload);
        scriptEle.onerror = reject;
      } else {
        scriptEle = document.createElement('script');
        scriptEle.type = 'text/javascript';
        scriptEle.setAttribute('data-groot-extension', `${remotePackage}`);
        scriptEle.async = true;
        scriptEle.onerror = reject;
        scriptEle.onload = onScriptLoad(remotePackage, shareScope, resolve, reject);
        scriptEle.src = remoteUrl;
        document.head.appendChild(scriptEle);
      }
    } else {
      resolve(window[remotePackage]);
    }
  });
}

function onScriptLoad(remotePackage: string, shareScope: string, resolve: Function, reject: Function, originOnload?: Function) {
  return () => {
    if (window[remotePackage].__initialized) {
      reject(new Error('远程插件重复加载'));

      // resolve(window[remotekey]);
      // originOnload && originOnload();
    } else {
      if (typeof __webpack_share_scopes__ === 'undefined') {
        reject(new Error('__webpack_share_scopes__ 未定义'))
      } else {
        window[remotePackage].init(__webpack_share_scopes__[shareScope]);
        window[remotePackage].__initialized = true;
        resolve(window[remotePackage]);
        originOnload && originOnload();
      }
    }
  }
}

declare const __webpack_share_scopes__: any;