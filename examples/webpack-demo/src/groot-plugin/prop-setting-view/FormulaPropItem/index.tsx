import { PluginViewComponent } from "@grootio/common";

const FormulaPropItem: PluginViewComponent = ({ useModel, WorkbenchModel }) => {
  const [workbenchModel] = useModel(WorkbenchModel);
  return <>公式编辑器: {JSON.stringify(workbenchModel.component)}</>
}

export default FormulaPropItem;