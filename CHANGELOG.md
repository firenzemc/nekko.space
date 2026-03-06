# Changelog

## [0.4.0] - 2026-03-06

### Added
- **村民详情页** `/villagers/[id]`：人物小传、说话风格、喜好/讨厌标签、小趣事、村民关系网（进度条）、生活记录（最近 20 条事件）、直接送礼/约会
- **地点详情页** `/map/[id]`：当前氛围描述、天气效果、在场村民、场景布置、内嵌改造面板、活动和叙事钩子
- **手动 tick**：首页「推进世界」按钮，`POST /api/tick/manual`，30 秒冷却
- **LLM 家具解析**：自然语言如「放一排路灯和石头椅子」→ LLM 解析多个物品一次性放置，关键词匹配降级兜底
- State API 支持 `?villagerId=xxx` 过滤事件

### Changed
- 村民卡片、地点卡片可点击进入详情页
- 首页村民速览可点击跳转
- ModifyPanel 支持 `locationHint` 预填地点、操作后刷新页面
- 家具系统移除重复限制，允许多个同类物品

---

## [0.3.0] - 2026-03-06

### Added
- **LLM system prompt 支持**：所有 5 个 provider 支持 `systemPrompt` 参数
- **结构化角色数据** `villager-profiles.ts`：5 个村民的核心人设、说话风格、喜好、作息、关系
- **结构化场景数据** `location-profiles.ts`：12 个场景的时段氛围、天气效果、活动、叙事钩子
- **村民关系网** `VillagerRelationship` 类型，存储与持久化
- **每日剧情引擎**：Director Agent 生成 `DailyPlot`（标题、主题、相关村民、剧情线索）
- `villager.behavior` LLM task key（gpt-4o-mini, temp 0.7）

### Changed
- **村民 Agent 重写**：LLM 自主决策行动、地点、心情变化（取代硬编码 + 随机）
- **结构化 prompt/response**：`【地点】【行动】【心情变化】【旁白】` 格式，带模糊匹配和兜底
- **睡眠机制**：根据作息时间跳过 LLM 调用
- **Gossip 升级**：注入角色人设 + 关系上下文，低心情不参与，聊天后更新关系分
- **礼物系统**：用 `bio.likes` 替代硬编码关键词，LLM 生成个性化收礼反应
- **信件/约会**：注入 `systemPrompt` 和场景氛围
- **自动信件**：亲密度影响语气

### Exposed
- `GET /api/state` 返回 `villagerRelationships`
- `VillagerDecision` 新增 `moodReason` 字段
- `WorldState` 新增 `plotHook` 字段

---

## [0.2.0] - 2025-03-05

### Added
- 底部 Tab 导航栏（总览、地图、村民、信箱、岛报）
- `TimeDisplay` 组件（友好时间格式：今天/昨天/日期）
- 季节天气系统（基于杭州气候的月份概率分布）
- Asia/Shanghai 时区支持（`getIslandDate()`）
- 首页重新设计：hero + 状态卡片 + 村民速览 + 事件 + 剧情线索
- 决策日志页清理：隐藏 provider/model，心情箭头可视化
- 地图页加入场景氛围和天气效果描述

### Changed
- 配置界面从主导航移除（admin 页保留直接 URL 访问）
- 时间显示改为浏览器本地时区

---

## [0.1.0] - 2025-03-04

### Added
- 5 位初始村民
- 世界时钟 + 天气 + 每小时 world tick
- 村民 Agent 行动与事件日志
- 记者 Agent 日报生成
- 多 provider LLM 路由（Vercel Gateway / MiniMax / DeepSeek / GLM / AIHubMix）
- 信件、礼物、约会系统
- Gossip 系统
- 岛屿改造（自然语言）
- Neon Postgres 持久化 + 本地 JSON 降级
- Vercel 定时任务
