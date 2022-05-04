
export const fetchPageData = async (url: string) => {
  return await fetch(url).then(response => response.json()) as Promise<Page>
}

export const fetchPageData2 = () => {
  return Promise.resolve({
    "id": 1,
    "name": "demo1",
    "url": "/demo1",
    "path": "/demo1",
    "component": {
      "id": 1,
      "name": "demo1",
      "studio": {
        "id": 1,
        "name": "demo1",
        "packageName": "antd",
        "moduleName": "Button_text",
        "componentName": "Button",
        "rootGroups": [],
        "allGroups": [
          {
            "id": 1,
            "name": "属性配置",
            "isRoot": true,
            "propBlocks": [],
            "propKey": ''
          }
        ],
        "allBlocks": [
          {
            "id": 1,
            "name": "通用",
            "propKey": '',
            "isRootPropKey": false,
            "groupId": 1,
            "propItems": []
          }
        ],
        "allItems": [
          {
            "id": 1,
            "label": "内容",
            "propKey": "children",
            "type": "input",
            "value": "hello world!",
            "defaultValue": null,
            "groupId": 1,
            "span": 24,
            "isRootPropKey": false,
            "blockId": 1,
          },
          {
            "id": 2,
            "label": "类型",
            "propKey": "type",
            "type": "input",
            "value": "primary",
            "defaultValue": null,
            "groupId": 1,
            "span": 24,
            "isRootPropKey": false,
            "blockId": 1
          }
        ]
      },
      "codeMetaData": [
        {
          "id": 1,
          "key": "children",
          "defaultValue": "hello world!",
          "type": "input"
        },
        {
          "id": 2,
          "key": "type",
          "defaultValue": "primary",
          "type": "input"
        }
      ]
    }
  } as Page);
}
