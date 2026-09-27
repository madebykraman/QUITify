"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, BarChart3, Check, ChevronRight, CircleHelp, Download,
  LockKeyhole, Plus, RotateCcw, Settings2, ShieldCheck, Timer, Trash2,
  Upload, X
} from "lucide-react";

type Goal = {
  id: string; label: string; icon: string; accent: string; startedAt: string;
  best: number; checkIns: number; resets: number; active: boolean;
};
type Checkin = { date: string; goalId: string; stayedOnTrack: boolean };

const goalOptions = [
  ["Nicotine","N","mint"],["Smoking","S","mint"],["Vaping","V","mint"],
  ["Alcohol","A","peach"],["Sugar / junk food","S","peach"],["Doomscrolling","D","violet"],
  ["Social media","S","violet"],["Gaming","G","violet"],["Adult content","A","lavender"],
  ["Something else","•","neutral"]
];

function dateKey(date=new Date()){
  const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,"0"),d=String(date.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
}
function todayKey(){return dateKey();}
function daysSince(iso:string){
  const start=new Date(iso), now=new Date();
  const a=new Date(start.getFullYear(),start.getMonth(),start.getDate()).getTime();
  const b=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime();
  return Math.max(0,Math.round((b-a)/86400000));
}
function safeGoals(raw:string|null):Goal[]{
  try{
    const parsed=raw?JSON.parse(raw):[];
    if(!Array.isArray(parsed)) return [];
    return parsed.filter((g:any)=>g&&typeof g.id==="string"&&typeof g.label==="string"&&typeof g.startedAt==="string")
      .map((g:any)=>({
        id:g.id,label:g.label,icon:typeof g.icon==="string"?g.icon:"•",
        accent:typeof g.accent==="string"?g.accent:"neutral",startedAt:g.startedAt,
        best:Number.isFinite(g.best)?Math.max(0,Math.floor(g.best)):0,
        checkIns:Number.isFinite(g.checkIns)?Math.max(0,Math.floor(g.checkIns)):0,
        resets:Number.isFinite(g.resets)?Math.max(0,Math.floor(g.resets)):0,
        active:g.active!==false
      }));
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
  const [goals,setGoals]=useState<Goal[]>([]);
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
      if("serviceWorker" in navigator) navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister())).catch(()=>{});
      if("caches" in window) caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))).catch(()=>{});
      const savedGoals=safeGoals(localStorage.getItem("quitify-goals"));
      const savedCheckins=safeCheckins(localStorage.getItem("quitify-checkins"));
      setGoals(savedGoals);setCheckins(savedCheckins);
      if(savedGoals.length)setSelected(savedGoals[0].id);else setOnboard(true);
    }catch{setOnboard(true)}
    setReady(true);
  },[]);

  useEffect(()=>{if(ready){try{localStorage.setItem("quitify-goals",JSON.stringify(goals))}catch{flash("Local storage is full. Export a backup.")}}},[goals,ready]);
  useEffect(()=>{if(ready){try{localStorage.setItem("quitify-checkins",JSON.stringify(checkins))}catch{flash("Local storage is full. Export a backup.")}}},[checkins,ready]);

  const current=goals.find(g=>g.id===selected)??goals[0];
  const active=goals.filter(g=>g.active);
  const days=current?daysSince(current.startedAt):0;
  const goalCheckins=current?checkins.filter(c=>c.goalId===current.id):[];
  const todayCheckin=checkins.find(c=>c.goalId===current?.id&&c.date===todayKey());
  const last7=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return dateKey(d)});
  const last7OnTrack=last7.filter(key=>goalCheckins.some(c=>c.date===key&&c.stayedOnTrack)).length;
  const consistency=Math.round((last7OnTrack/7)*100);
  const nextMilestone=days<7?7:days<14?14:days<30?30:days<60?60:90;
  const milestoneProgress=Math.min(100,Math.round((days/nextMilestone)*100));
  const dateLabel=useMemo(()=>new Intl.DateTimeFormat(undefined,{weekday:"long",month:"long",day:"numeric"}).format(new Date()),[]);
  const greeting=useMemo(()=>{const h=new Date().getHours();return h<12?"Good morning":h<18?"Good afternoon":"Good evening"},[]);

  useEffect(()=>{setChecked(!!todayCheckin?.stayedOnTrack)},[todayCheckin?.stayedOnTrack,current?.id]);
  useEffect(()=>{
    const key=(e:KeyboardEvent)=>{if(e.key==="Escape"){setShowAdd(false);setShowReset(false);setShowTimer(false);setOnboard(false)}};
    window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key);
  },[]);
  useEffect(()=>{
    if(!showTimer||timer<=0)return;
    const id=setInterval(()=>setTimer(v=>Math.max(0,v-1)),1000);return()=>clearInterval(id);
  },[showTimer,timer]);

  function flash(text:string){setMessage(text);window.setTimeout(()=>setMessage(""),2400)}
  function createGoal(label:string,icon:string,accent:string){
    const id=globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const goal:Goal={id,label,icon,accent,startedAt:new Date().toISOString(),best:0,checkIns:0,resets:0,active:true};
    setGoals(v=>[...v,goal]);setSelected(goal.id);setShowAdd(false);setOnboard(false);flash("Saved on this device.");
  }
  function toggleCheckin(){
    if(!current)return;
    const date=todayKey(),next=!checked;
    setChecked(next);
    setCheckins(v=>{
      const rest=v.filter(c=>!(c.goalId===current.id&&c.date===date));
      return [...rest,{goalId:current.id,date,stayedOnTrack:next}];
    });
    setGoals(v=>v.map(g=>g.id===current.id?{...g,checkIns:Math.max(0,g.checkIns+(next?1:-1))}:g));
  }
  function resetGoal(){
    if(!current)return;
    const hadToday=!!todayCheckin?.stayedOnTrack;
    setGoals(v=>v.map(g=>g.id===current.id?{
      ...g,startedAt:new Date().toISOString(),best:Math.max(g.best,days),
      checkIns:Math.max(0,g.checkIns-(hadToday?1:0)),resets:g.resets+1
    }:g));
    setCheckins(v=>v.filter(c=>!(c.goalId===current.id&&c.date===todayKey())));
    setShowReset(false);setChecked(false);flash("Fresh start. Your history stays.");
  }
  function exportData(){
    const payload={version:1,exportedAt:new Date().toISOString(),goals,checkins};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob),link=document.createElement("a");
    link.href=url;link.download="quitify-backup.json";link.click();URL.revokeObjectURL(url);flash("Backup exported.");
  }
  async function importData(file:File){
    setImporting(true);
    try{
      const parsed=JSON.parse(await file.text());
      const importedGoals=safeGoals(JSON.stringify(parsed?.goals));
      const importedCheckins=safeCheckins(JSON.stringify(parsed?.checkins));
      if(parsed?.version!==1||!importedGoals.length)throw new Error("Invalid backup");
      const ids=new Set(importedGoals.map(g=>g.id));
      setGoals(importedGoals);setCheckins(importedCheckins.filter(c=>ids.has(c.goalId)));
      setSelected(importedGoals[0].id);setOnboard(false);setTab("today");flash("Backup restored.");
    }catch{flash("That file is not a valid QUITify backup.")}finally{setImporting(false)}
  }
  function eraseAll(){
    localStorage.removeItem("quitify-goals");localStorage.removeItem("quitify-checkins");
    setGoals([]);setCheckins([]);setSelected("");setOnboard(true);setTab("today");flash("Local data cleared.");
  }
  function startTimer(){setTimer(600);setShowTimer(true)}
  const mins=String(Math.floor(timer/60)).padStart(2,"0"),secs=String(timer%60).padStart(2,"0");

  if(!ready)return <main className="page splash"><div className="brand"><span className="brand-mark" aria-hidden="true">Q</span>QUITify</div></main>;

  return <main className="page">
    <header className="topbar">
      <button className="brand brand-button" onClick={()=>setTab("today")} aria-label="Go to Today">
        <span className="brand-mark" aria-hidden="true">Q</span><span>QUITify</span>
      </button>
      <div className="privacy-pill"><LockKeyhole size={14}/> Local by default</div>
      <button className="icon-button" aria-label="Open Settings" onClick={()=>setTab("settings")}><Settings2 size={18}/></button>
    </header>

    {tab==="today"&&<div className="app-body">
      <section className="home-header">
        <div>
          <span className="eyebrow">{dateLabel.toUpperCase()}</span>
          <h1>Today</h1>
          <p>{greeting}. One small choice is enough for now.</p>
        </div>
      </section>

      <section className="focus-nav" aria-label="Your goals">
        {active.map(g=><button key={g.id} className={`goal-row ${selected===g.id?"selected":""}`} onClick={()=>setSelected(g.id)}>
          <span className={`goal-dot ${g.accent}`}>{g.icon}</span><span className="goal-name">{g.label}</span><span className="goal-age">{daysSince(g.startedAt)}d</span>
        </button>)}
        <button className="add-focus" onClick={()=>setShowAdd(true)}><Plus size={16}/> Add goal</button>
      </section>

      {current?<div className="redesign-grid">
        <section className="run-panel surface-card">
          <div className="status-head">
            <div><span className="eyebrow">YOUR RUN</span><div className="big-run"><strong>{days}</strong><span>days</span></div></div>
            <div className="best-stat"><span>Best</span><strong>{Math.max(current.best,days)}</strong></div>
          </div>
          <div className="run-rule"><span style={{width:`${Math.min(100,days*4+8)}%`}}/></div>
          <div className="run-foot"><span>{days===0?"Started today":"Since your fresh start"}</span><span>{nextMilestone} day milestone</span></div>
          <button className={`daily-check ${checked?"done":""}`} onClick={toggleCheckin}>
            <span className="daily-check-icon">{checked?<Check size={20}/>:null}</span>
            <span><b>{checked?"Checked in for today":"Check in for today"}</b><small>{checked?"You recorded today's choice.":"Tap once when you want to mark today."}</small></span>
            <ChevronRight size={18}/>
          </button>
        </section>

        <section className="pause-card surface-card">
          <div className="pause-top"><span className="eyebrow">A MOMENT BEFORE THE NEXT CHOICE</span><span className="pause-badge">10 min</span></div>
          <h2>Pause. Let the moment pass.</h2>
          <p>A short timer gives you a little distance before you decide what to do next.</p>
          <button className="dark-button" onClick={startTimer}><Timer size={16}/> 10 minute pause <ArrowRight size={15}/></button>
        </section>

        <section className="week-panel surface-card">
          <div className="card-heading"><div><span className="eyebrow">THIS WEEK</span><h2>Keep it visible.</h2></div><button className="link-button" onClick={()=>setTab("progress")}>See progress <ArrowRight size={14}/></button></div>
          <div className="week-grid">{Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));const key=dateKey(d);const done=goalCheckins.some(c=>c.date===key&&c.stayedOnTrack);const isToday=key===todayKey();return <div className={`week-day ${done?"done":""} ${isToday?"today":""}`} key={key}><span>{["S","M","T","W","T","F","S"][d.getDay()]}</span><i>{done?<Check size={12}/>:null}</i><small>{d.getDate()}</small></div>})}</div>
          <div className="consistency"><span>{consistency}% of the last 7 days checked in</span><span>{goalCheckins.length} total</span></div>
        </section>

        <section className="principle" hidden>
          <span className="eyebrow">THE QUITIFY IDEA</span>
          <p>Don’t build a perfect streak. Build a life where the next useful choice is easier.</p>
        </section>

        <div className="under-actions">
          <button className="secondary-button" onClick={()=>setShowReset(true)}><RotateCcw size={15}/> Fresh start</button>
          <span className="local-note"><ShieldCheck size={14}/> Private on this device</span>
        </div>
      </div>:<section className="empty-state surface-card">
        <span className="empty-kicker">FIRST STEP</span><h2>What would you like to change?</h2>
        <p>Pick one thing. QUITify will keep the experience focused and local.</p>
        <button className="primary-button" onClick={()=>setShowAdd(true)}>Choose a goal <ArrowRight size={16}/></button>
      </section>}
    </div>}

    {tab==="progress"&&<section className="secondary-page">
      <div className="page-heading"><span className="eyebrow">PROGRESS</span><h1>See the pattern,<br/><span>not the score.</span></h1><p>Use your history to understand what helps. There is nothing to win here.</p></div>
      {current?<div className="progress-stack">
        <section className="progress-hero surface-card"><span className="eyebrow">CURRENT RUN</span><strong>{days}<small> days</small></strong><div className="progress-bar"><i style={{width:`${Math.min(100,days*4+8)}%`}}/></div><div className="milestone-row"><span>Next milestone <b>{nextMilestone} days</b></span><span>{milestoneProgress}%</span></div></section>
        <section className="metrics-grid"><div className="metric surface-card"><span className="eyebrow">LAST 7 DAYS</span><strong>{consistency}%</strong><small>checked in</small></div><div className="metric surface-card"><span className="eyebrow">TOTAL</span><strong>{goalCheckins.length}</strong><small>check-ins</small></div><div className="metric surface-card"><span className="eyebrow">FRESH STARTS</span><strong>{current.resets}</strong><small>recorded</small></div></section>
        <section className="history-card surface-card"><div className="card-heading"><div><span className="eyebrow">HISTORY</span><h2>Your recent check-ins</h2></div></div><div className="history-list">{goalCheckins.slice(-12).reverse().map(c=><div className="history-row" key={c.date}><span>{new Date(c.date+"T12:00:00").toLocaleDateString(undefined,{weekday:"long",month:"short",day:"numeric"})}</span><b>{c.stayedOnTrack?"Checked in":"Logged"}</b></div>)}{!goalCheckins.length&&<p className="muted">Nothing here yet. Your history starts with your first check-in.</p>}</div></section>
      </div>:<section className="empty-state surface-card"><span className="empty-kicker">PROGRESS</span><h2>Start with one goal.</h2><p>Your history will appear here after you choose what you want to change.</p><button className="primary-button" onClick={()=>setShowAdd(true)}>Choose a goal <ArrowRight size={16}/></button></section>}
    </section>}

    {tab==="settings"&&<section className="secondary-page">
      <div className="page-heading"><span className="eyebrow">SETTINGS</span><h1>Simple by design.<br/><span>Private by default.</span></h1><p>No account, cloud database, feed, or public profile is required.</p></div>
      <section className="settings-list surface-card">
        <div className="setting-row"><div className="setting-icon"><ShieldCheck size={17}/></div><div><strong>Local-only storage</strong><p>Your goals and check-ins stay in this browser.</p></div><span className="status-dot"/></div>
        <div className="setting-row"><div className="setting-icon"><Download size={17}/></div><div><strong>Back up your data</strong><p>Save a small JSON copy that you control.</p></div><button className="setting-action" onClick={exportData}>Export</button></div>
        <div className="setting-row"><div className="setting-icon"><Upload size={17}/></div><div><strong>Restore a backup</strong><p>Replace this device's local data with a QUITify backup.</p></div><label className="setting-action">{importing?"Reading…":"Import"}<input type="file" accept="application/json,.json" hidden disabled={importing} onChange={e=>{const file=e.target.files?.[0];if(file)importData(file);e.currentTarget.value=""}}/></label></div>
        <div className="setting-row"><div className="setting-icon"><CircleHelp size={17}/></div><div><strong>Safety note</strong><p>QUITify is a self-guided design case study, not medical treatment. Some forms of dependence can require professional support.</p></div></div>
        <button className="danger-row" onClick={eraseAll}><Trash2 size={17}/><span><strong>Clear all local data</strong><small>This cannot be undone.</small></span><ChevronRight size={16}/></button>
      </section>
    </section>}

    <nav className="bottom-nav" aria-label="Main navigation">
      <button className={tab==="today"?"active":""} onClick={()=>setTab("today")}><span className="nav-icon">01</span><span>Today</span></button>
      <button className={tab==="progress"?"active":""} onClick={()=>setTab("progress")}><span className="nav-icon">02</span><span>Progress</span></button>
      <button className={tab==="settings"?"active":""} onClick={()=>setTab("settings")}><span className="nav-icon">03</span><span>Settings</span></button>
    </nav>

    {message&&<div className="toast" role="status"><Check size={15}/>{message}</div>}

    {showAdd&&<div className="modal-backdrop" onClick={()=>setShowAdd(false)}><section className="sheet surface-card" role="dialog" aria-modal="true" aria-labelledby="goal-title" onClick={e=>e.stopPropagation()}>
      <div className="sheet-head"><div><span className="eyebrow">NEW GOAL</span><h2 id="goal-title">What are you changing?</h2></div><button className="close" aria-label="Close" onClick={()=>setShowAdd(false)}><X size={18}/></button></div>
      <p>Choose one. You can add another later.</p>
      <div className="option-list">{goalOptions.map(([label,icon,accent])=><button key={label} onClick={()=>createGoal(label,icon,accent)}><span className={`option-icon ${accent}`}>{icon}</span><span>{label}</span><ChevronRight size={16}/></button>)}</div>
    </section></div>}

    {showReset&&<div className="modal-backdrop" onClick={()=>setShowReset(false)}><section className="sheet compact surface-card" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}>
      <div className="sheet-head"><div><span className="eyebrow">FRESH START</span><h2>Start again?</h2></div><button className="close" aria-label="Close" onClick={()=>setShowReset(false)}><X size={18}/></button></div>
      <p>Your previous best stays saved. A reset changes the starting point, not your history.</p>
      <div className="sheet-actions"><button className="secondary-button" onClick={()=>setShowReset(false)}>Keep going</button><button className="primary-button" onClick={resetGoal}>Start fresh <ArrowRight size={15}/></button></div>
    </section></div>}

    {showTimer&&<div className="modal-backdrop" onClick={()=>setShowTimer(false)}><section className="sheet timer-sheet surface-card" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}>
      <div className="sheet-head"><div><span className="eyebrow">PAUSE</span><h2>Ten quiet minutes.</h2></div><button className="close" aria-label="Close timer" onClick={()=>setShowTimer(false)}><X size={18}/></button></div>
      <div className="timer-display"><span>{mins}:{secs}</span><small>{timer===0?"Time is yours again.":"You don't need to decide yet."}</small></div>
      <div className="timer-steps"><div><b>01</b><span>Put a little distance between you and the moment.</span></div><div><b>02</b><span>Change what you are doing for a few minutes.</span></div><div><b>03</b><span>When the timer ends, choose what feels right for you.</span></div></div>
      <button className="primary-button full" onClick={()=>{setShowTimer(false);flash("You gave yourself some space.")}}>{timer===0?"Finish":"I'm ready to continue"} <ArrowRight size={15}/></button>
    </section></div>}

    {onboard&&<div className="modal-backdrop"><section className="onboarding surface-card" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <span className="brand-mark large" aria-hidden="true">Q</span><span className="eyebrow">WELCOME TO QUITIFY</span><h2 id="welcome-title">Make room for your life.</h2>
      <p>A private, focused place to work on one change at a time. No account. No feed. No performance theatre.</p>
      <button className="primary-button full" onClick={()=>{setOnboard(false);setShowAdd(true)}}>Choose my first goal <ArrowRight size={15}/></button>
      <small>Design case study · local-first prototype</small>
    </section></div>}
  </main>;
}
