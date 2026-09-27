"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, BarChart3, Check, ChevronRight, CircleHelp, Download,
  Flame, Leaf, LockKeyhole, Plus, RotateCcw, Settings2, ShieldCheck,
  Sparkles, Timer, Trash2, Upload, X
} from "lucide-react";

type Goal = {
  id: string; label: string; icon: string; accent: string; startedAt: string;
  best: number; checkIns: number; resets: number; active: boolean;
};

type Checkin = { date: string; goalId: string; stayedOnTrack: boolean };

const goalOptions = [
  ["Nicotine","◌","mint"],["Smoking","○","mint"],["Vaping","◇","mint"],
  ["Alcohol","◐","peach"],["Sugar / junk food","✦","peach"],["Doomscrolling","◒","violet"],
  ["Social media","◎","violet"],["Gaming","▣","violet"],["Adult content","◌","lavender"],
  ["Something else","＋","neutral"]
];

const starter: Goal[] = [];

function dateKey(date=new Date()){
  const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,"0"),d=String(date.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
}
function todayKey(){ return dateKey(); }
function daysSince(iso:string){
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
}
function safeGoals(raw:string|null):Goal[]{
  try{
    const parsed=raw?JSON.parse(raw):[];
    return Array.isArray(parsed)?parsed.filter((g:any)=>g&&typeof g.id==="string"&&typeof g.label==="string"&&typeof g.startedAt==="string"):[]; 
  }catch{return []}
}
function safeCheckins(raw:string|null):Checkin[]{
  try{
    const parsed=raw?JSON.parse(raw):[];
    return Array.isArray(parsed)?parsed.filter((c:any)=>c&&typeof c.goalId==="string"&&typeof c.date==="string"&&typeof c.stayedOnTrack==="boolean"):[]; 
  }catch{return []}
}

export default function Home(){
  const [ready,setReady]=useState(false);
  const [goals,setGoals]=useState<Goal[]>(starter);
  const [checkins,setCheckins]=useState<Checkin[]>([]);
  const [selected,setSelected]=useState("");
  const [tab,setTab]=useState<"today"|"progress"|"settings">("today");
  const [onboard,setOnboard]=useState(false);
  const [showAdd,setShowAdd]=useState(false);
  const [showReset,setShowReset]=useState(false);
  const [showTimer,setShowTimer]=useState(false);
  const [timer,setTimer]=useState(600);
  const [message,setMessage]=useState("");
  const [checked,setChecked]=useState(false);
  const [importing,setImporting]=useState(false);

  useEffect(()=>{
    try{
      if ("serviceWorker" in navigator) navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister())).catch(()=>{});
      if ("caches" in window) caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))).catch(()=>{});
      const g=localStorage.getItem("quitify-goals");
      const c=localStorage.getItem("quitify-checkins");
      const savedGoals=safeGoals(g);
      const savedCheckins=safeCheckins(c);
      setGoals(savedGoals);
      setCheckins(savedCheckins);
      if(savedGoals.length) setSelected(savedGoals[0].id); else setOnboard(true);
    }catch{ setOnboard(true); }
    setReady(true);
  },[]);

  useEffect(()=>{ if(ready){try{localStorage.setItem("quitify-goals",JSON.stringify(goals))}catch{flash("Local storage is full; export a backup in Settings.")}} },[goals,ready]);
  useEffect(()=>{ if(ready){try{localStorage.setItem("quitify-checkins",JSON.stringify(checkins))}catch{flash("Local storage is full; export a backup in Settings.")}} },[checkins,ready]);

  const current=goals.find(g=>g.id===selected) ?? goals[0];
  const days=current?daysSince(current.startedAt):0;
  const active=goals.filter(g=>g.active);
  const todayCheckin=checkins.find(c=>c.goalId===current?.id && c.date===todayKey());
  const greeting=useMemo(()=>{const h=new Date().getHours();return h<12?"Good morning":h<18?"Good afternoon":"Good evening"},[]);

  useEffect(()=>{
    const onKeyDown=(e:KeyboardEvent)=>{
      if(e.key==="Escape"){setShowAdd(false);setShowReset(false);setShowTimer(false);setOnboard(false)}
    };
    window.addEventListener("keydown",onKeyDown);
    return ()=>window.removeEventListener("keydown",onKeyDown);
  },[]);

  useEffect(()=>{
    if(!showTimer) return;
    if(timer<=0) return;
    const id=setInterval(()=>setTimer(v=>Math.max(0,v-1)),1000);
    return ()=>clearInterval(id);
  },[showTimer,timer]);

  useEffect(()=>{ setChecked(!!todayCheckin?.stayedOnTrack); },[todayCheckin?.stayedOnTrack,current?.id]);

  function flash(text:string){setMessage(text);setTimeout(()=>setMessage(""),2400)}
  function createGoal(label:string,icon:string,accent:string){
    const id=globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const goal:Goal={id,label,icon,accent,startedAt:new Date().toISOString(),best:0,checkIns:0,resets:0,active:true};
    setGoals(v=>[...v,goal]);setSelected(goal.id);setShowAdd(false);setOnboard(false);flash("Saved only on this device.");
  }
  function toggleCheckin(){
    if(!current)return;
    const date=todayKey();
    setChecked(v=>!v);
    setCheckins(v=>{
      const rest=v.filter(c=>!(c.goalId===current.id&&c.date===date));
      return [...rest,{goalId:current.id,date,stayedOnTrack:!checked}];
    });
    setGoals(v=>v.map(g=>g.id===current.id?{...g,checkIns:g.checkIns+(!checked?1:-1)}:g));
  }
  function resetGoal(){
    if(!current)return;
    setGoals(v=>v.map(g=>g.id===current.id?{...g,startedAt:new Date().toISOString(),best:Math.max(g.best,days),resets:g.resets+1}:g));
    setShowReset(false);setChecked(false);flash("Fresh start. Your best run is still here.");
  }
  function eraseAll(){
    localStorage.removeItem("quitify-goals");localStorage.removeItem("quitify-checkins");
    setGoals([]);setCheckins([]);setSelected("");setOnboard(true);setTab("today");flash("All local QUITify data was cleared.");
  }
  function startTimer(){setTimer(600);setShowTimer(true)}
  const mins=String(Math.floor(timer/60)).padStart(2,"0"), secs=String(timer%60).padStart(2,"0");

  if(!ready)return <main className="page splash"><div className="brand"><div className="brand-mark"><Leaf size={17}/></div>QUITify</div></main>;

  return <main className="page">
    <div className="ambient ambient-a"/><div className="ambient ambient-b"/>

    <nav className="topbar">
      <button className="brand brand-button" onClick={()=>setTab("today")}><div className="brand-mark"><Leaf size={17}/></div><span>QUITify</span></button>
      <div className="privacy-pill"><LockKeyhole size={13}/> Private by default</div>
      <button className="icon-button" aria-label="Settings" onClick={()=>setTab("settings")}><Settings2 size={18}/></button>
    </nav>

    {tab==="today" && <div className="app-body">
      <section className="hero">
        <div className="eyebrow"><Sparkles size={14}/> Your reset, your pace</div>
        <h1>{greeting},<br/><span>keep going.</span></h1>
        <p className="hero-copy">Less noise. More room for the next useful choice.</p>
      </section>

      <section className="goal-strip">
        {active.map(g=><button key={g.id} onClick={()=>setSelected(g.id)} className={`goal-chip ${selected===g.id?"selected":""}`}>
          <span className={`goal-dot ${g.accent}`}>{g.icon}</span><span>{g.label}</span><span className="chip-days">{daysSince(g.startedAt)}d</span>
        </button>)}
        <button className="add-chip" onClick={()=>setShowAdd(true)}><Plus size={17}/> Add</button>
      </section>

      {current && <section className="main-grid">
        <article className="glass-card streak-card">
          <div className="card-top"><div><span className="label">CURRENT RUN</span><h2>{days}<small> days</small></h2></div>
            <div className="ring"><Flame size={18}/><strong>{Math.max(current.best,days)}</strong><span>best</span></div></div>
          <div className="progress-track"><div style={{width:`${Math.min(100,Math.max(7,days*4+8))}%`}}/></div>
          <div className="progress-meta"><span>Today</span><span>{days===0?"Start here":"Momentum is built one day at a time"}</span></div>
          <div className="checkin">
            <div className="check-icon">{checked?<Check size={18}/>:<span/>}</div>
            <div><strong>{checked?"Today is handled":"Check in for today"}</strong><p>{checked?"You showed up for yourself.":"No perfection required. Just notice the choice."}</p></div>
            <button onClick={toggleCheckin} className="tiny-action">{checked?"Undo":"Check in"}</button>
          </div>
        </article>

        <article className="glass-card focus-card"><div className="focus-orb">10</div>
          <div><div className="label">WHEN AN URGE HITS</div><h3>Make the next<br/>10 minutes easier.</h3>
          <p>Pause before acting. Change your surroundings. Give the urge time to move.</p></div>
          <button className="primary-button" onClick={startTimer}><Timer size={17}/> Start a 10-minute reset <ArrowRight size={16}/></button>
        </article>

        <article className="glass-card stats-card">
          <div className="section-heading"><div><span className="label">YOUR PATTERN</span><h3>Progress, not punishment.</h3></div><BarChart3 size={19}/></div>
          <div className="stat-row">
            <div><strong>{current.checkIns}</strong><span>check-ins</span></div><div><strong>{current.best}</strong><span>best run</span></div><div><strong>{current.resets}</strong><span>fresh starts</span></div>
          </div>
          <div className="week">{Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));const key=dateKey(d);const done=checkins.some(c=>c.goalId===current.id&&c.date===key&&c.stayedOnTrack);return <div className="day" key={key}><span>{["S","M","T","W","T","F","S"][d.getDay()]}</span><i className={done?"done":""}>{done?<Check size={11}/>:null}</i></div>})}</div>
        </article>

        <article className="glass-card principle-card"><div className="quote-mark">“</div><p>You don’t need to win forever. You only need to make the next useful choice.</p><span>QUITify principle 01</span></article>
      </section>}

      {!current && <section className="empty-state glass-card"><div className="empty-icon"><Leaf size={22}/></div><span className="label">YOUR SPACE</span><h2>Choose what you want<br/>to change first.</h2><p>Keep it private. Keep it simple. You can add another goal whenever you’re ready.</p><button className="primary-button" onClick={()=>setShowAdd(true)}>Choose a goal <ArrowRight size={16}/></button></section>}

      {current && <section className="footer-actions"><button className="secondary-button" onClick={()=>setShowReset(true)}><RotateCcw size={16}/> Fresh start</button><div className="local-note"><ShieldCheck size={15}/><span>Stored only on this device</span></div></section>}
    </div>}

    {tab==="progress" && <section className="secondary-page">
      <div className="page-heading"><span className="label">REFLECTION</span><h2>Your progress<br/><span>is the data.</span></h2><p>Look back without judging the person who was trying.</p></div>
      {current?<div className="progress-layout"><article className="glass-card big-number"><span className="label">CURRENT RUN</span><strong>{days}</strong><span>days</span><div className="mini-line"><i style={{width:`${Math.min(100,days*4+8)}%`}}/></div></article>
      <article className="glass-card history-card"><span className="label">CHECK-IN HISTORY</span><div className="history-list">{checkins.filter(c=>c.goalId===current.id).slice(-8).reverse().map(c=><div className="history-row" key={c.date}><span>{new Date(c.date+"T12:00:00").toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})}</span><b className={c.stayedOnTrack?"positive":"neutral"}>{c.stayedOnTrack?"Stayed on track":"Logged"}</b></div>)}{!checkins.filter(c=>c.goalId===current.id).length&&<p className="muted">Your check-ins will appear here.</p>}</div></article></div>
      :<div className="glass-card empty-state"><h2>Nothing to measure yet.</h2><p>Choose a goal first and QUITify will keep the useful history locally.</p></div>}
    </section>}

    {tab==="settings" && <section className="secondary-page">
      <div className="page-heading"><span className="label">SETTINGS</span><h2>Your data,<br/><span>your control.</span></h2><p>QUITify doesn't require an account or a cloud database.</p></div>
      <div className="settings-list glass-card">
        <div className="setting-row"><div className="setting-icon"><ShieldCheck size={17}/></div><div><strong>Local-only storage</strong><p>Your goals and check-ins stay in this browser. Nothing here requires an account.</p></div><span className="status-dot"/></div>
        <div className="setting-row"><div className="setting-icon"><Download size={17}/></div><div><strong>Back up your data</strong><p>Export your goals and check-ins as a small JSON file. The backup stays under your control.</p></div><button className="setting-action" onClick={exportData}>Export</button></div>
        <div className="setting-row"><div className="setting-icon"><Upload size={17}/></div><div><strong>Restore a backup</strong><p>Import a QUITify JSON backup on this device. Existing local data will be replaced.</p></div><label className="setting-action">{importing?"Reading…":"Import"}<input type="file" accept="application/json,.json" hidden disabled={importing} onChange={e=>{const file=e.target.files?.[0];if(file) importData(file);e.currentTarget.value=""}}/></label></div>
        <div className="setting-row"><div className="setting-icon"><CircleHelp size={17}/></div><div><strong>Safety note</strong><p>For alcohol or other dependence, withdrawal can require medical support. QUITify is not medical treatment.</p></div></div>
        <button className="danger-row" onClick={eraseAll}><Trash2 size={17}/><span><strong>Clear all local data</strong><small>This cannot be undone.</small></span><ChevronRight size={16}/></button>
      </div>
    </section>}

    <div className="bottom-nav">
      <button className={tab==="today"?"active":""} onClick={()=>setTab("today")}><Leaf size={17}/><span>Today</span></button>
      <button className={tab==="progress"?"active":""} onClick={()=>setTab("progress")}><BarChart3 size={17}/><span>Progress</span></button>
      <button className={tab==="settings"?"active":""} onClick={()=>setTab("settings")}><Settings2 size={17}/><span>Settings</span></button>
    </div>

    {message&&<div className="toast"><Check size={15}/>{message}</div>}

    {showAdd&&<div className="modal-backdrop" onClick={()=>setShowAdd(false)}><div className="modal glass-card" onClick={e=>e.stopPropagation()}>
      <button className="close" onClick={()=>setShowAdd(false)}><X size={18}/></button><span className="label">NEW GOAL</span><h2>What are you changing?</h2><p>Choose one. You can add another later.</p>
      <div className="option-grid">{goalOptions.map(([label,icon,accent])=><button key={label} onClick={()=>createGoal(label,icon,accent)}><span><i className={`option-icon ${accent}`}>{icon}</i>{label}</span><ChevronRight size={15}/></button>)}</div>
    </div></div>}

    {showReset&&<div className="modal-backdrop" onClick={()=>setShowReset(false)}><div className="modal glass-card" onClick={e=>e.stopPropagation()}>
      <button className="close" onClick={()=>setShowReset(false)}><X size={18}/></button><span className="label">NO SHAME</span><h2>Start a fresh run?</h2><p>Your previous best stays saved. A reset is information, not failure.</p>
      <div className="modal-actions"><button className="secondary-button" onClick={()=>setShowReset(false)}>Keep going</button><button className="primary-button" onClick={resetGoal}>Fresh start <ArrowRight size={16}/></button></div>
    </div></div>}

    {showTimer&&<div className="modal-backdrop"><div className="timer-modal glass-card">
      <button className="close" onClick={()=>setShowTimer(false)}><X size={18}/></button><span className="label">TEN MINUTE RESET</span>
      <div className="timer-orbit"><span>{mins}:{secs}</span><small>{timer===0?"Time is yours again.":"Breathe. Notice. Wait."}</small></div>
      <div className="timer-steps"><div><b>01</b><span>Put a little distance between you and the trigger.</span></div><div><b>02</b><span>Change rooms, posture, or what you're looking at.</span></div><div><b>03</b><span>When the timer ends, choose your next step.</span></div></div>
      <button className="primary-button full" onClick={()=>{setShowTimer(false);flash("You made space before making a choice.")}}>{timer===0?"Finish reset":"I'm ready to move on"} <ArrowRight size={16}/></button>
    </div></div>}

    {onboard&&<div className="modal-backdrop"><div className="onboarding glass-card">
      <div className="onboard-mark"><Leaf size={23}/></div><span className="label">WELCOME TO QUITIFY</span><h2>Make room<br/>for your life.</h2><p>No account. No public profile. No noisy feed. Just a private place to work on one change at a time.</p>
      <button className="primary-button full" onClick={()=>{setOnboard(false);setShowAdd(true)}}>Choose my first goal <ArrowRight size={16}/></button>
      <small>QUITify is a self-guided design case study, not medical treatment.</small>
    </div></div>}
  </main>;
}
