import { BranchesOutlined } from "@ant-design/icons";
import WorkbenchModel from "@model/WorkbenchModel";
import { useModel } from "@util/robot";
import { Dropdown, Menu } from "antd";
import InstanceModel from "pages/Instance/InstanceModel";

const Release: React.FC = () => {
  const [instanceModel] = useModel(InstanceModel);
  const [workbenchModel] = useModel(WorkbenchModel);

  const releaseListMenu = workbenchModel.application.releaseList.map((release) => {
    return {
      key: release.id,
      label: (<a >
        {release.name}
        {workbenchModel.application.devReleaseId === release.id ? <strong style={{ color: 'green' }}>DEV</strong> : null}
        {workbenchModel.application.qaReleaseId === release.id ? <strong style={{ color: 'blue' }}>QA</strong> : null}
        {workbenchModel.application.plReleaseId === release.id ? <strong style={{ color: 'orange' }}>PL</strong> : null}
        {workbenchModel.application.onlineReleaseId === release.id ? <strong style={{ color: 'red' }}>OL</strong> : null}
      </a>),
      onClick: () => {
        instanceModel.switchRelease(release.id);
      }
    }
  })

  return (<Dropdown placement="topLeft" overlay={<Menu items={releaseListMenu} />}>
    <span >
      <BranchesOutlined title="迭代" />
      <span>{workbenchModel.application.release.name}</span>
    </span>
  </Dropdown>)
}

export default Release;