import { StudioMode } from "@grootio/common";
import { getContext, grootCommandManager } from "context";
import { instanceBootstrap } from "instance";
import { prototypeBootstrap } from "prototype";
import ActivityBar from "./ActivityBar";
import Banner from "./Banner";
import Panel from "./Panel";
import PrimarySidebar from "./PrimarySidebar";
import SecondarySidebar from "./SecondarySidebar";
import Stage from "./Stage";
import StatusBar from "./StatusBar";

export const startup = () => {
  const { groot } = getContext()
  const { registerCommand } = grootCommandManager();

  registerCommand('gc.workbench.render.banner', () => {
    return <Banner />
  });
  registerCommand('gc.workbench.render.activityBar', () => {
    return <ActivityBar />
  });
  registerCommand('gc.workbench.render.primarySidebar', () => {
    return <PrimarySidebar />
  });
  registerCommand('gc.workbench.render.secondarySidebar', () => {
    return <SecondarySidebar />
  });
  registerCommand('gc.workbench.render.stage', () => {
    return <Stage />
  });
  registerCommand('gc.workbench.render.panel', () => {
    return <Panel />
  });
  registerCommand('gc.workbench.render.statusBar', () => {
    return <StatusBar />
  });

  if (groot.params.mode === StudioMode.Prototype) {
    prototypeBootstrap();
  } else if (groot.params.mode === StudioMode.Instance) {
    instanceBootstrap();
  }
}