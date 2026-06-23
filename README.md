# ChatGPT Composer Glow

ChatGPT の入力欄や回答状態に、控えめな光のアニメーションを追加する Chrome 拡張機能です。

This is a Chrome extension that adds subtle state-based animations to ChatGPT.

![screenshot1](docs/screenshot-01.png)


![screenshot2](docs/screenshot-02.png)

この拡張機能は OpenAI と提携、承認、後援されているものではありません。

This extension is not affiliated with, endorsed by, or sponsored by OpenAI.

## ローカルでの読み込み

1. `chrome://extensions` を開きます。
2. デベロッパーモードを有効にします。
3. 「パッケージ化されていない拡張機能を読み込む」をクリックします。
4. この拡張機能のディレクトリを選択します。
5. `https://chatgpt.com/` を開きます。

Load unpacked from this extension directory, then open `https://chatgpt.com/`.

## 主な動作

- 入力欄: 入力エリアの外側に、控えめな呼吸するような光を表示します。
- 送信可能な状態: 送信ボタンをやさしく点滅させます。
- 回答待機中: 最新のアシスタント回答に細いステータスバーを表示します。
- 回答完了時: ステータスバーを短く光らせてからフェードアウトします。
- サイドバー: チャット項目のホバー状態や選択状態に、控えめなアクセントを追加します。

The extension adds composer, send-button, response-state, and sidebar visual cues.

## デザイン方針

ChatGPT の読み書き体験を邪魔しないよう、全画面背景や音声連動のような大きな演出は入れていません。必要な状態だけを、控えめな光で分かりやすくします。

The design stays intentionally subtle so the ChatGPT interface remains clean.

## プライバシー

ChatGPT Composer Glow は、個人情報を収集、保存、販売、共有、送信しません。対応する ChatGPT ページ上でローカルに動作し、ページ状態に応じて視覚効果を適用するだけです。

ChatGPT Composer Glow does not collect, store, sell, share, or transmit personal information.

詳細は [プライバシーポリシー](docs/privacy-policy.md) を参照してください。
