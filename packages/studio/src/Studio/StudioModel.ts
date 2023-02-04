import { APIPath, Application, GridLayout, HostConfig, MainType, StudioMode } from "@grootio/common";
import request from "../util/request";
import { execExtension, loadExtension } from "./groot";

export default class StudioModel extends EventTarget {
  static modelName = 'studio';

  loadStatus: 'doing' | 'no-application' | 'no-solution' | 'no-instance' | 'fetch-extension' | 'notfound' | 'ok' = 'doing';

  studioMode: StudioMode;
  solution: any;
  application: Application;
  account: any;

  config: HostConfig;

  public fetchSolution = (solutionId: number) => {
    return request(APIPath.solution_detail_solutionId, { solutionId }).then(({ data }) => {
      this.solution = data;
    }).catch((e) => {
      this.loadStatus = 'no-solution';
      return Promise.reject(e);
    })
  }

  public fetchApplication = (applicationId: number, releaseId?: number) => {
    return request(APIPath.application_detail_applicationId, { applicationId, releaseId }).then(({ data }) => {
      this.application = data;
    }).catch((e) => {
      this.loadStatus = 'no-application';
      return Promise.reject(e);
    })
  }

  public fetchExtension = () => {
    const localCustomExtension = localStorage.getItem('groot_extension');

    let remoteExtensionList: { key: string, url: string }[] = [];
    if (localCustomExtension) {
      remoteExtensionList = localCustomExtension.split(',').map(str => {
        const [key, url] = str.split('@')
        return { key, url }
      });
    } else {
      remoteExtensionList = this.studioMode === StudioMode.Prototype ? this.solution.extensionList : this.application.extensionList;
    }

    return loadExtension(remoteExtensionList)
  }

  public initExtension = (remoteExtensionList: { key: string, url: string, main: MainType }[], layout: GridLayout) => {
    execExtension(remoteExtensionList, {
      mode: this.studioMode,
      application: this.application,
      solution: this.solution,
      account: this.account,
      layout
    })
  }
}