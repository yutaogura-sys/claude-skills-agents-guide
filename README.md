# Claude Code スキル & エージェント 機能ガイド

Claude Code の「スキル」と「エージェント（サブエージェント）」の機能・解説・おすすめの使い方をまとめたリファレンスサイトです。ビジネス用途（ツール開発・資料作成）を想定しています。

## 🌐 公開サイト

https://yutaogura-sys.github.io/claude-skills-agents-guide/

検索・カテゴリ絞り込み・ファイルパスのワンクリックコピーに対応した操作できるページです。

## 🏗 構成（データ駆動・APIキー不要）

コンテンツは **`data/guide.json` が唯一の情報源**。`index.html` 等はそこから自動生成します。

| パス | 内容 |
|---|---|
| `data/guide.json` | **唯一の情報源**（カード・レシピ・参考・変更履歴など全コンテンツ） |
| `build/build.mjs` | `guide.json` → `index.html` と Artifact 版を生成。日付の自動刻印・「今回の変更点」描画も担当 |
| `build/validate.mjs` | JSON妥当性・HTML健全性・カード件数一致・リンク死活を検証 |
| `build/watch-docs.mjs` | 公式docsの変化を検知（**AI不使用**・`GITHUB_TOKEN`のみ） |
| `index.html` / `claude-guide/skills-agents-guide.html` / `CHANGELOG.md` | 生成物（直接編集しない） |
| `data/sources.lock.json` | 監視のベースライン（生成物） |
| `.github/workflows/validate.yml` | PR時に再ビルド整合性・健全性を自動検証 |
| `.github/workflows/watch-docs.yml` | 週次で公式docs変化を検知 → Issueで通知 |
| `.claude/commands/update-guide.md` | ローカル更新コマンド（`/update-guide`） |

### ビルド

```bash
node build/build.mjs      # data/guide.json から生成
node build/validate.mjs   # 検証
```

## 🔄 更新の流れ（APIキー不要）

外部APIキーやクラウドでのAI実行は使いません。

1. **監視（自動）**: `watch-docs` が毎週月曜、公式ドキュメントの変化を検知。変わっていれば GitHub Issue（ラベル `docs-update`）で「更新してね」と通知します。`GITHUB_TOKEN` のみで動作し、**中身の自動書き換えはしません**。
2. **更新（手動・ローカル）**: 手元の Claude Code でこのプロジェクトを開き `/update-guide` を実行 → `data/guide.json` を更新 → `node build/build.mjs && node build/validate.mjs`。
3. **公開**: PR を作成（`validate.yml` が検証）してマージ、または `main` へ push → GitHub Pages に反映。

> 公開サイト右上の **「更新情報を確認」** ボタンは、`docs-update` ラベルの Issue 一覧（＝更新が必要かどうか）を開きます。

## ⚙️ 初期設定

**認証情報（APIキー等）の登録は不要です。** GitHub Actions が通知Issueを作成できるよう、*Settings → Actions → General → Workflow permissions* で書き込み権限を許可してください（このリポジトリは設定済み）。

---

参考: [Skills](https://code.claude.com/docs/en/skills) / [Subagents](https://claude.com/blog/subagents-in-claude-code) / [Best practices](https://code.claude.com/docs/en/best-practices)
