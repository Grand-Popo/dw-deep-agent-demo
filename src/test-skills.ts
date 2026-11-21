import path from 'path';
import { loadSkills, buildSkillsPrompt } from './skill-loader.js';

const skillsDir = path.resolve(process.cwd(), 'dw/skills');

console.log("--- 测试加载 Skill ---");
const skills = loadSkills(skillsDir);

console.log("\n--- 查看解析出的技能列表 ---");
skills.forEach((s) => {
    console.log(`- ${s.name}: ${s.description}`);
});

console.log("\n--- 查看最终生成的 System Prompt 片段 ---");
const prompt = buildSkillsPrompt(skills);
console.log(prompt.slice(0, 300) + "\n...\n(省略剩余部分)");