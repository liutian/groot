import { Component, ComponentVersion } from "@grootio/common";

import { ModalStatus } from "@util/common";
import { APIPath } from "api/API.path";
import request from "@util/request";
import WorkbenchModel from "@model/WorkbenchModel";

export default class PrototypeModel {
  static modelName = 'prototype';

  public loadStatus: 'doing' | 'fetch-pluginn' | 'notfound' | 'ok' = 'doing';
  public componentAddModalStatus: ModalStatus = ModalStatus.None;
  public componentVersionAddModalStatus: ModalStatus = ModalStatus.None;
  private workbench: WorkbenchModel;

  public inject(workbench: WorkbenchModel) {
    this.workbench = workbench;
  }

  public switchComponent = (componentId: number, versionId: number) => {
    return request(APIPath.componentPrototype_detail, { componentId, versionId }).then(({ data }) => {
      this.loadStatus = 'ok';
      this.workbench.startComponentPrototype(data);
    })
  }

  public fetchOrg = (orgId: number) => {
    return request(APIPath.org_detail, { orgId }).then(({ data }) => {
      this.workbench.launchPrototypeBox(data);
      this.loadStatus = 'fetch-pluginn';
    }).catch((e) => {
      return Promise.reject(e);
    })
  }

  public addComponent = (rawComponent: Component) => {
    this.componentAddModalStatus = ModalStatus.Submit;
    return request(APIPath.component_add, {
      ...rawComponent,
      orgId: this.workbench.org.id
    }).then(({ data }) => {
      this.componentAddModalStatus = ModalStatus.None;
      this.workbench.org.componentList.push(data);

      this.switchComponent(data.id, data.recentVersionId);
    });
  }

  public addComponentVersion = (rawComponentVersion: ComponentVersion) => {
    this.componentVersionAddModalStatus = ModalStatus.Submit;
    return request(APIPath.componentVersion_add, rawComponentVersion).then(({ data }) => {
      this.componentVersionAddModalStatus = ModalStatus.None;
      this.workbench.component.versionList.push(data);

      this.switchComponent(this.workbench.component.id, data.id);
    });
  }

  public publish = (componentId: number, versioinId: number) => {
    request(APIPath.componentVersion_publish, { componentId, versioinId }).then(() => {
      this.workbench.component.recentVersionId = versioinId;
    });
  }
}