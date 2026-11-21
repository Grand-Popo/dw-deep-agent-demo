import fs from "fs-extra";
import path from "path";

export interface SandboxConfig {
    workspaceDir: string; // 工作区根目录
    outputDir: string;    // 允许 AI 写入的目录
    verbose?: boolean;    // 是否打印详细日志
}

export class Sandbox {
    private workspaceDir: string;
    private outputDir: string;
    private verbose: boolean;

    constructor(config: SandboxConfig) {
        this.workspaceDir = path.resolve(config.workspaceDir);
        this.outputDir = path.resolve(config.outputDir);
        this.verbose = config.verbose || false;

        // 初始化时确保 output 目录存在
        fs.ensureDirSync(this.outputDir);
    }

    /**
     * 核心安全校验：判断路径是否越界
     * 如果解析出来的绝对路径不是以 outputDir 开头，说明越界了
     */
    private isSafePath(targetPath: string): boolean {
        // 注意这里：基准路径必须是 outputDir
        const resolvedPath = path.resolve(this.outputDir, targetPath);
        return resolvedPath.startsWith(this.outputDir);
    }
    /**
     * 写入文件
     */
    writeFile(filename: string, content: string): string {
        if (!this.isSafePath(filename)) {
            throw new Error(`[Sandbox] 🚨 安全拦截：试图越界写入 ${filename}`);
        }

        // 解析出真实要写入的路径
        // const targetPath = path.resolve(this.workspaceDir, filename);
        const targetPath = path.resolve(this.outputDir, filename);

        // 自动创建子目录（比如 AI 要写 output/test/a.md，会自动建 test 文件夹）
        fs.ensureDirSync(path.dirname(targetPath));
        fs.writeFileSync(targetPath, content, "utf-8");

        if (this.verbose) {
            console.log(`\n[Sandbox] ✅ 文件已保存: ${path.relative(this.outputDir, targetPath)}`);
        }
        return targetPath;
    }

    /**
     * 读取文件内容
     */
    readFile(filename: string): string | null {
        if (!this.isSafePath(filename)) {
            throw new Error(`[Sandbox] 🚨 安全拦截：试图越界读取 ${filename}`);
        }

        const targetPath = path.resolve(this.workspaceDir, filename);
        if (!fs.existsSync(targetPath)) return null;
        return fs.readFileSync(targetPath, "utf-8");
    }

    /**
     * 列出 output 目录下的所有文件
     */
    listFiles(): string[] {
        if (!fs.existsSync(this.outputDir)) return [];

        const walk = (dir: string): string[] => {
            let results: string[] = [];
            const list = fs.readdirSync(dir);
            list.forEach((file) => {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                if (stat && stat.isDirectory()) {
                    results = results.concat(walk(filePath));
                } else {
                    results.push(path.relative(this.workspaceDir, filePath));
                }
            });
            return results;
        };

        return walk(this.outputDir);
    }

    getOutputDir(): string {
        return this.outputDir;
    }
}