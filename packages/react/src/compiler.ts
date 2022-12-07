import React, { useEffect, useReducer, useRef } from "react";

import { appControlMode, globalConfig, groot } from "@grootio/runtime";
import { Metadata } from "@grootio/common";

const refreshFnMap = new Map<number, Function>();


export const createComponent = (metadata: Metadata, isRoot: boolean, viewEleMap, viewMetadataMap) => {
  const module = globalConfig.modules[metadata.packageName][metadata.componentName];
  if (!module) {
    throw new Error(`模块未找到 ${metadata.packageName}/${metadata.componentName}`);
  }
  const componentName = `${metadata.packageName}_${metadata.componentName}`;
  function ComponentFunction() {
    const [, metadataRefresh] = useReducer((bool) => !bool, true);
    const containerEleRef = useRef<HTMLElement>();

    useEffect(() => {
      refreshFnMap.set(metadata.id, metadataRefresh);
      viewEleMap.set(metadata.id, containerEleRef.current);
      viewMetadataMap.set(metadata.id, metadata);

      return () => {
        refreshFnMap.delete(metadata.id);
        viewEleMap.delete(metadata.id);
        viewMetadataMap.delete(metadata.id);
      }
    }, []);

    if (appControlMode) {
      console.log(`组件刷新 ${componentName}`);
    }

    // react不接受$开头的属性
    const propsObj = Object.assign({}, metadata.propsObj);
    delete propsObj.$setting;
    propsObj._groot = groot;
    if (!appControlMode && !globalConfig.useWrapper) {
      return React.createElement(module, propsObj)
    } else {

      const props = {
        'data-groot-component-instance-id': metadata.id,
        style: { display: metadata.propsObj.$setting?.wrapperDisplay || 'block' },
        ref: containerEleRef
      }

      if (isRoot) {
        props['data-groot-root'] = 'true';
      }
      return React.createElement('div', props, React.createElement(module, propsObj));
    }

  }

  ComponentFunction.displayName = `${componentName}_Wrapper`;


  return React.createElement(ComponentFunction, { key: metadata.id })
}


export const refreshComponent = (metadataId: number) => {
  if (refreshFnMap.has(metadataId)) {
    refreshFnMap.get(metadataId)();
  }
}
