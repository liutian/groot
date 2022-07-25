import { useEffect, } from "react";
import { useSearchParams } from "react-router-dom";

import { useRegisterModel } from "@util/robot";
import WorkbenchModel from "@model/WorkbenchModel";
import PropPersistModel from "@model/PropPersistModel";
import PropHandleModel from "@model/PropHandleModel";
import ScaffoldModel from "pages/Scaffold/ScaffoldModel";
import Workbench from "@components/Workbench";

const Editor: React.FC = () => {
  const [scaffoldModel] = useRegisterModel<ScaffoldModel>(ScaffoldModel.modelName, new ScaffoldModel());
  const [workbenchModel] = useRegisterModel<WorkbenchModel>(WorkbenchModel.modelName, new WorkbenchModel());
  const [propHandleModel] = useRegisterModel<PropHandleModel>(PropHandleModel.modelName, new PropHandleModel());
  const [propPersistModel] = useRegisterModel<PropPersistModel>(PropPersistModel.modelName, new PropPersistModel());

  let [searchParams] = useSearchParams();

  useEffect(() => {
    propPersistModel.inject(workbenchModel, propHandleModel);
    scaffoldModel.inject(workbenchModel);
    workbenchModel.inject(propHandleModel);

    scaffoldModel.fetchScaffold(+searchParams.get('scaffoldId'));
  }, []);

  if (scaffoldModel.scaffold === undefined) {
    return <>loading</>
  } else if (scaffoldModel.scaffold === null) {
    return <>notfound component</>
  } else {
    return (<Workbench />);
  }
}

export default Editor;