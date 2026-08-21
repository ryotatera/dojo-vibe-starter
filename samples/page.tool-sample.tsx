// ─────────────────────────────────────────────────────────
// これは「業務アプリの画面」です。宣伝ページ（LP）ではありません。
//
// /build を実行すると、docs/03_spec.md にそって
// この構造を保ったまま、あなたの題材のツールに作り替えられます。
//
// 画面の骨格（この形は崩さない）:
//   左メニュー（.side）＋ 上部バー（.topbar）＋ 本体（.content）
//   一覧 / 新規登録 / 設定 の3画面を view で切り替える
// ─────────────────────────────────────────────────────────
"use client";

import { useEffect, useMemo, useState } from "react";

/** 1件のデータ。/build でこの項目名を題材に合わせて変える */
type Record = {
  id: string;
  name: string;      // 主たる名前（顧客名など）
  category: string;  // 区分（流入元・種別など）
  note: string;      // メモ
  date: string;      // YYYY-MM-DD
  done: boolean;     // 対応済みか
};

type View = "list" | "new" | "settings";
type Filter = "open" | "done" | "all";

const KEY = "starter-records";
const NAME_KEY = "starter-appname";

const CATEGORIES = ["LINE", "電話", "メール", "紹介"];

/** n日前の日付。見本データが、いつ開いても「今の話」に見えるようにする */
const ago = (n: number) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

/**
 * 見本データ。/build でこの中身を題材に合わせて入れ替える。
 * ⚠ 実在の人名・連絡先は使わない。件数は10件以上（少ないと画面が寂しく見える）
 */
const SAMPLE: Record[] = [
  { id: "s01", name: "佐藤さん（中2）",  category: "LINE",  note: "数学と英語、週2希望。木曜以外",       date: ago(0),  done: false },
  { id: "s02", name: "田村さん（小5）",  category: "電話",  note: "折り返し希望 18時以降",              date: ago(1),  done: false },
  { id: "s03", name: "鈴木さん（高1）",  category: "紹介",  note: "在籍生のご家族から。物理を見てほしい", date: ago(1),  done: false },
  { id: "s04", name: "中村さん（中3）",  category: "メール", note: "受験相談。志望校はまだ決めていない",  date: ago(2),  done: false },
  { id: "s05", name: "渡辺さん（中2）",  category: "紹介",  note: "平日夕方のみ。部活が19時まで",        date: ago(3),  done: false },
  { id: "s06", name: "小林さん（中1）",  category: "LINE",  note: "体験授業の日程を調整中",             date: ago(4),  done: false },
  { id: "s07", name: "松本さん（小4）",  category: "メール", note: "兄弟割引について聞かれている",       date: ago(5),  done: false },
  { id: "s08", name: "山口さん（小6）",  category: "電話",  note: "料金表を送ってほしいとのこと",       date: ago(6),  done: false },
  { id: "s09", name: "吉田さん（高2）",  category: "LINE",  note: "夏期講習の残席を確認したい",         date: ago(9),  done: false },
  { id: "s10", name: "井上さん（中3）",  category: "電話",  note: "面談日程を確定。来週火曜18時",       date: ago(12), done: true },
  { id: "s11", name: "清水さん（高3）",  category: "LINE",  note: "資料送付済み。返事待ち",             date: ago(14), done: true },
  { id: "s12", name: "森さん（小3）",    category: "紹介",  note: "体験のあと入会。4月から週1",         date: ago(16), done: true },
  { id: "s13", name: "大野さん（中1）",  category: "メール", note: "他塾と比較検討中とのこと",           date: ago(18), done: true },
  { id: "s14", name: "岡田さん（高1）",  category: "LINE",  note: "今回は見送りとご連絡あり",           date: ago(21), done: true },
];

const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (d: string) =>
  Math.max(0, Math.floor((Date.now() - new Date(d + "T00:00:00").getTime()) / 86400000));

export default function Home() {
  const [items, setItems] = useState<Record[]>([]);
  const [appName, setAppName] = useState("お問い合わせ管理");
  const [loaded, setLoaded] = useState(false);

  const [view, setView] = useState<View>("list");
  const [filter, setFilter] = useState<Filter>("open");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Record | null>(null);

  // 入力フォーム
  const [form, setForm] = useState({ name: "", category: CATEGORIES[0], note: "", date: today() });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setItems(raw ? (JSON.parse(raw) as Record[]) : SAMPLE);
      const n = localStorage.getItem(NAME_KEY);
      if (n) setAppName(n);
    } catch {
      setItems(SAMPLE);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(KEY, JSON.stringify(items));
    localStorage.setItem(NAME_KEY, appName);
  }, [items, appName, loaded]);

  // 見本データのまま触っていない状態か（1件でも足す・消すと false になる）
  const isSample = items.length === SAMPLE.length && items.every((i) => i.id.startsWith("s"));

  const counts = useMemo(
    () => ({ open: items.filter((i) => !i.done).length, done: items.filter((i) => i.done).length, all: items.length }),
    [items]
  );

  const shown = useMemo(() => {
    const k = q.trim().toLowerCase();
    return items
      .filter((i) => (filter === "all" ? true : filter === "open" ? !i.done : i.done))
      .filter((i) => !k || (i.name + i.note + i.category).toLowerCase().includes(k))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [items, filter, q]);

  function resetForm() {
    setForm({ name: "", category: CATEGORIES[0], note: "", date: today() });
    setEditing(null);
  }

  function save() {
    const name = form.name.trim();
    if (!name) return;
    if (editing) {
      setItems(items.map((i) => (i.id === editing.id ? { ...i, ...form, name } : i)));
    } else {
      setItems([...items, { id: String(Date.now()), ...form, name, done: false }]);
    }
    resetForm();
    setView("list");
  }

  function startEdit(r: Record) {
    setEditing(r);
    setForm({ name: r.name, category: r.category, note: r.note, date: r.date });
    setView("new");
  }

  const toggle = (id: string) => setItems(items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  const remove = (id: string) => setItems(items.filter((i) => i.id !== id));

  const NAV: { k: View; label: string; count?: number }[] = [
    { k: "list", label: "一覧", count: counts.open },
    { k: "new", label: "新規登録" },
    { k: "settings", label: "設定" },
  ];

  const titles: Record2 = {
    list: ["一覧", "未対応のものが、待たせている順に並びます"],
    new: [editing ? "編集" : "新規登録", "入力して保存すると、一覧に追加されます"],
    settings: ["設定", "表示名の変更と、データの初期化"],
  };

  return (
    <div className="shell">
      {/* ───────── 左メニュー ───────── */}
      <nav className="side">
        <div className="side-brand">
          <div className="n">{appName}</div>
          <div className="s">この端末に保存</div>
        </div>
        <div className="side-label">メニュー</div>
        <div className="side-nav">
          {NAV.map((n) => (
            <button
              key={n.k}
              className="side-item"
              aria-current={view === n.k ? "page" : undefined}
              onClick={() => { if (n.k !== "new") resetForm(); setView(n.k); }}
            >
              {n.label}
              {typeof n.count === "number" && <span className="c">{n.count}</span>}
            </button>
          ))}
        </div>
        <div className="side-foot">/build で、あなたの題材に作り替わります</div>
      </nav>

      {/* ───────── 本体 ───────── */}
      <div className="main">
        <header className="topbar">
          <span className="t">{titles[view][0]}</span>
          <span className="d">{titles[view][1]}</span>
          {view === "list" && (
            <span className="right">
              <button className="btn" onClick={() => { resetForm(); setView("new"); }}>新規登録</button>
            </span>
          )}
        </header>

        <div className="content">
          {/* ── 一覧 ── */}
          {view === "list" && (
            <>
              {isSample && (
                <div className="notice">
                  表示中のデータは<b>見本</b>です。そのまま触って試せます。
                  消したいときは、左メニューの<b>設定</b>から。
                </div>
              )}

              <div className="stats">
                <div className="stat"><div className="n accent">{counts.open}</div><div className="l">未対応</div></div>
                <div className="stat"><div className="n">{items.filter((i) => !i.done && daysAgo(i.date) >= 3).length}</div><div className="l">3日以上 放置</div></div>
                <div className="stat"><div className="n">{counts.all}</div><div className="l">全件</div></div>
              </div>

              <div className="filters">
                <div className="search">
                  <input className="field" value={q} onChange={(e) => setQ(e.target.value)}
                    placeholder="名前・メモで検索" />
                </div>
                <div className="seg">
                  {(["open", "done", "all"] as Filter[]).map((f) => (
                    <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>
                      {f === "open" ? `未対応 ${counts.open}` : f === "done" ? `対応済 ${counts.done}` : `全部 ${counts.all}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="list">
                <div className="list-head">
                  {filter === "open" ? "未対応（待たせている順）" : filter === "done" ? "対応済み" : "すべて"}
                  <span className="count">{shown.length} 件</span>
                </div>

                {shown.length === 0 ? (
                  <div className="empty">
                    <div className="t">{q ? "見つかりませんでした" : "ここに表示するものがありません"}</div>
                    <div className="d">
                      {q ? "検索の言葉を変えてみてください。" : "右上の「新規登録」から追加できます。"}
                    </div>
                  </div>
                ) : (
                  shown.map((r) => {
                    const d = daysAgo(r.date);
                    return (
                      <div className="row" key={r.id}>
                        <div className="row-main">
                          <div className="row-title">{r.name}</div>
                          {r.note && <div className="row-sub">{r.note}</div>}
                        </div>
                        <div className="row-meta">
                          {!r.done && d >= 3 && <span className="badge badge-warn">{d}日</span>}
                          <span className="badge">{r.category}</span>
                          <span className="row-time">{r.date.slice(5).replace("-", "/")}</span>
                          <button className="btn-ghost" onClick={() => startEdit(r)}>編集</button>
                          <button className="btn-ghost" onClick={() => toggle(r.id)}>
                            {r.done ? "戻す" : "対応済みにする"}
                          </button>
                          <button className="btn-ghost danger-btn" onClick={() => remove(r.id)}>削除</button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <p className="note">データはこの端末のブラウザにだけ保存されます。外部には送信されません。</p>
            </>
          )}

          {/* ── 新規登録・編集 ── */}
          {view === "new" && (
            <div className="panel">
              <div className="form-row">
                <label className="label" htmlFor="f-name">名前<span className="req">必須</span></label>
                <input id="f-name" className="field" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onKeyDown={(e) => { if (e.key === "Enter") save(); }}
                  placeholder="例：Aさん（中2）" />
                <span className="hint">あとで見て誰か分かる書き方にします</span>
              </div>

              <div className="form-row">
                <div className="inline">
                  <div>
                    <label className="label" htmlFor="f-cat">区分</label>
                    <select id="f-cat" className="select" value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="f-date">受けた日</label>
                    <input id="f-date" className="field" type="date" value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <label className="label" htmlFor="f-note">メモ</label>
                <textarea id="f-note" className="field" value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="希望曜日・科目・折り返し時間など" />
              </div>

              <div className="form-actions">
                <button className="btn" onClick={save} disabled={!form.name.trim()}>
                  {editing ? "保存する" : "一覧に追加"}
                </button>
                <button className="btn-ghost" onClick={() => { resetForm(); setView("list"); }}>やめる</button>
                <span className="spacer" />
                {editing && (
                  <button className="btn-ghost danger-btn"
                    onClick={() => { remove(editing.id); resetForm(); setView("list"); }}>
                    この1件を削除
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── 設定 ── */}
          {view === "settings" && (
            <div className="panel">
              <div className="form-row">
                <label className="label" htmlFor="f-app">画面の表示名</label>
                <input id="f-app" className="field" value={appName}
                  onChange={(e) => setAppName(e.target.value)} />
                <span className="hint">左上に表示されます。変えるとすぐ反映されます</span>
              </div>

              <div className="form-row">
                <label className="label">データ</label>
                <div className="inline">
                  <button className="btn-ghost" onClick={() => setItems(SAMPLE)}>見本データを入れ直す</button>
                  <button className="btn-ghost danger-btn"
                    onClick={() => { if (confirm("全部消します。よろしいですか？")) setItems([]); }}>
                    全部消す
                  </button>
                </div>
                <span className="hint">
                  現在 {counts.all} 件（未対応 {counts.open} / 対応済 {counts.done}）
                </span>
              </div>

              <p className="note">
                データはこの端末のブラウザにだけ保存されます。
                別の端末や他の人とは共有されません（共有は第3回で扱います）。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** 画面ごとの見出し */
type Record2 = { [K in View]: [string, string] };
