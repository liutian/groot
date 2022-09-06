import { HTMLAttributes, useRef } from "react";
import { Tabs } from "antd";

import { useModel } from "@util/robot";
import WorkbenchModel from "@model/WorkbenchModel";
import MouseFollow from "components/MouseFollow";
import styles from './index.module.less';
import SideToolBar from "../SideToolBar";
import SideFooter from "../SideFooter";
import PropPane from "../PropPane";
import PropGroupSetting from "../PropGroupSetting";
import PropItemSetting from "../PropItemSetting";
import PropBlockSetting from "../PropBlockSetting";
import SubPropPane from "../SubPropPane";
import PropHandleModel from "@model/PropHandleModel";

type PropsType = {
} & HTMLAttributes<HTMLDivElement>;

const SidePanel: React.FC<PropsType> = ({ ...props }) => {
  const [propHandleModel] = useModel<PropHandleModel>(PropHandleModel.modelName);
  const [workbenchModel, workbenchUpdateAction] = useModel<WorkbenchModel>(WorkbenchModel.modelName);

  const containerRef = useRef<HTMLDivElement>({} as any);

  const tabChange = (key) => {
    workbenchUpdateAction(() => {
      workbenchModel.currActiveTab = key as any
    })
  }

  return <div {...props} ref={containerRef}>
    <Tabs type="card" className={styles.tabsContainer} activeKey={workbenchModel.currActiveTab} onChange={tabChange}>
      <Tabs.TabPane key="props" tab="属性">
        <SideToolBar className={styles.toolBar} />

        <div className={`${styles.propPaneContainer} `}>
          <div className={`${styles.propPaneItem}  `}>
            {!!workbenchModel.component ? <PropPane /> : <>loading ...</>}
          </div>

          {
            propHandleModel.propItemStack.map(item => {
              return (
                <div key={item.id} className={`${styles.propPaneItem} ${styles.cascaderPropPane} `}>
                  <SubPropPane key={item.id} item={item} />
                </div>
              )
            })
          }
        </div>
      </Tabs.TabPane>

      <Tabs.TabPane key="data-sources" tab="数据源"></Tabs.TabPane>
      <Tabs.TabPane key="vars" tab="变量"></Tabs.TabPane>

      {workbenchModel.renderExtraTabPanes.map(render => render())}

    </Tabs>


    <SideFooter className={`${styles.footerContainer} `} />

    <PropGroupSetting />
    <PropBlockSetting />
    <PropItemSetting />

    <MouseFollow
      cursor="col-resize"
      className={styles.moveHandle}
      start={() => {
        containerRef.current.parentElement.classList.add('drag-active');
        return containerRef.current.getBoundingClientRect().width;
      }}
      move={(x, _y, originData) => {
        const width = originData - x;
        let sideWidth = width;

        if (width <= workbenchModel.minSideWidth) {
          sideWidth = workbenchModel.minSideWidth;
        }
        containerRef.current.parentElement!.style.setProperty('--side-width', `${sideWidth}px`);
      }}
      end={() => {
        containerRef.current.parentElement.classList.remove('drag-active');
      }}
    />
  </div >
}

export default SidePanel;