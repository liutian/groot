### 工程搭建

- `git init`
- 添加 gitignore
- `npm init`
- `npm install husky -D`
- `npx husky install`
- `npm set-script prepare "husky install"`
- `npx husky add .husky/commit-msg 'npx commitlint --edit \"$1\"'`
- `npm install -D @commitlint/{config-conventional,cli}`
- package.json 添加 commitlint 字段
- `npm i -D prettier eslint typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier`
- `npx husky add .husky/pre-commit 'npx lint-staged'`
- `npm i -D lint-staged`
- package.json 添加 lint-staged 字段
- package.json 添加 workspaces
- 创建 monorepo 项目
