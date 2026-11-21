import 'dotenv/config';
import path from 'path';
import { createAgent } from './agent.js';

async function main() {
    const agent = createAgent({
        name: "TestAgent",
        model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
        apiKey: process.env.DEEPSEEK_API_KEY!,
        skillsDir: path.resolve(process.cwd(), 'dw/skills'),
        workspaceDir: process.cwd(),
        outputDir: path.resolve(process.cwd(), 'output'),
        verbose: true,
        // 为了测试顺利，我们先关闭 HITL（因为写文件也会触发它）
        hitl: { enabled: false, autoApprove: false }
    });

    console.log("--- 开始与 AI 对话 ---");

    // 我们故意让它触发“代码评审”技能，并让它写一个文件
    const prompt = "请帮我写一个最简单的 Node.js 的防抖函数（debounce），并把代码保存到 output/debounce.md 文件中。";

    process.stdout.write("\n🤖 AI 正在思考并生成... \n\n");

    const result = await agent.invokeStream(prompt);

    console.log("\n--- 对话结束 ---");
    console.log(`AI 总共生成了 ${result.files.length} 个文件。`);
}

main().catch(console.error);