### 概要

只要组件提供通用能力并通过 `prop` 对外公开定制化，就可以使用 `groot` 将组件进行共享和项目集成，通过配置界面实现通用组件定制化能力

### 特性
- 不去影响开发者现有的开发习惯
- 不去改变前端项目现有的工程化体系
- 不去破坏组件的通用性，组件不是为 `groot` 特制的

### 贡献代码
`react` `typescript` 为项目公共依赖库，在根目录默认安装，根目录 `base.tsconfig.json` 作为各个项目通用ts配置

如果需要本地调试 `examples/webpack-demo` 首先删除改项目下的 `node_modules/react`，防止运行时有两套react