import { HITL } from './hitl.js';

async function test() {
    // 开启 HITL，且不自动放行
    const hitl = new HITL({ enabled: true, autoApprove: false });

    console.log("--- 测试正常操作（应当直接跳过） ---");
    await hitl.checkPoint("我想写一段防抖代码");

    console.log("\n--- 测试危险操作（应当卡住询问你） ---");
    // 注意：这个操作包含了危险词 "rm -rf"
    const result = await hitl.checkPoint("我要执行 rm -rf / 删除系统文件");

    console.log(`\n最终执行结果: ${result ? '已执行' : '被取消了'}`);
}

test();