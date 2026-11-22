import 'dotenv/config';
import path from 'path';
import { createAgent } from './agent.js';
import { TavilySearch } from './tools/tavily-search.js';

async function main() {
    if (!process.env.TAVILY_API_KEY) {
        console.error("❌ 缺少 TAVILY_API_KEY");
        process.exit(1);
    }

    const searchTool = new TavilySearch(process.env.TAVILY_API_KEY);

    // 通用配置（提取出来复用）
    const commonConfig = {
        model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
        apiKey: process.env.DEEPSEEK_API_KEY!,
        skillsDir: path.resolve(process.cwd(), 'dw/skills'),
        workspaceDir: process.cwd(),
        outputDir: path.resolve(process.cwd(), 'output'),
        hitl: { enabled: false, autoApprove: false }
    };

    // ==========================================
    // 角色 1：研究员 (负责搜索)
    // ==========================================
    const researcher = createAgent({
        ...commonConfig,
        name: "Researcher",
        verbose: false, // 研究员不用输出太多废话，只看结果
        systemPrompt: "你是一个专业的研究员，请根据搜索结果提取核心信息，不要瞎编。"
    });

    // ==========================================
    // 角色 2：分析师 (负责分析)
    // ==========================================
    const analyst = createAgent({
        ...commonConfig,
        name: "Analyst",
        verbose: false,
        systemPrompt: "你是一个资深的行业分析师，请对提供的信息进行深度分析、提炼，输出有条理的 Markdown 报告。"
    });

    console.log("--- 阶段1：研究员并发搜索 ---");
    // 这里用 Promise.all 并发执行两个搜索任务，节约时间
    const [res1, res2] = await Promise.all([
        searchTool.search("LangChain 最新特性 2024"),
        searchTool.search("DeepSeek V3 模型评测 2024")
    ]);

    console.log("--- 阶段2：分析师并发处理 ---");
    // 同样用 Promise.all 并发让分析师处理两份搜索资料
    const [analysis1, analysis2] = await Promise.all([
        analyst.invoke(`请分析以下内容：\n${res1}`),
        analyst.invoke(`请分析以下内容：\n${res2}`)
    ]);

    console.log("--- 阶段3：主智能体汇总 ---");
    // 角色 3：主编 (负责合成终稿)
    const editor = createAgent({
        ...commonConfig,
        name: "Editor",
        verbose: true,
        systemPrompt: "你是一个主编，请把两份分析报告整合成一份完整的行业调研报告，并使用 Markdown 格式输出。"
    });

    // 调用主编，把两份分析结果塞给它
    await editor.invokeStream(`
    分析报告1：\n${analysis1.content}
    \n---\n
    分析报告2：\n${analysis2.content}
    \n请整合并命名为 final-report.md 保存。
  `);

    console.log("\n✅ 多智能体协作完成！请去 output 目录查看 final-report.md");
}

main().catch(console.error);