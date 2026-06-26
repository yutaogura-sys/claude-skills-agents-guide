# Claude Code スキル & エージェント 機能ガイド

Claude Code の「スキル」と「エージェント（サブエージェント）」の機能・解説・おすすめの使い方をまとめたリファレンスサイトです。ビジネス用途（ツール開発・資料作成）を想定しています。

## 🌐 公開サイト

https://yutaogura-sys.github.io/claude-skills-agents-guide/

検索・カテゴリ絞り込み・ファイルパスのワンクリックコピーに対応した操作できるページです。

## 📁 構成

| パス | 内容 |
|---|---|
| `index.html` | GitHub Pages 公開用ページ |
| `claude-guide/skills-agents-guide.html` | Claude アーティファクト形式のソース |
| `.claude/commands/update-guide.md` | 最新情報をクロールしてページを更新する手動トリガー |

## 🔄 更新方法

Claude Code でこのプロジェクトを開き、次を実行すると最新情報を Web からクロールしてページを再生成します。

```
/update-guide
```

更新後は `index.html` を再生成し、コミット & push すれば GitHub Pages にも反映されます。

### 🖱 Webサイトのボタンから更新（GitHub Actions）

公開サイト右上の **「最新情報に更新」** ボタン → GitHub Actions の実行画面 → **Run workflow** を押すと、クラウド上で更新が実行され、自動コミット → Pages に反映されます。

事前準備（1回だけ）:
- リポジトリの **Settings → Secrets and variables → Actions** に `ANTHROPIC_API_KEY` を登録
- ワークフロー `.github/workflows/update-guide.yml` が存在すること

※ Run workflow を実行できるのはリポジトリの参加者のみです（一般の閲覧者は実行できません）。

---

参考: 公式ドキュメント [Skills](https://code.claude.com/docs/en/skills) / [Subagents](https://claude.com/blog/subagents-in-claude-code) / [Best practices](https://code.claude.com/docs/en/best-practices)
