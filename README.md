# Eleventyを使ってみる：Markdownから業務マニュアルを生成

Qiita Advent Calendarの記事「Eleventy活用によるマニュアル作成・保守の業務効率化」向けの最小サンプルです。本文1ファイルを、レイアウト付きHTML1ファイルへ変換します。

## 実行手順

Node.js 18以上とnpmが必要です。作成時の環境はNode.js v24.21.0 / npm 11.19.0です。

```sh
npm ci
npm run build
npm start
```

`npm ci` は同梱のロックファイルから依存関係を再現します。`npm run build` の出力は `_site/index.html`、`_site/styles.css`、`_site/images/workflow.svg` です。`npm start` 後、ターミナルに表示されたURL（通常は http://localhost:8080 ）を開きます。保存すると再ビルドされます。終了は Ctrl+C です。

ビルド後の `_site/index.html` は直接ブラウザーで開くこともできます。CSSは相対パスで参照しています。HTMLを別の場所へコピーするときは `styles.css` と `images` ディレクトリも一緒にコピーしてください。

## ファイルと役割

```text
eleventy.config.js          入出力・CSSと画像のコピー設定
src/
  index.md                 本文（公開対象のMarkdownはこの1つ）
  _includes/manual.njk     共通HTMLレイアウト
  styles.css               画面・印刷用CSS・図表の自動採番
  images/workflow.svg      マニュアル生成の処理フロー図
_site/                     ビルド結果（自動生成）
```

`src` のみを入力にするため、このREADMEはHTML化されません。

## 記事で比較するポイント

| Markdown側 | HTML側の見た目 |
| --- | --- |
| `#` 文書名 | 大きな文書タイトル（h1） |
| `##` 部 | 背景色と太い左罫線（h2） |
| `###` 章 | 下線付き見出し（h3） |
| `####` 節 | 小さめの色付き見出し（h4） |
| `<aside class="note">` | 青い枠の注釈 |
| `<aside class="warning">` | 黄褐色の枠の警告 |
| `>` 引用 | 灰色の背景と左罫線 |
| `**強調**` / バッククォート | 太字 / 等幅のコード表記 |

エディターで `src/index.md` のソースを表示し、ブラウザーの同じ箇所と並べると比較できます。Markdownプレビューの見た目はエディターによって異なります。

注釈・警告は標準Markdown固有の構文ではなく、Markdown内へのHTML埋め込みです。追加プラグインは不要です。開始タグと本文の間、および本文と終了タグの間の空行を維持してください。囲みの中の太字やコードもMarkdownとして変換されます。

先頭の `---` で囲んだ部分はfront matterです。`layout` は共通レイアウト、`title` はブラウザーのタイトル、`version` は本文上部の版表示に使います。本文のh1は別途Markdownに記述しています。

Eleventyは本文をHTMLへ変換し、Nunjucksレイアウトの `{{ content | safe }}` に挿入します。`safe` は生成したHTMLをタグとして出力する指定なので、この例では自分で管理する原稿だけを扱います。見た目はCSSが担当し、Eleventy自体が見出しに色などを付けるわけではありません。

## 図・表・自動採番

サンプルのSVG図は同梱しているため、画像を別途用意する必要はありません。
自分の画像を使う場合は `src/images/` に配置し、画像のパスと代替テキストを変更します。

```md
<figure class="numbered-figure" id="fig-example">

![図の内容を説明する代替テキスト](./images/workflow.svg)

<figcaption>マニュアル生成の流れ</figcaption>
</figure>
```

`figure` の開始タグと画像記法の間、画像記法と `figcaption` の間に空行を入れてください。
`id` は文書内で重複させないでください。図の下に「図1　マニュアル生成の流れ」と表示されます。

番号付きの表は、次のようにMarkdown内へHTMLを埋め込みます。

```html
<table class="numbered-table" id="table-example">
  <caption>ファイルの役割</caption>
  <thead>
    <tr><th scope="col">ファイル</th><th scope="col">役割</th></tr>
  </thead>
  <tbody>
    <tr><td><code>index.md</code></td><td>本文</td></tr>
  </tbody>
</table>
```

表の上に「表1　ファイルの役割」と表示されます。HTMLの表内では、太字やコードも
`<strong>` や `<code>` のHTMLタグで記述します。
番号や表題が不要な表はMarkdownのパイプ区切りで書けます（原稿に例を掲載）。
その表は自動採番の対象になりません。

採番には[CSSカウンター](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Counter_styles/Using_counters)を使い、追加の依存パッケージやブラウザーJavaScriptは使いません。
`.manual` で図用・表用のカウンターを初期化し、対象の `figure` / `table` ごとに増やします。
部や章をまたいでも図と表の連番はそれぞれ続き、追加・削除・並べ替え時に表示番号が変わります。

番号はCSSで表示するため、生成HTMLのテキストに直接書き込まれるものではありません。
CSSが無効な表示やテキストのコピーでは番号が含まれない場合があります。
本文からの番号付き相互参照の自動更新は含めていません。
参照するときは `[生成の流れ](#fig-workflow)` のように説明文をリンクにできます。

印刷時は図とキャプション、表の各行を可能な範囲で分割しない設定です。
長い表はページをまたぎ、列見出しの繰り返しをブラウザーに指定します。
1ページに収まらない大きな図や行の扱い、見出しの繰り返しは印刷プレビューで確認してください。

## PDFへの変換・改ページ

1. ブラウザーで生成したHTMLを開き、印刷画面を開きます。
2. 保存先を「PDFに保存」、用紙をA4縦、倍率を100%にします。
3. ブラウザーのヘッダー・フッター（URLや日時）をオフにします。
4. 色を含めて比較する場合は「背景のグラフィック」をオンにします。
5. プレビューで第II部が新しいページから始まることを確認し、保存します。

`@page` でA4縦・上下18mm／左右16mmの余白を指定しています。印刷ダイアログで独自の余白を指定すると優先される場合があるため、プレビューで確認してください。

`h2 ~ h2 { break-before: page; }` で2つ目以降の部の前に改ページを入れます。最初の部は文書名と同じページで開始します。章ごとに改ページしたい場合は、印刷用CSSに `h3 { break-before: page; }` を追加します。

見出し直後の改ページを避け、注釈・警告・引用・コードは可能な範囲でまとまるよう指定しています。ブロックが1ページより長い場合などは分割されます。改ページ後の行数や総ページ数はブラウザー・フォント・印刷設定で変わります。PDFの自動生成やページ番号の自動付与は含めていません。

## 保守の流れ

本文は `src/index.md`、共通の見た目は `src/styles.css` を編集して再ビルドします。`_site` の直接編集は次回ビルドで上書きされます。`package-lock.json` は共有し、依存関係を再現できるようにします。

## 参考

- [Eleventy公式：Getting Started](https://www.11ty.dev/docs/)
- [Eleventy公式：Layouts](https://www.11ty.dev/docs/layouts/)
- [Eleventy公式：Passthrough File Copy](https://www.11ty.dev/docs/copy/)
