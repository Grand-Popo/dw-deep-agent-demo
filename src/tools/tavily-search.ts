export interface SearchResult {
    title: string;
    url: string;
    content: string;
}

export class TavilySearch {
    private apiKey: string;
    private baseUrl = "https://api.tavily.com/search";

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * 执行搜索
     * @param query 搜索关键词
     * @param maxResults 最大返回条数 (默认 5)
     */
    async search(query: string, maxResults: number = 5): Promise<string> {
        if (!this.apiKey) {
            return "【错误】未配置 TAVILY_API_KEY，无法进行联网搜索。";
        }

        try {
            console.log(`\n[🔍 正在联网搜索]: "${query}" ...`);

            const response = await fetch(this.baseUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    api_key: this.apiKey,
                    query: query,
                    max_results: maxResults,
                    search_depth: "basic", // basic 速度更快，advanced 更深入
                }),
            });

            if (!response.ok) {
                throw new Error(`Tavily API 请求失败: ${response.status}`);
            }

            const data = await response.json();

            // 将结果格式化，提取前 800 个字符，防止 Token 消耗过大
            const results = data.results.map((item: any, index: number) => {
                return `[${index + 1}] ${item.title}\n内容摘要: ${item.content.slice(0, 800)}...\n来源: ${item.url}`;
            }).join("\n\n");

            console.log(`[✅ 搜索完成，找到 ${data.results.length} 条结果]\n`);
            return results;

        } catch (error: any) {
            console.error(`[❌ 搜索失败]:`, error.message);
            return `搜索时发生错误：${error.message}`;
        }
    }
}