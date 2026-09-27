"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, Check, ChevronRight, Flame, Leaf, LockKeyhole, MoreHorizontal,
  Plus, RotateCcw, ShieldCheck, Sparkles, Timer, TrendingUp, X
} from "lucide-react";

type Goal = {
  id: string;
  label: string;
  icon: string;
  accent: string;
  active: boolean;
  startedAt: string;
  checkIns: number;
  best: number;
};

const starterGoals: Goal[] = [
  { id:"nicotine", label:"Nicotine", icon:"◌", accent:"mint", active:true, startedAt:new Date().toISOString(), checkIns:3, best:7 },
  { id:"scrolling", label:"Doomscrolling", icon:"◒", accent:"violet", active:true, startedAt:new Date().toISOString(), checkIns:5, best:12 },
  { id:"junk", label:"Junk food", icon:"✦", accent:"peach", active:false, startedAt:new Date().toISOString(), checkIns:0, best:0 },
];

const options = ["Nicotine", "Alcohol", "Sugar / junk food", "Doomscrolling", "Social media", "Gaming", "Adult content", "Something else"];

function daysSince(iso:string) {
  const start = new Date(iso).getTime();
  return Math.max(0, Math.floor((Date.now() - start) / 86400000));
}

export default function Home() {
  const [goals, setGoals] = useState<Goal[]>(starterGoals);
  const [selected, setSelected] = useState("nicotine");
  const [showAdd, setShowAdd] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [message, setMessage] = useState("");
  const [checkedToday, setCheckedToday] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("quitify-goals");
    if (saved) setGoals(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("quitify-goals", JSON.stringify(goals));
  }, [goals]);

  const activeGoals = goals.filter(g => g.active);
  const current = goals.find(g => g.id === selected) ?? goals[0];
  const days = current ? daysSince(current.startedAt) : 0;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  }, []);

  function addGoal(label:string) {
    const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();
    const goal:Goal = { id, label, icon:"✦", accent:"violet", active:true, startedAt:new Date().toISOString(), checkIns:0, best:0 };
    setGoals(prev => [...prev, goal]);
    setSelected(id);
    setShowAdd(false);
    setMessage("New goal added locally.");
    setTimeout(() => setMessage(""), 2200);
  }

  function resetCurrent() {
    if (!current) return;
    setGoals(prev => prev.map(g => g.id === current.id ? { ...g, startedAt:new Date().toISOString(), best:Math.max(g.best, days) } : g));
    setShowReset(false);
    setCheckedToday(false);
    setMessage("Fresh start. Nothing was lost.");
    setTimeout(() => setMessage(""), 2200);
  }

  return (
    <main className="page">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />

      <nav className="topbar">
        <div className="brand">
          <div className="brand-mark"><Leaf size={17} strokeWidth={2.6}/></div>
          <span>QUITify</span>
        </div>
        <div className="privacy-pill"><LockKeyhole size={13}/> Private by default</div>
        <button className="icon-button" aria-label="More"><MoreHorizontal size={20}/></button>
      </nav>

      <section className="hero">
        <div className="eyebrow"><Sparkles size={14}/> Your reset, your pace</div>
        <h1>{greeting},<br/><span>keep going.</span></h1>
        <p className="hero-copy">Small choices compound. QUITify keeps the noise out and the next step close.</p>
      </section>

      <section className="goal-strip">
        {activeGoals.map(goal => (
          <button key={goal.id} onClick={() => setSelected(goal.id)} className={`goal-chip ${selected === goal.id ? "selected" : ""}`}>
            <span className={`goal-dot ${goal.accent}`}>{goal.icon}</span>
            <span>{goal.label}</span>
            <span className="chip-days">{daysSince(goal.startedAt)}d</span>
          </button>
        ))}
        <button className="add-chip" onClick={() => setShowAdd(true)}><Plus size={17}/> Add</button>
      </section>

      {current && (
        <section className="main-grid">
          <article className="glass-card streak-card">
            <div className="card-top">
              <div>
                <span className="label">CURRENT RUN</span>
                <h2>{days}<small> days</small></h2>
              </div>
              <div className="ring"><Flame size={18}/><strong>{Math.max(current.best, days)}</strong><span>best</span></div>
            </div>

            <div className="progress-track"><div style={{width:`${Math.min(100, Math.max(10, days * 5 + 12))}%`}}/></div>
            <div className="progress-meta"><span>Today</span><span>{days === 0 ? "Start here" : "You’re building momentum"}</span></div>

            <div className="checkin">
              <div className="check-icon">{checkedToday ? <Check size={18}/> : <span/>}</div>
              <div><strong>Today is handled</strong><p>No perfection required. Just notice the choice.</p></div>
              <button onClick={() => setCheckedToday(v=>!v)} className="tiny-action">{checkedToday ? "Undo" : "Check in"}</button>
            </div>
          </article>

          <article className="glass-card focus-card">
            <div className="label">WHEN AN URGE HITS</div>
            <h3>Make the next<br/>10 minutes easier.</h3>
            <p>Pause. Change your environment. Let the intensity pass before deciding what to do next.</p>
            <button className="primary-button" onClick={() => setMessage("10-minute reset started. One minute at a time.")}>
              <Timer size={17}/> Start a 10-minute reset <ArrowRight size={16}/>
            </button>
          </article>

          <article className="glass-card stats-card">
            <div className="section-heading"><div><span className="label">YOUR PATTERN</span><h3>Progress, not punishment.</h3></div><TrendingUp size={19}/></div>
            <div className="stat-row">
              <div><strong>{current.checkIns + (checkedToday ? 1 : 0)}</strong><span>check-ins</span></div>
              <div><strong>{current.best}</strong><span>best run</span></div>
              <div><strong>{Math.max(0, 7 - days)}</strong><span>to 7 days</span></div>
            </div>
            <div className="week">
              {[1,1,1,1,0,1,checkedToday?1:0].map((v,i)=><div key={i} className={`day ${v ? "done" : ""}`}><span>{["M","T","W","T","F","S","S"][i]}</span><i>{v ? <Check size={11}/> : ""}</i></div>)}
            </div>
          </article>

          <article className="glass-card principle-card">
            <div className="quote-mark">“</div>
            <p>You don’t need to win forever. You only need to make the next useful choice.</p>
            <span>QUITify principle 01</span>
          </article>
        </section>
      )}

      <section className="footer-actions">
        <button className="secondary-button" onClick={() => setShowReset(true)}><RotateCcw size={16}/> Reset today</button>
        <div className="local-note"><ShieldCheck size={15}/><span>Stored only on this device</span></div>
      </section>

      {message && <div className="toast"><Check size={15}/>{message}</div>}

      {showAdd && (
        <div className="modal-backdrop" onClick={()=>setShowAdd(false)}>
          <div className="modal glass-card" onClick={e=>e.stopPropagation()}>
            <button className="close" onClick={()=>setShowAdd(false)}><X size={18}/></button>
            <span className="label">NEW GOAL</span>
            <h2>What are you changing?</h2>
            <p>Choose one. You can add more later.</p>
            <div className="option-grid">{options.map(o=><button key={o} onClick={()=>addGoal(o)}>{o}<ChevronRight size={15}/></button>)}</div>
          </div>
        </div>
      )}

      {showReset && (
        <div className="modal-backdrop" onClick={()=>setShowReset(false)}>
          <div className="modal glass-card" onClick={e=>e.stopPropagation()}>
            <button className="close" onClick={()=>setShowReset(false)}><X size={18}/></button>
            <span className="label">NO SHAME</span>
            <h2>Start a fresh run?</h2>
            <p>Your previous best stays saved. A reset is information, not failure.</p>
            <div className="modal-actions"><button className="secondary-button" onClick={()=>setShowReset(false)}>Keep going</button><button className="primary-button" onClick={resetCurrent}>Fresh start <ArrowRight size={16}/></button></div>
          </div>
        </div>
      )}
    </main>
  );
}
