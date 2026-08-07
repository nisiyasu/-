# Life Command Center Smartphone v1 Visual Masters

Status: RUNTIME_DERIVATIVES_EMBEDDED

この文書は、2026-08-07 にオーナーが承認した2枚の視覚正本と、公開ランタイムで使用する派生アセットを対応付けるマニフェストである。

## 1. Home visual master

- Role: RIOT NEON ホーム完成見本
- Source uploaded filename: `B9F70E89-A4F5-4556-AB43-06A84B6259D1.jpeg`
- Source size: 650445 bytes
- Source SHA-256: `3c5d0e5a2a3ddba503513c6a3194dfd8da96bf4b83b34f38b4542868c546235e`
- Source dimensions: 864 x 1536
- Runtime derivative: approved master をWebP化し、次の6チャンクとして埋め込み
  - `assets/runtime/home_00.js`
  - `assets/runtime/home_01.js`
  - `assets/runtime/home_02.js`
  - `assets/runtime/home_03.js`
  - `assets/runtime/home_04.js`
  - `assets/runtime/home_05.js`

## 2. Save-list visual master

- Role: RIOT NEON 保存リスト完成見本
- Source uploaded filename: `9A26D42D-22FF-4CBD-9971-4AD2B995898D.jpeg`
- Source size: 615254 bytes
- Source SHA-256: `53d1de7362bb6c68911c9d1322592e31cb676b9ec9a2e7f95905b82fb32503aa`
- Source dimensions: 864 x 1536
- Runtime derivative: approved master の上部ヒーロー領域を高品質WebP化し、次の4チャンクとして埋め込み
  - `assets/runtime/savehero_00.js`
  - `assets/runtime/savehero_01.js`
  - `assets/runtime/savehero_02.js`
  - `assets/runtime/savehero_03.js`

## 3. Dynamic UI assets

保存リストの可変UIは、文字・状態を画像へ焼き込まないため、HTML/CSS/JavaScriptで再構成する。
質感補助アセット:

- `assets/runtime/icon_diary.js`
- `assets/runtime/icon_insight.js`
- `assets/runtime/icon_rule.js`
- `assets/runtime/icon_other.js`
- `assets/runtime/card_texture.js`
- `assets/runtime/brush_lime.js`
- `assets/runtime/assets-init.js`

## Important accuracy note

承認元JPEGそのものをGitHub上のバイナリファイルとして保存した、という意味ではない。
公開ランタイムでは、承認元画像から作成したWebP派生アセットを使用する。
視覚正本の同一性確認には、上記の元ファイル名・寸法・SHA-256を使用する。

## Acceptance rule

- Home は承認済みホーム見本のRIOT NEON質感を明確に維持すること。
- 保存リストは承認済み保存リスト見本のヒーロー・配色・アイコン・ネオン・グランジ感を維持しつつ、検索・絞り込み・表示切替・原文切替等を可変UIとして実装すること。
- 公開完了は、コード更新ではなくGitHub Pagesの公開実画面確認までを条件とする。
