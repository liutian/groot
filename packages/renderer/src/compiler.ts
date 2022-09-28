import { ComponentValueType, Metadata, PropMetadataType } from "@grootio/common";

import React, { useEffect, useState } from "react";
import { globalConfig } from "./config";
import { debugInfo, controlMode, errorInfo } from "./util";

const metadataRefreshFnMap = new Map<Metadata, Function>();

export const buildComponent = (root: Metadata, store: Metadata[]) => {
  processAdvancedProp(root, store);

  const wrapper = createComponentWrapper(root);
  return React.createElement(wrapper, { key: root.id });
}

export const reBuildComponent = (metadata: Metadata, store: Metadata[]) => {
  processAdvancedProp(metadata, store);

  const refresh = metadataRefreshFnMap.get(metadata);
  refresh();
}


const createComponentWrapper = (metadata: Metadata) => {
  const module = globalConfig.modules[metadata.packageName][metadata.componentName];
  if (!module) {
    errorInfo(`模块未找到 ${metadata.packageName}/${metadata.componentName}`, 'compiler');
  }
  const componentName = `${metadata.packageName}_${metadata.componentName}`;

  function ComponentFunction() {
    const [, switchBool] = useState(true);
    const metadataRefresh = () => switchBool(b => !b);

    useEffect(() => {
      metadataRefreshFnMap.set(metadata, metadataRefresh);

      return () => {
        metadataRefreshFnMap.delete(metadata);
      }
    }, []);

    if (controlMode) {
      debugInfo(`组件刷新 ${componentName}`);
    }

    return React.createElement('div', { 'data-groot-component-id': metadata.id },
      React.createElement(module, metadata.propsObj)
    );
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
      if (key.startsWith('[')) {
        ctx = ctx[+key.replace('[', '').replace(']', '')];
      } else {
        ctx = ctx[key];
      }
    })

    if (propMetadata.type === PropMetadataType.Component && ctx[endPropKey]) {
      ctx[endPropKey] = createComponentByValue(ctx[endPropKey], store);
    } else if (propMetadata.type === PropMetadataType.Json) {
      try {
        ctx[endPropKey] = JSON.parse(ctx[endPropKey]);
      } catch (e) {
        console.error(`高级属性解析失败  ${keys}:${ctx[endPropKey]}`)
        ctx[endPropKey] = undefined;
      }
    } else if (propMetadata.type === PropMetadataType.Function) {
      try {
        ctx[endPropKey] = window.Function(ctx[endPropKey]);
      } catch (e) {
        console.error(`高级属性解析失败  ${keys}:${ctx[endPropKey]}`)
        ctx[endPropKey] = undefined;
      }
    }
  })

}

const createComponentByValue = (value: ComponentValueType<{ id: number }>, store: Metadata[]) => {
  const nodes = (value.list || []).map((value) => {
    const metadata = store.find(m => m.id === value.id);

    return buildComponent(metadata, store);
  });
  return nodes;
}