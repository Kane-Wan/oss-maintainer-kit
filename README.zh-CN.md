# OSS Maintainer Kit

[![CI](https://github.com/Kane-Wan/oss-maintainer-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/Kane-Wan/oss-maintainer-kit/actions/workflows/ci.yml)
[![CodeQL](https://github.com/Kane-Wan/oss-maintainer-kit/actions/workflows/codeql.yml/badge.svg)](https://github.com/Kane-Wan/oss-maintainer-kit/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[English](README.md)

OSS Maintainer Kit 是面向开源维护者的 CLI 和 GitHub Action，可用于：

- 审查 Pull Request 的元数据和代码差异；
- 对 Issue 进行分类并生成维护者回复草稿；
- 将变更列表整理成结构化发布说明。

项目使用 OpenAI Responses API，将仓库内容视为不可信数据，并且不会执行 Pull Request
中的代码。

> 当前状态：早期预览版（`v0.1.0`）。发布评论、修改标签或采纳生成内容之前，必须由维护者判断。

## 为什么做这个项目

小型开源团队经常需要花费大量时间阅读变更、追问复现信息和整理版本说明。本项目提供一个透明、
可自行部署的自动化起点，帮助处理重复工作，但不替代维护者的最终决定。

## 运行可验证的试点

先完成[十分钟演示](docs/DEMO.md)，再按照[只读试点指南](docs/PILOT_GUIDE.md)操作。
公开采用记录只有在维护者同意并提供可验证证据后才会加入 [ADOPTERS.md](ADOPTERS.md)，
试点统计遵循 [docs/METRICS.md](docs/METRICS.md) 中的定义。

目前没有经过验证的外部采用者。项目欢迎真实的正面、混合或负面试点结果，但不会以互点 Star、
虚假安装或刷下载量代替采用证据。

## CLI 快速开始

要求：

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

还可提供 `repository`、`title`、`body`、`labels` 和 `version` 等字段。使用
`--output review.md` 保存 Markdown，使用 `--model <模型名>` 更换模型，也可以通过
`OSS_MAINTAINER_MODEL` 设置默认模型。

## GitHub Action

早期只读试点可以使用：

```yaml
name: Maintainer assistant

on:
  pull_request:
    types: [opened, synchronize, reopened]
  issues:
    types: [opened]

permissions:
  contents: read
  pull-requests: read
  issues: read

jobs:
  assist:
    runs-on: ubuntu-latest
    steps:
      - uses: Kane-Wan/oss-maintainer-kit@v0.1.0
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          github-token: ${{ github.token }}
          language: zh-CN
          post-comment: "false"
```

完整示例位于 [`examples/maintainer.yml`](examples/maintainer.yml)。`post-comment` 默认关闭；
结果写入工作流摘要并通过 `result` 输出。建议先观察生成质量，再单独评审是否开放写权限。

### 来自 Fork 的 Pull Request

GitHub 不会向 Fork PR 触发的普通 `pull_request` 工作流提供仓库 Secrets。Action 默认拒绝
`pull_request_target`。只有在确认工作流不会检出或执行贡献者代码、权限保持最小并设置人工授权门槛后，
才可显式配置 `allow-pull-request-target: "true"`。即便如此，仍存在 API 额度被滥用的风险。

## Action 输入

| 输入                        | 必需     | 默认值         | 说明                                           |
| --------------------------- | -------- | -------------- | ---------------------------------------------- |
| `openai-api-key`            | 是       | —              | 存放在 Actions Secrets 中的 OpenAI Key         |
| `github-token`              | PR/评论  | —              | 读取 PR 文件，并在显式开启时发布评论           |
| `mode`                      | 否       | `auto`         | `pr-review`、`issue-triage` 或 `release-notes` |
| `model`                     | 否       | `gpt-5.6-luna` | OpenAI 模型                                    |
| `language`                  | 否       | `auto`         | `auto`、`en` 或 `zh-CN`                        |
| `post-comment`              | 否       | `false`        | 是否发布生成的 Markdown 评论                   |
| `allow-pull-request-target` | 否       | `false`        | 风险评审后显式允许该事件                       |
| `content`                   | 发布模式 | —              | 发布说明使用的变更列表                         |
| `title`                     | 否       | 自动推断       | 发布标题                                       |
| `version`                   | 否       | `Unreleased`   | 发布版本                                       |

## 安全与隐私

- 仓库文本会被标记为不可信内容，且不会执行。
- Action 会在工作流日志中屏蔽传入的令牌。
- API 请求设置 `store: false`。
- 单文件差异限制为 8,000 字符，总差异限制为 50,000 字符，最终内容限制为 60,000 字符。
- AI 输出可能出错；审查、标签、评论和发布仍由维护者负责。
- 仓库内容会发送给配置的 API 服务；只有在项目及组织政策允许时才能使用。

漏洞请按照 [SECURITY.md](SECURITY.md) 私密报告。信任边界、当前控制措施和剩余风险记录在
[THREAT_MODEL.md](THREAT_MODEL.md)。

## 开发与发布

```bash
pnpm install
pnpm check
pnpm release:check
```

`pnpm check` 检查格式、TypeScript 类型、测试和构建产物。发布 GitHub Action 时必须提交编译后的
`dist/action.cjs`，因为 GitHub Runner 不会自动安装 JavaScript Action 的依赖。完整发布流程见
[RELEASING.md](RELEASING.md)。

## 项目治理

- [路线图](ROADMAP.md)
- [采用记录](ADOPTERS.md)
- [试点指南](docs/PILOT_GUIDE.md)
- [指标定义](docs/METRICS.md)
- [威胁模型](THREAT_MODEL.md)
- [发布流程](RELEASING.md)
- [贡献指南](CONTRIBUTING.md)
- [行为准则](CODE_OF_CONDUCT.md)
- [安全政策](SECURITY.md)
- [更新记录](CHANGELOG.md)

## 许可证

MIT © 2026 Kane-Wan
