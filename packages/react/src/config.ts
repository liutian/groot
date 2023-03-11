import { UIManagerConfig } from "@grootio/common";

import { createComponent, refreshComponent } from "./compiler";
import Container from "./modules/Container";
import PageContainer from "./modules/PageContainer";

export const defaultConfig: Partial<UIManagerConfig> = {
  modules: {
    groot: {
      Container,
      PageContainer
    },
  },
  createComponent,
  refreshComponent
};
