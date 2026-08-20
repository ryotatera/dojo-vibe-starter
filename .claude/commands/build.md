---
description: 要件定義書から、本番URLで動くツールを実装する
---

`docs/03_spec.md` の要件定義書にそって、**触ると動くツール**を実装してください。

## 作るもの

`app/page.tsx` を、**説明ページではなく、実際に動くツール**に置き換えます。

## 技術の制約（必ず守る）

| | |
|---|---|
| ファイル | **`app/page.tsx` の1枚だけ**で完結させる |
| 状態管理 | React の `useState`。ファイル先頭に `"use client"` を書く |
| 保存 | **`localStorage`**。`useEffect` で読み書きする |
| スタイル | `app/globals.css` の**既存の変数とクラス**を使う。直値の色を書かない |
| ライブラリ | **追加しない。** Next.js と React だけで作る |
| 画面 | **1画面。**ルーティングを増やさない |

### localStorage の実装で必ず守ること

サーバー側で `localStorage` を触るとビルドが落ちます。**必ずこの形にしてください。**

```tsx
"use client";
import { useState, useEffect } from "react";

const KEY = "xxx-data";

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);

  // 読み込みは必ず useEffect の中で
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setItems(raw ? JSON.parse(raw) : INITIAL);
    } catch {
      setItems(INITIAL);
    }
    setLoaded(true);
  }, []);

  // 保存も useEffect。読み込み完了前に走らせない
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, loaded]);
  ...
}
```

## 進め方

1. 実装の前に、**何をどう作るつもりか3行以内**で伝える
2. **一度に全部作る。**このコマンドだけは、動くところまで一気に書いてよい
3. 実装後、**ビルドが通るか必ず確認する**（`npm run build` 相当）
4. 要件定義書の「7. 完成条件」を1つずつ照らして、満たしているか自己チェックする

## やってはいけないこと

- 要件定義書の「6. やらないこと」に書かれた機能を足す
- 新しいライブラリを追加する
- `localStorage` を `useEffect` の外で読む（**ビルドが落ちます**）
- 実在の人名・連絡先をダミーデータに使う

## 終わったら

次の形で報告してください。

```
実装しました。

■ できること
- （操作1）
- （操作2）
- （操作3）

■ 確認してほしいところ
1. （画面のどこを見れば動作が分かるか）
2. リロードしてもデータが残ること

■ 完成条件
- [x] ...
- [x] ...
- [ ] ...（満たせていないものがあれば正直に）
```

$ARGUMENTS
