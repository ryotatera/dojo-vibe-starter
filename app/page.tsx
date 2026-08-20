// ─────────────────────────────────────────────────────────
// これは「アプリの画面」です。宣伝ページ（LP）ではありません。
//
// /build を実行すると、docs/03_spec.md にそって
// この画面が、あなたの題材のツールに作り替えられます。
// ─────────────────────────────────────────────────────────
"use client";

import { useEffect, useState } from "react";

type Item = {
  id: string;
  title: string;
  note: string;
  createdAt: string; // YYYY-MM-DD
  done: boolean;
};

const KEY = "starter-items";

const INITIAL: Item[] = [
  { id: "1", title: "サンプル：最初の1件", note: "行をクリックせず、右の「完了」を押すと消えます", createdAt: "2026-08-19", done: false },
  { id: "2", title: "サンプル：2件目", note: "上の欄から自由に追加できます", createdAt: "2026-08-20", done: false },
];

function daysAgo(d: string) {
  const t = new Date(d + "T00:00:00").getTime();
  return Math.max(0, Math.floor((Date.now() - t) / 86400000));
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setItems(raw ? (JSON.parse(raw) as Item[]) : INITIAL);
    } catch {
      setItems(INITIAL);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, loaded]);

  const open = items.filter((i) => !i.done);

  function add() {
    const t = title.trim();
    if (!t) return;
    setItems([
      ...items,
      { id: String(Date.now()), title: t, note: "", createdAt: new Date().toISOString().slice(0, 10), done: false },
    ]);
    setTitle("");
  }

  return (
    <div className="app">
      <header className="app-bar">
        <span className="app-name">はじめてのツール</span>
        <span className="app-sub">/build で、あなたの題材に作り替わります</span>
        <span className="right">
          <span className="badge">サンプルデータ</span>
        </span>
      </header>

      <main className="app-body">
        <div className="stats">
          <div className="stat">
            <div className="n accent">{open.length}</div>
            <div className="l">未対応</div>
          </div>
          <div className="stat">
            <div className="n">{items.length}</div>
            <div className="l">全部</div>
          </div>
        </div>

        <div className="toolbar">
          <input
            className="field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") add(); }}
            placeholder="内容を入力して追加"
          />
          <button className="btn" onClick={add} disabled={!title.trim()}>
            追加
          </button>
        </div>

        <div className="list">
          <div className="list-head">
            未対応
            <span className="count">{open.length} 件</span>
          </div>

          {open.length === 0 ? (
            <div className="empty">
              <div className="t">未対応はありません</div>
              <div className="d">上の欄から追加すると、ここに並びます。</div>
            </div>
          ) : (
            open.map((i) => {
              const d = daysAgo(i.createdAt);
              return (
                <div className="row" key={i.id}>
                  <div className="row-main">
                    <div className="row-title">{i.title}</div>
                    {i.note && <div className="row-sub">{i.note}</div>}
                  </div>
                  <div className="row-meta">
                    {d >= 3 && <span className="badge badge-warn">{d}日経過</span>}
                    <span className="row-time">{i.createdAt}</span>
                    <button
                      className="btn-ghost"
                      onClick={() => setItems(items.map((x) => (x.id === i.id ? { ...x, done: true } : x)))}
                    >
                      完了
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <p className="note">
          データはこの端末に保存されます。リロードしても消えません。
        </p>
      </main>
    </div>
  );
}
