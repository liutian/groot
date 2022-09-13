import { BranchesOutlined } from "@ant-design/icons";
import { useModel } from "@util/robot";
import { Dropdown, Menu } from "antd";
import EditorModel from "pages/Editor/EditorModel";

const Release: React.FC = () => {
  const [editorModel] = useModel<EditorModel>(EditorModel.modelName);

  const releaseListMenu = editorModel.application.releaseList.map((release) => {
    return {
      key: release.id,
      label: (<a >
        {release.name}
        {editorModel.application.devReleaseId === release.id ? <strong style={{ color: 'green' }}>DEV</strong> : null}
        {editorModel.application.qaReleaseId === release.id ? <strong style={{ color: 'blue' }}>QA</strong> : null}
        {editorModel.application.plReleaseId === release.id ? <strong style={{ color: 'orange' }}>PL</strong> : null}
        {editorModel.application.onlineReleaseId === release.id ? <strong style={{ color: 'red' }}>OL</strong> : null}
      </a>),
      onClick: () => {
        editorModel.switchRelease(release.id);
      }
    }
  })

  return (<Dropdown placement="topLeft" overlay={<Menu items={releaseListMenu} />}>
    <span >
      <BranchesOutlined title="迭代" />
      <span>{editorModel.application.release.name}</span>
    </span>
  </Dropdown>)
}

export default Release;