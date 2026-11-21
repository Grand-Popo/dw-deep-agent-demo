import readline from "readline";

// 我们预定义一些危险的关键词，只要用户输入里有这些，就会触发拦截
const HIGH_RISK_KEYWORDS = [
    "rm -rf", "rm -r", "rmdir", "del /f", "del /q", "format",
    "drop table", "delete from", "truncate table",
    "shutdown", "reboot", "> /dev/sda"
];

export interface HITLConfig {
    enabled: boolean;          // 是否开启此功能
    autoApprove: boolean;      // 是否自动放行（如果为 true，就不再弹窗问你了）
    extraKeywords?: string[];  // 允许你自定义额外的危险关键词
}

export class HITL {
    private config: HITLConfig;

    constructor(config: HITLConfig) {
        this.config = config;
    }

    /**
     * 检查文本是否包含高危关键词
     */
    hasHighRiskKeyword(text: string): boolean {
        const lowerText = text.toLowerCase();
        const allKeywords = [...HIGH_RISK_KEYWORDS, ...(this.config.extraKeywords || [])];
        return allKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
    }

    /**
     * 核心检查点：拦截或放行
     */
    async checkPoint(operation: string): Promise<boolean> {
        // 如果没开启 HITL，直接放行
        if (!this.config.enabled) return true;

        // 如果没检测到危险词，直接放行
        if (!this.hasHighRiskKeyword(operation)) return true;

        // 如果配置了自动放行
        if (this.config.autoApprove) {
            console.warn(`\n⚠️ [HITL] 检测到高危操作 (已自动放行): ${operation}`);
            return true;
        }

        // 否则，死等用户输入
        console.warn(`\n🚨 [HITL] 检测到高危操作，等待人工确认:`);
        console.warn(`操作描述: ${operation}`);

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        // 包装成 Promise，等待用户敲击回车
        const answer = await new Promise<string>((resolve) => {
            rl.question(`是否允许执行该操作？(y/N) `, resolve);
        });
        rl.close(); // 必须关闭，否则终端会卡住

        const isApproved = answer.toLowerCase() === "y";
        if (isApproved) {
            console.log(`✅ [HITL] 用户已放行。\n`);
        } else {
            console.log(`❌ [HITL] 操作被用户拒绝。\n`);
        }
        return isApproved;
    }
}