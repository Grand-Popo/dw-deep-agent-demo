import OpenAI from "openai";
import { loadSkills, buildSkillsPrompt, Skill } from "./skill-loader.js";
import { Sandbox } from "./sandbox.js";
import { HITL, HITLConfig } from "./hitl.js";

export interface AgentConfig {
    name: string;
    model: string;
    apiKey: string;
    baseURL?: string;
    skillsDir: string;
    workspaceDir: string;
    outputDir: string;
    verbose?: boolean;
    hitl?: HITLConfig;
    systemPrompt?: string; // 允许自定义基础人设
}

export class Agent {
    private client: OpenAI;
    private config: AgentConfig;
    private conversationHistory: any[] = [];
    private skills: Skill[];
    private sandbox: Sandbox;
    private hitl: HITL;

    constructor(config: AgentConfig) {
        this.config = config;

        // 1. 初始化 OpenAI SDK (底层接入 DeepSeek)
        this.client = new OpenAI({
            apiKey: config.apiKey,
            baseURL: config.baseURL || "https://api.deepseek.com/v1",
        });

        // 2. 加载技能
        this.skills = loadSkills(config.skillsDir);

        // 3. 初始化沙箱和 HITL
        this.sandbox = new Sandbox({
            workspaceDir: config.workspaceDir,
            outputDir: config.outputDir,
            verbose: config.verbose
        });
        this.hitl = new HITL(config.hitl || { enabled: false, autoApprove: false });
    }

    getSkills(): Skill[] { return this.skills; }
    getSandbox(): Sandbox { return this.sandbox; }

    /**
     * 核心：构建 System Prompt
     * 整合基础人设 + 技能提示词 + 文件输出格式约束
     */
    private buildSystemPrompt(): string {
        const skillPrompt = buildSkillsPrompt(this.skills);
        const basePrompt = this.config.systemPrompt || "你是一个专业的 AI 全栈助手。";

        return `${basePrompt}

${skillPrompt}

【输出约束】
当你需要输出文件时，请务必使用以下格式（文件名不能包含空格）：
\`\`\`filename:你的文件名.md
这里写文件内容
\`\`\`
除了文件代码块外，你可以附带一些简单的解释说明。`;
    }

    /**
     * 核心：解析大模型回复中的文件代码块，并写入沙箱
     */
    private async processFileOperations(content: string): Promise<string[]> {
        const writtenFiles: string[] = [];
        // 正则匹配 ```filename:xxx.md ... ```
        const regex = /```filename:(.+?)\n([\s\S]*?)```/g;
        let match;

        while ((match = regex.exec(content)) !== null) {
            const filename = match[1].trim();
            const fileContent = match[2].trim();

            // 写入前，过一遍 HITL 检查（防止 AI 自动覆盖重要文件）
            const approved = await this.hitl.checkPoint(`准备写入文件: ${filename}`);

            if (approved) {
                try {
                    this.sandbox.writeFile(filename, fileContent);
                    writtenFiles.push(filename);
                } catch (error: any) {
                    console.error(`[Agent] 文件写入失败: ${error.message}`);
                }
            } else {
                console.log(`[Agent] ⚠️ 用户拒绝了写入文件: ${filename}`);
            }
        }
        return writtenFiles;
    }

    /**
     * 流式对话 (用于终端交互)
     */
    async invokeStream(userMessage: string): Promise<{ content: string; files: string[] }> {
        // 1. 检查用户输入是否包含高危指令
        const approved = await this.hitl.checkPoint(userMessage);
        if (!approved) {
            return { content: "【操作已被用户取消】", files: [] };
        }

        // 2. 记录用户历史
        this.conversationHistory.push({ role: "user", content: userMessage });

        // 3. 呼叫 DeepSeek
        const stream = await this.client.chat.completions.create({
            model: this.config.model,
            messages: [
                { role: "system", content: this.buildSystemPrompt() },
                ...this.conversationHistory,
            ],
            stream: true,
        });

        // 4. 实时打印流式输出
        let fullContent = "";
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                process.stdout.write(content); // 逐字打印
                fullContent += content;
            }
        }
        process.stdout.write("\n");

        // 5. 记录 AI 历史
        this.conversationHistory.push({ role: "assistant", content: fullContent });

        // 6. 解析并写入文件
        const files = await this.processFileOperations(fullContent);
        return { content: fullContent, files };
    }

    /**
     * 普通对话 (非流式，用于后台静默执行)
     */
    async invoke(userMessage: string): Promise<{ content: string; files: string[] }> {
        // 1. 检查高危操作
        const approved = await this.hitl.checkPoint(userMessage);
        if (!approved) {
            return { content: "【操作已被用户取消】", files: [] };
        }

        // 2. 记录用户消息
        this.conversationHistory.push({ role: "user", content: userMessage });

        // 3. 发起请求（注意这里没有 stream: true）
        const response = await this.client.chat.completions.create({
            model: this.config.model,
            messages: [
                { role: "system", content: this.buildSystemPrompt() },
                ...this.conversationHistory,
            ],
        });

        // 4. 获取回复并记录
        const assistantContent = response.choices[0].message.content || "";
        this.conversationHistory.push({ role: "assistant", content: assistantContent });

        // 5. 处理文件写入
        const files = await this.processFileOperations(assistantContent);

        return { content: assistantContent, files };
    }

    /**
     * 清空对话历史
     */
    clearHistory() {
        this.conversationHistory = [];
    }
}

// 快捷创建函数
export function createAgent(config: AgentConfig): Agent {
    return new Agent(config);
}