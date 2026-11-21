import path from 'path';
import { Sandbox } from './sandbox.js';

const sandbox = new Sandbox({
    workspaceDir: process.cwd(),
    outputDir: path.resolve(process.cwd(), 'output'),
    verbose: true
});

// 1. 测试正常写入（应该成功）
console.log("--- 测试正常写入 ---");
sandbox.writeFile("test/hello.md", "你好，这是沙箱测试文件。");

// 2. 测试越界写入（应该报错拦截）
console.log("\n--- 测试越界写入 ---");
try {
    sandbox.writeFile("../../etc/passwd", "恶意代码"); // 试图越界修改系统文件
} catch (error: any) {
    console.log("成功拦截越界操作:", error.message);
}

// 3. 测试读取
console.log("\n--- 测试读取列表 ---");
console.log("output 目录下的文件:", sandbox.listFiles());