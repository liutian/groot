import { useModel } from "@util/robot";
import { Button, Modal } from "antd"
import EditorModel from "pages/Editor/EditorModel";

const BuildModal: React.FC = () => {
  const [editorModel, updateEditorModel] = useModel<EditorModel>(EditorModel.modelName);

  let actions = [
    <Button key="primary" onClick={() => editorModel.assetBuild()} type="primary" loading={editorModel.assetBuildStatus === 'building'}>构建</Button>,
    <Button key="cancel">取消</Button>,
  ]

  if (editorModel.assetBuildStatus === 'approve') {
    actions = [
      <Button key="primary" type="primary">查看审批</Button>,
      <Button key="cancel">取消</Button>,
    ]
  } else if (editorModel.assetBuildStatus === 'buildOver') {
    actions = [
      <Button key="primary" onClick={() => {
        updateEditorModel(() => {
          editorModel.showAssetBuildModal = false;
          editorModel.showAssetDeployModal = true;
          editorModel.assetBuildStatus = 'init';
        })
      }} type="primary">前往部署</Button>,
      <Button key="cancel">取消</Button>,
    ]
  }

  return <Modal visible={editorModel.showAssetBuildModal} title="构建" footer={[actions]}>
    {
      editorModel.assetBuildStatus === 'init' && (
        <div>
          分析中...
        </div>
      )
    }

    {
      editorModel.assetBuildStatus === 'analyseOver' && (
        <div>分析结果：</div>
      )
    }

    {
      editorModel.assetBuildStatus === 'building' && (
        <div>
          构建中...
        </div>
      )
    }

    {
      editorModel.assetBuildStatus === 'buildOver' && (
        <div>
          构建完成
        </div>
      )
    }

    {
      editorModel.assetBuildStatus === 'approve' && (
        <div>
          构建完成，需要审批
        </div>
      )
    }
  </Modal>
}

export default BuildModal;