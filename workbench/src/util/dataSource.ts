import { uuid } from "./utils";

export const fetchPageData = () => {
  return Promise.resolve({
    id: uuid(),
    name: 'demo',
    url: 'http://localhost:8888/admin/groot/page1',
    path: '/groot/page1',
    component: {
      id: uuid(),
      name: 'demo',
      codeMetaData: [{ key: 'children', defaultValue: 'hello world!', type: 'input' }, { key: 'type', defaultValue: 'primary', type: 'input' }],
      studio: {
        id: uuid(),
        name: 'demo',
        packageName: 'antd',
        moduleName: 'Button_text',
        componentName: 'Button',
        propGroups: [{
          id: 1,
          name: '属性配置',
          propBlocks: [
            {
              id: 2,
              name: '通用',
              groupId: 1,
              propItems: [
                {
                  id: 3,
                  propKey: 'children',
                  label: '内容',
                  value: 'hello world!',
                  type: 'input',
                  span: 24,
                  groupId: 1,
                  blockId: 2
                }, {
                  id: 4,
                  propKey: 'type',
                  label: '类型',
                  value: 'primary',
                  type: 'input',
                  span: 24,
                  groupId: 1,
                  blockId: 2
                }
              ]
            }
          ]
        }]
      }
    }
  } as Page);
}
