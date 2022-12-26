import { PluginViewComponent } from "@grootio/common";
import { Button, Modal } from "antd";
import { useState } from "react";

const FormulaPropItem: PluginViewComponent = ({ useModel, WorkbenchModel }) => {
  const workbenchModel = useModel(WorkbenchModel);
  const [open, setOpen] = useState(false);
  return <>
    公式编辑器: <Button onClick={() => {
      setOpen(true);
    }}>打开</Button>

    <Modal open={open} onCancel={() => setOpen(false)}>
      {workbenchModel.component.name}
    </Modal>
  </>
}

export default FormulaPropItem;