# OSS Maintainer Kit

[English](README.md)

OSS Maintainer Kit 是面向开源维护者的 CLI 和 GitHub Action，可用于：

- 审查 Pull Request 的元数据和代码差异；
- 对 Issue 进行分类并生成维护者回复草稿；
- 将变更列表整理成结构化发布说明。

项目使用 OpenAI Responses API，把仓库内容视为不可信数据，并且不会执行 Pull Request 中的代码。

> 当前状态：早期预览版（`v0.1.0`）。发布评论、修改标签或执行建议之前必须由维护者判断。

## 为什么做这个项目

小型开源团队往往需要花大量时间阅读变更、追问复现信息、整理版本说明。这个项目提供透明、可自行部署的自动化起点，帮助处理重复工作，但不替代维护者的最终决定。

## CLI 快速开始

环境要求：

- Node.js 20 或更高版本；
- 通过 `OPENAI_API_KEY` 环境变量提供 OpenAI API Key。

```powershell
pnpm install
pnpm build

$env:OPENAI_API_KEY = "your_key"
node dist/cli.js pr-review --input examples/pr-review.json --language zh-CN
node dist/cli.js issue-triage --input examples/issue-triage.json --language zh-CN
node dist/cli.js release-notes --input examples/release-notes.json --language zh-CN
```

不要把 `.env` 文件或 API Key 提交到仓库。

## JSON 输入

每个命令都支持 JSON 文件或标准输入（`--input -`）：

| 任务            | 常用内容字段           |
| --------------- | ---------------------- |
| `pr-review`     | `diff` 或 `content`    |
| `issue-triage`  | `body` 或 `content`    |
| `release-notes` | `changes` 或 `content` |

还可提供 `repository`、`title`、`body`、`labels` 和 `version` 等字段。

使用 `--output review.md` 保存 Markdown，使用 `--model <模型名>` 更换模型。默认模型是适合控制自动化成本的 `gpt-5.6-luna`，也可通过 `OSS_MAINTAINER_MODEL` 设置。

## GitHub Action

仓库发布 `v1` 后，使用方可以加入：

```yaml
name: Maintainer assistant

on:
  pull_request:
    types: [opened, synchronize, reopened]
  issues:
    types: [opened]

permissions:
  contents: read
  pull-requests: write
  issues: write

jobs:
  assist:
    runs-on: ubuntu-latest
    steps:
      - uses: Kane-Wan/oss-maintainer-kit@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          github-token: ${{ github.token }}
          language: zh-CN
          post-comment: "false"
```

完整示例位于 [`examples/maintainer.yml`](examples/maintainer.yml)。

`post-comment` 默认关闭。结果会写入工作流摘要，并通过 `result` 输出。建议先观察生成效果，再开启自动评论。

### 来自 Fork 的 Pull Request

GitHub 不会向 Fork PR 触发的工作流提供仓库 Secrets。不要为了取得密钥而在 `pull_request_target` 工作流中检出或执行外部贡献者代码。如果确实使用 `pull_request_target`，必须保持最小权限、禁止运行 PR 代码，并增加授权或人工批准机制，避免滥用 API 额度。

## 安全与隐私

- 仓库文本会被标记为不可信内容，且不会执行。
- Action 会在工作流日志中屏蔽传入的令牌。
- API 请求设置了 `store: false`。
- 单文件差异限制为 8,000 字符，总差异限制为 50,000 字符，最终内容限制为 60,000 字符。
- AI 输出可能出错，审查、标签、评论和发布仍由维护者负责。
- 仓库内容会发送到配置的 API 服务。只有在项目及组织政策允许时才能使用。

安全问题请按照 [SECURITY.md](SECURITY.md) 报告。

## 开发

```bash
pnpm install
pnpm check
```

`pnpm check` 会检查格式、TypeScript 类型、测试和构建产物。发布 GitHub Action 时必须提交编译后的 `dist/action.cjs`，因为 GitHub Runner 不会自动安装 JavaScript Action 的依赖。

## 项目治理

- [路线图](ROADMAP.md)
- [贡献指南](CONTRIBUTING.md)
- [行为准则](CODE_OF_CONDUCT.md)
- [安全政策](SECURITY.md)
- [更新记录](CHANGELOG.md)

## 许可证

MIT © 2026 Kane-Wan
