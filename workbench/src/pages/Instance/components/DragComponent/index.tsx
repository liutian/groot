import { DropboxOutlined } from "@ant-design/icons";
import { Component } from "@grootio/common";
import WorkbenchModel from "@model/WorkbenchModel";
import { WorkbenchEvent } from "@util/common";
import { useModel } from "@util/robot";
import { Button } from "antd";
import { useState } from "react";

export const DragComponent: React.FC<{ component: Component }> = ({ component }) => {
  const [workbenchModel] = useModel(WorkbenchModel);
  const [viewportMaskEle] = useState<HTMLElement>(() => {
    return document.getElementById(workbenchModel.viewportMaskId);
  });

  const dragstart = (e) => {
    workbenchModel.dispatchEvent(new CustomEvent(WorkbenchEvent.DragStart))
    viewportMaskEle.classList.add('show');
    e.dataTransfer.setData('componentId', component.id);
    console.log('drag start');
  }

  const dragend = () => {
    viewportMaskEle.classList.remove('show');
    console.log('drag end');
  }

  return (<Button style={{ width: '110px', marginBottom: '10px', textAlign: 'left', paddingLeft: '8px' }} icon={<DropboxOutlined />} draggable="true" onDragStart={dragstart} onDragEnd={dragend}>
    {component.name}
  </Button>)
}