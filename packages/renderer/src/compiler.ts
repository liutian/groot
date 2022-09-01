import { Metadata, PropMetadataType } from "@grootio/common";
import React, { useState } from "react";
import { globalConfig } from "./config";
import { debugInfo, controlMode, errorInfo } from "./util";
import { instance } from './application';

export const buildComponent = (root: Metadata, store: Metadata[]) => {
  const component = createComponent(root, store);
  return component;
}

export const reBuildProps = (metadata: Metadata, store: Metadata[]) => {
  processAdvancedProp(metadata, store);
}

const createComponent = (metadata: Metadata, store: Metadata[]) => {
  processAdvancedProp(metadata, store);

  const wrapper = createComponentWrapper(metadata);
  return React.createElement(wrapper, { key: metadata.id });
}

const createComponentWrapper = (metadata: Metadata) => {
  const module = globalConfig.modules[metadata.packageName][metadata.componentName];
  if (!module) {
    errorInfo(`not found module : ${metadata.packageName}/${metadata.componentName}`, 'compiler');
  }
  const componentName = `${metadata.packageName}_${metadata.componentName}`;

  function ComponentFunction() {
    const [, switchBool] = useState(true);
    const metadataRefresh = () => switchBool(b => !b);
    instance.setRefresh(metadata, metadataRefresh);
    if (controlMode) {
      debugInfo(`component refresh name:${componentName}`)
    }

    return React.createElement(module, metadata.propsObj);
  }

  ComponentFunction.displayName = `${componentName}_Wrapper`;

  return ComponentFunction;
}

const processAdvancedProp = (metadata: Metadata, store: Metadata[]) => {

  metadata.advancedProps?.forEach((propMetadata) => {
    const keys = propMetadata.keyChain.split('.');
    const endPropKey = keys[keys.length - 1];
    let ctx = metadata.propsObj;
    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        return;
      }

      if (key.startsWith('[')) {
        ctx = ctx[+key.replace('[', '').replace(']', '')];
      } else {
        ctx = ctx[key];
      }
    })

    if (propMetadata.type === PropMetadataType.Component) {
      ctx[endPropKey] = createComponentByMetadataId(ctx[endPropKey], store);
    } else if (propMetadata.type === PropMetadataType.Json) {
      try {
        ctx[endPropKey] = JSON.parse(ctx[endPropKey]);
      } catch (e) {
        ctx[endPropKey] = undefined;
      }
    } else if (propMetadata.type === PropMetadataType.Function) {
      try {
        ctx[endPropKey] = window.Function(ctx[endPropKey]);
      } catch (e) {
        ctx[endPropKey] = undefined;
      }
    }
  })

}

const createComponentByMetadataId = (metadataId: number | number[], store: Metadata[]) => {
  const metadataIds = Array.isArray(metadataId) ? metadataId : [metadataId];
  const nodes = metadataIds.map((id) => {
    const metadata = store.find(m => m.id === id);

    return createComponent(metadata, store);
  });
  return nodes;
}