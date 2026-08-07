# Life Command Center スマホ版 v1 テストレポート

実施日: 2026-08-07
対象: `nisiyasu/-` main
基準仕様: `docs/specs/LCC_SMARTPHONE_V1_DECISIONS_20260807.md`

## 現在の実装

- ホーム: RIOT NEON承認画像を埋め込みアセットとして復元し、7コマンドに44px以上のタップ領域を配置。
- 保存リスト: RIOT NEON承認画像のヒーローを使用し、可変領域はHTML/CSS/JavaScriptで実装。
- 検索: `organized_title` / `original_text` / `body` を横断検索。
- カテゴリ: ALL / 日記 / ルール / 気付き / その他。
- 表示切替: カード / 一覧。
- タイトル切替: 整理タイトル / 俺の原文。
- 永続化: 表示モード・タイトルモードをlocalStorageへ保存。
- 並び替え: 新しい順のみ。
- 詳細表示: 原文と整理版を分離して表示。
- データ索引: `data/saved-items.json` は `canonical:false`。正本を上書きしない補助索引。

## 実機相当テスト

Chromium DevTools Protocolを用いて、自己完結テストビルドをiPhone相当viewportで検査した。
ローカルテスト環境のセキュリティ制約によりlocalhost/file URLは使用せず、同一HTMLをドキュメントへロードしてDOM・レイアウト・イベントを検査した。

### 390 x 844

- 横スクロール: PASS (overflow 0px)
- 7コマンド表示: PASS
- 7コマンドのタップ領域: PASS（最小約72px高、44px以上）
- カテゴリボタン: PASS（44px以上）
- 検索: PASS
- カテゴリ絞り込み: PASS
- カード / 一覧切替: PASS
- 整理タイトル / 俺の原文切替: PASS
- 新しい順: PASS
- 0件検索結果: PASS
- 詳細表示: PASS
- 詳細モーダル横はみ出し: PASS
- 長文原文表示: PASS
- 下部ナビ固定: PASS
- モードボタン1行表示: PASS

### 430 x 932

- 横スクロール: PASS (overflow 0px)
- 最小可視タップ領域: PASS（44px以上）
- レイアウト破綻: なし

### 1280 x 900

- 横スクロール: PASS (overflow 0px)
- スマホUIは最大430pxで中央配置
- 最小可視タップ領域: PASS（44px以上）

## 原文保護

- `original_text` と `organized_title` は別フィールド。
- UIはread-only。
- 表示切替・検索・詳細表示のいずれも原文を書き換えない。
- `data/saved-items.json` は補助索引であり正本ではない。

判定: PASS

## 視覚不具合と修正

切り出し途中の `card_texture` / `brush_lime` に可変文字や旧「開く」ボタンが焼き込まれており、動的カードの下に文字が二重表示される不具合を検出した。

修正:
- 動的カードでは文字入り切り出し素材を背景として使用しない。
- 承認画像のヒーロー・アイコン・多色ネオンを維持しながら、可変カード面のみ文字のない暗色ネオン面へ変更。
- 390pxで「カード表示」「整理タイトル」が折り返さないよう補正。

判定: PASS

## 未決定事項の扱い

仕様上未決定のため、以下を推測実装していない。

- 「新しい順」以外のソートキー
- お気に入りのv1必須化
- 本番正本データとの最終接続方式
- 7コマンドの未定義遷移先

7コマンドは視覚・タップUIまで実装し、未定義の外部遷移は作成していない。

## GitHub Pages

コード反映先: main
公開URL候補: `https://nisiyasu.github.io/-/`

このレポート作成時点では、最新コミットに対するPages build / deploy / 公開実画面の最終確認は別途実施中。
GitHubファイル更新だけを公開完了とは判定しない。

## 判定

- SPEC_COMPLIANCE: PASS（未決定事項を勝手に確定していない）
- HOME UI: PASS
- SAVED_LIST UI: PASS
- 390PX_IPHONE: PASS
- SEARCH: PASS
- CATEGORY_FILTER: PASS
- CARD_LIST_TOGGLE: PASS
- ORGANIZED_ORIGINAL_TOGGLE: PASS
- ORIGINAL_TEXT_PROTECTION: PASS
- DETAIL_VIEW: PASS
- DATA_CANONICALITY: PASS
- PUBLIC_VERIFIED: PENDING
