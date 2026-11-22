import 'dotenv/config';
import path from 'path';
import { createAgent } from './agent.js';
import { TavilySearch } from './tools/tavily-search.js';

async function main() {
    // 1. 检查 API Key 是否存在
    if (!process.env.TAVILY_API_KEY) {
        console.error("❌ 缺少 TAVILY_API_KEY，请先在 .env 中配置。");
        process.exit(1);
    }

    // 2. 初始化搜索工具
    const searchTool = new TavilySearch(process.env.TAVILY_API_KEY);

    // 3. 初始化 Agent
    const agent = createAgent({
        name: "SearchAgent",
        model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
        apiKey: process.env.DEEPSEEK_API_KEY!,
        skillsDir: path.resolve(process.cwd(), 'dw/skills'),
        workspaceDir: process.cwd(),
        outputDir: path.resolve(process.cwd(), 'output'),
        verbose: true,
        // 这里先关闭 HITL，免得一直卡住等待输入
        hitl: { enabled: false, autoApprove: false }
    });

    // 4. 定义我们要问的问题
    const query = "LangChain 2024 年的最新核心概念";

    // 5. 第一步：执行联网搜索
    const searchResults = await searchTool.search(query);

    // 6. 第二步：把搜索结果包装成给大模型的 Prompt
    const prompt = `
你是一个资深的 AI 技术专家。请根据以下实时搜索结果，帮我写一份关于 "${query}" 的简要学习笔记。
请将笔记保存为 Markdown 文件，文件名为：langchain-notes.md。

【搜索结果】：
${searchResults}

【要求】：
1. 提取出最核心的 3 个概念。
2. 使用简洁的语言解释这些概念。
3. 严格按照约定的 filename 格式输出文件。
`;

    console.log("\n🤖 Agent 正在整理资料并撰写报告...\n");

    // 7. 第三步：让大模型生成内容（使用流式输出，体验更好）
    const result = await agent.invokeStream(prompt);

    console.log("\n--- 报告生成完毕 ---");
    if (result.files.length > 0) {
        console.log(`✅ 文件已成功保存在 output 目录下: ${result.files.join(', ')}`);
    } else {
        console.log("⚠️ 注意：Agent 没有生成文件。请检查大模型是否遵循了 filename 格式约束。");
    }
}

main().catch(console.error);