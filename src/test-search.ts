import 'dotenv/config';
import { TavilySearch } from './tools/tavily-search.js';

async function main() {
    const searchTool = new TavilySearch(process.env.TAVILY_API_KEY || "");

    const query = "2024年 AI Agent 发展趋势";
    const result = await searchTool.search(query);

    console.log("--- 搜索结果预览 ---");
    console.log(result.slice(0, 500) + "\n...\n(省略剩余内容)");
}

main().catch(console.error);