import { Button, Checkbox, Col, DatePicker, Form, Input, Radio, Row, Select, Space, Switch, Typography } from "antd";
import { VerticalAlignTopOutlined, DeleteOutlined, VerticalAlignBottomOutlined, SettingOutlined } from '@ant-design/icons';
import { useModel } from "@util/robot";
import StudioModel from '@model/StudioModel';
import styles from './index.module.less';
import WorkbenchModel from "@model/WorkbenchModel";

type PropType = {
  block: PropBlock,
  freezeSetting?: boolean,
  templateMode?: boolean,
  noWrapMode?: boolean
}

function PropBlockStudio({ block, freezeSetting, templateMode, noWrapMode }: PropType) {
  const [studioModel, updateAction] = useModel<StudioModel>('studio');
  const [workbenchModel] = useModel<WorkbenchModel>('workbench');
  const [form] = Form.useForm();
  workbenchModel.blockFormInstanceMap.set(block.id, form);

  const renderItemLabel = (propItem: PropItem, itemIndex: number) => {

    const editPropItem = () => {
      updateAction(() => {
        studioModel.currSettingPropItem = JSON.parse(JSON.stringify(propItem));
      })
    }

    const renderItemSetting = () => {
      if (!workbenchModel.stageMode || freezeSetting) return null;


      return (<Space size="small">
        <Typography.Link disabled={itemIndex === 0} onClick={(e) => {
          e.preventDefault();
          studioModel.movePropItem(block, itemIndex, true);
        }}>
          <VerticalAlignTopOutlined />
        </Typography.Link>
        <Typography.Link disabled={itemIndex === block.propItemList.length - 1} onClick={(e) => {
          e.preventDefault();
          studioModel.movePropItem(block, itemIndex, false);
        }}>
          <VerticalAlignBottomOutlined />
        </Typography.Link>
        <Typography.Link disabled={itemIndex === 0 && block.propItemList.length === 1} onClick={(e) => {
          e.preventDefault();
          studioModel.delItem(propItem.id);
        }} >
          <DeleteOutlined />
        </Typography.Link>
        <Typography.Link onClick={(e) => {
          e.preventDefault();
          editPropItem();
        }}>
          <SettingOutlined />
        </Typography.Link>
      </Space>)
    }

    return <div className={styles.propItemHeader}>
      <div className={styles.propItemHeaderText}>
        {propItem.label}
        <i className="highlight" hidden={!propItem.highlight} />
      </div>
      <div className={styles.propItemHeaderActions}>
        {renderItemSetting()}
      </div>
    </div>
  }

  const renderFormItem = (item: PropItem) => {
    if (item.type === 'Input') {
      return <Input />;
    } else if (item.type === 'Date_Picker') {
      return <DatePicker />;
    } else if (item.type === 'Switch') {
      return <Switch />
    } else if (item.type === 'Select') {
      return <Select options={item.optionList} />
    } else if (item.type === 'Radio') {
      return <Radio.Group options={item.optionList} />
    } else if (item.type === 'Checkbox') {
      return <Checkbox.Group options={item.optionList} />
    } else if (item.type === 'List' || item.type === 'Item') {
      return <Button block onClick={() => {
        studioModel.pushHandUpPropItem(item)
      }}>列表{item.valueOfGroup.propBlockList.length}</Button>
    }

    return <>not found item</>
  }

  return <div className={templateMode || noWrapMode ? styles.containerWrap : ''}>
    <Form form={form} layout="vertical" className="studio-form" onValuesChange={() => workbenchModel.productStudioData()}>
      <Row gutter={6}>
        {
          block.propItemList.map((item, index) => {
            return <Col span={item.span} key={item.id} >
              <Form.Item className={styles.propItem} label={renderItemLabel(item, index)} name={item.propKey} preserve={false}
                valuePropName={item.type === 'Switch' ? 'checked' : 'value'} initialValue={item.defaultValue}>
                {renderFormItem(item)}
              </Form.Item>
            </Col>
          })
        }
      </Row>
    </Form>
    {
      templateMode || (workbenchModel.stageMode && noWrapMode) ? (
        <Button type="dashed" block onClick={() => {
          studioModel.showPropItemSettinngForCreate(block)
        }}>
          添加
        </Button>
      ) : null
    }
  </div>
}

export default PropBlockStudio;