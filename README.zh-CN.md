# Repo Steward AI

[![CI](https://github.com/Kane-Wan/oss-maintainer-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/Kane-Wan/oss-maintainer-kit/actions/workflows/ci.yml)
[![CodeQL](https://github.com/Kane-Wan/oss-maintainer-kit/actions/workflows/codeql.yml/badge.svg)](https://github.com/Kane-Wan/oss-maintainer-kit/actions/workflows/codeql.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/Kane-Wan/oss-maintainer-kit/badge)](https://scorecard.dev/viewer/?uri=github.com/Kane-Wan/oss-maintainer-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[English](README.md)

Repo Steward AI 是面向开源维护者的 CLI 和 GitHub Action，可用于：

- 审查 Pull Request 元数据和代码差异；
- 对 Issue 进行分类并生成维护者回复草稿；
- 将变更列表整理成结构化发布说明；
- 在本地汇总可核验的试点记录。

项目使用 OpenAI Responses API，将仓库内容视为不可信数据，并且不会执行 Pull Request
中的代码。

> 当前状态：早期预览版（`v0.3.0`）。发布评论、修改标签或采纳生成内容之前，必须由维护者判断。

为保持已经提交的申请和历史链接可用，GitHub 仓库地址没有修改；新的发行包名是
`repo-steward-ai`。本项目与更早存在的 npm 包 `oss-maintainer-kit` 无关联，也不会把该包的
下载量计入本项目。详见[项目身份与差异说明](docs/DIFFERENTIATION.md)。

## 为什么做这个项目

小型开源团队经常需要花费大量时间阅读变更、追问复现信息和整理版本说明。本项目提供一个
透明、可自行部署的自动化起点，帮助处理重复工作，但不替代维护者的最终决定。

## 运行可验证的试点

先完成[十分钟演示](docs/DEMO.md)，再按照[只读试点指南](docs/PILOT_GUIDE.md)操作。公开采用
记录只有在维护者同意并提供可验证证据后才会加入 [ADOPTERS.md](ADOPTERS.md)。统计口径见
[指标定义](docs/METRICS.md)。

目前没有经过验证的外部采用者。项目欢迎真实的正面、混合或负面结果，但不会以互点 Star、
虚假安装或其他项目的下载量代替采用证据。

可以在不调用 API 的情况下汇总结构化试点记录：

```bash
node dist/cli.js pilot-summary --input examples/pilot-runs.example.json
```

示例数据明确标记为 `demonstration`，输出也会注明“不能作为采用证据”。真实数据格式见
[试点数据流程](docs/PILOT_DATA.md)。

## 运行零成本演示

离线演示会构建项目、检查三个经过整理的任务输出、确认一个故意设计的错误样本能够被
拒绝，并汇总合成试点记录。它不需要 API Key，也不能作为实时模型性能证据：

```bash
pnpm demo
```

只运行确定性输出检查：

```bash
node dist/cli.js eval-summary --input examples/evaluation.example.json
```

详细边界见[质量评测流程](docs/QUALITY_EVALUATION.md)和已提交的
[演示报告](docs/EVALUATION_REPORT.md)。

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

三个分析命令都支持 JSON 文件或标准输入（`--input -`）：

| 任务            | 常用内容字段           |
| --------------- | ---------------------- |
| `pr-review`     | `diff` 或 `content`    |
| `issue-triage`  | `body` 或 `content`    |
| `release-notes` | `changes` 或 `content` |

还可以提供 `repository`、`title`、`body`、`labels` 和 `version`。使用 `--output review.md`
保存 Markdown，使用 `--model <模型名>` 更换模型。默认模型为 `gpt-5.6-luna`。推荐通过
`REPO_STEWARD_MODEL` 设置默认模型；`OSS_MAINTAINER_MODEL` 仅作为旧版兼容变量保留。

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
      - uses: Kane-Wan/oss-maintainer-kit@v0.3.0
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          github-token: ${{ github.token }}
          language: zh-CN
          post-comment: "false"
```

完整示例位于 [`examples/maintainer.yml`](examples/maintainer.yml)。`post-comment` 默认关闭，
结果写入工作流摘要并通过 `result` 输出。建议先观察生成质量，再单独评审是否开放写权限。

### 来自 Fork 的 Pull Request

GitHub 不会向 Fork PR 触发的普通 `pull_request` 工作流提供仓库 Secrets。Action 默认拒绝
`pull_request_target`。只有在确认工作流不会检出或执行贡献者代码、权限保持最小并设置人工授权
门槛后，才可显式配置 `allow-pull-request-target: "true"`。即便如此，仍存在 API 额度被滥用的风险。

## Action 输入

| 输入                        | 必需     | 默认值         | 说明                                           |
| --------------------------- | -------- | -------------- | ---------------------------------------------- |
| `openai-api-key`            | 是       | —              | 存放在 Actions Secrets 中的 OpenAI Key         |
| `github-token`              | PR/评论  | —              | 读取 PR 文件并在显式开启时发布评论             |
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

漏洞请按照 [SECURITY.md](SECURITY.md) 私密报告。信任边界、控制措施和剩余风险记录在
[THREAT_MODEL.md](THREAT_MODEL.md)。

## 开发与发布

```bash
pnpm install
pnpm check
pnpm release:check
```

`pnpm check` 检查格式、TypeScript 类型、测试和构建产物。完整发布流程见
[RELEASING.md](RELEASING.md)。

## 项目治理

- [路线图](ROADMAP.md)
- [采用记录](ADOPTERS.md)
- [试点指南](docs/PILOT_GUIDE.md)
- [试点数据流程](docs/PILOT_DATA.md)
- [指标定义](docs/METRICS.md)
- [项目身份与差异说明](docs/DIFFERENTIATION.md)
- [威胁模型](THREAT_MODEL.md)
- [发布流程](RELEASING.md)
- [贡献指南](CONTRIBUTING.md)
- [行为准则](CODE_OF_CONDUCT.md)
- [安全政策](SECURITY.md)
- [更新记录](CHANGELOG.md)

## 许可证

MIT © 2026 Kane-Wan
