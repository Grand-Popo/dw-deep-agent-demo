import 'dotenv/config';
import path from 'path';
import readline from 'readline';
import { createAgent } from './agent.js';

async function main() {
    // 1. 初始化 Agent
    const agent = createAgent({
        name: "OpenCodex-CLI",
        model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
        apiKey: process.env.DEEPSEEK_API_KEY!,
        skillsDir: path.resolve(process.cwd(), 'dw/skills'),
        workspaceDir: process.cwd(),
        outputDir: path.resolve(process.cwd(), 'output'),
        verbose: true,
        // 生产环境建议开启 HITL！这里我们先设为 true，让你体验一下拦截快感
        hitl: { enabled: true, autoApprove: false }
    });

    console.log("=========================================");
    console.log("🤖 OpenCodex 智能体已启动！");
    console.log("💡 输入 'exit' 退出 | 'clear' 清空历史 | 'files' 查看输出文件");
    console.log("=========================================");

    // 2. 初始化终端输入接口
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const askQuestion = (query: string) => new Promise<string>((resolve) => rl.question(query, resolve));

    // 3. 开启无限循环
    while (true) {
        const input = await askQuestion("\n👨‍💻 你: ");
        const trimmed = input.trim();

        if (!trimmed) continue;

        // 处理特殊指令
        if (trimmed === 'exit') {
            console.log("👋 再见！");
            rl.close();
            process.exit(0);
        }

        if (trimmed === 'clear') {
            agent.clearHistory();
            console.log("🧹 对话历史已清空，开始全新对话。");
            continue;
        }

        if (trimmed === 'files') {
            const files = agent.getSandbox().listFiles();
            if (files.length === 0) {
                console.log("📂 output 目录目前是空的。");
            } else {
                console.log("📂 output 目录下的文件：");
                files.forEach(f => console.log(`  - ${f}`));
            }
            continue;
        }

        // 4. 调用 Agent
        process.stdout.write("\n🤖 Agent: ");
        try {
            const result = await agent.invokeStream(trimmed);
            if (result.files.length > 0) {
                console.log(`\n[系统提示] 本次对话已自动写入文件: ${result.files.join(", ")}`);
            }
        } catch (error: any) {
            console.error(`\n❌ 发生错误: ${error.message}`);
        }
    }
}

main().catch(console.error);