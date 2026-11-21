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

2. 配置环境变量
复制根目录下的 .env.example 为 .env，并填入你的 DeepSeek API Key：

env
DEEPSEEK_API_KEY=sk-你的真实API_KEY
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_TEMPERATURE=0.7

(注意：请勿将包含真实 Key 的 .env 文件提交至 Git)

3. 编译并启动
bash
# 编译 TypeScript
npm run build

# 启动交互式智能体
npm run dev

🎮 交互指令
启动后，你可以在终端直接输入自然语言与智能体对话，同时支持以下特殊指令：

exit：退出智能体

clear：清空当前对话历史（让 AI 失忆）

files：查看 output/ 目录下 AI 生成的所有文件

📂 项目架构

├── dw/
│   └── skills/          # Markdown 技能定义文件 (如写诗、代码评审等)
├── src/
│   ├── agent.ts         # 智能体核心类 (调度大模型、历史管理、文件解析)
│   ├── sandbox.ts       # 安全沙箱 (文件路径隔离与读写控制)
│   ├── hitl.ts          # 人工确认机制 (高危指令拦截)
│   ├── skill-loader.ts  # 技能加载器 (解析 Markdown 并拼接 Prompt)
│   └── index.ts         # 命令行主入口 (交互式循环)
├── output/              # AI 生成的最终文件存放处 (沙箱区域)
├── .env                 # 环境变量 (不提交至仓库)
├── tsup.config.ts       # 构建配置
└── tsconfig.json        # TypeScript 配置

🧩 扩展玩法

自定义技能
只需在 dw/skills/ 目录下新建一个 .skill.md 文件，按照格式编写 name、description 和执行指南，Agent 重启后即可自动学会新技能，无需改动任何核心代码。

切换大模型
得益于 OpenAI SDK 的兼容性，只需修改 .env 中的 DEEPSEEK_MODEL 或在 src/agent.ts 中修改 baseURL，即可无缝切换至通义千问、Kimi (Moonshot)、本地 Ollama 等任何兼容 OpenAI 接口的模型。

📝 开发心得与踩坑记录
ESM 规范踩坑：Node.js 开启 "type": "module" 后，本地引入 TypeScript 模块必须在相对路径后加上 
.js
 后缀（如 
import { Agent } from './agent.js'
），否则编译后会报错 ERR_MODULE_NOT_FOUND。

Windows 换行符兼容：在解析 Markdown 技能文件的 Frontmatter 时，Windows 默认的 \r\n 换行符会导致严格的正则匹配（仅匹配 \n）失败。在正则表达式中加入 \r? 即可完美兼容跨平台。

OpenAI SDK 与 DeepSeek 的兼容：将 baseURL 指定为 
https://api.deepseek.com/v1
 后，可直接使用 OpenAI 的 SDK 和流式方法，业务代码完全不用动。


***

### 🎯 后续操作步骤：

1. 把上面这段内容完整复制。
2. 打开你项目里的 `README.md` 文件（或者在 GitHub 网页上直接点击 README 旁边的铅笔图标进行编辑）。
3. 粘贴进去并保存。
4. 在终端执行：
   ```bash
   git add README.md
   git commit -m "docs: 完善项目 README，增加架构说明与开发心得"
   git push origin main
