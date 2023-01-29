import { DropboxOutlined } from "@ant-design/icons";
import { Component, useModel, WorkbenchEvent } from "@grootio/common";
import { Button } from "antd";

import WorkbenchModel from "@model/WorkbenchModel";

export const DragComponent: React.FC<{ component: Component }> = ({ component }) => {
  const workbenchModel = useModel(WorkbenchModel);

  const dragstart = (e) => {
    workbenchModel.dispatchEvent(new CustomEvent(WorkbenchEvent.DragComponentStart));
    e.dataTransfer.setData('componentId', component.id);
  }

  const dragend = () => {
    workbenchModel.dispatchEvent(new CustomEvent(WorkbenchEvent.DragComponentEnd));
  }

  return (<Button style={{ width: '110px', marginBottom: '10px', textAlign: 'left', paddingLeft: '8px' }} icon={<DropboxOutlined />} draggable="true" onDragStart={dragstart} onDragEnd={dragend}>
    {component.name}
  </Button>)
}