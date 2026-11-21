# 🤖 OpenCodex - 通用型 AI 智能体 (AI Agent)

基于 **TypeScript + Node.js + DeepSeek API** 从零到一实现的通用型 AI 智能体，对标 OpenAI Codex / Claude Code 的核心产品形态。

> **核心亮点**：不是简单的 API 套壳，而是从底层架构出发，完整实现了智能体的六层架构、动态 Skill 技能加载、安全沙箱隔离、HITL 人类参与机制以及多智能体协作，具备企业级生产环境的健壮性处理。

## ✨ 核心特性

- 🧠 **动态技能体系 (Skill System)**：采用 Markdown 文件定义技能，Agent 启动时自动扫描并注入 System Prompt，大模型根据用户意图按需、动态触发对应技能，实现“零代码”扩展能力。
- 🛡️ **安全沙箱隔离 (Sandbox)**：不依赖重量级的底层 VM，而是通过严格的文件路径校验（`path.resolve` 与 `startsWith`），限制 AI 仅能在 `output/` 目录内进行读写操作，彻底杜绝路径穿越（Path Traversal）越权风险。
- 🚦 **人类参与机制 (HITL)**：Human-in-the-Loop，在调用大模型前和写入文件前进行高危指令拦截（如 `rm -rf`, `drop table` 等），通过 Node `readline` 阻塞式等待人类确认（y/n），保障系统绝对安全。
- 🔄 **流式交互体验 (Streaming)**：基于 Server-Sent Events (SSE) 实现打字机级的流式输出，大幅提升终端交互体验。
- 📁 **文件自动解析与写入**：通过约定 ` ```filename:xxx.md ` 的 Markdown 格式，Agent 自动解析大模型回复并提权执行文件落盘，实现从“聊天”到“执行”的闭环。
- 💾 **多轮记忆管理**：内置 `conversationHistory` 上下文管理，支持持久化多轮对话；并提供 `clear` 指令一键清空记忆，开启全新会话。
- 🤝 **多智能体协作 (Multi-Agent)**：支持将复杂任务拆分，多个独立职能的子智能体（如 Researcher / Analyst）基于 `Promise.all` 并发执行，最终由主智能体汇总。

## 🛠️ 技术栈

- **语言**: TypeScript (ESM 模块规范)
- **运行时**: Node.js (>=20)
- **大模型底座**: DeepSeek (基于 OpenAI SDK 无缝兼容接入)
- **构建工具**: tsup (极速构建)
- **核心依赖**: `openai`, `dotenv`, `fs-extra`

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
