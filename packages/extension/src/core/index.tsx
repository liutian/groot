import { ExtensionContext, GrootCommandType, StudioMode } from "@grootio/common";
import { instanceBootstrap } from "instance";
import { prototypeBootstrap } from "prototype";
import ActivityBar from "./ActivityBar";
import Banner from "./Banner";
import Panel from "./Panel";
import PrimarySidebar from "./PrimarySidebar";
import SecondarySidebar from "./SecondarySidebar";
import Stage from "./Stage";
import StatusBar from "./StatusBar";

export const startup = (context: ExtensionContext) => {
  const { registerCommand } = context.groot.commandManager<GrootCommandType>();

  registerCommand('groot.command.workbench.render.banner', () => {
    return <Banner />
  });
  registerCommand('groot.command.workbench.render.activityBar', () => {
    return <ActivityBar />
  });
  registerCommand('groot.command.workbench.render.primarySidebar', () => {
    return <PrimarySidebar />
  });
  registerCommand('groot.command.workbench.render.secondarySidebar', () => {
    return <SecondarySidebar />
  });
  registerCommand('groot.command.workbench.render.stage', () => {
    return <Stage />
  });
  registerCommand('groot.command.workbench.render.panel', () => {
    return <Panel />
  });
  registerCommand('groot.command.workbench.render.statusBar', () => {
    return <StatusBar />
  });

  if (context.groot.params.mode === StudioMode.Prototype) {
    prototypeBootstrap(context);
  } else if (context.groot.params.mode === StudioMode.Instance) {
    instanceBootstrap(context);
  }
}