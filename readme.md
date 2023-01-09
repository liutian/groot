### 概要

如果你有可视化搭建需求，`groot` 可以帮你快速集成，节省从0到1的开发精力，同时也具备超高定制化能力


### 特性
- 不去影响开发者现有的开发习惯
- 不去改变前端项目现有的工程化体系
- 不去破坏组件的通用性，组件不是为 `groot` 特制的

### 贡献代码
- `react` `typescript` 为项目公共依赖库，在根目录默认安装，根目录 `base.tsconfig.json` 作为各个项目通用ts配置
- 如果需要本地调试 `examples/webpack-demo` 首先删除改项目下的 `node_modules/react`，防止运行时有两套react
- 本地开发应用启动列表，深度定制化
  - `cloud` 服务器：groot-local.com:10000
  - `examples/webpack-demo` demo项目：groot-local.com:11000
  - `examples/groot-plugin-demo` 插件项目模块联邦：groot-local.com:12000
  - `workbench` 工作台模块联邦：groot-local.com:13000
  - `examples/groot-workbench-demo` 工作台宿主项目：groot-local.com:14000

- `workbench` 独立工作台项目：groot-local.com:15000