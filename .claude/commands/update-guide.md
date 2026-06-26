---
description: ガイドの最新情報をWebでクロールし、data/guide.json を更新して再ビルドする（データ駆動）
allowed-tools: WebSearch, WebFetch, Read, Edit, Write, Bash
---

# スキル & エージェント機能ガイドの更新（データ駆動・ローカル手動トリガー）

このプロジェクトは **データ駆動構成** です。コンテンツは `data/guide.json` が唯一の情報源で、
`index.html` と `claude-guide/skills-agents-guide.html` は `build/build.mjs` で生成されます。
**HTML を直接編集しないでください。** 編集するのは `data/guide.json` だけです。

## 公開
- 公開サイト: https://yutaogura-sys.github.io/claude-skills-agents-guide/
- リポジトリ: https://github.com/yutaogura-sys/claude-skills-agents-guide

## いつ実行するか
- 任意のタイミングで実行可。
- `watch-docs` ワークフロー（週次・AI不使用）が公式ドキュメントの変化を検知すると、
  ラベル `docs-update` の Issue で通知します。その通知が来たら本コマンドを実行するのが目安です。

## 手順

1. `data/guide.json` と `CHANGELOG.md` を Read して現状を把握する。
2. 最新情報を WebFetch（可能なら WebSearch も）で確認する:
   - https://code.claude.com/docs/en/skills
   - https://claude.com/blog/subagents-in-claude-code
   - https://code.claude.com/docs/en/best-practices
3. 現在の `guide.json` と比較し「新機能 / 仕様変更 / 廃止・名称変更」を特定する。
4. `data/guide.json` を Edit で更新する:
   - 新機能カードは該当 section（`id: skills` / `agents`）の `cards` に追加
   - 仕様変更・廃止は `body` / `rec` を修正（古い記述は残さない）
   - JSON として妥当な構造を保つ
5. 変更があれば `changelog` 配列の先頭に
   `{"date": "本日(YYYY-MM-DD)", "summary": ["変更点", ...]}` を追加する。
6. ビルドして検証する（Bash）:
   ```
   node build/build.mjs
   node build/validate.mjs
   ```
7. 変更点（追加 / 変更 / 削除）を箇条書きで報告する。実質的な変更が無ければ
   「内容に変更なし」と明記し、guide.json は変更しない。

## 反映（GitHub Pages へ）
- 検証が通ったら、PR を作成してマージ（推奨）または main へ commit & push する。
  push すると GitHub Pages に自動反映されます。

## 注意
- 公式ソース（anthropic.com / claude.com / code.claude.com）のみ採用。
- 出所が不確かな情報・第三者配布スキルの宣伝は採用しない。不確実な新機能は見送る。
