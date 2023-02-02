import { APIPath, Application, HostConfig, loadRemoteModule, MainType, pick } from "@grootio/common";
import request from "../util/request";
import WorkbenchModel from "./Workbench/WorkbenchModel";

export default class StudioModel extends EventTarget {
  static modelName = 'studio';

  loadStatus: 'doing' | 'no-application' | 'no-solution' | 'no-instance' | 'fetch-plugin' | 'notfound' | 'ok' = 'doing';
  workbenchModel?: WorkbenchModel;

  prototypeMode: boolean;
  solution: any;
  application: Application;
  pluginList: { key: string, url: string, main?: MainType }[] = [];
  config: HostConfig;

  public fetchSolution = (solutionId: number) => {
    return request(APIPath.solution_detail_solutionId, { solutionId }).then(({ data }) => {
      this.solution = data;
      this.loadStatus = 'fetch-plugin';
    }).catch((e) => {
      this.loadStatus = 'no-solution';
      return Promise.reject(e);
    })
  }

  public fetchApplication = (applicationId: number, releaseId?: number) => {
    return request(APIPath.application_detail_applicationId, { applicationId, releaseId }).then(({ data }) => {
      this.application = data;
      this.loadStatus = 'fetch-plugin';
    }).catch((e) => {
      this.loadStatus = 'no-application';
      return Promise.reject(e);
    })
  }

  public loadPlugin() {
    const customPluginList = (localStorage.getItem('groot_plugin') || '').split(',')

    if (customPluginList.length) {
      this.pluginList = customPluginList.map(str => {
        const [key, url] = str.split('@')
        return { key, url }
      });
    } else {
      this.pluginList = this.prototypeMode ? this.solution.pluginList : this.application.pluginList;
    }

    return Promise.all(this.pluginList.map(item => {
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
        this.loadStatus = 'ok';
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
          console.log(`[${this.pluginList[index].key} request]`);
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