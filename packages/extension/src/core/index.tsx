import { StudioMode } from "@grootio/common";
import { getContext, grootCommandManager, isPrototypeMode } from "context";
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

  registerCommand('gc.workbench.banner.render', () => {
    return <Banner />
  });
  registerCommand('gc.workbench.activityBar.render', () => {
    return <ActivityBar />
  });
  registerCommand('gc.workbench.primarySidebar.render', () => {
    return <PrimarySidebar />
  });
  registerCommand('gc.workbench.secondarySidebar.render', () => {
    return <SecondarySidebar />
  });
  registerCommand('gc.workbench.stage.render', () => {
    return <Stage />
  });
  registerCommand('gc.workbench.panel.render', () => {
    return <Panel />
  });
  registerCommand('gc.workbench.statusBar.render', () => {
    return <StatusBar />
  });

  if (isPrototypeMode()) {
    prototypeBootstrap();
  } else if (groot.params.mode === StudioMode.Instance) {
    instanceBootstrap();
  }
}