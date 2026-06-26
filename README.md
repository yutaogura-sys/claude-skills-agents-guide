# Claude Code スキル & エージェント 機能ガイド

Claude Code の「スキル」と「エージェント（サブエージェント）」の機能・解説・おすすめの使い方をまとめたリファレンスサイトです。ビジネス用途（ツール開発・資料作成）を想定しています。

## 🌐 公開サイト

https://yutaogura-sys.github.io/claude-skills-agents-guide/

検索・カテゴリ絞り込み・ファイルパスのワンクリックコピーに対応した操作できるページです。

## 🏗 構成（データ駆動）

コンテンツは **`data/guide.json` が唯一の情報源**。`index.html` 等はそこから自動生成します。

| パス | 内容 |
|---|---|
| `data/guide.json` | **唯一の情報源**（カード・レシピ・参考・変更履歴など全コンテンツ） |
| `build/build.mjs` | `guide.json` → `index.html` と Artifact 版を生成。日付の自動刻印・「今回の変更点」描画も担当 |
| `build/validate.mjs` | JSON妥当性・HTML健全性・カード件数一致・リンク死活を検証 |
| `index.html` | 公開用ページ（生成物。直接編集しない） |
| `claude-guide/skills-agents-guide.html` | Claude Artifact 版（生成物） |
| `CHANGELOG.md` | 変更履歴（生成物） |
| `.github/workflows/update-guide.yml` | クロール→`guide.json`更新→再ビルド→**PR作成**（手動 + 週次 cron） |
| `.github/workflows/validate.yml` | PR時に再ビルド整合性・健全性を自動検証 |
| `.claude/commands/update-guide.md` | ローカル手動更新コマンド（`/update-guide`） |

### ビルド

```bash
node build/build.mjs      # data/guide.json から生成
node build/validate.mjs   # 検証
```

## 🔄 更新の流れ

コンテンツを変えるときは **`data/guide.json` を編集 → ビルド → PR** です。HTML は直接編集しません。

### A. Webサイトのボタンから（GitHub Actions）

公開サイト右上の **「最新情報に更新」** → GitHub Actions の実行画面 → **Run workflow**。
クラウド上で Claude が公式ドキュメントをクロールして `guide.json` を更新・再ビルドし、**Pull Request を作成**します。レビューしてマージすると Pages に反映されます（毎週月曜にも自動実行）。

### B. ローカルから

Claude Code でこのプロジェクトを開き `/update-guide` を実行。

## ⚙️ 一度だけの初期設定

1. **APIキー**: リポジトリの *Settings → Secrets and variables → Actions* に `ANTHROPIC_API_KEY` を登録
   （または `gh secret set ANTHROPIC_API_KEY --repo yutaogura-sys/claude-skills-agents-guide`）
2. **PR作成の許可**: *Settings → Actions → General → Workflow permissions* で
   「Allow GitHub Actions to create and approve pull requests」を有効化

---

参考: [Skills](https://code.claude.com/docs/en/skills) / [Subagents](https://claude.com/blog/subagents-in-claude-code) / [Best practices](https://code.claude.com/docs/en/best-practices)
