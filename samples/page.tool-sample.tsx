"use client";

import { useEffect, useState } from "react";

type Source = "LINE" | "電話" | "HP";
type Inquiry = { id: string; name: string; grade: string; source: Source; date: string; done: boolean };

const KEY = "juku-inquiries";

const INITIAL: Inquiry[] = [
  { id: "1", name: "佐藤さん", grade: "中2・数学", source: "LINE", date: "2026-08-18", done: false },
  { id: "2", name: "鈴木さん", grade: "小5・体験希望", source: "電話", date: "2026-08-19", done: false },
  { id: "3", name: "高橋さん", grade: "中3・冬期講習", source: "HP", date: "2026-08-20", done: false },
];

function daysAgo(d: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(d + "T00:00:00").getTime()) / 86400000));
}

export default function Home() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [source, setSource] = useState<Source>("LINE");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setItems(raw ? (JSON.parse(raw) as Inquiry[]) : INITIAL);
    } catch { setItems(INITIAL); }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, loaded]);

  const open = items.filter((i) => !i.done).sort((a, b) => a.date.localeCompare(b.date));
  const stale = open.filter((i) => daysAgo(i.date) >= 3).length;

  function add() {
    const n = name.trim();
    if (!n) return;
    setItems([...items, { id: String(Date.now()), name: n, grade: grade.trim(), source, date: new Date().toISOString().slice(0, 10), done: false }]);
    setName(""); setGrade("");
  }

  return (
    <div className="app">
      <header className="app-bar">
        <span className="app-name">体験授業の問い合わせ</span>
        <span className="app-sub">明光義塾 三鷹校</span>
        <span className="right">
          {stale > 0 && <span className="badge badge-warn">3日以上 {stale}件</span>}
        </span>
      </header>

      <main className="app-body">
        <div className="stats">
          <div className="stat"><div className="n accent">{open.length}</div><div className="l">今日返す人</div></div>
          <div className="stat"><div className="n">{items.length}</div><div className="l">受けた問い合わせ</div></div>
        </div>

        <div className="toolbar">
          <input className="field" value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") add(); }} placeholder="保護者名" />
          <input className="field" value={grade} onChange={(e) => setGrade(e.target.value)}
            placeholder="学年・用件（任意）" />
          <select className="select" value={source} onChange={(e) => setSource(e.target.value as Source)}>
            <option>LINE</option><option>電話</option><option>HP</option>
          </select>
          <button className="btn" onClick={add} disabled={!name.trim()}>追加</button>
        </div>

        <div className="list">
          <div className="list-head">
            未返信（古い順）
            <span className="count">{open.length} 件</span>
          </div>
          {open.length === 0 ? (
            <div className="empty">
              <div className="t">未返信はありません</div>
              <div className="d">今日の分は終わりです。新しい問い合わせは上の欄から追加できます。</div>
            </div>
          ) : (
            open.map((i) => {
              const d = daysAgo(i.date);
              return (
                <div className="row" key={i.id}>
                  <div className="row-main">
                    <div className="row-title">{i.name}</div>
                    {i.grade && <div className="row-sub">{i.grade}</div>}
                  </div>
                  <div className="row-meta">
                    {d >= 3 && <span className="badge badge-warn">{d}日放置</span>}
                    <span className="badge">{i.source}</span>
                    <span className="row-time">{i.date}</span>
                    <button className="btn-ghost"
                      onClick={() => setItems(items.map((x) => (x.id === i.id ? { ...x, done: true } : x)))}>
                      返信済み
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <p className="note">データはこの端末に保存されます。リロードしても消えません。</p>
      </main>
    </div>
  );
}
