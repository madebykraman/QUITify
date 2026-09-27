"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowRight, Check, ChevronRight, CircleHelp, Clock3, Download,
  Fingerprint, LockKeyhole, Pause, Plus, RotateCcw, Settings2, ShieldCheck,
  Target, Trash2, Upload, X
} from "lucide-react";

type Goal = {
  id: string;
  label: string;
  icon: string;
  accent: string;
  startedAt: string;
  best: number;
  checkIns: number;
  resets: number;
  active: boolean;
  reason?: string;
};

type Checkin = { date: string; goalId: string; stayedOnTrack: boolean };
type Setup = { reason: string; intention: string };

const goalOptions = [
  ["Nicotine", "N", "green"], ["Smoking", "S", "green"], ["Vaping", "V", "green"],
  ["Alcohol", "A", "sand"], ["Sugar / junk food", "S", "sand"],
  ["Doomscrolling", "D", "violet"], ["Social media", "S", "violet"],
  ["Gaming", "G", "violet"], ["Adult content", "A", "plum"], ["Something else", "•", "neutral"]
];

const reasonOptions = ["More focus", "More time", "Better sleep", "More money", "My relationships", "My own reason"];
const intentionOptions = [
  ["steady", "Keep today simple"], ["clear", "Make the next choice easier"], ["private", "Do this quietly, for me"]
];

function dateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysSince(iso: string) {
  const start = new Date(iso), now = new Date();
  const a = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.max(0, Math.round((b - a) / 86400000));
}

function safeGoals(raw: string | null): Goal[] {
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((g: any) => g && typeof g.id === "string" && typeof g.label === "string" && typeof g.startedAt === "string")
      .map((g: any) => ({
        id: g.id, label: g.label, icon: typeof g.icon === "string" ? g.icon : "•",
        accent: typeof g.accent === "string" ? g.accent : "neutral", startedAt: g.startedAt,
        best: Number.isFinite(g.best) ? Math.max(0, Math.floor(g.best)) : 0,
        checkIns: Number.isFinite(g.checkIns) ? Math.max(0, Math.floor(g.checkIns)) : 0,
        resets: Number.isFinite(g.resets) ? Math.max(0, Math.floor(g.resets)) : 0,
        active: g.active !== false, reason: typeof g.reason === "string" ? g.reason : ""
      }));
  } catch { return []; }
}

function safeCheckins(raw: string | null): Checkin[] {
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((c: any) =>
      c && typeof c.goalId === "string" && typeof c.date === "string" && typeof c.stayedOnTrack === "boolean"
    ) : [];
  } catch { return []; }
}

function safeSetup(raw: string | null): Setup {
  try {
    const parsed = raw ? JSON.parse(raw) : {};
    return { reason: typeof parsed.reason === "string" ? parsed.reason : "", intention: typeof parsed.intention === "string" ? parsed.intention : "steady" };
  } catch { return { reason: "", intention: "steady" }; }
}

export default function Home() {
  const [ready, setReady] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [setup, setSetup] = useState<Setup>({ reason: "", intention: "steady" });
  const [selected, setSelected] = useState("");
  const [tab, setTab] = useState<"today" | "progress" | "settings">("today");
  const [onboard, setOnboard] = useState(false);
  const [onboardStep, setOnboardStep] = useState(0);
  const [onboardGoal, setOnboardGoal] = useState<(typeof goalOptions)[number] | null>(null);
  const [onboardReason, setOnboardReason] = useState("");
  const [showGoals, setShowGoals] = useState(false);
  const [showPause, setShowPause] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [timer, setTimer] = useState(600);
  const [checked, setChecked] = useState(false);
  const [message, setMessage] = useState("");
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    try {
      if ("serviceWorker" in navigator) navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister())).catch(() => {});
      if ("caches" in window) caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).catch(() => {});
      const gs = safeGoals(localStorage.getItem("quitify-goals"));
      const cs = safeCheckins(localStorage.getItem("quitify-checkins"));
      const sp = safeSetup(localStorage.getItem("quitify-setup"));
      setGoals(gs); setCheckins(cs); setSetup(sp);
      if (gs.length) setSelected(gs[0].id); else setOnboard(true);
    } catch { setOnboard(true); }
    setReady(true);
  }, []);

  useEffect(() => { if (ready) try { localStorage.setItem("quitify-goals", JSON.stringify(goals)); } catch { flash("Local storage is full. Export a backup."); } }, [goals, ready]);
  useEffect(() => { if (ready) try { localStorage.setItem("quitify-checkins", JSON.stringify(checkins)); } catch { flash("Local storage is full. Export a backup."); } }, [checkins, ready]);
  useEffect(() => { if (ready) try { localStorage.setItem("quitify-setup", JSON.stringify(setup)); } catch {} }, [setup, ready]);

  const current = goals.find(g => g.id === selected) ?? goals[0];
  const active = goals.filter(g => g.active);
  const days = current ? daysSince(current.startedAt) : 0;
  const goalCheckins = current ? checkins.filter(c => c.goalId === current.id) : [];
  const todayCheckin = checkins.find(c => c.goalId === current?.id && c.date === dateKey());
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i)); return dateKey(d);
  });
  const last14OnTrack = last14.filter(k => goalCheckins.some(c => c.date === k && c.stayedOnTrack)).length;
  const consistency = Math.round((last14OnTrack / 14) * 100);
  const nextMilestone = days < 7 ? 7 : days < 14 ? 14 : days < 30 ? 30 : days < 60 ? 60 : 90;
  const milestoneProgress = Math.min(100, Math.round((days / nextMilestone) * 100));
  const dateLabel = useMemo(() => new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date()), []);
  const intention = intentionOptions.find(x => x[0] === setup.intention)?.[1] ?? "Keep today simple";

  useEffect(() => { setChecked(!!todayCheckin?.stayedOnTrack); }, [todayCheckin?.stayedOnTrack, current?.id]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setShowGoals(false); setShowPause(false); setShowReset(false); }
    };
    window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    if (!showPause || timer <= 0) return;
    const id = setInterval(() => setTimer(v => Math.max(0, v - 1)), 1000);
    return () => clearInterval(id);
  }, [showPause, timer]);

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2300);
  }

  function makeGoal(label: string, icon: string, accent: string, reason = "") {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const goal: Goal = { id, label, icon, accent, startedAt: new Date().toISOString(), best: 0, checkIns: 0, resets: 0, active: true, reason };
    setGoals(v => [...v, goal]); setSelected(id); setShowGoals(false); setOnboard(false); setTab("today");
    flash("Your space is ready.");
  }

  function finishOnboarding() {
    if (!onboardGoal) return;
    const [label, icon, accent] = onboardGoal;
    setSetup({ reason: onboardReason, intention: setup.intention });
    makeGoal(label, icon, accent, onboardReason);
  }

  function toggleCheckin() {
    if (!current) return;
    const date = dateKey(), next = !checked;
    setChecked(next);
    setCheckins(v => [...v.filter(c => !(c.goalId === current.id && c.date === date)), { goalId: current.id, date, stayedOnTrack: next }]);
    setGoals(v => v.map(g => g.id === current.id ? { ...g, checkIns: Math.max(0, g.checkIns + (next ? 1 : -1)) } : g));
    flash(next ? "Today is recorded." : "Today's check-in was removed.");
  }

  function resetGoal() {
    if (!current) return;
    const hadToday = !!todayCheckin?.stayedOnTrack;
    setGoals(v => v.map(g => g.id === current.id ? {
      ...g, startedAt: new Date().toISOString(), best: Math.max(g.best, days),
      checkIns: Math.max(0, g.checkIns - (hadToday ? 1 : 0)), resets: g.resets + 1
    } : g));
    setCheckins(v => v.filter(c => !(c.goalId === current.id && c.date === dateKey())));
    setShowReset(false); setChecked(false); flash("New starting point saved.");
  }

  function exportData() {
    const payload = { version: 2, exportedAt: new Date().toISOString(), setup, goals, checkins };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob), link = document.createElement("a");
    link.href = url; link.download = "quitify-backup.json"; link.click(); URL.revokeObjectURL(url); flash("Backup exported.");
  }

  async function importData(file: File) {
    setImporting(true);
    try {
      const parsed = JSON.parse(await file.text());
      const importedGoals = safeGoals(JSON.stringify(parsed?.goals));
      const importedCheckins = safeCheckins(JSON.stringify(parsed?.checkins));
      if (![1, 2].includes(parsed?.version) || !importedGoals.length) throw new Error("Invalid");
      const ids = new Set(importedGoals.map(g => g.id));
      setGoals(importedGoals); setCheckins(importedCheckins.filter(c => ids.has(c.goalId)));
      setSetup(safeSetup(JSON.stringify(parsed?.setup))); setSelected(importedGoals[0].id);
      setOnboard(false); setTab("today"); flash("Backup restored.");
    } catch { flash("That file is not a valid QUITify backup."); }
    finally { setImporting(false); }
  }

  function eraseAll() {
    localStorage.removeItem("quitify-goals"); localStorage.removeItem("quitify-checkins"); localStorage.removeItem("quitify-setup");
    setGoals([]); setCheckins([]); setSelected(""); setOnboard(true); setOnboardStep(0); setTab("today"); flash("Local data cleared.");
  }

  function beginPause() { setTimer(600); setShowPause(true); }
  const mins = String(Math.floor(timer / 60)).padStart(2, "0");
  const secs = String(timer % 60).padStart(2, "0");

  if (!ready) return <main className="page loading"><div className="wordmark"><span className="qmark">Q</span><b>QUITify</b></div></main>;

  return (
    <main className="page">
      <header className="topbar">
        <button className="wordmark" onClick={() => setTab("today")} aria-label="Go to Today"><span className="qmark">Q</span><b>QUITify</b></button>
        <div className="top-meta"><Fingerprint size={15} /><span>Only you can see this</span></div>
        <button className="top-icon" onClick={() => setTab("settings")} aria-label="Settings"><Settings2 size={19} /></button>
      </header>

      {tab === "today" && (
        <section className="screen today-screen">
          <div className="screen-intro">
            <div><span className="micro">{dateLabel}</span><h1>Make room<br />for today.</h1></div>
            <div className="intention-chip"><span className="live-dot" />{intention}</div>
          </div>

          {active.length > 0 && (
            <div className="goal-switcher">
              {active.map(g => <button key={g.id} className={g.id === current?.id ? "chosen" : ""} onClick={() => setSelected(g.id)}>
                <span className={`goal-symbol ${g.accent}`}>{g.icon}</span><span>{g.label}</span>
              </button>)}
              <button className="add-goal" onClick={() => setShowGoals(true)}><Plus size={16} /> New</button>
            </div>
          )}

          {current ? (
            <>
              <section className="command-grid">
                <div className="run-card">
                  <div className="run-orbit" style={{ "--progress": `${Math.min(100, Math.max(7, milestoneProgress))}%` } as React.CSSProperties}>
                    <div className="orbit-core"><span>current run</span><strong>{days}</strong><small>days</small></div>
                  </div>
                  <div className="run-copy"><span className="micro">THE RUN</span><h2>{days === 0 ? "Today is day one." : days === 1 ? "One day at a time." : "Keep the next choice simple."}</h2><p>{nextMilestone} day milestone · {Math.max(current.best, days)} day best</p></div>
                </div>

                <div className="choice-card">
                  <div className="choice-heading"><span className="micro">RIGHT NOW</span><Target size={18} /></div>
                  <h2>How is this moment going?</h2>
                  <p>You don't need to solve the whole habit. Just record this moment.</p>
                  <button className={`check-action ${checked ? "checked" : ""}`} onClick={toggleCheckin}>
                    <span>{checked ? <Check size={21} /> : <span className="empty-check" />}</span>
                    <span><b>{checked ? "I'm on track today" : "I'm on track today"}</b><small>{checked ? "Recorded · tap to undo" : "One tap. No score."}</small></span>
                    <ChevronRight size={17} />
                  </button>
                  <button className="pause-action" onClick={beginPause}><Pause size={15} /> I need a little space</button>
                </div>
              </section>

              <section className="pattern-section">
                <div className="section-line"><div><span className="micro">THE PATTERN</span><h2>Last 14 days</h2></div><span>{consistency}% recorded</span></div>
                <div className="pattern-grid">
                  {last14.map((key, i) => {
                    const d = new Date(); d.setDate(d.getDate() - (13 - i));
                    const done = goalCheckins.some(c => c.date === key && c.stayedOnTrack);
                    const today = key === dateKey();
                    return <div key={key} className={`pattern-cell ${done ? "done" : ""} ${today ? "today" : ""}`} title={key}>
                      <span>{["S","M","T","W","T","F","S"][d.getDay()]}</span><i>{done && <Check size={11} />}</i><small>{d.getDate()}</small>
                    </div>;
                  })}
                </div>
              </section>

              <section className="lower-grid">
                <div className="reason-card"><span className="micro">YOUR REASON</span><h3>{current.reason || "You chose to make room."}</h3><p>{current.reason ? "Keep this close when the moment gets noisy." : "You can add a reason later in a new goal."}</p></div>
                <div className="fresh-card"><div><span className="micro">RESET WITHOUT ERASING</span><h3>Need a new starting point?</h3><p>Your history and best stay intact.</p></div><button onClick={() => setShowReset(true)} aria-label="Start a fresh run"><RotateCcw size={17} /></button></div>
              </section>
            </>
          ) : (
            <section className="empty-focus"><span className="empty-number">01</span><h2>Start with one thing.</h2><p>QUITify is deliberately quiet. Choose one change and the rest of the interface will organize itself around today.</p><button className="primary-action" onClick={() => setShowGoals(true)}>Choose your focus <ArrowRight size={17} /></button></section>
          )}
        </section>
      )}

      {tab === "progress" && (
        <section className="screen secondary-screen">
          <div className="screen-intro"><div><span className="micro">REFLECTION</span><h1>See what<br />is changing.</h1></div><Activity size={26} /></div>
          {current ? (
            <div className="reflection-layout">
              <section className="big-stat"><span className="micro">CURRENT RUN</span><strong>{days}<small> days</small></strong><div className="milestone-track"><i style={{ width: `${milestoneProgress}%` }} /></div><div><span>{milestoneProgress}% toward {nextMilestone} days</span><span>best {Math.max(current.best, days)}</span></div></section>
              <section className="small-stat"><span className="micro">LAST 14 DAYS</span><strong>{consistency}%</strong><p>days recorded</p></section>
              <section className="small-stat"><span className="micro">TOTAL CHECK-INS</span><strong>{goalCheckins.length}</strong><p>moments captured</p></section>
              <section className="history-block"><div className="section-line"><div><span className="micro">RECENT HISTORY</span><h2>What you recorded</h2></div></div>{goalCheckins.length ? goalCheckins.slice(-10).reverse().map(c => <div className="history-item" key={c.date}><span>{new Date(c.date + "T12:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span><b>{c.stayedOnTrack ? "On track" : "Logged"}</b></div>) : <p className="quiet">Your first check-in will appear here.</p>}</section>
            </div>
          ) : <section className="empty-focus"><h2>Nothing to reflect on yet.</h2><p>Choose a focus first. Your history will grow from there.</p><button className="primary-action" onClick={() => setShowGoals(true)}>Choose your focus <ArrowRight size={17} /></button></section>}
        </section>
      )}

      {tab === "settings" && (
        <section className="screen secondary-screen">
          <div className="screen-intro"><div><span className="micro">CONTROL</span><h1>Keep it<br />in your hands.</h1></div><LockKeyhole size={26} /></div>
          <div className="control-list">
            <div className="control-row"><span className="control-icon"><ShieldCheck size={17} /></span><div><b>Local-only data</b><p>Your goals and check-ins live in this browser. No account is required.</p></div><span className="secure-label">LOCAL</span></div>
            <div className="control-row"><span className="control-icon"><Download size={17} /></span><div><b>Export a backup</b><p>Save a JSON copy that you control.</p></div><button onClick={exportData}>Export</button></div>
            <label className="control-row"><span className="control-icon"><Upload size={17} /></span><div><b>Restore a backup</b><p>Replace this browser's data with a QUITify backup.</p></div><button>{importing ? "Reading…" : "Import"}<input type="file" accept="application/json,.json" hidden disabled={importing} onChange={e => { const f = e.target.files?.[0]; if (f) importData(f); e.currentTarget.value = ""; }} /></button></label>
            <div className="control-row"><span className="control-icon"><CircleHelp size={17} /></span><div><b>Safety note</b><p>QUITify is a self-guided design case study, not medical treatment. Some forms of dependence can require professional support.</p></div></div>
            <button className="erase-row" onClick={eraseAll}><Trash2 size={17} /><span><b>Clear local data</b><small>This removes goals, check-ins, and setup from this browser.</small></span><ChevronRight size={17} /></button>
          </div>
        </section>
      )}

      <nav className="dock" aria-label="Main navigation">
        <button className={tab === "today" ? "active" : ""} onClick={() => setTab("today")}><span>01</span>Today</button>
        <button className={tab === "progress" ? "active" : ""} onClick={() => setTab("progress")}><span>02</span>Reflect</button>
        <button className={tab === "settings" ? "active" : ""} onClick={() => setTab("settings")}><span>03</span>Control</button>
      </nav>

      {message && <div className="toast"><Check size={15} />{message}</div>}

      {onboard && (
        <div className="onboarding">
          <div className="onboard-shell">
            <header><button className="wordmark light" onClick={() => { if (onboardStep > 0) setOnboardStep(v => v - 1); }}><span className="qmark">Q</span><b>QUITify</b></button><span>{String(onboardStep + 1).padStart(2, "0")} / 03</span></header>
            {onboardStep === 0 && <div className="onboard-step"><span className="micro light-text">A QUIET START</span><h2>Make room<br />for your life.</h2><p>No account. No feed. No performance. Just a private place to work on one change.</p><button className="light-action" onClick={() => setOnboardStep(1)}>Begin <ArrowRight size={17} /></button></div>}
            {onboardStep === 1 && <div className="onboard-step"><span className="micro light-text">01 · YOUR FOCUS</span><h2>What are you<br />making room for?</h2><div className="choice-grid">{goalOptions.map(g => <button key={g[0]} className={onboardGoal?.[0] === g[0] ? "picked" : ""} onClick={() => setOnboardGoal(g)}><span>{g[1]}</span>{g[0]}</button>)}</div><button className="light-action" disabled={!onboardGoal} onClick={() => setOnboardStep(2)}>Continue <ArrowRight size={17} /></button></div>}
            {onboardStep === 2 && <div className="onboard-step"><span className="micro light-text">02 · YOUR REASON</span><h2>Give today<br />a reason.</h2><div className="reason-grid">{reasonOptions.map(r => <button className={onboardReason === r ? "picked" : ""} key={r} onClick={() => setOnboardReason(r)}>{r}</button>)}</div><span className="micro light-text intention-label">YOUR MODE</span><div className="mode-row">{intentionOptions.map(i => <button className={setup.intention === i[0] ? "picked" : ""} key={i[0]} onClick={() => setSetup(v => ({ ...v, intention: i[0] }))}>{i[1]}</button>)}</div><button className="light-action" onClick={finishOnboarding}>Enter QUITify <ArrowRight size={17} /></button><button className="skip" onClick={finishOnboarding}>Skip the reason</button></div>}
          </div>
        </div>
      )}

      {showGoals && <div className="overlay" onClick={() => setShowGoals(false)}><section className="goal-picker" onClick={e => e.stopPropagation()}><header><div><span className="micro">CHOOSE A FOCUS</span><h2>What comes next?</h2></div><button onClick={() => setShowGoals(false)} aria-label="Close"><X size={18} /></button></header><div className="picker-grid">{goalOptions.map(g => <button key={g[0]} onClick={() => makeGoal(g[0], g[1], g[2])}><span className={`goal-symbol ${g[2]}`}>{g[1]}</span><span>{g[0]}</span><ChevronRight size={16} /></button>)}</div></section></div>}

      {showPause && <div className="overlay" onClick={() => setShowPause(false)}><section className="pause-room" onClick={e => e.stopPropagation()}><header><div><span className="micro">A LITTLE SPACE</span><h2>Nothing to solve<br />for ten minutes.</h2></div><button onClick={() => setShowPause(false)} aria-label="Close"><X size={18} /></button></header><div className="timer-face"><Clock3 size={20} /><strong>{mins}:{secs}</strong><span>{timer === 0 ? "Time is up. Choose what feels useful now." : "Let the moment become a little less immediate."}</span></div><div className="pause-notes"><div><b>Change the scene</b><span>Stand up, move rooms, or put a little distance between you and the trigger.</span></div><div><b>Do one ordinary thing</b><span>Drink water, wash your face, stretch, or return to what you were doing.</span></div></div><button className="primary-action wide" onClick={() => setShowPause(false)}>I'm ready <ArrowRight size={17} /></button></section></div>}

      {showReset && <div className="overlay" onClick={() => setShowReset(false)}><section className="reset-room" onClick={e => e.stopPropagation()}><span className="micro">NEW STARTING POINT</span><h2>Start again without deleting what you learned.</h2><p>Your best and history stay. Only the current run starts over.</p><div><button className="quiet-button" onClick={() => setShowReset(false)}>Keep this run</button><button className="primary-action" onClick={resetGoal}>Start fresh <RotateCcw size={16} /></button></div></section></div>}
    </main>
  );
}
