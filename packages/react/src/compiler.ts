import { Metadata, PropMetadata, PropMetadataType, RuntimeComponentValueType } from "@grootio/common";

import React, { useEffect, useReducer, useRef } from "react";
import { globalConfig } from "./config";
import functionCreate from "./function-creator";
import groot from "./groot";
import { debugInfo, controlMode, errorInfo } from "./util";

const instanceRefreshFnMap = new Map<number, Function>();
const instanceWrapperEleMap = new Map<number, HTMLElement>();
const instanceMetadataMap = new Map<number, Metadata>();

export const buildComponent = (root: Metadata, store: Metadata[], isRoot = false) => {
  processAdvancedProp(root, store);

  const wrapper = createComponentWrapper(root, isRoot);
  return React.createElement(wrapper, { key: root.id });
}

export const reBuildComponent = (metadata: Metadata, store: Metadata[]) => {
  processAdvancedProp(metadata, store);

  const refresh = instanceRefreshFnMap.get(metadata.id);
  refresh();
}

export const getInstanceWrapperEle = (instanceId) => {
  return instanceWrapperEleMap.get(instanceId);
}

export const getInstanceMetadata = (instanceId) => {
  return instanceMetadataMap.get(instanceId);
}


const createComponentWrapper = (metadata: Metadata, isRoot: boolean) => {
  const module = globalConfig.modules[metadata.packageName][metadata.componentName];
  if (!module) {
    errorInfo(`模块未找到 ${metadata.packageName}/${metadata.componentName}`, 'compiler');
  }
  const componentName = `${metadata.packageName}_${metadata.componentName}`;
  function ComponentFunction() {
    // const [, switchBool] = useState(true);
    // const metadataRefresh = () => switchBool(b => !b);
    const [, metadataRefresh] = useReducer((bool) => !bool, true);
    const containerEleRef = useRef<HTMLElement>();

    useEffect(() => {
      instanceRefreshFnMap.set(metadata.id, metadataRefresh);
      instanceWrapperEleMap.set(metadata.id, containerEleRef.current);
      instanceMetadataMap.set(metadata.id, metadata);

      return () => {
        instanceRefreshFnMap.delete(metadata.id);
        instanceWrapperEleMap.delete(metadata.id);
        instanceMetadataMap.delete(metadata.id);
      }
    }, []);

    if (controlMode) {
      debugInfo(`组件刷新 ${componentName}`);
    }

    // react不接受$开头的属性
    const propsObj = Object.assign({}, metadata.propsObj);
    delete propsObj.$setting;
    propsObj._groot = groot;
    if (!controlMode && !globalConfig.useWrapper) {
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

  return ComponentFunction;
}

const processAdvancedProp = (metadata: Metadata, store: Metadata[]) => {

  metadata.advancedProps?.forEach((propMetadata) => {
    const keys = propMetadata.keyChain.split('.');
    const endPropKey = keys[keys.length - 1];
    let ctx = metadata.propsObj;

    // 找到属性对应的值
    keys.slice(0, -1).forEach((key) => {
      if (key.endsWith(']')) {
        const [preKey, index] = key.split(/\[|\]/);
        ctx = ctx[preKey][index];
      } else {
        ctx = ctx[key];
      }
    })

    if (propMetadata.type === PropMetadataType.Component) {
      ctx[endPropKey] = createComponentByValue(propMetadata, store);
    } else if (propMetadata.type === PropMetadataType.Json) {
      try {
        ctx[endPropKey] = JSON.parse(ctx[endPropKey]);
      } catch (e) {
        console.error(`高级属性解析失败  ${keys}:${ctx[endPropKey]}`)
        ctx[endPropKey] = undefined;
      }
    } else if (propMetadata.type === PropMetadataType.Function) {
      try {
        ctx[endPropKey] = functionCreate(ctx[endPropKey], ctx);
      } catch (e) {
        console.error(`高级属性解析失败  ${keys}:${ctx[endPropKey]}`)
        ctx[endPropKey] = undefined;
      }
    }
  })

}

const createComponentByValue = (propMetadata: PropMetadata, store: Metadata[]) => {
  const rootData = propMetadata.data as RuntimeComponentValueType;
  const nodes = propMetadata.data.list.map((item) => {
    const metadata = store.find(m => m.id === item.instanceId);
    if (!metadata) {
      throw new Error('数据异常');
    }
    metadata.$$runtime = {
      propItemId: rootData.propItemId,
      abstractValueIdChain: rootData.abstractValueIdChain
    }
    return buildComponent(metadata, store);
  });

  (nodes as any)._groot = rootData;

  return nodes;
}