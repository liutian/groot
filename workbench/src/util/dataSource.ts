export const fetchPageComponentData = () => {
  return Promise.resolve({
    name: 'demo',
    url: 'http://localhost:8888/admin/groot/page1',
    path: '/groot/page1',
    codeMetadata: '[{ "key": "children", "defaultValue": "hello world!" },{"key": "type","defaultValue": "primary"}]',
    codeMetaStudio: codeMetaStudioData,
    packageName: 'antd',
    moduleName: 'Button_text',
    componentName: 'Button'
  } as PageComponentStudio);
}


const codeMetaStudioData = {
  propGroups: [{
    id: '001',
    title: '属性配置',
    propBlocks: [
      {
        id: '002',
        title: '通用',
        groupId: '001',
        propItems: [
          {
            id: '003',
            propKey: 'children',
            label: '内容',
            value: 'hello world!',
            type: 'input',
            span: 24,
            groupId: '001',
            blockId: '002'
          }, {
            id: '004',
            propKey: 'type',
            label: '类型',
            value: 'primary',
            type: 'input',
            span: 24,
            groupId: '001',
            blockId: '002'
          }
        ]
      }
    ]
  }]
} as CodeMetaStudio;