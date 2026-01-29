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

## 备注

- **一定要用 devnet**（钱包与 RPC 保持一致）。
- dial.to 无法访问 `localhost`，如果要测试 Blink 购买链路，请用 `ngrok` 暴露本地端口：
  ```bash
  ngrok http 3011
  ```
  然后用 ngrok 的公网地址生成 Blink 链接。
