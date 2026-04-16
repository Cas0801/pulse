# Pulse Full-Stack Skeleton

这个项目现在已经从静态原型升级成了一个前后端分层系统：

- 前端：`React + Vite`
- 后端：`Express`
- 云数据库：`Supabase REST API`

## Architecture

- `src/components/*` 负责视图层
- `src/hooks/usePulseData.ts` 负责前端状态与 API 编排
- `src/lib/api.ts` 负责前端 HTTP 调用
- `server/index.ts` 负责 API 入口与输入校验
- `server/supabase.ts` 负责 Supabase 读写与数据归一化
- `src/lib/mockData.ts` 负责无云配置时的本地回退

## Start

1. 安装依赖
   `npm install`
2. 复制 `.env.example` 到 `.env.local` 并填写 Supabase 参数
3. 启动后端
   `npm run dev:api`
4. 启动前端
   `npm run dev`

前端默认运行在 `http://localhost:3000`，并通过 Vite 代理把 `/api/*` 转发到 `http://localhost:3001`。

## Supabase Setup

项目里已经附带了可直接执行的初始化脚本：

- `supabase/init.sql`

导入方式：

1. 打开 Supabase 项目的 SQL Editor
2. 粘贴 `supabase/init.sql` 全部内容并执行
3. 将 `.env.local` 里的 `SUPABASE_DEFAULT_AUTHOR_ID` 设置为脚本里种子用户的 id
   `11111111-1111-1111-1111-111111111111`

这个脚本会自动创建：

- `profiles` 表
- `posts` 表
- 常用索引
- `updated_at` 自动维护触发器
- `post_count` 自动同步触发器
- `auth.users -> profiles` 自动同步触发器
- 基础 RLS 策略
- 一条演示用户和两条演示帖子

### RLS Notes

- 匿名用户可读取公开 `profiles`
- 匿名用户只能读取 `visibility = 'public'` 的帖子
- 登录用户可读取 `public` 和 `followers` 帖子
- 登录用户可以更新自己的 `profile`
- 登录用户只能写入、更新、删除自己的帖子

如果你后面要做真正的关注关系，可以再把 `followers` 可见性的策略替换成基于关系表的判断。

## Auth Notes

- 前端登录依赖 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`
- 用户注册后，数据库会自动从 `auth.users` 建立对应的 `profiles` 行
- 后端收到前端的 Bearer token 后，会按当前用户身份写入 `posts`
- 如果你开启了邮箱确认，首次注册后需要先去邮箱激活，再登录

## Behavior

- 没有配置 Supabase 时，系统会自动回退到 mock 数据，方便你先联调界面
- 配置完成后，`GET /api/feed` 会从 Supabase 拉取动态内容
- `POST /api/posts` 会把新内容写入 Supabase 的 `posts` 表
