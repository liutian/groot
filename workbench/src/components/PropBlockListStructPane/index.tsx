import { DeleteOutlined, DragOutlined, SettingOutlined } from "@ant-design/icons";
import { PropItemType } from "@grootio/common";
import PropHandleModel from "@model/PropHandleModel";
import PropPersistModel from "@model/PropPersistModel";
import WorkbenchModel from "@model/WorkbenchModel";
import { useModel } from "@util/robot";
import { DatePicker, Form, Input, InputNumber, Select, Space, Switch, Table, TimePicker, Typography } from "antd";

import styles from './index.module.less';

type PropsType = {
  block: PropBlock
}

const PropBlockListStructPane: React.FC<PropsType> = ({ block: propBlock }) => {
  const [propHandleModel] = useModel<PropHandleModel>(PropHandleModel.modelName);
  const [workbenchModel] = useModel<WorkbenchModel>(WorkbenchModel.modelName);
  const [propPersistModel] = useModel<PropPersistModel>(PropPersistModel.modelName);
  const [form] = Form.useForm();

  const childPropItem = propBlock.propItemList[0];

  let dataSource = [];
  let initialValues = {};
  const columns = propBlock.primaryShowPropItemList.map((propItem) => {
    return {
      title: propItem.label,
      dataIndex: `propItemId_${propItem.id}`,
      width: '',
      render: (_, record) => {
        return (
          <Form.Item name={`propItemId_${propItem.id}_parentValueId_${record.parentValueId}`} preserve={false}>
            {renderFormItem(propItem)}
          </Form.Item>
        )
      }
    }
  });
  if (workbenchModel.prototypeMode) {
    columns.push({
      title: '',
      dataIndex: '#action',
      width: '50px',
      render: (_, record) => {
        return (<Space>
          <Typography.Link >
            <SettingOutlined onClick={() => showPropItemSetting(record.parentValueId)} />
          </Typography.Link>

          <Typography.Link>
            <DeleteOutlined onClick={() => propPersistModel.removeBlockListStructChildItem(record.parentValueId, childPropItem)} />
          </Typography.Link>

          <Typography.Link>
            <DragOutlined />
          </Typography.Link>
        </Space>)
      }
    });

    childPropItem.valueList.forEach((parentValue: PropValue) => {
      dataSource.push({
        parentValueId: parentValue.id
      });

      propBlock.primaryShowPropItemList.forEach((propItem) => {
        const propValue = propItem.valueList.find(v => v.propValueIdChainForBlockListStruct.endsWith(`${parentValue.id}`));
        initialValues[`propItemId_${propItem.id}_parentValueId_${parentValue.id}`] = propValue?.value || propItem.defaultValue;
      });
    })
  } else {

  }


  const showPrimaryItem = () => {
    propHandleModel.pushPropItemStack(childPropItem);
    childPropItem.extraUIData = {
      type: 'BlockListPrefs',
      data: propBlock
    }
  }

  const renderFormItem = (item: PropItem) => {
    if (item.type === PropItemType.Text) {
      return <Input />;
    } else if (item.type === PropItemType.Number) {
      return <InputNumber keyboard />;
    } else if (item.type === PropItemType.Switch) {
      return <Switch />
    } else if (item.type === PropItemType.Select) {
      return <Select options={item.optionList} />
    } else if (item.type === PropItemType.Date_Picker) {
      return <DatePicker />;
    } else if (item.type === PropItemType.Time_Picker) {
      return <TimePicker style={{ width: '100%' }} />;
    }

    return <>not found item</>
  }

  const addBlockListStructChildItem = () => {
    propPersistModel.addBlockListStructChildItem(childPropItem);
  }

  const showPropItemSetting = (parentValueId: number) => {
    childPropItem.parentPropValueId = parentValueId;
    propHandleModel.pushPropItemStack(childPropItem);
  }

  return <div className={styles.container}>
    <Form form={form} layout="vertical" initialValues={initialValues}>

      <Table className={styles.tablePatch} rowKey="parentValueId" columns={columns} dataSource={dataSource} size="small" pagination={false} ></Table>

    </Form>

    <div>
      <Space>
        <Typography.Link onClick={() => addBlockListStructChildItem()}>添加子项</Typography.Link>
        <Typography.Link hidden={!workbenchModel.prototypeMode}
          onClick={() => showPrimaryItem()}>
          首要显示项
        </Typography.Link>
        <Typography.Link hidden={!workbenchModel.prototypeMode}
          onClick={() => propHandleModel.pushPropItemStack(childPropItem)}>
          子项模版配置
        </Typography.Link>
      </Space>
    </div>
  </div>
}


export default PropBlockListStructPane;