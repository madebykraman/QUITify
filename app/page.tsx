"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, BarChart3, Check, ChevronRight, Clock3, Download,
  Heart, LockKeyhole, MoreHorizontal, Pause, Plus, RotateCcw,
  Settings2, ShieldCheck, Sparkles, Target, Trash2, Upload, X, Zap
} from "lucide-react";

type Goal={id:string;label:string;icon:string;accent:string;startedAt:string;best:number;checkIns:number;resets:number;active:boolean;reason?:string};
type Checkin={date:string;goalId:string;stayedOnTrack:boolean};

const goals=[["Nicotine","N","lime"],["Smoking","S","coral"],["Vaping","V","blue"],["Alcohol","A","amber"],["Sugar / junk food","S","orange"],["Doomscrolling","D","purple"],["Social media","S","blue"],["Gaming","G","violet"],["Adult content","A","rose"],["Something else","•","gray"]];

function key(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function since(iso:string){const s=new Date(iso),n=new Date();const a=new Date(s.getFullYear(),s.getMonth(),s.getDate()).getTime(),b=new Date(n.getFullYear(),n.getMonth(),n.getDate()).getTime();return Math.max(0,Math.round((b-a)/86400000))}
function parseGoals(v:string|null):Goal[]{try{const a=JSON.parse(v||"[]");return Array.isArray(a)?a.filter(x=>x&&x.id&&x.label).map(x=>({...x,best:Number(x.best)||0,checkIns:Number(x.checkIns)||0,resets:Number(x.resets)||0,active:x.active!==false})):[]}catch{return[]}}
function parseChecks(v:string|null):Checkin[]{try{const a=JSON.parse(v||"[]");return Array.isArray(a)?a.filter(x=>x&&x.id!==null&&typeof x.goalId==="string"&&typeof x.date==="string"):[]}catch{return[]}}

export default function Home(){
 const [ready,setReady]=useState(false),[goalsState,setGoals]=useState<Goal[]>([]),[checks,setChecks]=useState<Checkin[]>([]);
 const [selected,setSelected]=useState(""),[tab,setTab]=useState<"home"|"insights"|"settings">("home");
 const [onboard,setOnboard]=useState(false),[onStep,setOnStep]=useState(0),[chosen,setChosen]=useState<(typeof goals)[number]|null>(null),[reason,setReason]=useState("");
 const [sheet,setSheet]=useState<"goal"|"pause"|"reset"|null>(null),[timer,setTimer]=useState(600),[toast,setToast]=useState("");
 const current=goalsState.find(g=>g.id===selected)||goalsState[0], days=current?since(current.startedAt):0;
 const today=current?checks.find(c=>c.goalId===current.id&&c.date===key()):undefined;
 const recorded=!!today?.stayedOnTrack;
 const recent=useMemo(()=>Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return key(d)}),[]);
 const recentCount=current?recent.filter(d=>checks.some(c=>c.goalId===current.id&&c.date===d&&c.stayedOnTrack)).length:0;
 const dateText=new Intl.DateTimeFormat(undefined,{weekday:"long",month:"long",day:"numeric"}).format(new Date());

 useEffect(()=>{try{const g=parseGoals(localStorage.getItem("quitify-goals"));const c=parseChecks(localStorage.getItem("quitify-checkins"));setGoals(g);setChecks(c);if(g.length)setSelected(g[0].id);else setOnboard(true)}catch{setOnboard(true)}setReady(true)},[]);
 useEffect(()=>{if(ready)localStorage.setItem("quitify-goals",JSON.stringify(goalsState))},[goalsState,ready]);
 useEffect(()=>{if(ready)localStorage.setItem("quitify-checkins",JSON.stringify(checks))},[checks,ready]);
 useEffect(()=>{if(!sheet||sheet!=="pause"||timer<=0)return;const i=setInterval(()=>setTimer(v=>Math.max(0,v-1)),1000);return()=>clearInterval(i)},[sheet,timer]);
 useEffect(()=>{const f=(e:KeyboardEvent)=>{if(e.key==="Escape"){setSheet(null);setOnboard(false)}};addEventListener("keydown",f);return()=>removeEventListener("keydown",f)},[]);
 function notify(t:string){setToast(t);setTimeout(()=>setToast(""),2200)}
 function createGoal(g:(typeof goals)[number],r=""){const id=crypto?.randomUUID?.()||Date.now().toString();const n:Goal={id,label:g[0],icon:g[1],accent:g[2],startedAt:new Date().toISOString(),best:0,checkIns:0,resets:0,active:true,reason:r};setGoals(v=>[...v,n]);setSelected(id);setOnboard(false);setSheet(null);setTab("home");notify("Your focus is ready.")}
 function finish(){if(chosen)createGoal(chosen,reason)}
 function toggle(){if(!current)return;const d=key(),next=!recorded;setChecks(v=>[...v.filter(c=>!(c.goalId===current.id&&c.date===d)),{goalId:current.id,date:d,stayedOnTrack:next}]);setGoals(v=>v.map(g=>g.id===current.id?{...g,checkIns:Math.max(0,g.checkIns+(next?1:-1))}:g));notify(next?"Today is checked in.":"Today's check-in was removed.")}
 function reset(){if(!current)return;setGoals(v=>v.map(g=>g.id===current.id?{...g,startedAt:new Date().toISOString(),best:Math.max(g.best,days),resets:g.resets+1}:g));setChecks(v=>v.filter(c=>!(c.goalId===current.id&&c.date===key())));setSheet(null);notify("Fresh start saved.")}
 function exportData(){const blob=new Blob([JSON.stringify({version:3,exportedAt:new Date().toISOString(),goals:goalsState,checkins:checks},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="quitify-backup.json";a.click();notify("Backup exported.")}
 function clear(){localStorage.clear();setGoals([]);setChecks([]);setSelected("");setOnboard(true);setOnStep(0);setTab("home");notify("Local data cleared.")}
 if(!ready)return <main className="loading"><div className="brand"><span>Q</span>QUITify</div></main>;

 return <main className="app">
  <header className="header">
   <button className="brand" onClick={()=>setTab("home")}><span>Q</span>QUITify</button>
   <div className="privacy"><ShieldCheck size={14}/> Private by default</div>
   <button className="icon-btn" onClick={()=>setTab("settings")} aria-label="Settings"><Settings2 size={18}/></button>
  </header>

  {tab==="home"&&<section className="content">
   <div className="welcome-row"><div><p className="eyebrow">{dateText}</p><h1>Today is enough.</h1><p className="sub">One moment at a time. No judgement, no performance.</p></div><div className="avatar"><Heart size={17}/></div></div>

   {current?<><div className="focus-bar">
     <div className={`focus-icon ${current.accent}`}>{current.icon}</div><div><span className="eyebrow">YOUR FOCUS</span><b>{current.label}</b></div>
     <button onClick={()=>setSheet("goal")}><MoreHorizontal size={19}/></button>
   </div>
   <section className="hero-card">
    <div className="hero-top"><div><span className="eyebrow">CURRENT RUN</span><div className="days">{days}<small> day{days===1?"":"s"}</small></div></div><div className="run-badge"><Sparkles size={14}/> {days===0?"Started today":"You're doing it"}</div></div>
    <div className="hero-progress"><div><span>Next milestone</span><b>{days<7?7:days<14?14:days<30?30:60} days</b></div><div className="bar"><i style={{width:`${Math.min(100,Math.max(5,(days/(days<7?7:days<14?14:days<30?30:60))*100))}%`}}/></div></div>
   </section>

   <section className="check-card">
    <div className="check-copy"><div className="eyebrow">RIGHT NOW</div><h2>How are you doing today?</h2><p>There is no score here. Just a small check-in for yourself.</p></div>
    <button className={`check-button ${recorded?"done":""}`} onClick={toggle}><span>{recorded?<Check size={22}/>:<span className="ring"/>}</span><div><b>{recorded?"I'm on track":"I'm on track today"}</b><small>{recorded?"Recorded · tap to undo":"Tap once to record today"}</small></div><ChevronRight size={18}/></button>
    <button className="pause-link" onClick={()=>{setTimer(600);setSheet("pause")}}><Pause size={15}/> I need a moment</button>
   </section>

   <section className="week-card"><div className="section-head"><div><span className="eyebrow">YOUR WEEK</span><h3>Small steps count.</h3></div><span className="week-count">{recentCount}/7</span></div><div className="week-grid">{recent.map((d,i)=>{const on=checks.some(c=>c.goalId===current.id&&c.date===d&&c.stayedOnTrack),today=d===key();return <div key={d} className={today?"today":""}><span>{["S","M","T","W","T","F","S"][new Date(d+"T12:00:00").getDay()]}</span><i className={on?"on":""}>{on&&<Check size={12}/>}</i><small>{new Date(d+"T12:00:00").getDate()}</small></div>})}</div></section>

   <div className="tool-grid"><button onClick={()=>setSheet("pause")}><span><Zap size={17}/></span><div><b>Need a reset?</b><small>A short pause before the next choice.</small></div><ChevronRight size={16}/></button><button onClick={()=>setSheet("reset")}><span><RotateCcw size={17}/></span><div><b>Start fresh</b><small>Keep your history. Begin a new run.</small></div><ChevronRight size={16}/></button></div>
   </>:<section className="first-card"><div className="first-art"><Target size={30}/></div><span className="eyebrow">YOUR FIRST STEP</span><h2>Choose one thing<br/>you want to change.</h2><p>QUITify keeps the experience simple: one focus, one day, one decision at a time.</p><button className="primary" onClick={()=>setSheet("goal")}>Choose my focus <ArrowRight size={17}/></button></section>}
  </section>}

  {tab==="insights"&&<section className="content"><div className="page-title"><p className="eyebrow">INSIGHTS</p><h1>Notice the change.</h1><p className="sub">Progress isn't only a number. Here's what you've recorded.</p></div>{current?<><div className="stats-grid"><div className="stat-card featured"><span className="eyebrow">CURRENT RUN</span><strong>{days}</strong><small>days</small><div className="stat-foot">Best · {Math.max(days,current.best)} days</div></div><div className="stat-card"><span className="eyebrow">CHECK-INS</span><strong>{checks.filter(c=>c.goalId===current.id).length}</strong><small>moments</small></div><div className="stat-card"><span className="eyebrow">THIS WEEK</span><strong>{recentCount}</strong><small>of 7 days</small></div></div><div className="insight-card"><div className="insight-icon"><BarChart3 size={19}/></div><div><span className="eyebrow">A SIMPLE READ</span><h3>{recentCount>=5?"You've been showing up consistently.":recentCount>=3?"You're building a pattern.":"Every check-in is useful information."}</h3><p>Keep looking at the pattern, not just the perfect days.</p></div></div><div className="history-card"><div className="section-head"><div><span className="eyebrow">HISTORY</span><h3>Recent check-ins</h3></div></div>{checks.filter(c=>c.goalId===current.id).slice(-8).reverse().map(c=><div className="history" key={c.date}><span>{new Date(c.date+"T12:00:00").toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})}</span><b>{c.stayedOnTrack?"On track":"Recorded"}</b></div>)}{!checks.filter(c=>c.goalId===current.id).length&&<p className="empty-text">Your check-ins will appear here.</p>}</div></>:<div className="empty-small">Choose a focus to start seeing your pattern.</div>}</section>}

  {tab==="settings"&&<section className="content"><div className="page-title"><p className="eyebrow">SETTINGS</p><h1>Your space.</h1><p className="sub">QUITify stays on this device unless you choose to move it.</p></div><div className="settings-card"><div className="setting"><span className="setting-icon"><LockKeyhole size={17}/></span><div><b>Local-only</b><p>No account is required. Your data stays in this browser.</p></div><em>ON DEVICE</em></div><button className="setting action" onClick={exportData}><span className="setting-icon"><Download size={17}/></span><div><b>Export backup</b><p>Save a copy of your QUITify data.</p></div><ChevronRight size={17}/></button><label className="setting action"><span className="setting-icon"><Upload size={17}/></span><div><b>Restore backup</b><p>Bring your data back onto this device.</p></div><ChevronRight size={17}/><input hidden type="file" accept=".json,application/json" onChange={async e=>{const f=e.target.files?.[0];if(!f)return;try{const x=JSON.parse(await f.text());if(!Array.isArray(x.goals))throw 0;setGoals(x.goals);setChecks(Array.isArray(x.checkins)?x.checkins:[]);setSelected(x.goals[0]?.id||"");notify("Backup restored.")}catch{notify("That backup could not be restored.")}}}/></label><div className="setting"><span className="setting-icon"><ShieldCheck size={17}/></span><div><b>Safety</b><p>QUITify is a self-guided design case study, not medical treatment. Some forms of dependence may need professional support.</p></div></div><button className="danger" onClick={clear}><Trash2 size={17}/><span><b>Clear local data</b><small>Delete goals, check-ins and setup from this browser.</small></span></button></div></section>}

  <nav className="nav"><button className={tab==="home"?"active":""} onClick={()=>setTab("home")}><Target size={18}/><span>Today</span></button><button className={tab==="insights"?"active":""} onClick={()=>setTab("insights")}><BarChart3 size={18}/><span>Progress</span></button><button className={tab==="settings"?"active":""} onClick={()=>setTab("settings")}><Settings2 size={18}/><span>Settings</span></button></nav>

  {onboard&&<div className="onboard"><div className="onboard-inner"><header><div className="brand light"><span>Q</span>QUITify</div><small>{onStep+1} / 3</small></header>{onStep===0&&<div className="on-content"><div className="welcome-symbol"><Sparkles size={24}/></div><p className="eyebrow">WELCOME TO QUITify</p><h2>A little more space<br/>between you and the habit.</h2><p>Private, simple, and built for the moments that actually matter.</p><button className="light-primary" onClick={()=>setOnStep(1)}>Let's begin <ArrowRight size={17}/></button></div>}{onStep===1&&<div className="on-content"><p className="eyebrow">STEP 1 · YOUR FOCUS</p><h2>What would you like<br/>to change?</h2><div className="goal-grid">{goals.map(g=><button className={chosen?.[0]===g[0]?"selected":""} key={g[0]} onClick={()=>setChosen(g)}><span className={`focus-icon ${g[2]}`}>{g[1]}</span>{g[0]}<ChevronRight size={15}/></button>)}</div><button className="light-primary" disabled={!chosen} onClick={()=>setOnStep(2)}>Continue <ArrowRight size={17}/></button></div>}{onStep===2&&<div className="on-content"><p className="eyebrow">STEP 2 · YOUR REASON</p><h2>Why does this<br/>matter to you?</h2><div className="reason-list">{["More focus","More time","Better sleep","My relationships","More money","Just for me"].map(r=><button className={reason===r?"selected":""} key={r} onClick={()=>setReason(r)}>{r}{reason===r&&<Check size={16}/>}</button>)}</div><button className="light-primary" onClick={finish}>Enter QUITify <ArrowRight size={17}/></button><button className="skip" onClick={finish}>Skip for now</button></div>}</div></div>}

  {sheet==="goal"&&<div className="sheet-bg" onClick={()=>setSheet(null)}><section className="sheet" onClick={e=>e.stopPropagation()}><div className="sheet-handle"/><div className="sheet-head"><div><span className="eyebrow">YOUR FOCUS</span><h2>Choose another focus</h2></div><button className="icon-btn" onClick={()=>setSheet(null)}><X size={18}/></button></div><div className="sheet-goals">{goals.map(g=><button key={g[0]} onClick={()=>createGoal(g)}><span className={`focus-icon ${g[2]}`}>{g[1]}</span>{g[0]}<ChevronRight size={16}/></button>)}</div></section></div>}
  {sheet==="pause"&&<div className="sheet-bg" onClick={()=>setSheet(null)}><section className="pause-sheet" onClick={e=>e.stopPropagation()}><div className="sheet-handle"/><div className="sheet-head"><div><span className="eyebrow">PAUSE</span><h2>You don't have to decide right now.</h2></div><button className="icon-btn" onClick={()=>setSheet(null)}><X size={18}/></button></div><div className="pause-timer"><Clock3 size={18}/><strong>{String(Math.floor(timer/60)).padStart(2,"0")}:{String(timer%60).padStart(2,"0")}</strong><p>Give the moment a little room. Change your surroundings, breathe, and let the urgency settle.</p></div><div className="pause-actions"><div><b>Change the scene</b><span>Stand up or move somewhere different.</span></div><div><b>Do one ordinary thing</b><span>Return to a simple, familiar activity.</span></div></div><button className="primary full" onClick={()=>setSheet(null)}>I'm ready <ArrowRight size={17}/></button></section></div>}
  {sheet==="reset"&&<div className="sheet-bg" onClick={()=>setSheet(null)}><section className="sheet reset-sheet" onClick={e=>e.stopPropagation()}><div className="sheet-head"><div><span className="eyebrow">FRESH START</span><h2>Start again without erasing your progress.</h2></div><button className="icon-btn" onClick={()=>setSheet(null)}><X size={18}/></button></div><p>Your history and best run stay saved. Only the current run starts over.</p><div className="reset-buttons"><button className="secondary" onClick={()=>setSheet(null)}>Keep my run</button><button className="primary" onClick={reset}>Start fresh <RotateCcw size={16}/></button></div></section></div>}
  {toast&&<div className="toast"><Check size={15}/>{toast}</div>}
 </main>
}
