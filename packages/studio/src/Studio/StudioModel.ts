import { APIPath, Application, ExtensionRuntime, HostConfig, loadRemoteModule, MainType } from "@grootio/common";
import request from "../util/request";
import { executeCommand, registerCommand } from "./groot";
import WorkbenchModel from "./Workbench/WorkbenchModel";

export default class StudioModel extends EventTarget {
  static modelName = 'studio';

  loadStatus: 'doing' | 'no-application' | 'no-solution' | 'no-instance' | 'fetch-extension' | 'notfound' | 'ok' = 'doing';
  workbenchModel?: WorkbenchModel;

  prototypeMode: boolean;
  solution: any;
  application: Application;
  extensionList: ExtensionRuntime[] = [];
  config: HostConfig;

  public fetchSolution = (solutionId: number) => {
    return request(APIPath.solution_detail_solutionId, { solutionId }).then(({ data }) => {
      this.solution = data;
      this.loadStatus = 'fetch-extension';
    }).catch((e) => {
      this.loadStatus = 'no-solution';
      return Promise.reject(e);
    })
  }

  public fetchApplication = (applicationId: number, releaseId?: number) => {
    return request(APIPath.application_detail_applicationId, { applicationId, releaseId }).then(({ data }) => {
      this.application = data;
      this.loadStatus = 'fetch-extension';
    }).catch((e) => {
      this.loadStatus = 'no-application';
      return Promise.reject(e);
    })
  }

  public loadExtension = () => {
    const localCustomExtension = localStorage.getItem('groot_extension');

    let remoteExtensions: { key: string, url: string }[] = [];
    if (localCustomExtension) {
      remoteExtensions = localCustomExtension.split(',').map(str => {
        const [key, url] = str.split('@')
        return { key, url }
      });
    } else {
      remoteExtensions = this.prototypeMode ? this.solution.extensionList : this.application.extensionList;
    }

    return Promise.all(remoteExtensions.map(item => {
      return loadRemoteModule(item.key, 'Main', item.url);
    }))
      .then(
        moduleList => moduleList.map(m => m.default),
        (error) => {
          console.error('加载插件失败');
          return Promise.reject(error);
        })
      .then((mainList: MainType[]) => {
        const extensionConfigList = this.parseExtensionConfig(mainList);
        this.extensionList = remoteExtensions.map(({ key, url }, index) => {
          return {
            key,
            url,
            main: mainList[index],
            config: extensionConfigList[index]
          }
        })
      })
  }

  private parseExtensionConfig(mainList: MainType[]) {
    return mainList.map((main, index) => {
      const requestClone = request.clone((type) => {
        if (type === 'request') {
          console.log(`[${this.extensionList[index].key} request]`);
        }
      });

      const extensionConfig = main({
        request: requestClone,
        studioModel: this,
        groot: {
          commands: {
            registerCommand: (command, callback, thisArg) => {
              return registerCommand(command, callback, thisArg);
            },
            executeCommand: (command, ...args) => {
              return executeCommand(command, ...args);
            }
          }
        }
      });

      return extensionConfig;
    });
  }
}