import { DeleteOutlined, DragOutlined, SettingOutlined } from "@ant-design/icons";
import { PropItemType } from "@grootio/common";
import PropHandleModel from "@model/PropHandleModel";
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
  const [form] = Form.useForm();

  const childPropItem = propBlock.propItemList[0];

  const columns = propBlock.primaryShowPropItemList.map((propItem) => {
    return {
      title: propItem.label,
      dataIndex: `propItemId_${propItem.id}_valueId`,
      key: `propItemId_${propItem.id}_valueId`,
      width: '',
      render: (valueId) => {
        return (
          <Form.Item name={`propItemId_${propItem.id}_valueId_${valueId}`} preserve={false}>
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
      key: '#action',
      width: '50px',
      render: () => {
        return (<Space>
          <Typography.Link >
            <SettingOutlined />
          </Typography.Link>

          <Typography.Link>
            <DeleteOutlined />
          </Typography.Link>

          <Typography.Link>
            <DragOutlined />
          </Typography.Link>
        </Space>)
      }
    });
  }

  let dataSource = [];
  if (workbenchModel.prototypeMode) {
    dataSource = childPropItem.defaultValue?.map((parentValueId: number) => {
      const data = {};
      propBlock.primaryShowPropItemList.forEach((propItem) => {
        const propValue = propItem.valueList.find(v => v.parentId === parentValueId);
        if (propValue) {
          data[`propItemId_${propItem.id}_valueId`] = propValue.id;
        }
      });
      return data;
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


  return <div className={styles.container}>
    <Form form={form} layout="vertical">

      <Table className={styles.tablePatch} columns={columns} dataSource={dataSource} size="small" pagination={false} ></Table>

    </Form>

    <div>
      <Space>
        <Typography.Link>添加子项</Typography.Link>
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