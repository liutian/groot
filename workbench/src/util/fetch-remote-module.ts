
export const loadRemoteModule = (remoteKey: string, remoteModule: string, remoteUrl: string, sharedScope = 'default') => {
  return () => {
    return getOrLoadModule(remoteKey, remoteUrl, sharedScope).then((container: any) => {
      return container.get(remoteModule).then((factory) => {
        const Module = factory();
        return Module;
      })
    })
  };
};

function getOrLoadModule(remoteKey: string, remoteUrl: string, shareScope: string,) {

  return new Promise((resolve, reject) => {
    if (!window[remoteKey]) {
      let scriptEle = document.querySelector(`[data-groot-plugin="${remoteKey}"]`) as HTMLScriptElement;

      if (scriptEle) {
        scriptEle.onload = onScriptLoad(remoteKey, shareScope, resolve, reject, scriptEle.onload);
        scriptEle.onerror = reject;
      } else {
        scriptEle = document.createElement('script');
        scriptEle.type = 'text/javascript';
        scriptEle.setAttribute('data-groot-plugin', `${remoteKey}`);
        scriptEle.async = true;
        scriptEle.onerror = reject;
        scriptEle.onload = onScriptLoad(remoteKey, shareScope, resolve, reject);
        scriptEle.src = remoteUrl;
        document.head.appendChild(scriptEle);
      }
    } else {
      resolve(window[remoteKey]);
    }
  });
}

function onScriptLoad(remoteKey: string, shareScope: string, resolve: Function, reject: Function, originOnload?: Function) {
  return () => {
    if (window[remoteKey].__initialized) {
      reject(new Error('远程插件重复加载'));

      // resolve(window[remotekey]);
      // originOnload && originOnload();
    } else {
      if (typeof __webpack_share_scopes__ === 'undefined') {
        reject(new Error('__webpack_share_scopes__ 未定义'))
      } else {
        window[remoteKey].init(__webpack_share_scopes__[shareScope]);
        window[remoteKey].__initialized = true;
        resolve(window[remoteKey]);
        originOnload && originOnload();
      }
    }
  }
}
