# 小岛物语 (Island Story)

一个动森风格的 AI Agent 驱动持续运行 Web 游戏。村民拥有独立人格、自主决策、社交关系，在一座小岛上过着有故事线的生活。

**线上地址：[nekko.space](https://nekko.space)**

## 游戏特色

- **AI 驱动的村民行为**：每个村民由 LLM 根据人设、心情、社交关系、天气、时间自主决策行动
- **5 位性格迥异的村民**：牧牧（温柔甜点师）、茶茶丸（热血运动员）、雷姆（慵懒哲学家）、樱桃（朋克大姐）、小润（傲娇咖啡师）
- **12 个岛屿地点**：广场、海滩、咖啡摊、烘焙小屋、码头、花园、森林、舞台、跑道、商店、博物馆、露营地
- **每日剧情引擎**：Director Agent 每天规划剧情线索，影响村民行为
- **村民关系网**：村民之间有好感度、互动历史，gossip 系统让他们聊八卦
- **季节天气系统**：基于杭州气候规律，不同月份有不同天气概率分布
- **自然语言岛屿改造**：用自然语言描述想放的物品，LLM 解析并放置

## 页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 岛屿总览 | `/` | 世界状态、天气、村民速览、最近动态、手动推进 |
| 小岛地图 | `/map` | 12 个地点概览，点击进入地点详情 |
| 地点详情 | `/map/[id]` | 场景氛围、在场村民、家具布置、活动 |
| 村民档案 | `/villagers` | 村民列表，点击进入详情 |
| 村民详情 | `/villagers/[id]` | 人物小传、喜好、关系网、生活记录、送礼/约会 |
| 信箱 | `/mailbox` | 与村民书信往来 |
| 岛报 | `/newspaper` | AI 生成的每日报纸 |
| 决策日志 | `/ticks` | 村民每轮的行为决策时间线 |

## 本地启动

```bash
bun install
bun dev
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | Neon Postgres 连接串（持久化） |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway Key |
| `AI_GATEWAY_BASE_URL` | 默认 `https://ai-gateway.vercel.sh/v1` |
| `MINIMAX_API_KEY` | MiniMax 直连 |
| `AIHUBMIX_API_KEY` | AIHubMix 调用 |
| `DEEPSEEK_API_KEY` | DeepSeek 调用 |
| `GLM_API_KEY` | GLM 调用 |
| `CUSTOM_LLM_BASE_URL` | 自定义 OpenAI-compatible 端点 |
| `CUSTOM_LLM_API_KEY` | 自定义 OpenAI-compatible Key |
| `CRON_SECRET` | 保护 cron route |
| `MODEL_OVERRIDES_JSON` | 可选，初始化模型覆盖配置 |

## 技术栈

- **前端**：Next.js 16 + Tailwind CSS 4
- **后端**：Next.js API Routes（Serverless）
- **数据库**：Neon Postgres（Drizzle ORM），本地 JSON 降级
- **LLM**：多 provider 支持（Vercel Gateway / MiniMax / DeepSeek / GLM / AIHubMix / 自定义），per-task 模型路由
- **部署**：Vercel + GitHub 自动部署

## 定时任务

`vercel.json` 配置：
- 每小时：`/api/cron/world-tick` — 世界推进
- 每日：`/api/cron/daily-report` — 日报生成
- 每日：`/api/cron/memory-maintain` — 事件裁剪

用户也可在首页手动点击「推进世界」按钮触发 tick（30 秒冷却）。

## 管理

- `/admin/models` — 模型路由配置（仅通过直接 URL 访问）

## 数据库

```bash
bun run db:push
```

首次部署前执行，根据 `src/lib/db/schema.ts` 同步表结构。
