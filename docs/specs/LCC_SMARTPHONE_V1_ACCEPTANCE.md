# Life Command Center スマホ版 v1 受入条件

## Scope
対象はホーム + 保存リストの2ページのみ。

## 390px iPhone acceptance
- 横スクロールなし
- 主要文字切れなし
- safe-area対応
- 下部ナビが本文を隠さない
- タップ領域は原則44px以上
- 長い原文でもカード/一覧が崩壊しない
- ホーム/保存リストでRIOT NEONの質感が一致する

## Home
- 承認済みHome visual masterが主要視覚として表示される
- 7コマンドがすべて視認可能
- 大枠のマゼンタ + 太いライムイエロー表現が保持される
- 7コマンドのタップ領域が存在する
- 未定義の遷移先を捏造しない

## Saved List
- 全件表示
- ALL / 日記 / ルール / 気付き / その他のカテゴリ絞り込み
- 整理タイトル / 俺の原文切替
- カード / 一覧切替
- 検索対象 = 整理タイトル + 原文 + 本文
- 新しい順
- 詳細表示
- 0件検索結果
- 手動更新 / 同期状態
- カード/一覧とタイトルモードをlocalStorageへ保存し、再読込後に復元

## Original text protection
- `original_text` をAI整理文で上書きしない
- 一覧の「俺の原文」は元フィールドをそのまま表示
- 詳細で原文全文を確認可能

## Canonicality
`data/saved-items.json` は `canonical:false` の補助索引・プロトタイプデータとして扱う。正本Markdown/原記録を別正本へ置き換えない。

## Responsive spot checks
- 390px
- 430px前後
- デスクトップ幅

## Publish acceptance
次をすべて満たすまで公開完了としない。
1. final commitを特定
2. Pages build/deploy成功を確認
3. 公開URLを開く
4. 最新実装であることを確認
5. Homeと保存リストの主要UIが公開画面で取得可能であることを確認

## Build marker
公開検証時は `data-lcc-build="20260807-v1-riot-neon"` または同等のビルド識別子を確認する。
