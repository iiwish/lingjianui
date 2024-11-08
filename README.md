# 灵简前端项目

基于Remix + React + Ant Design的低代码平台前端项目。

## 技术栈

- Remix: Web应用框架
- React: UI库
- Ant Design 5: UI组件库
- Redux Toolkit: 状态管理
- TypeScript: 类型系统

## 项目结构

```
src/
  ├── app/                # Remix路由和页面组件
  │   ├── routes/        # 路由页面
  │   └── root.tsx       # 根组件
  ├── components/        # 可复用组件
  │   ├── common/        # 通用组件
  │   ├── config/        # 配置相关组件
  │   └── layout/        # 布局组件
  ├── hooks/             # 自定义Hooks
  ├── services/          # API服务
  ├── stores/            # Redux状态管理
  ├── types/             # TypeScript类型定义
  ├── utils/             # 工具函数
  └── styles/            # 全局样式
```

## 开发环境

- Node.js >= 20.0.0
- npm >= 9.0.0

## 安装依赖

```bash
npm install
```

## 开发调试

```bash
npm run dev
```

访问 http://localhost:3000 查看应用

## 构建部署

```bash
npm run build
npm start
```

## 代码检查

```bash
npm run lint
npm run typecheck
```

## 主要功能

1. 用户认证
   - 登录/登出
   - Token管理
   - 验证码

2. 应用管理
   - 应用列表
   - 创建应用
   - 应用模板

3. 配置管理
   - 数据表配置
   - 维度配置
   - 数据模型配置
   - 表单配置
   - 菜单配置

4. 权限管理
   - 角色管理
   - 权限分配
   - RBAC控制

5. 任务管理
   - 定时任务
   - 触发器配置

## 开发规范

1. 组件开发
   - 使用TypeScript编写
   - 遵循函数式组件规范
   - 使用Hooks管理状态和副作用

2. 样式开发
   - 使用CSS Modules
   - 遵循BEM命名规范
   - 优先使用Ant Design的样式变量

3. 状态管理
   - 使用Redux Toolkit管理全局状态
   - 使用React Context管理局部状态
   - 合理使用useReducer管理复杂组件状态

4. API调用
   - 使用统一的请求封装
   - 处理错误和加载状态
   - 实现请求缓存和防抖

5. 路由管理
   - 按功能模块组织路由
   - 实现路由鉴权
   - 支持动态路由配置
