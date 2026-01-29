# Solana ETF TCG Forge

基于 AI 的交易卡牌（TCG）生成器，使用 React 19 + Vite + TypeScript 构建。输入文本提示词后，Google Gemini 生成卡牌元数据与插画，然后通过真实的 Solana devnet 交易铸造卡牌，并生成可分享的 Blink 链接。

## 技术栈

- **前端：** React 19、TypeScript、Tailwind CSS v3
- **AI：** Google Gemini API（`@google/genai`）— 文本元数据 + 图片生成
- **区块链：** Solana devnet（`@solana/web3.js` + Wallet Adapter / Phantom）
- **构建：** Vite 6、PostCSS、Autoprefixer
- **测试/规范：** Vitest、Testing Library、ESLint + typescript-eslint

## 本地启动

**前置要求：** Node.js >= 20

1. 安装依赖：

   ```bash
   npm install
   ```

2. 创建 `.env.local` 并填写以下配置：

   ```bash
   GEMINI_API_KEY=your_key_here
   PINATA_JWT=pinata_jwt_here
   PINATA_GATEWAY=your_subdomain.mypinata.cloud
   TREASURY_SECRET_KEY=[1,2,3,...]
   VITE_TREASURY_PUBKEY=your_treasury_pubkey
   VITE_HELIUS_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY
   HELIUS_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY
   ```

3. 启动开发服务器：

   ```bash
   npm run dev
   ```

   默认地址：`http://localhost:3011`

## 环境变量说明（必填）

- `GEMINI_API_KEY`
  - Google Gemini API Key，用于生成卡牌元数据与插画。
- `PINATA_JWT`
  - Pinata 的 JWT，用于上传图片与 metadata 到 IPFS。
- `PINATA_GATEWAY`
  - 你的 Pinata Gateway 域名（例如 `your_subdomain.mypinata.cloud`），用于访问 IPFS 资源。
- `TREASURY_SECRET_KEY`
  - 托管账户的私钥数组（JSON array），示例：`[1,2,3,...]`。
  - **必须是 JSON 数组字符串**，不要包含多余的引号或换行。
- `VITE_TREASURY_PUBKEY`
  - 对应托管账户的公钥（base58）。
  - 前端使用，用于显示与构建 mint/交易信息。
- `VITE_HELIUS_RPC_URL`
  - 前端 RPC 地址（devnet），用于获取 blockhash、发送交易、查询状态。
  - 示例：`https://devnet.helius-rpc.com/?api-key=YOUR_KEY`
- `HELIUS_RPC_URL`
  - 服务端 RPC 地址（devnet），用于 Action 相关交易构建与查询。
  - 与前端保持同一集群，避免网络不一致问题。

## 获取密钥与官方链接

- **Gemini API Key**（Google AI Studio）
  - 入口：`https://ai.google.dev/aistudio`
  - 获取 API Key 指引：`https://ai.google.dev/palm_docs/setup`
- **Pinata API / JWT & Gateway**
  - 文档总览：`https://docs.pinata.cloud/quickstart`
  - API 介绍：`https://docs.pinata.cloud/api-reference/introduction`
- **Helius API Key**
  - 鉴权与创建 Key 指引：`https://www.helius.dev/docs/api-reference/authentication`
- **Solana Devnet Faucet（领测试 SOL）**
  - Faucet：`https://faucet.solana.com/`
  - 官方说明：`https://solana.com/developers/cookbook/development/test-sol`
- **ngrok（用于暴露本地端口测试 Blink）**
  - 下载与安装：`https://ngrok.com/download`
  - 快速上手：`https://ngrok.com/docs/getting-started/`

## Devnet 钱包充值步骤

1. 打开 Faucet：`https://faucet.solana.com/`
2. 粘贴你的钱包地址（Devnet），请求测试 SOL。
3. 如果提示额度不足，使用 GitHub 登录提升额度。

## ngrok 使用（用于 Blink 购买链路）

dial.to 无法访问 `localhost`，测试 Blink 购买必须用公网 URL。

```bash
ngrok http 3011
```

运行后会得到一个公网地址（如 `https://xxxx.ngrok-free.app`），将 Blink 链接里的 `http://localhost:3011` 替换为该地址即可。

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run preview` | 本地预览生产构建 |
| `npm run test` | 运行测试（watch 模式） |
| `npm run test:run` | 运行一次测试 |
| `npm run lint` | ESLint 检查 |

## 目录结构

```
├── index.html                 # 入口 HTML
├── index.tsx                  # React 入口 + Buffer polyfill + Wallet provider
├── index.css                  # Tailwind + 自定义样式
├── App.tsx                    # 主流程：生成 + 铸造
├── constants.ts               # Gemini system prompt
├── types.ts                   # TypeScript 类型
├── components/
│   ├── CardDisplay.tsx        # 卡牌展示
│   ├── SolanaWallet.tsx       # Phantom 钱包连接
│   └── BlinkPreview.tsx       # Blink 预览
├── providers/
│   └── WalletProvider.tsx     # Wallet adapter 上下文
├── services/
│   ├── geminiService.ts       # Gemini API 调用
│   └── solanaService.ts       # devnet 交易逻辑
├── tailwind.config.ts
├── postcss.config.js
├── vite.config.ts
└── eslint.config.js
```

## 使用流程

1. 连接 Phantom 钱包（Devnet）。
2. 输入卡牌主题/概念。
3. Gemini 生成卡牌元数据与插画。
4. 点击 “Mint Card Token”，钱包签名并发送 devnet 交易。
5. 生成 Blink 链接分享。

## 常见报错排查

- **401 / invalid api key**
  - Helius API Key 无效或被禁用。请在 Helius Dashboard 重新生成并更新 `.env.local`。
- **block height exceeded / blockhash expired**
  - 交易签名时间过长或 blockhash 过期。请重新发起交易。
- **Unexpected error（钱包签名阶段）**
  - 常见原因是 RPC/网络不一致或钱包未处于 Devnet。
  - 确认钱包网络为 Devnet，并重启 `npm run dev` 让前端读取新 env。
- **Transaction simulation failed: Cannot create NFT with no Freeze Authority**
  - Freeze authority 为空导致创建 Master Edition 失败。请确保初始化 mint 时带 freeze authority。
- **Transaction simulation failed: owner does not match**
  - SetAuthority 的 owner 不匹配，建议将撤销 mint authority 放到单独交易里执行。
- **Blink 购买 timeout**
  - dial.to 无法访问 localhost，必须用 ngrok 暴露公网地址。

## 备注

- **一定要用 devnet**（钱包与 RPC 保持一致）。
- 不要把 API Key 明文贴到聊天或提交到 Git。
