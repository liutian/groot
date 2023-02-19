import { DropboxOutlined } from "@ant-design/icons";
import { Component } from "@grootio/common";
import { Button } from "antd";
import { grootHookManager } from "context";


export const DragComponent: React.FC<{ component: Component }> = ({ component }) => {

  const { callHook } = grootHookManager()
  const dragstart = (e) => {
    callHook('gh.component.drag.start')
    e.dataTransfer.setData('componentId', component.id);
  }

  const dragend = () => {
    callHook('gh.component.drag.end')
  }

  return (<Button style={{ width: '100px', marginBottom: '10px', textAlign: 'left', paddingLeft: '8px' }}
    icon={<DropboxOutlined />} draggable="true" onDragStart={dragstart} onDragEnd={dragend}>
    {component.name}
  </Button>)
}