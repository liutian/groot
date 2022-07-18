import React, { useState } from "react";
import { globalConfig } from "./config";
import { Metadata } from "./types";
import { debugInfo, designMode, errorInfo } from "./util";

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
  const module = globalConfig.modules[metadata.packageName][metadata.moduleName];
  if (!module) {
    errorInfo(`not found module : ${metadata.packageName}/${metadata.moduleName}`, 'compiler');
  }
  const componentName = `${metadata.packageName}_${metadata.moduleName}`;

  function ComponentFunction() {
    const [, switchBool] = useState(true);
    metadata.refresh = () => switchBool(b => !b);
    if (designMode) {
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
    for (let keyIndex = 0; keyIndex < keys.length - 1; keyIndex++) {
      const key = keys[keyIndex];
      ctx = ctx[key];
    }

    if (propMetadata.type === 'component') {
      ctx[endPropKey] = createComponentByMetadataId(ctx[endPropKey], store);
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