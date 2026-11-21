import fs from "fs-extra";
import path from "path";

export interface Skill {
    name: string;
    description: string;
    content: string;
    filepath: string;
}

/**
 * 解析 Markdown 里的 Frontmatter（头部元数据）和正文
 */
function parseSkillFile(fileContent: string, filepath: string): Skill | null {
    // 兼容 Windows 换行符 (\r\n) 和 Mac/Linux 换行符 (\n)
    const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);

    if (!match) {
        console.warn(`[SkillLoader] ⚠️ 正则匹配失败，可能缺少 --- 头部声明: ${filepath}`);
        return null;
    }

    const frontmatter = match[1];
    const content = match[2].trim();
    let name = "";
    let description = "";

    // 解析 name 和 description
    frontmatter.split("\n").forEach((line) => {
        // 去除行尾的 \r，防止 Windows 换行符干扰
        const cleanLine = line.replace("\r", "").trim();
        if (cleanLine.startsWith("name:")) name = cleanLine.replace("name:", "").trim();
        if (cleanLine.startsWith("description:")) description = cleanLine.replace("description:", "").trim();
    });

    if (!name || !description) {
        console.warn(`[SkillLoader] ⚠️ 缺少 name 或 description 字段: ${filepath}`);
        return null;
    }

    return { name, description, content, filepath };
}

/**
 * 加载指定目录下的所有 Skill
 */
export function loadSkills(skillsDir: string): Skill[] {
    if (!fs.existsSync(skillsDir)) {
        console.warn(`[SkillLoader] ⚠️ 技能目录不存在: ${skillsDir}`);
        return [];
    }

    const files = fs.readdirSync(skillsDir);
    const skills: Skill[] = [];

    for (const file of files) {
        // 严格匹配以 .md 结尾的文件
        if (file.endsWith(".md")) {
            const filepath = path.join(skillsDir, file);
            const fileContent = fs.readFileSync(filepath, "utf-8");

            const skill = parseSkillFile(fileContent, filepath);
            if (skill) {
                skills.push(skill);
                console.log(`[SkillLoader] ✅ 已加载: ${skill.name}`);
            } else {
                console.warn(`[SkillLoader] ❌ 解析失败，跳过文件: ${file}`);
            }
        }
    }

    console.log(`[SkillLoader] 🎉 成功加载 ${skills.length} 个技能。`);
    return skills;
}

/**
 * 将技能格式化为 System Prompt 的一部分
 * 这就是传给大模型的指令，告诉它有哪些技能可用
 */
export function buildSkillsPrompt(skills: Skill[]): string {
    if (skills.length === 0) return "";

    let prompt = "你拥有以下专业技能，请在合适的时候调用：\n\n";
    skills.forEach((skill) => {
        prompt += `### 技能名称：${skill.name}\n`;
        prompt += `触发条件：${skill.description}\n`;
        prompt += `执行指南：\n${skill.content}\n\n`;
    });
    return prompt;
}