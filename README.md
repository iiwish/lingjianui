> ⚠️ **警示**: 该项目目前处于开发阶段，此版本仅用于求职展示。项目完成后此警示将被移除。
> 
> ⚠️ **Warning**: This project is under development. Current version is for job seeking purpose only. This warning will be removed once the project is completed.

# 灵简前端项目 (LingJian Frontend)

灵简低代码平台项目的前端部分，基于Remix + React + Ant Design

后端项目链接：https://github.com/iiwish/lingjian

The frontend part of LingJian Low-Code Platform, built with Remix + React + Ant Design.

---

## 技术栈 (Tech Stack)

- React 18: 前端框架
- Remix: Web应用框架
- Ant Design 5: UI组件库
- Redux Toolkit: 状态管理
- Redux Persist: 状态持久化
- TypeScript: 类型系统
- Tailwind CSS: 原子化CSS框架
- DND Kit: 拖拽功能实现
- Axios: HTTP客户端
- Dayjs: 日期处理
- Vite: 构建工具

## 项目结构 (Project Structure)

```
app/
  ├── components/        # 可复用组件
  │   ├── apps/         # 应用相关组件
  │   │   ├── AppList.tsx        # 应用列表组件
  │   │   ├── CreateAppModal.tsx # 创建应用弹窗
  │   │   └── AppSettingsModal.tsx # 应用设置弹窗
  │   ├── layout/       # 布局组件
  │   │   ├── MainLayout.tsx    # 主布局组件
  │   │   └── TabContent.tsx    # 标签页内容组件
  │   └── config/       # 配置相关组件
  │       └── model/    # 数据模型配置组件
  │           ├── DimensionConfig.tsx  # 维度配置组件
  │           ├── RelationConfig.tsx   # 关系配置组件
  │           └── hooks/              # 模型配置相关钩子
  ├── routes/           # 路由页面
  │   ├── _index.tsx             # 根路由（重定向到应用列表）
  │   ├── _auth.tsx              # 认证布局
  │   ├── dashboard.tsx          # 仪表盘页面
  │   ├── dashboard.settings.tsx # 设置页面
  │   ├── dashboard.$appCode.tsx # 应用详情页面
  │   ├── 404.tsx               # 404页面
  │   └── login.tsx             # 登录页面
  ├── services/         # API服务
  │   ├── index.ts      # 服务入口
  │   ├── auth.ts       # 认证相关服务
  │   ├── app.ts        # 应用相关服务
  │   └── element/      # 元素相关服务
  │       ├── menu.ts   # 菜单服务
  │       ├── table.ts  # 表格服务
  │       └── dim.ts    # 维度服务
  ├── stores/           # Redux状态管理
  │   ├── index.ts      # Store配置
  │   └── slices/       # Redux切片
  │       ├── authSlice.ts  # 认证状态
  │       ├── appSlice.ts   # 应用状态
  │       └── tabSlice.ts   # 标签页状态
  ├── types/            # TypeScript类型定义
  │   ├── auth.ts       # 认证相关类型
  │   ├── app.ts        # 应用相关类型
  │   └── element/      # 元素相关类型
  │       ├── menu.ts   # 菜单类型
  │       ├── table.ts  # 表格类型
  │       └── dim.ts    # 维度类型
  ├── utils/            # 工具函数
  │   ├── http.ts       # HTTP请求工具
  │   └── permission.ts # 权限控制工具
  └── root.tsx          # 根组件
```

## 项目配置文件 (Configuration Files)

```
.
├── .env                # 环境变量配置
├── .eslintrc.cjs      # ESLint配置
├── .eslintrc.js       # ESLint扩展配置
├── postcss.config.js   # PostCSS配置
├── tailwind.config.ts  # Tailwind CSS配置
├── tsconfig.json      # TypeScript配置
└── vite.config.ts     # Vite构建工具配置
```

---

## 开发环境要求 (Requirements)

- Node.js >= 20.0.0
- npm >= 9.0.0

## 主要依赖版本 (Dependencies)

- React: 18.2.0
- Remix: 2.13.1
- Ant Design: 5.21.6
- Redux Toolkit: 2.2.1
- TypeScript: 5.1.6
- Tailwind CSS: 3.4.4
- DND Kit Core: 6.1.0
- Axios: 1.6.7

## 安装依赖 (Installation)

```bash
npm install
```

## 开发调试 (Development)

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。默认会重定向到登录页面。

## 构建部署 (Build & Deploy)

```bash
npm run build
npm start
```

## 代码检查 (Code Quality)

```bash
npm run lint
npm run typecheck
```

---

## 主要功能 (Core Features)

1. 用户认证
   - 登录/登出
   - Token管理（访问令牌和刷新令牌）
   - 验证码支持
   - 修改密码
   - 用户信息管理

2. 应用管理
   - 应用列表展示
   - 创建新应用
   - 应用基础信息配置
   - 应用权限管理
   - 应用图标（支持emoji）

3. 元素管理
   - 菜单管理
     - 菜单树结构
     - 拖拽排序
     - 创建/编辑/删除菜单项
   - 数据表管理
     - 表格数据CRUD
     - 查询条件配置
     - 批量操作支持
   - 维度管理
     - 维度树结构
     - 节点拖拽排序
     - 批量操作支持

4. 界面功能
   - 响应式布局
   - 标签页管理
   - 面包屑导航
   - 权限控制
   - 加载状态处理
   - 错误处理
   - 空状态展示

---

## 开发规范 (Development Guidelines)

1. 组件开发
   - 使用TypeScript编写
   - 使用函数式组件
   - 使用Hooks管理状态和副作用
   - 组件目录结构清晰
   - 使用Tailwind CSS进行样式开发
   - 支持响应式设计

2. 状态管理
   - 全局状态使用Redux Toolkit
   - 按功能模块拆分Slice
   - 使用redux-persist持久化必要状态
   - 异步操作使用createAsyncThunk
   - 本地状态使用useState/useReducer

3. API调用
   - 使用Axios进行HTTP请求
   - 统一的错误处理
   - 请求响应拦截器
   - Token自动刷新
   - 类型安全的API响应处理

4. 路由管理
   - 使用Remix文件系统路由
   - 路由级别的代码分割
   - 认证路由保护
   - 标签页状态同步
   - 动态路由参数处理

5. 类型定义
   - 完整的TypeScript类型定义
   - 按模块组织类型文件
   - API请求响应类型
   - 组件Props类型
   - Redux状态类型

6. 权限控制
   - 基于角色的访问控制
   - 细粒度的按钮权限
   - 路由级别的权限控制
   - 预设权限配置

---

## 开发流程 (Development Process)

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

## 注意事项 (Notes)

1. 开发时需要确保后端API服务正常运行
2. 本地开发默认连接后端API地址为：http://localhost:8080
3. 如需修改API地址，请在.env文件中配置
4. 代码提交前请确保通过lint和类型检查
5. 样式开发优先使用Tailwind CSS类名
6. 注意处理API请求的错误情况
7. 及时更新类型定义
8. 遵循权限控制机制

---

## 贡献指南 (Contributing)

1. Fork本项目
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建一个Pull Request

## 版权许可 (License)

本项目采用 Apache-2.0 许可证 - 查看 [LICENSE](LICENSE) 文件了解详细信息
