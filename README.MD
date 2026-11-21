🚀 第一步：创建项目并初始化

# 1. 创建项目文件夹并进入
mkdir dw-deep-agent-demo
cd dw-deep-agent-demo

# 2. 初始化 package.json
npm init -y


# 3. 安装核心依赖
我们要用 TypeScript 和 Node 环境，并且用官方的 openai SDK 去调用 DeepSeek。
npm install openai dotenv fs-extra
npm install -D typescript @types/node @types/fs-extra tsup

# 4. 建立骨架目录

# (1). 先创建 src 和 dw 和 output 这三个主目录
mkdir src, dw, output

# (2). 进入 dw 目录
cd dw

# (3). 在 dw 里面创建 skills 目录
mkdir skills

此时请敲一下 cd .. 退回到根目录（也就是 dw-deep-agent-demo）
如果你觉得来回切换目录麻烦，也可以直接用这行代码（推荐直接复制）：
New-Item -ItemType Directory -Force -Path src, dw/skills, output

---------------------------------------------------------------------------------------

第二步：配置文件与环境变量准备。

这一步非常关键，它不仅决定了你的项目能不能顺利编译运行，还关系到你的 API Key 安不安全（千万别把 Key 传到 GitHub 上）
# 1. 配置 package.json
# 2. 配置 tsconfig.json(TypeScript 的语法规则)
# 3. 配置 tsup.config.ts(打包工具)
# 4. 创建环境变量与 .gitignore（重点！）
① 创建 .gitignore（根目录新建）[文件告诉 Git 千万不要把你的密钥传上去]
② 创建 .env[这是你本地存放密钥的地方。你需要先去 DeepSeek 官网（platform.deepseek.com）注册申请一个 API Key。]
③ 创建 .env.example[给别人看的模板，里面不写真实 Key]
④ 创建 output/.gitkeep [防止上传后目录结构丢失]

---------------------------------------------------------------------------------------

第三步：构建项目的“基建模块”

🛡️ 第1步：实现沙箱模块 (sandbox.ts)
沙箱的作用是：限制 AI 只能往 output 文件夹里写代码，绝对不能让它碰到你电脑上的其他文件。
🧪 测试沙箱[需要验证一下它是不是真的能拦住 AI 越界操作]


