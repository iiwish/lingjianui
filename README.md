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
app/
  ├── components/        # 可复用组件
  │   └── layout/       # 布局组件
  │       └── MainLayout.tsx  # 主布局组件
  ├── routes/           # 路由页面
  │   ├── _index.tsx    # 根路由（重定向到应用列表）
  │   ├── _auth.tsx     # 认证布局（需要登录的页面）
  │   ├── _auth.apps.tsx # 应用列表页面（需要认证）
  │   ├── login.tsx     # 登录页面
  │   └── 404.tsx       # 404页面
  ├── services/         # API服务
  │   ├── auth.ts       # 认证相关服务
  │   ├── app.ts        # 应用相关服务
  │   └── config/       # 配置相关服务
  │       ├── table.ts  # 数据表配置服务
  │       ├── dimension.ts # 维度配置服务
  │       ├── model.ts  # 数据模型配置服务
  │       ├── form.ts   # 表单配置服务
  │       └── menu.ts   # 菜单配置服务
  ├── stores/           # Redux状态管理
  │   ├── index.ts      # Store配置
  │   └── slices/       # Redux切片
  │       ├── authSlice.ts  # 认证状态
  │       ├── appSlice.ts   # 应用状态
  │       └── configSlice.ts # 配置状态
  ├── types/            # TypeScript类型定义
  │   └── api.ts        # API相关类型
  ├── utils/            # 工具函数
  │   └── http.ts       # HTTP请求工具
  └── root.tsx          # 根组件

```

## 开发环境要求

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

访问 http://localhost:3000 查看应用。默认会重定向到登录页面。

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
   - Token管理（访问令牌和刷新令牌）
   - 验证码支持

2. 应用管理
   - 应用列表
   - 创建应用
   - 应用模板
   - 应用设置

3. 配置管理
   - 数据表配置
   - 维度配置
   - 数据模型配置
   - 表单配置
   - 菜单配置

## 开发规范

1. 组件开发
   - 使用TypeScript编写
   - 使用函数式组件
   - 使用Hooks管理状态和副作用
   - 组件放在components目录下
   - 页面组件放在routes目录下

2. 状态管理
   - 全局状态使用Redux Toolkit
   - 按功能模块拆分Slice
   - 异步操作使用createAsyncThunk
   - 本地状态使用useState/useReducer

3. API调用
   - 使用统一的HTTP请求工具（utils/http.ts）
   - 按功能模块组织API服务
   - 处理请求错误和加载状态
   - 支持Token自动刷新

4. 路由管理
   - 使用Remix文件系统路由
   - 认证路由放在_auth.tsx下
   - 实现路由级别的权限控制
   - 支持路由错误处理

5. 类型定义
   - 所有类型定义放在types目录下
   - API相关类型定义在api.ts中
   - 组件Props使用interface定义
   - Redux状态使用interface定义

## 目录说明

- `app/components`: 可复用的React组件
- `app/routes`: 页面组件和路由配置
- `app/services`: API服务封装
- `app/stores`: Redux状态管理
- `app/types`: TypeScript类型定义
- `app/utils`: 工具函数

## 开发流程

1. 启动开发服务器
```bash
npm run dev
```

2. 访问登录页面
```
http://localhost:3000/login
```

3. 使用以下默认账号登录（需要后端支持）
```
用户名: admin
密码: 123456
```

4. 登录成功后会自动跳转到应用列表页面

## 注意事项

1. 开发时需要确保后端API服务正常运行
2. 本地开发默认连接后端API地址为：http://localhost:8080
3. 如需修改API地址，请在环境变量中配置
4. 代码提交前请确保通过lint和类型检查
