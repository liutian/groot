import { useEffect } from "react";
import { Button, Checkbox, Col, DatePicker, Form, Input, Radio, Row, Select, Space, Switch, TimePicker, Typography } from "antd";
import { VerticalAlignTopOutlined, DeleteOutlined, VerticalAlignBottomOutlined, EditOutlined } from '@ant-design/icons';

import { useModel } from "@util/robot";
import styles from './index.module.less';
import WorkbenchModel from "@model/WorkbenchModel";
import PropPersistModel from "@model/PropPersistModel";
import PropHandleModel from "@model/PropHandleModel";
import { PropItemType } from '@grootio/common';

type PropType = {
  block: PropBlock,
  freezeSetting?: boolean,
  templateMode?: boolean,
  noWrapMode?: boolean
}

function PropBlockPane({ block, freezeSetting, templateMode, noWrapMode }: PropType) {
  const [propPersistModel, propPersistAction] = useModel<PropPersistModel>(PropPersistModel.modelName);
  const [propHandleModel, propHandleUpdateAction] = useModel<PropHandleModel>(PropHandleModel.modelName);
  const [workbenchModel] = useModel<WorkbenchModel>(WorkbenchModel.modelName);
  const [form] = Form.useForm();

  useEffect(() => {
    propHandleModel.blockFormInstanceMap.set(block.id, form);

    // 组件销毁时自动更新表单数据并删除表单对象
    return () => {
      const formObj = form.getFieldsValue();
      propPersistModel.autoSavePropItemDefaultValue(block, formObj);
      propHandleModel.blockFormInstanceMap.delete(block.id);
    }
  }, []);

  const renderItemLabel = (propItem: PropItem, itemIndex: number) => {

    const editPropItem = () => {
      propPersistAction(() => {
        propPersistModel.currSettingPropItem = JSON.parse(JSON.stringify(propItem));
      })
    }

    const renderItemSetting = () => {
      if (!workbenchModel.prototypeMode || freezeSetting) return null;

      return (<Space size="small">
        {
          itemIndex > 0 && (
            <Typography.Link onClick={(e) => {
              e.preventDefault();
              propPersistModel.movePropItem(block, itemIndex, true);
            }}>
              <VerticalAlignTopOutlined />
            </Typography.Link>
          )
        }

        {
          itemIndex < block.propItemList.length - 1 && (
            <Typography.Link onClick={(e) => {
              e.preventDefault();
              propPersistModel.movePropItem(block, itemIndex, false);
            }}>
              <VerticalAlignBottomOutlined />
            </Typography.Link>
          )
        }

        <Typography.Link onClick={(e) => {
          e.preventDefault();
          editPropItem();
        }}>
          <EditOutlined />
        </Typography.Link>

        {
          block.propItemList.length > 1 && (
            <Typography.Link onClick={(e) => {
              e.preventDefault();
              propPersistModel.delItem(propItem.id);
            }} >
              <DeleteOutlined />
            </Typography.Link>
          )
        }
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
    if (item.type === PropItemType.TEXT) {
      return <Input />;
    } else if (item.type === PropItemType.TEXTAREA) {
      return <Input.TextArea />;
    } else if (item.type === PropItemType.DATE_PICKER) {
      return <DatePicker />;
    } else if (item.type === PropItemType.TIME_PICKER) {
      return <TimePicker style={{ width: '100%' }} />;
    } else if (item.type === PropItemType.SWITCH) {
      return <Switch />
    } else if (item.type === PropItemType.SELECT) {
      return <Select options={item.optionList} />
    } else if (item.type === PropItemType.RADIO) {
      return <Radio.Group options={item.optionList} />
    } else if (item.type === PropItemType.CHECKBOX) {
      return <Checkbox.Group options={item.optionList} />
    } else if (item.type === PropItemType.LIST) {
      return <Button block onClick={() => { propHandleModel.pushPropItemStack(item) }}>
        列表{item.valueOfGroup.propBlockList.length}
      </Button>
    } else if (item.type === PropItemType.ITEM) {
      return <Button block onClick={() => { propHandleModel.pushPropItemStack(item) }}>配置项</Button>
    } else if (item.type === PropItemType.HIERARCHY) {
      return <Button block onClick={() => { propHandleModel.pushPropItemStack(item) }}>层级</Button>
    } else if (item.type === PropItemType.JSON) {
      return <>json</>
    } else if (item.type === PropItemType.FUNCTION) {
      return <>函数</>
    }

    return <>not found item</>
  }

  return <div className={templateMode || noWrapMode ? styles.containerWrap : ''}>
    <Form form={form} layout="vertical" className="prop-form" onValuesChange={() => workbenchModel.iframeManager.refreshComponent()}>
      <Row gutter={6}>
        {
          block.propItemList.map((item, index) => {
            return <Col span={item.span} key={item.id}
              onMouseEnter={() => {
                propHandleModel.setActivePropItemPath(item.id);
              }}
              onMouseLeave={() => {
                propHandleUpdateAction(() => {
                  propHandleModel.activePropItemId = 0;
                  propHandleModel.activePropItemPath = '';
                })
              }}
            >
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
      templateMode || (workbenchModel.prototypeMode && noWrapMode) ? (
        <Button type="primary" ghost block onClick={() => {
          propPersistModel.showPropItemSettinngForCreate(block)
        }}>
          添加配置项
        </Button>
      ) : null
    }
  </div>
}

export default PropBlockPane;