# 💡 Inspiration Wall (灵感卡片墙)

一个基于 **Next.js 16 + React 19 + Tailwind CSS + Cloudflare D1 边缘数据库** 的极简美观灵感知识库与卡片墙应用。

---

## 🌟 项目亮点与特性

- 🎨 **现代化毛玻璃质感 UI**：采用 Dark Mode 深色主题、高饱和度微光渐变（Amber/Emerald/Blue/Purple/Rose/Cyan）与丝滑交互。
- ⚡ **无服务器与边缘计算**：后端无缝对接 **Cloudflare D1** SQLite 边缘数据库，低延迟全球查询。
- 📌 **卡片核心功能**：
  - 支持灵感创建、富分类标签管理、自定义卡片色调。
  - 支持置顶（Pinned）、点赞及动态撒花动画（Confetti）、在线编辑与删除。
  - 支持按分类实时过滤与标题/内容/标签/作者全文搜索。
  - 支持按最新发布与获赞热度排序。
- 🚀 **开箱即用，支持 Vercel 一键部署**。

---

## 🛠 技术栈

- **前端 / 框架**：Next.js 16 (App Router) + React 19 + TypeScript
- **样式**：Tailwind CSS v4 + Lucide React + Canvas Confetti
- **数据库**：Cloudflare D1 (Serverless SQLite)
- **部署平台**：Vercel / Cloudflare Pages

---

## ⚙️ 环境变量配置

在根目录 `.env.local` 或在 Vercel 环境变量中添加：

```env
CLOUDFLARE_ACCOUNT_ID="your_cloudflare_account_id"
CLOUDFLARE_DATABASE_ID="your_d1_database_id"
CLOUDFLARE_API_TOKEN="your_cloudflare_api_token"
```

---

## 🐛 开发中遇到的业务 Bug、产品意图及修复过程

### 1. 业务 Bug 描述
在开发**点赞排序与卡片置顶**功能时，发现在按“最高获赞”排序时，被用户或管理员置顶的重要灵感卡片被挤到了后面，且重复点击点赞按钮时，点赞数会出现负数或者因为无锁并发导致状态错乱。此外，前端单次点击点赞后由于等待异步接口响应，卡片爱心图标出现明显卡顿和闪烁。

### 2. 产品意图 (Product Intent)
- **置顶机制优先级**：置顶（Pin）是产品的核心强运营/标记能力，无论用户选择“最新发布”还是“最高获赞”排序，**置顶卡片都必须始终固定在卡片墙最前列**。
- **防止点赞异常**：点赞数必须有底线校验（最低为 0，不能被点成负数）。
- **极速交互体验（Optimistic UI）**：点赞和取消点赞应当在毫秒级给用户视觉反馈与粒子动效，并持久化到本地状态，同时在后台静默同步给 D1 数据库。

### 3. 修复与优化过程
1. **SQL 排序重构**：
   在 `/api/cards/route.ts` 中，统一调整 ORDER 逻辑为 `ORDER BY pinned DESC, likes DESC, created_at DESC`，确保 `pinned DESC` 作为首要权重因子，完美兼顾置顶与热度排序。
2. **防负数与事务原子计算**：
   在 `/api/cards/[id]/like/route.ts` 中采用 `UPDATE cards SET likes = MAX(0, likes - 1)` 防止出现负赞。
3. **前端乐观更新（Optimistic Update）与本地缓存**：
   前端在发起网络请求的同时，直接利用 React 状态即时自增/自减，配合 `canvas-confetti` 触发礼花动画，并在 `localStorage` 缓存当前用户的点赞卡片集合，极大提升了流畅度与产品体验。
