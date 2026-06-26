---
description: スキル&エージェント機能ガイドの最新情報をWebでクロールし、Artifactページを同じURLに上書き更新する
allowed-tools: WebSearch, WebFetch, Read, Edit, Write, Artifact
---

# スキル & エージェント機能ガイドの更新（手動トリガー）

このコマンドは「最新情報をクロール → ページ再生成 → 同じURLに上書き」を行います。

## 対象
- ソースHTML（永続）: `claude-guide/skills-agents-guide.html`
- 公開URL（**この同じページを上書き更新する**）: https://claude.ai/code/artifact/d418cf1a-20c0-4fdf-8d9f-7d2aba258314

## 手順（順番に実行）

1. **最新情報をクロールする**（今日の年月を使うこと）。次を WebSearch:
   - `Claude Code skills agents new features`
   - `Claude Code subagents update`
   - `Claude Code スキル エージェント 新機能`
   そのうえで公式情報を WebFetch で確認:
   - https://code.claude.com/docs/en/skills
   - https://claude.com/blog/subagents-in-claude-code
   - https://code.claude.com/docs/en/best-practices

2. **差分を洗い出す**。`claude-guide/skills-agents-guide.html` を Read し、現状の記載と比較して
   「新機能 / 仕様変更 / 廃止・名称変更」を特定する。

3. **HTMLを更新する**（Edit）:
   - 新機能 → 該当セクション（機能一覧①スキル / ②エージェント）にカードを追加。タグは `skill` か `agent` に合わせる
   - 仕様変更・廃止 → 本文を修正。古い記述は残さない
   - `id="updated"` の日付を**今日の日付**に更新
   - footer 末尾の「◯◯年◯月時点の情報」も今日の日付に更新
   - 参考リンクに有用な新ソースがあれば footer の一覧に追加

4. **再公開する**。Artifact ツールを呼び、
   - `file_path` = `claude-guide/skills-agents-guide.html`
   - `url` = 上記の公開URL ← **必ず指定**。指定しないと新しいURLが発行され、既存ページが更新されない
   - `favicon` = `🧩`（変えない）

5. **報告する**。追加 / 変更 / 削除した項目を箇条書きで。
   実質的な変更が無ければ「内容に変更なし。最終更新日のみ更新しました」と明記する。

## 注意
- 出所が不確かな情報・第三者配布スキルの宣伝は採用しない（公式 anthropic.com / claude.com / code.claude.com を優先）。
- 不確実な新機能は断定せず「（要確認）」を付すか採用を見送る。
