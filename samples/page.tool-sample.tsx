"use client";

import { useState, useEffect } from "react";

type Inquiry = {
  id: string;
  name: string;
  source: "LINE" | "電話" | "HP";
  date: string;
  done: boolean;
};

const KEY = "juku-inquiries";

const INITIAL: Inquiry[] = [
  { id: "1", name: "佐藤さん（中2）", source: "LINE", date: "2026-08-18", done: false },
  { id: "2", name: "鈴木さん（小6）", source: "電話", date: "2026-08-19", done: false },
  { id: "3", name: "高橋さん（中3）", source: "HP", date: "2026-08-20", done: false },
];

function daysAgo(date: string) {
  const d = new Date(date + "T00:00:00");
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

export default function Home() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("");
  const [source, setSource] = useState<Inquiry["source"]>("LINE");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setItems(raw ? (JSON.parse(raw) as Inquiry[]) : INITIAL);
    } catch {
      setItems(INITIAL);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, loaded]);

  const pending = items.filter((i) => !i.done).sort((a, b) => a.date.localeCompare(b.date));

  function add() {
    if (!name.trim()) return;
    setItems([
      ...items,
      {
        id: String(Date.now()),
        name: name.trim(),
        source,
        date: new Date().toISOString().slice(0, 10),
        done: false,
      },
    ]);
    setName("");
  }

  return (
    <main className="container">
      <span className="eyebrow">体験授業の問い合わせ</span>
      <h1 className="title">今日、返信する人</h1>
      <p className="lead">
        古い順に並びます。返信したら「返信済み」を押すとリストから消えます。
      </p>

      <div className="card">
        <h2>問い合わせを追加</h2>
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="保護者名（学年）"
            style={{
              flex: 1,
              minWidth: "180px",
              padding: "var(--space-3)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius)",
              fontFamily: "inherit",
              fontSize: "var(--text-base)",
            }}
          />
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as Inquiry["source"])}
            style={{
              padding: "var(--space-3)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius)",
              fontFamily: "inherit",
              fontSize: "var(--text-base)",
            }}
          >
            <option>LINE</option>
            <option>電話</option>
            <option>HP</option>
          </select>
          <button className="button" onClick={add} style={{ border: "none", cursor: "pointer" }}>
            追加
          </button>
        </div>
      </div>

      <div className="card">
        <h2>未返信 {pending.length} 件</h2>
        {pending.length === 0 ? (
          <p className="note">未返信はありません。</p>
        ) : (
          <ol>
            {pending.map((i) => {
              const d = daysAgo(i.date);
              return (
                <li key={i.id} style={{ marginBottom: "var(--space-3)" }}>
                  <strong>{i.name}</strong>{" "}
                  <span className="note">
                    {i.source} ・ {i.date}
                    {d >= 3 && (
                      <span style={{ color: "#B23A2A", fontWeight: 700 }}> ・{d}日放置</span>
                    )}
                  </span>{" "}
                  <button
                    onClick={() => setItems(items.map((x) => (x.id === i.id ? { ...x, done: true } : x)))}
                    style={{
                      marginLeft: "var(--space-2)",
                      padding: "2px var(--space-3)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius)",
                      background: "var(--color-surface)",
                      fontFamily: "inherit",
                      fontSize: "var(--text-sm)",
                      cursor: "pointer",
                    }}
                  >
                    返信済み
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </main>
  );
}
