import { APIPath, Application, HostConfig, loadRemoteModule, MainType, pick } from "@grootio/common";
import request from "../util/request";
import WorkbenchModel from "./Workbench/WorkbenchModel";

export default class StudioModel extends EventTarget {
  static modelName = 'studio';

  loadStatus: 'doing' | 'no-application' | 'no-solution' | 'no-instance' | 'fetch-extension' | 'notfound' | 'ok' = 'doing';
  workbenchModel?: WorkbenchModel;

  prototypeMode: boolean;
  solution: any;
  application: Application;
  extensionList: { key: string, url: string, main?: MainType }[] = [];
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

    if (localCustomExtension) {
      this.extensionList = localCustomExtension.split(',').map(str => {
        const [key, url] = str.split('@')
        return { key, url }
      });
    } else {
      this.extensionList = this.prototypeMode ? this.solution.extensionList : this.application.extensionList;
    }

    return Promise.all(this.extensionList.map(item => {
      return loadRemoteModule(item.key, 'Main', item.url);
    }))
      .then(
        moduleList => moduleList.map(m => m.default),
        (error) => {
          console.error('加载插件失败');
          return Promise.reject(error);
        })
      .then((mainList: MainType[]) => {
        this.initConfig(mainList);
      })
  }

  private initConfig(mainList: MainType[]) {
    this.config = {
      contributes: {
        sidebarView: [],
        propSettingView: []
      }
    };

    mainList.reduce((config, main, index) => {
      const requestClone = request.clone((type) => {
        if (type === 'request') {
          console.log(`[${this.extensionList[index].key} request]`);
        }
      });

      const newConfig = main({
        request: requestClone,
        studioModel: this
      }, config);

      if (newConfig === config) {
        return config;
      }

      Object.assign(config, pick(newConfig, ['viewportMode']));
      config.contributes.sidebarView.push(...(newConfig.contributes.sidebarView || []));
      config.contributes.propSettingView.push(...(newConfig.contributes.propSettingView || []));
      return config;
    }, this.config);
  }
}