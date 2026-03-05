# 小岛物语 (Island Story)

一个基于 Next.js + Agent 架构的 ACNH 风格持续运行 Web 游戏原型。

## 当前阶段

MVP1（进行中）：

- 5 位初始村民（含牧牧）
- 世界时钟 + 天气 + 每小时 world tick
- 村民 Agent 行动与事件日志
- 记者 Agent 生成日报
- 模型路由可配置（不写死模型）

## 本地启动

```bash
bun install
bun dev
```

> 注意：当前环境下如果安装依赖超时，请先在网络稳定环境执行 `bun install` 后再启动。

## 核心 API

- `GET /api/state`
  - 查看当前世界状态、最新事件、日报
- `GET /api/health/llm`
  - 仅检查关键环境变量是否已注入（不触发模型调用）
- `GET /api/health/llm?probe=1`
  - 低成本探测模型调用是否落入 mock fallback
- `GET /api/health/db`
  - 检查数据库连接变量是否注入、当前连接来源
- `GET /api/health/db?probe=1`
  - 执行数据库读写探测（kv_store）
- `GET /api/models`
  - 查看当前任务到模型的映射
- `POST /api/models`
  - 写入 runtime model overrides（支持角色级覆盖）
- `GET /api/mail/list`
  - 查看岛主信件（支持 `villagerId` 过滤）
- `POST /api/mail/send`
  - 给村民写信并生成回信，更新亲密度
- `POST /api/gift/send`
  - 给村民送礼物并更新亲密度
- `GET /api/cron/world-tick`
  - 执行一轮世界推进
- `GET /api/cron/daily-report`
  - 生成日报
- `GET /api/cron/memory-maintain`
  - 记忆维护（MVP：裁剪事件长度）

## 管理页面

- `/admin/models`
  - 可视化配置模型路由（调试村民/导演/记者的模型）

## 模型配置策略

默认模型映射在 `src/lib/llm/model-registry.ts`：

- `villager.dialogue` -> 默认 MiniMax M2.5（Vercel Gateway）
- `villager.dialogue` / `villager.letter` -> AIHubMix (`openai_compatible + gpt-4o-mini`，通过 runtime override)
- `director.daily-plan` -> Vercel Gateway (`openai/gpt-4o-mini`)
- `reporter.daily` -> Vercel Gateway (`openai/gpt-4o-mini`)

支持三层优先级：

1. runtime override（`POST /api/models`）
2. 环境变量 `MODEL_OVERRIDES_JSON`
3. 代码默认值

支持的调用方式：

- `vercel_gateway`：通过 Vercel AI Gateway（OpenAI-compatible）
- `openai_compatible`：任意兼容 OpenAI API 的自定义端点
- `minimax` / `deepseek` / `glm` / `aihubmix`：直连 provider

## 环境变量

- `CRON_SECRET`：保护 cron route
- `DATABASE_URL`：Neon Postgres 连接串（启用持久化）
- `AI_GATEWAY_API_KEY`：Vercel AI Gateway API Key
- `AI_GATEWAY_BASE_URL`：默认 `https://ai-gateway.vercel.sh/v1`
- `CUSTOM_LLM_BASE_URL`：自定义 OpenAI-compatible 基础地址
- `CUSTOM_LLM_API_KEY`：自定义 OpenAI-compatible Key
- `AIHUBMIX_API_KEY`：AIHubMix 调用
- `MINIMAX_API_KEY`：MiniMax 调用
- `DEEPSEEK_API_KEY`：DeepSeek 调用
- `GLM_API_KEY`：GLM 调用
- `MODEL_OVERRIDES_JSON`：可选，初始化模型覆盖配置

## 数据库（Neon + Drizzle）

项目会优先使用 `DATABASE_URL` 对接 Neon 的 `kv_store` 表持久化世界状态和模型覆盖配置；若未配置，会回退到 `.data` 文件。

```bash
bun run db:push
```

- `db:push` 会根据 `src/lib/db/schema.ts` 同步表结构
- 首次上线建议在本地或 CI 执行一次后再部署

## Vercel 定时任务

`vercel.json` 已配置：

- 每小时：`/api/cron/world-tick`
- 每日：`/api/cron/daily-report`
- 每日：`/api/cron/memory-maintain`

建议在 Vercel 设置 `CRON_SECRET`，所有 cron route 自动校验 `Authorization: Bearer <CRON_SECRET>`。

## 后续计划（已排期）

- MVP2：信件系统 + 礼物 + 好感度
- MVP3：约会模式 + 旅行 + 周剧情
- MVP4：建设系统 + Garmin + 小游戏

## 部署到 GitHub + Vercel

```bash
git init
git add .
git commit -m "init island story mvp1"
git branch -M main
git remote add origin git@github.com:firenzemc/nekko.space.git
git push -u origin main
```

然后在 Vercel 导入该仓库，配置环境变量后即可部署。
