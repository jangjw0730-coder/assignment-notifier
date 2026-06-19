import { useState, useEffect, useMemo } from "react";

// ── 데이터 저장 키 ──
const STORE_KEY = "assignment-notifier-v1";

// 오늘 0시 기준 D-day 계산
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + "T00:00:00");
  return Math.round((due - today) / 86400000);
}

// D-day → 상태/라벨/색
function statusOf(d, done) {
  if (done) return { key: "done", label: "완료", tone: "var(--ok)" };
  if (d === null) return { key: "none", label: "기한 없음", tone: "var(--muted)" };
  if (d < 0) return { key: "over", label: `지남 ${Math.abs(d)}일`, tone: "var(--over)" };
  if (d === 0) return { key: "today", label: "오늘 마감", tone: "var(--soon)" };
  if (d <= 2) return { key: "soon", label: `D-${d}`, tone: "var(--soon)" };
  return { key: "ok", label: `D-${d}`, tone: "var(--ahead)" };
}

const seed = [
  { id: 1, title: "구현과제 PDF 작성", course: "S/W 프로그래밍", due: isoIn(3), memo: "의도·과정 중심으로", done: false },
  { id: 2, title: "웹서비스 배포하기", course: "S/W 프로그래밍", due: isoIn(3), memo: "Vercel로 URL 띄우기", done: false },
];

function isoIn(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export default function App() {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : seed;
    } catch {
      return seed;
    }
  });
  const [form, setForm] = useState({ title: "", course: "", due: "", memo: "" });
  const [filter, setFilter] = useState("active");

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const add = () => {
    if (!form.title.trim()) return;
    setItems((prev) => [
      ...prev,
      { id: Date.now(), ...form, title: form.title.trim(), done: false },
    ]);
    setForm({ title: "", course: "", due: "", memo: "" });
  };

  const toggle = (id) =>
    setItems((p) => p.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  const remove = (id) => setItems((p) => p.filter((x) => x.id !== id));

  const view = useMemo(() => {
    const withMeta = items.map((x) => {
      const d = daysUntil(x.due);
      return { ...x, d, st: statusOf(d, x.done) };
    });
    const filtered = withMeta.filter((x) =>
      filter === "active" ? !x.done : filter === "done" ? x.done : true
    );
    // 정렬: 미완료 기한 임박 우선, 기한 없는 건 뒤로
    return filtered.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (a.d === null) return 1;
      if (b.d === null) return -1;
      return a.d - b.d;
    });
  }, [items, filter]);

  const urgent = items.filter((x) => !x.done && daysUntil(x.due) !== null && daysUntil(x.due) <= 2);

  return (
    <div className="wrap">
      <style>{css}</style>

      <header className="head">
        <div className="kicker">SEMESTER · {new Date().getFullYear()}</div>
        <h1>과제 알리미</h1>
        <p className="sub">
          기한이 가까운 과제를 위로 끌어올립니다. 입력한 내용은 이 브라우저에 저장돼요.
        </p>
      </header>

      {urgent.length > 0 && (
        <div className="alert">
          <strong>{urgent.length}건</strong>이 곧 마감입니다 —{" "}
          {urgent.map((u) => u.title).join(", ")}
        </div>
      )}

      <section className="composer">
        <input
          className="big"
          placeholder="무슨 과제인가요?"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <div className="row">
          <input
            placeholder="과목"
            value={form.course}
            onChange={(e) => setForm({ ...form, course: e.target.value })}
          />
          <input
            type="date"
            value={form.due}
            onChange={(e) => setForm({ ...form, due: e.target.value })}
          />
          <input
            placeholder="메모 (선택)"
            value={form.memo}
            onChange={(e) => setForm({ ...form, memo: e.target.value })}
          />
          <button className="add" onClick={add}>
            추가
          </button>
        </div>
      </section>

      <nav className="tabs">
        {[
          ["active", "진행 중"],
          ["done", "완료"],
          ["all", "전체"],
        ].map(([k, l]) => (
          <button
            key={k}
            className={filter === k ? "tab on" : "tab"}
            onClick={() => setFilter(k)}
          >
            {l}
          </button>
        ))}
      </nav>

      <ul className="list">
        {view.length === 0 && (
          <li className="empty">표시할 과제가 없습니다. 위에서 하나 추가해보세요.</li>
        )}
        {view.map((x) => (
          <li key={x.id} className={x.done ? "card done" : "card"}>
            <button
              className="check"
              aria-label="완료 토글"
              onClick={() => toggle(x.id)}
              style={{ borderColor: x.st.tone }}
            >
              {x.done ? "✓" : ""}
            </button>
            <div className="body">
              <div className="title">{x.title}</div>
              <div className="meta">
                {x.course && <span className="chip">{x.course}</span>}
                {x.due && <span className="date">{x.due}</span>}
                {x.memo && <span className="memo">· {x.memo}</span>}
              </div>
            </div>
            <span className="badge" style={{ color: x.st.tone, borderColor: x.st.tone }}>
              {x.st.label}
            </span>
            <button className="del" onClick={() => remove(x.id)} aria-label="삭제">
              ✕
            </button>
          </li>
        ))}
      </ul>

      <footer className="foot">
        총 {items.length}건 · 완료 {items.filter((x) => x.done).length}건
      </footer>
    </div>
  );
}

const css = `
:root{
  --bg:#10131a; --panel:#171b24; --line:#272d3a;
  --ink:#e8ebf2; --muted:#7b8499;
  --ahead:#5b8def; --soon:#f5a623; --over:#ff5d5d; --ok:#3ecf8e;
  --accent:#8b7cff;
}
*{box-sizing:border-box}
.wrap{max-width:720px;margin:0 auto;padding:32px 20px 80px;
  font-family:"Segoe UI",-apple-system,Roboto,"Noto Sans KR",sans-serif;
  color:var(--ink);background:var(--bg);min-height:100vh}
.head{margin-bottom:24px}
.kicker{font-size:12px;letter-spacing:.22em;color:var(--accent);font-weight:700}
.head h1{font-size:38px;margin:6px 0 8px;letter-spacing:-.02em}
.sub{color:var(--muted);margin:0;font-size:14px}
.alert{background:rgba(245,166,35,.12);border:1px solid var(--soon);
  color:#ffd27a;padding:12px 16px;border-radius:12px;margin-bottom:20px;font-size:14px}
.alert strong{color:var(--soon)}
.composer{background:var(--panel);border:1px solid var(--line);
  border-radius:16px;padding:16px;margin-bottom:24px}
.big{width:100%;background:transparent;border:none;color:var(--ink);
  font-size:18px;outline:none;padding:6px 2px;margin-bottom:10px}
.row{display:grid;grid-template-columns:1.2fr 1fr 1.6fr auto;gap:8px}
.row input{background:var(--bg);border:1px solid var(--line);color:var(--ink);
  border-radius:10px;padding:9px 11px;font-size:13px;outline:none;min-width:0}
.row input:focus,.big:focus{border-color:var(--accent)}
.add{background:var(--accent);color:#fff;border:none;border-radius:10px;
  padding:0 18px;font-weight:700;cursor:pointer;font-size:14px}
.add:hover{filter:brightness(1.1)}
.tabs{display:flex;gap:6px;margin-bottom:14px}
.tab{background:transparent;border:1px solid var(--line);color:var(--muted);
  border-radius:999px;padding:6px 16px;cursor:pointer;font-size:13px}
.tab.on{background:var(--ink);color:var(--bg);border-color:var(--ink);font-weight:600}
.list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px}
.empty{color:var(--muted);text-align:center;padding:40px;font-size:14px}
.card{display:flex;align-items:center;gap:12px;background:var(--panel);
  border:1px solid var(--line);border-radius:14px;padding:12px 14px}
.card.done{opacity:.55}
.card.done .title{text-decoration:line-through}
.check{width:24px;height:24px;border-radius:50%;border:2px solid var(--line);
  background:transparent;color:var(--ok);cursor:pointer;flex:none;font-size:13px}
.body{flex:1;min-width:0}
.title{font-size:15px;font-weight:600;margin-bottom:3px}
.meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:12px;color:var(--muted)}
.chip{background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:2px 8px}
.badge{font-size:12px;font-weight:700;border:1px solid;border-radius:999px;
  padding:3px 10px;flex:none}
.del{background:transparent;border:none;color:var(--muted);cursor:pointer;
  font-size:14px;flex:none}
.del:hover{color:var(--over)}
.foot{margin-top:24px;text-align:center;color:var(--muted);font-size:12px}
@media(max-width:560px){.row{grid-template-columns:1fr 1fr}.add{grid-column:1/-1;padding:10px}}
`;
