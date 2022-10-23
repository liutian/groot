
interface Window {
  define: (
    moduleName: string,
    depsKey: string[],
  ) => void;
  _moduleCallback: (module: any) => void;

  _grootApplicationData: any;
}


