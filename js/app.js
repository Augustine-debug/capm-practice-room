/* CAPM Practice Room · app logic. Questions are loaded from data/questions.json. */
const DOMAINS=[
 {n:1,name:"Project Management Fundamentals and Core Concepts",short:"Fundamentals and Core Concepts",w:36},
 {n:2,name:"Predictive, Plan-Based Methodologies",short:"Predictive, Plan-Based",w:17},
 {n:3,name:"Agile Frameworks/Methodologies",short:"Agile",w:20},
 {n:4,name:"Business Analysis Frameworks",short:"Business Analysis",w:27}
];
const LEVELS={1:"Basic",2:"Intermediate",3:"Advanced"};
/* ECO 2023 tasks: code -> [task statement as written in the CAPM ECO 2023, short label] */
const TASKS={"1.1":["Demonstrate an understanding of the various project life cycles and processes","Life cycles and processes"],"1.2":["Demonstrate an understanding of project management planning","Project management planning"],"1.3":["Demonstrate an understanding of project roles and responsibilities","Project roles and responsibilities"],"1.4":["Determine how to follow and execute planned strategies or frameworks (e.g., communication, risks, etc.)","Executing planned strategies and frameworks"],"1.5":["Demonstrate an understanding of common problem-solving tools and techniques","Problem-solving tools and techniques"],"2.1":["Explain when it is appropriate to use a predictive, plan-based approach","When to use a predictive approach"],"2.2":["Demonstrate an understanding of a project management plan schedule","Project schedule and plan"],"2.3":["Determine how to document project controls of predictive, plan-based projects","Predictive project controls"],"3.1":["Explain when it is appropriate to use an adaptive approach","When to use an adaptive approach"],"3.2":["Determine how to plan project iterations","Planning iterations"],"3.3":["Determine how to document project controls for an adaptive project","Adaptive project controls"],"3.4":["Explain the components of an adaptive plan","Components of an adaptive plan"],"3.5":["Determine how to prepare and execute task management steps","Task management steps"],"4.1":["Demonstrate an understanding of business analysis (BA) roles and responsibilities","BA roles and responsibilities"],"4.2":["Determine how to conduct stakeholder communication","Stakeholder communication"],"4.3":["Determine how to gather requirements","Gathering requirements"],"4.4":["Demonstrate an understanding of product roadmaps","Product roadmaps"],"4.5":["Determine how project methodologies influence business analysis processes","Methodologies and business analysis"],"4.6":["Validate requirements through product delivery","Validating requirements through delivery"]};

let BANK=[];  // filled by loadBank() from data/questions.json; BANK[id-1] = question with that id
const multi=b=>Array.isArray(b.a);
const need=b=>multi(b)?b.a.length:1;
const okAns=(v,b)=>v!==undefined&&(multi(b)?Array.isArray(v)&&v.length===b.a.length&&v.every(i=>b.a.includes(i)):v===b.a);
const isAns=(b,i)=>multi(b)?b.a.includes(i):i===b.a;
const picked=(v,i)=>Array.isArray(v)?v.includes(i):v===i;
const BANK_V=1;   // question-bank version, stored with each attempt
const MOCK_N={1:54,2:26,3:30,4:40}; // full mock: 150 questions drawn by ECO domain weight
/* questions that share one set of facts (same "context") form a group: they are drawn together and kept side by side */
let GROUP={};  // id -> id of the first question in its group (filled after loading)
function unitsOf(ids){const seen=new Map();ids.forEach(id=>{const g=GROUP[id]||id;if(!seen.has(g))seen.set(g,[]);seen.get(g).push(id)});
  return [...seen.values()].map(u=>u.sort((a,b)=>a-b))}
const shuffleKeepGroups=ids=>shuffle(unitsOf(ids)).flat();
function fullMockIds(){
  const picked=[];
  DOMAINS.forEach(d=>{let need=MOCK_N[d.n];
    for(const u of shuffle(unitsOf(BANK.filter(b=>b.d===d.n&&b.mode==="exam").map(b=>b.id)))){
      if(u.length<=need){picked.push(u);need-=u.length}if(!need)break}});
  return shuffle(picked).flat();
}
const SEC=75;     // full mock: section 1 = Q1-75, then a 10-minute break
const BREAK=600;

/* ---------- storage ---------- */
const store={get(k,f){try{const v=localStorage.getItem("cpr."+k);return v?JSON.parse(v):f}catch(e){return f}},
  set(k,v){try{localStorage.setItem("cpr."+k,JSON.stringify(v))}catch(e){}},
  del(k){try{localStorage.removeItem("cpr."+k)}catch(e){}}};


/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const L="ABCDE";
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const fmt=s=>{s=Math.max(0,Math.round(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return (h?h+":":"")+String(m).padStart(h?2:1,"0")+":"+String(x).padStart(2,"0")};
const pctClass=p=>p>=75?"ok":p>=65?"mid":"bad";
const modeName={full:"Full mock exam",custom:"Custom practice",retry:"Review mistakes"};


/* ---------- site info (About page, footer) ---------- */
const SITE={
  repo:"https://github.com/Augustine-debug/capm-practice-room",
  kofi:"https://ko-fi.com/duyduy3396",
  maker:"Duy Nguyễn",
  github:"https://github.com/Augustine-debug",
  linkedin:"",            // paste the LinkedIn profile URL here; the link shows only when this is set
  bankUpdated:"21 November 2026",
  pmi:"https://www.pmi.org/capm",
  // Google Form links (E4). reportForm is the form's pre-filled link with the question ID field set to QID;
  // feedbackForm is the plain link. Buttons appear only when these are filled in.
  reportForm:"https://docs.google.com/forms/d/e/1FAIpQLSehQI1ccBgejCfve9nVBmqd46BuW_fVeUvaOKacZtvE1lwfIg/viewform?usp=pp_url&entry.1779748649=Report+a+problem+with+a+question&entry.829120462=QID",
  feedbackForm:"https://docs.google.com/forms/d/e/1FAIpQLSehQI1ccBgejCfve9nVBmqd46BuW_fVeUvaOKacZtvE1lwfIg/viewform"
};
const reportLink=b=>SITE.reportForm?`<a class="report" href="${esc(SITE.reportForm.replace("QID",encodeURIComponent(b.id)))}" target="_blank" rel="noopener">⚑ Report this question</a>`:"";
const feedbackLink=(cls="btn sm")=>SITE.feedbackForm?`<a class="${cls}" href="${esc(SITE.feedbackForm)}" target="_blank" rel="noopener">Share feedback</a>`:"";

let S=null;          // active session
let view="home";
let tick=null;
let reviewFilter="all";
let railCollapsed=true;
let confirmOpen=false;
let confirmKind="submit";
let detailOpen=store.get("detailOpen",false);

/* ---------- explanation language (E2): English by default, Vietnamese on request; remembered ---------- */
let lang=store.get("lang","en")==="vi"?"vi":"en";
const langSwitch=()=>`<div class="langsw" role="group" aria-label="Explanation language"><button type="button" data-lang="en" aria-pressed="${lang==="en"}">EN</button><button type="button" data-lang="vi" aria-pressed="${lang==="vi"}" lang="vi" title="Giải thích bằng tiếng Việt">VI</button></div>`;
const shortHTML=b=>`<p class="exshort"${lang==="vi"?' lang="vi"':""}>${esc(b.ex.short[lang])}</p><p class="inshort"${lang==="vi"?' lang="vi"':""}><b>${lang==="vi"?"Tóm lại":"In short"}:</b> ${esc(b.ex.inShort[lang])}</p>`;
const okLetters=(b,perm)=>perm.map((o,k)=>isAns(b,o)?L[k]:"").filter(Boolean).join(", ");
function detailHTML(b,perm){
  const ok=okLetters(b,perm);
  const wrong=perm.map((orig,pos)=>isAns(b,orig)?"":`<li><span class="wl">${L[pos]} · wrong</span><span>${esc(b.ex.whyWrong[lang][L[orig]])}</span></li>`).join("");
  const tk=TASKS[b.t];
  return `<details class="more"${detailOpen?" open":""}${lang==="vi"?' lang="vi"':""}><summary>Detailed explanation</summary>
    <div class="why"><span class="wl ok">Why ${ok} is correct</span><p>${esc(b.ex.whyCorrect[lang])}</p></div>
    <ul class="wrongs">${wrong}</ul>
    ${b.n8&&lang==="vi"?`<div class="n8"><span class="wl n8l">PMBOK 8 note</span><p>${esc(b.n8)}</p></div>`:""}
    ${b.src?`<p class="ecoline muted">Source: ${esc(b.src)}</p>`:""}
    ${tk?`<p class="ecoline"><span class="wl eco">ECO ${b.t}</span> ${esc(tk[0])}</p>`:""}</details>`;
}

/* ---------- visit counts (E5): GoatCounter, no cookies, no personal data ----------
   Page views: /, /guide, /about, /cards. Events: which modes are started and finished.
   Counts made before the script has loaded are queued and sent on window load.
   GoatCounter ignores localhost, so local testing is not counted. */
const gcQueue=[];
function gc(o){try{if(window.goatcounter&&window.goatcounter.count)window.goatcounter.count(o);else gcQueue.push(o)}catch(e){}}
window.addEventListener("load",()=>{while(gcQueue.length&&window.goatcounter&&window.goatcounter.count)window.goatcounter.count(gcQueue.shift())});
const PAGE_TITLES={home:"Practice",guide:"Exam guide",about:"About",cards:"Flashcards"};
let lastCounted="";
function countPage(){if(!PAGE_TITLES[view]||lastCounted===view)return;lastCounted=view;gc({path:view==="home"?"/":"/"+view,title:PAGE_TITLES[view]})}
function countEvent(name){gc({path:name,title:name,event:true})}

/* ---------- session ---------- */
function newSession(mode,ids,opt){
  const perm={};ids.forEach(id=>{const r=BANK[id-1].o.map((_,i)=>i);perm[id]=opt.shuffleOpts?shuffle(r):r});
  S={mode,ids,perm,ans:{},flag:{},idx:0,elapsed:0,limit:opt.limit||0,instant:!!opt.instant,started:Date.now(),done:false};
  if(mode==="full"&&ids.length>SEC){S.phase="s1";S.brk=0}
  countEvent("start-"+mode);lastCounted="";
  save();go("exam");
}
function save(){if(!S||S.fromHistory)return;if(!S.done)store.set("session",S);else store.del("session")}  // no active attempt: leave any saved one alone
function q(){return BANK[S.ids[S.idx]-1]}
function isRight(id){return okAns(S.ans[id],BANK[id-1])}
/* full mock sections: s1 = Q1-75, break, s2 = Q76-150 (no return to s1) */
function secRange(){if(!S.phase)return [0,S.ids.length-1];return S.phase==="s1"?[0,SEC-1]:[SEC,S.ids.length-1]}
const canGo=i=>{const r=secRange();return i>=r[0]&&i<=r[1]};
function goNext(){
  if(S.phase==="s1"&&S.idx===SEC-1){confirmKind="sec";confirmOpen=true;render();$(".dialog .primary")?.focus();return}
  if(S.idx<S.ids.length-1&&canGo(S.idx+1)){S.idx++;save();render()}}
function goPrev(){if(S.idx>0&&canGo(S.idx-1)){S.idx--;save();render()}}
function endSection(){S.phase="break";S.brk=0;confirmOpen=false;save();render()}
function startSection2(){S.phase="s2";S.idx=SEC;save();render();window.scrollTo(0,0)}

function go(v){view=v;confirmOpen=false;stopTick();
  if(v==="home"&&location.hash&&location.hash!=="#/")history.replaceState(null,"","#/");
  if(v==="exam")startTick();
  render();window.scrollTo(0,0)}
function startTick(){tick=setInterval(()=>{if(!S||S.done)return;
  if(S.phase==="break"){S.brk++;if(S.brk%5===0)save();
    if(S.brk>=BREAK){startSection2();return}
    const k=$("#brk");if(k)k.textContent=fmt(BREAK-S.brk);return}
  S.elapsed++;
  if(S.elapsed%5===0)save();
  if(S.limit&&S.elapsed>=S.limit){submit();return}
  const t=$("#timer");if(t){const rem=S.limit?S.limit-S.elapsed:S.elapsed;t.querySelector("b").textContent=fmt(rem);
    t.classList.toggle("low",!!S.limit&&rem<=300)}},1000)}
function stopTick(){if(tick){clearInterval(tick);tick=null}}

function submit(){
  S.done=true;stopTick();countEvent("finish-"+S.mode);
  const total=S.ids.length,correct=S.ids.filter(isRight).length;
  // wrong bank
  const wrong=new Set(store.get("wrong",[]));
  S.ids.forEach(id=>{isRight(id)?wrong.delete(id):wrong.add(id)});
  store.set("wrong",[...wrong].sort((a,b)=>a-b));
  const hist=store.get("history",[]);
  S.t=Date.now();
  hist.unshift({t:S.t,mode:S.mode,c:correct,n:total,s:S.elapsed,v:BANK_V,
    ids:S.ids,perm:S.perm,ans:S.ans,flag:S.flag,instant:S.instant,limit:S.limit});
  store.set("history",hist.slice(0,30));
  store.del("session");
  reviewFilter="all";
  go("result");
}
function fromHistory(t){
  const h=store.get("history",[]).find(x=>x.t===t);
  if(!h||!h.ids)return null;
  return {mode:h.mode,ids:h.ids,perm:h.perm,ans:h.ans||{},flag:h.flag||{},idx:0,elapsed:h.s,
    limit:h.limit||0,instant:!!h.instant,done:true,t:h.t,fromHistory:true,drop:h.drop||0};
}
function redo(src){
  const ids=shuffleKeepGroups(src.ids);
  const shuffleOpts=src.ids.some(id=>src.perm[id]&&src.perm[id].some((v,i)=>v!==i));
  newSession(src.mode,ids,{shuffleOpts,instant:src.instant,
    limit:src.mode==="full"?180*60:(src.limit?ids.length*72:0)});
}
const when=t=>new Date(t).toLocaleString("en-GB",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
function scopeOf(h){
  if(!h.ids)return "";
  const ds=[...new Set(h.ids.map(id=>BANK[id-1].d))].sort();
  return ds.length===4?"4 domain":ds.map(d=>"D"+d).join(", ");
}

/* ---------- views ---------- */
function render(){
  const app=$("#app");
  const oldGrid=view==="exam"?$(".rail .grid"):null,gridTop=oldGrid?oldGrid.scrollTop:0;
  if(view==="home")app.innerHTML=navHTML("home")+homeHTML()+footHTML();
  else if(view==="about")app.innerHTML=navHTML("about")+aboutHTML()+footHTML();
  else if(view==="guide")app.innerHTML=navHTML("guide")+guideHTML()+footHTML();
  else if(view==="cards")app.innerHTML=navHTML("cards")+cardsHTML()+footHTML();
  else if(view==="cardq")app.innerHTML=navHTML("cards")+cardQHTML();
  else if(view==="exam")app.innerHTML=examHTML();
  else app.innerHTML=resultHTML();
  if(view==="home")syncCustom();
  if(view==="exam")keepNavigatorInView(oldGrid?gridTop:null);
  countPage();
}
/* The navigator grid is rebuilt on every render. Keep its scroll position, and scroll it
   (not the page) just enough to show the current question. */
function keepNavigatorInView(top){
  const g=$(".rail .grid"),c=g&&g.querySelector(".cell.cur");if(!g)return;
  if(top!==null)g.scrollTop=top;
  if(!c||g.scrollHeight<=g.clientHeight)return;
  const pad=6,ct=c.getBoundingClientRect().top-g.getBoundingClientRect().top+g.scrollTop,cb=ct+c.offsetHeight;
  if(top===null)g.scrollTop=Math.max(0,ct-(g.clientHeight-c.offsetHeight)/2);
  else if(ct<g.scrollTop+pad)g.scrollTop=Math.max(0,ct-pad);
  else if(cb>g.scrollTop+g.clientHeight-pad)g.scrollTop=cb-g.clientHeight+pad;
}

function homeHTML(){
  const saved=store.get("session",null);
  const wrong=store.get("wrong",[]);
  const hist=store.get("history",[]);
  const dChecks=DOMAINS.map(d=>`<label class="chk"><input type="checkbox" id="cd${d.n}" data-d="${d.n}" checked><span><b>Domain ${d.n}</b> · ${d.w}%<br><small class="muted">${esc(d.name)}</small></span><span class="n">${BANK.filter(b=>b.d===d.n).length}</span></label>`).join("");
  const tChecks=Object.keys(TASKS).map(t=>`<label class="chk"><input type="checkbox" id="ct${t.replace(".","_")}" data-t="${t}" checked><span><b class="mono">${t}</b> ${esc(TASKS[t][1])}<br><small class="muted">${esc(TASKS[t][0])}</small></span><span class="n">${BANK.filter(b=>b.t===t).length}</span></label>`).join("");
  const mChecks=[["exam","Exam-style questions",true],["definition","Definition review",false]].map(([m,t,on])=>`<label class="chk"><input type="checkbox" id="cm_${m}" data-m="${m}"${on?" checked":""}><span>${t}</span><span class="n">${BANK.filter(b=>b.mode===m).length}</span></label>`).join("");
  const lChecks=[1,2,3].map(l=>`<label class="chk"><input type="checkbox" id="cl${l}" data-l="${l}" checked><span>${LEVELS[l]}</span><span class="n">${BANK.filter(b=>b.lv===l).length}</span></label>`).join("");
  return `
  <header class="mast">
    <div><div class="label">CAPM · Exam Content Outline 2023</div><h1>Practise for the <span>CAPM</span> exam</h1></div>
    <div class="spec"><div><b>150</b><small>questions</small></div><div><b>180′</b><small>minutes</small></div><div><b>72″</b><small>per question</small></div><div><b>135</b><small>scored</small></div><div><b>10′</b><small>break after Q75</small></div></div>
  </header>
  ${saved&&!saved.done?`<div class="resume"><div><b>You have an attempt in progress.</b> <span class="muted">${modeName[saved.mode]} · ${Object.keys(saved.ans).length}/${saved.ids.length} answered · ${fmt(saved.elapsed)}</span></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-act="discard">Discard</button><button class="btn primary" data-act="resume">Resume</button></div></div>`:""}
  <section class="modes">
    <article class="mode">
      <div class="label">Mode 1</div>
      <h2>Full mock exam</h2>
      <p>150 questions drawn at random from ${BANK.filter(b=>b.mode==="exam").length} exam questions, weighted by domain like the real exam (D1 54 · D2 26 · D3 30 · D4 40), with a 3-hour timer. Two sections, as on test day: after question 75 you get an optional 10-minute break (the exam clock stops) and cannot return to section 1. Answers are shown only after you submit.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary go" data-act="full">Start the 150-question exam</button></div>
    </article>
    <article class="mode">
      <div class="label">Mode 2</div>
      <h2>Review mistakes</h2>
      <p>${wrong.length?`You have <b class="mono">${wrong.length}</b> question${wrong.length===1?"":"s"} you got wrong or left unanswered. A question leaves this list once you answer it correctly.`:"No mistakes yet. After each submitted attempt, questions you got wrong or skipped are collected here."}</p>
      <button class="btn go" data-act="retryAll" ${wrong.length?"":"disabled"}>Review ${wrong.length||""} mistake${wrong.length===1?"":"s"}</button>
    </article>
    <article class="mode">
      <div class="label">Mode 3</div>
      <h2>Flashcards</h2>
      <p>${BANK.filter(b=>b.mode==="definition").length} cards for the key CAPM terms. Flip each card, mark it “Know it” or “Review again”, and jump to a related scenario question.</p>
      <a class="btn go" href="#/cards">Study flashcards</a>
    </article>
    <article class="mode wide">
      <div class="label">Mode 4</div>
      <h2>Custom practice</h2>
      <div class="form">
        <fieldset><legend class="label">Question type</legend>${mChecks}<legend class="label" style="margin-top:10px">Domain</legend>${dChecks}</fieldset>
        <fieldset><legend class="label">Difficulty</legend>${lChecks}
          <legend class="label" style="margin-top:10px">Options</legend>
          <label class="chk"><input type="checkbox" id="oShuffle" checked><span>Shuffle questions</span></label>
          <label class="chk"><input type="checkbox" id="oOpts"><span>Shuffle answer options</span></label>
          <label class="chk"><input type="checkbox" id="oInstant" checked><span>Show the answer and explanation after each question</span></label>
          <label class="chk"><input type="checkbox" id="oTimer"><span>Timed: 72 seconds per question, the real exam pace</span></label>
        </fieldset>
      </div>
      <details class="taskpick"><summary>Filter by ECO task <span id="taskInfo" class="muted"></span></summary>
        <div class="trow"><button type="button" class="btn sm" data-act="tasksAll">Select all</button><button type="button" class="btn sm" data-act="tasksNone">Clear all</button></div>
        <div class="taskgrid">${tChecks}</div></details>
      <div class="row">
        <div style="flex:1;min-width:220px"><div class="label" style="margin-bottom:6px">Number of questions <span id="poolInfo" class="muted" style="text-transform:none;letter-spacing:0;font-weight:400"></span></div>
          <p id="noMatch" class="nomatch" role="status" hidden>No questions match these filters. Tick at least one option in each group, or widen the ECO task filter.</p>
          <div class="range"><input type="range" id="oCount" aria-label="Number of questions" min="1" max="${BANK.length}" value="20"><output id="oCountOut">20</output></div></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary" id="startCustom" data-act="custom">Start practice</button></div>
      </div>
    </article>
  </section>
  ${confirmOpen&&confirmKind==="start"?`<div class="overlay" data-act="close"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlgT">
    <h3 id="dlgT">Start the full mock exam?</h3>
    <ul class="rules">
      <li><b>150 questions</b>, drawn by the ECO 2023 domain weights.</li>
      <li><b>180 minutes</b>, counting down while you work. When it reaches zero, the exam is submitted for you.</li>
      <li>After question 75 you can take <b>a break of up to 10 minutes</b>. The exam clock stops during the break.</li>
      <li>Once you end section 1, you <b>cannot return to questions 1–75</b>.</li>
      <li>Answers and explanations are shown only after you submit. You can pause and resume later.</li>
    </ul>
    <div class="row"><button class="btn" data-act="close">Not now</button><button class="btn primary" data-act="startFull">Start exam</button></div>
  </div></div>`:""}
  ${confirmOpen&&confirmKind==="discard"?`<div class="overlay" data-act="close"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlgT">
    <h3 id="dlgT">Discard this attempt?</h3>
    <p style="margin:0">Your answers in the attempt in progress will be deleted and it will not be saved to your history.</p>
    <div class="row"><button class="btn" data-act="close">Keep it</button><button class="btn primary" data-act="discardYes">Discard</button></div>
  </div></div>`:""}
  ${SITE.feedbackForm?`<p class="fbline">Found a wrong answer or have an idea? <a href="${esc(SITE.feedbackForm)}" target="_blank" rel="noopener">Share feedback</a> and rate the app from 1 to 5. No email needed.</p>`:""}
  <section class="ledger">
    <h2>History</h2>
    <p class="muted" style="margin:0 0 10px;font-size:14px">Open a past attempt to review every question with explanations, retake the whole set, or retry only the questions you missed.</p>
    <div class="tablewrap">${hist.length?`<table class="hist"><thead><tr><th>Date</th><th>Mode</th><th>Correct</th><th>Score</th><th>Time</th><th>Review</th></tr></thead><tbody>
      ${hist.map(h=>{const p=Math.round(h.c/h.n*100);const ok=!!h.ids;const wrongN=ok?h.ids.filter(id=>!okAns(h.ans[id],BANK[id-1])).length:0;
        return `<tr><td>${when(h.t)}</td><td>${modeName[h.mode]}${ok?`<br><small class="muted">${scopeOf(h)}</small>`:""}</td><td class="mono">${h.c}/${h.n}</td><td><span class="pill ${pctClass(p)}">${p}%</span></td><td class="mono">${fmt(h.s)}</td>
        <td>${ok?`<div class="hact"><button class="btn sm primary" data-review="${h.t}">Review</button><button class="btn sm" data-redo="${h.t}">Retake</button>${wrongN?`<button class="btn sm" data-redowrong="${h.t}">Retry ${wrongN} wrong</button>`:""}</div>`
          :`<small class="muted">No details saved</small>`}</td></tr>`}).join("")}
    </tbody></table>`:`<div class="empty">No attempts yet. Your results will be saved here, in this browser only.</div>`}</div>
    ${hist.length?`<p class="muted" style="font-size:13px;margin:8px 0 0">Your history is saved only in this browser, on this device, and is lost if you clear your browser data.</p>`:""}
    <p class="note">Based on the PMI Certification Handbook (June 2026) and the CAPM ECO 2023: the exam has 150 questions, 135 scored and 15 unscored pretest questions mixed in at random; 3 hours, with a 10-minute break after question 75. The passing score is criteria-based and not published; this app uses 70% as a reference mark. The real exam also has drag-and-drop/matching and hot spot questions; this app uses multiple choice and multiple response ("Select two/three"). The bank has ${BANK.length} questions (${BANK.filter(b=>b.mode==="exam").length} exam, ${BANK.filter(b=>b.mode==="definition").length} definition review), mostly original, with ${BANK.filter(b=>b.org!=="own").length} adapted from Creative Commons sources and credited on each question. Every question is tagged with its ECO task; terms follow PMBOK 7, with PMBOK 8 notes where things changed. Your progress and history are saved in this browser only.</p>
  </section>`;
}

function pool(){
  const ds=DOMAINS.filter(d=>$("#cd"+d.n)?.checked).map(d=>d.n);
  const ls=[1,2,3].filter(l=>$("#cl"+l)?.checked);
  const ts=new Set(Object.keys(TASKS).filter(t=>{const el=document.getElementById("ct"+t.replace(".","_"));return !el||el.checked}));
  const ms=["exam","definition"].filter(m=>$("#cm_"+m)?.checked);
  return BANK.filter(b=>ms.includes(b.mode)&&ds.includes(b.d)&&ls.includes(b.lv)&&ts.has(b.t)).map(b=>b.id);
}
function syncCustom(){
  const p=pool(),r=$("#oCount"),o=$("#oCountOut");if(!r)return;
  const max=Math.max(1,p.length);r.max=max;if(+r.value>max)r.value=max;
  o.textContent=p.length?r.value:0;
  $("#poolInfo").textContent=`(${p.length} matching)`;
  const nm=$("#noMatch");if(nm)nm.hidden=!!p.length;
  const tAll=Object.keys(TASKS).length,tOn=document.querySelectorAll(".taskgrid input:checked").length;
  const ti=$("#taskInfo");if(ti)ti.textContent=`· ${tOn===tAll?"all":tOn}/${tAll} tasks`;
  $("#startCustom").disabled=!p.length;
}

function breakHTML(){
  const s1=S.ids.slice(0,SEC),a1=s1.filter(id=>S.ans[id]!==undefined).length;
  return `<section class="breakbox">
    <div class="label">Full mock exam · End of section 1</div>
    <h2>Scheduled break</h2>
    <div class="brkclock"><b id="brk">${fmt(BREAK-S.brk)}</b><small>remaining</small></div>
    <p>Section 1 is locked (questions 1–75, ${a1}/${SEC} answered). The exam clock is paused, with <b class="mono">${fmt(S.limit-S.elapsed)}</b> left for section 2. Section 2 starts automatically after 10 minutes, or you can start it now.</p>
    <div class="row"><button class="btn ghost" data-act="pause">Pause</button><button class="btn primary" data-act="sec2">Start section 2 →</button></div>
  </section>`;
}
function examHTML(){
  if(S.phase==="break")return breakHTML();
  const b=q(),n=S.ids.length,answered=Object.keys(S.ans).length,sel=S.ans[b.id];
  const locked=isLocked(b);
  const perm=S.perm[b.id];
  const opts=perm.map((orig,pos)=>{
    let cls="";
    if(locked){if(isAns(b,orig))cls="right";else if(picked(sel,orig))cls="wrong"}
    else if(picked(sel,orig))cls="sel";
    return `<button class="opt ${cls}" data-pick="${orig}" ${locked?"disabled":""}><span class="k">${L[pos]}</span><span class="t">${esc(b.o[orig])}</span></button>`}).join("");
  const rem=S.limit?S.limit-S.elapsed:S.elapsed;
  const d=DOMAINS[b.d-1];
  const cells=S.ids.map((id,i)=>{let c="cell";const lk=!canGo(i);
    if(S.ans[id]!==undefined)c+=S.instant?(isRight(id)?" right":" wrong"):" ans";
    if(S.flag[id])c+=" flag";if(i===S.idx)c+=" cur";if(lk)c+=" locked";
    return `<button class="${c}" data-jump="${i}" aria-label="Question ${i+1}"${lk?" disabled":""}>${i+1}</button>`}).join("");
  const [r0,r1]=secRange();
  const secIds=S.ids.slice(r0,r1+1),secUn=secIds.filter(id=>S.ans[id]===undefined).length;
  const unanswered=n-answered,flagged=Object.values(S.flag).filter(Boolean).length;
  return `
  <div class="bar">
    <div class="title">${modeName[S.mode]}</div>
    <div class="stat"><b>${S.idx+1}/${n}</b><small>question</small></div>
    <div class="stat hideable"><b>${answered}</b><small>answered</small></div>
    ${S.mode!=="full"&&answered?`<div class="stat" title="Reference pace on the real exam: 72 seconds per question"><b>${fmt(S.elapsed/answered)}</b><small>avg · target 1:12</small></div>`:""}
    ${S.phase?`<div class="stat hideable"><b>${S.phase==="s1"?1:2}/2</b><small>section</small></div>`:""}
    <div class="stat timer ${S.limit&&rem<=300?"low":""}" id="timer"><b>${fmt(rem)}</b><small>${S.limit?"left":"elapsed"}</small></div>
    <div class="spacer"></div>
    <button class="btn ghost" data-act="pause">Pause</button>
    <button class="btn primary" data-act="ask">Submit</button>
    <div class="progress"><i style="width:${answered/n*100}%"></i></div>
  </div>
  <div class="exam">
    <section class="qcard">
      <div class="meta"><span class="qnum">QUESTION ${S.idx+1}</span><span class="chip">Domain ${d.n} · ${esc(d.short)}</span><span class="chip lv${b.lv}">${LEVELS[b.lv]}</span><span class="chip eco" title="${esc((TASKS[b.t]||[""])[0])}">ECO ${b.t}</span>${multi(b)?`<span class="chip new">Select ${need(b)}</span>`:""}<span class="chip">#${b.id}</span></div>
      ${b.ctx?`<div class="ctx">${esc(b.ctx)}</div>`:""}
      <p class="qtext">${esc(b.q)}</p>
      <div class="opts">${opts}</div>
      ${multi(b)&&!locked?`<p class="hint" style="margin:-4px 0 12px">Multiple response: ${(sel||[]).length}/${need(b)} selected. Tap again to unselect.</p>`:""}
      ${locked?`<div class="explain ${okAns(sel,b)?"ok":"bad"}"><div class="exhead"><b>${okAns(sel,b)?"Correct":"Incorrect · answer "+okLetters(b,perm)}</b>${langSwitch()}</div>${shortHTML(b)}${detailHTML(b,perm)}<div class="exfoot">${reportLink(b)}</div></div>`:""}
      <div class="qnav">
        <button class="btn" data-act="prev" ${S.idx===r0?"disabled":""}>← Previous</button>
        <div class="grp">
          <button class="btn ${S.flag[b.id]?"flagon":""}" data-act="flag">${S.flag[b.id]?"Unflag":"Flag for review"}</button>
          ${S.phase==="s1"&&S.idx===SEC-1?`<button class="btn primary" data-act="next">End section 1 →</button>`:S.idx<n-1?`<button class="btn primary" data-act="next">Next →</button>`:`<button class="btn primary" data-act="ask">Submit</button>`}
        </div>
      </div>
      <p class="hint">Shortcuts: A–E or 1–5 to answer, ← → to move between questions, F to flag.</p>
    </section>
    <aside class="rail ${railCollapsed?"collapsed":""}">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
        <div class="label">Navigator</div>
        <button class="btn ghost railtoggle" data-act="rail" style="min-height:32px;padding:4px 10px">${railCollapsed?"Show":"Hide"}</button>
      </div>
      <div class="legend"><span><i class="a"></i>Answered</span><span><i></i>Unanswered</span><span><i class="f"></i>Flagged</span></div>
      <div class="grid">${cells}</div>
      <div class="muted" style="font-size:13px">${unanswered} unanswered · ${flagged} flagged${S.phase?` · ${S.phase==="s1"?"section 1: questions 1–75":"section 2: questions 76–150 (section 1 locked)"}`:""}</div>
    </aside>
  </div>
  ${confirmOpen&&confirmKind==="sec"?`<div class="overlay" data-act="close"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlgT">
    <h3 id="dlgT">End section 1?</h3>
    <p style="margin:0">You get an optional 10-minute break, then section 2. <b>You cannot return to questions 1–75.</b>${secUn?` Section 1 still has <b>${secUn}</b> unanswered question${secUn===1?"":"s"}.`:" You have answered every question in section 1."}</p>
    <div class="row"><button class="btn" data-act="close">Stay in section 1</button><button class="btn primary" data-act="endsec">End section 1</button></div>
  </div></div>`:""}
  ${confirmOpen&&confirmKind!=="sec"?`<div class="overlay" data-act="close"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlgT">
    <h3 id="dlgT">Submit?</h3>
    <p style="margin:0">${unanswered?`<b>${unanswered}</b> question${unanswered===1?" is":"s are"} unanswered and will count as incorrect.`:"You have answered every question."}${flagged?` <b>${flagged}</b> question${flagged===1?" is":"s are"} flagged for review.`:""}</p>
    <div class="row"><button class="btn" data-act="close">Keep going</button><button class="btn primary" data-act="submit">Submit</button></div>
  </div></div>`:""}`;
}

function bar(label,c,n,w){const p=n?Math.round(c/n*100):0;
  const col=p>=75?"var(--ok)":p>=65?"var(--flag)":"var(--bad)";
  return `<div class="brk"><div class="top"><span>${label}</span><span>${c}/${n} · ${p}%</span></div><div class="track"><i style="width:${p}%;background:${col}"></i><span class="mark" title="70% reference mark"></span></div></div>`}

function resultHTML(){
  const ids=S.ids,n=ids.length,c=ids.filter(isRight).length,p=Math.round(c/n*100);
  const skipped=ids.filter(id=>S.ans[id]===undefined).length;
  const verdict=p>=75?"On track. You are above the 70% reference mark with a safety margin."
    :p>=65?"Borderline. Review the domains below 70% before your exam."
    :"Needs work. Focus on your weakest domain and retry your mistakes.";
  const byD=DOMAINS.map(d=>{const s=ids.filter(id=>BANK[id-1].d===d.n);return s.length?bar(`D${d.n} · ${d.short} <span class="muted">(${d.w}%)</span>`,s.filter(isRight).length,s.length):""}).join("");
  const byL=[1,2,3].map(l=>{const s=ids.filter(id=>BANK[id-1].lv===l);return s.length?bar(LEVELS[l],s.filter(isRight).length,s.length):""}).join("");
  const tStats=Object.keys(TASKS).map(t=>{const s=ids.filter(id=>BANK[id-1].t===t);return {t,n:s.length,c:s.filter(isRight).length}}).filter(x=>x.n);
  const weak=tStats.filter(x=>x.n>=2).sort((a,b)=>a.c/a.n-b.c/b.n||b.n-a.n).slice(0,3).filter(x=>x.c/x.n<.75);
  const byT=DOMAINS.map(d=>{const rows=tStats.filter(x=>x.t.startsWith(d.n+"."));return rows.length?`<div class="tgrp"><div class="label">Domain ${d.n}</div>${rows.map(x=>bar(`<b class="mono">${x.t}</b> ${esc(TASKS[x.t][1])}`,x.c,x.n)).join("")}</div>`:""}).join("");
  const wrongIds=ids.filter(id=>!isRight(id));
  const flt={all:ids,wrong:ids.filter(id=>S.ans[id]!==undefined&&!isRight(id)),skip:ids.filter(id=>S.ans[id]===undefined),flag:ids.filter(id=>S.flag[id])};
  const list=flt[reviewFilter];
  const items=list.map(id=>{const b=BANK[id-1],sel=S.ans[id],perm=S.perm[id],pos=ids.indexOf(id);
    const st=sel===undefined?"skip":okAns(sel,b)?"ok":"bad";
    const opts=perm.map((orig,k)=>{let cls=isAns(b,orig)?"right":picked(sel,orig)?"wrong":"";
      return `<div class="opt ${cls}"><span class="k">${L[k]}</span><span class="t">${esc(b.o[orig])}${picked(sel,orig)?' <small class="muted">· your answer</small>':""}</span></div>`}).join("");
    return `<article class="ritem ${st}"><div class="meta"><span class="qnum">QUESTION ${pos+1}</span><span class="chip">Domain ${b.d}</span><span class="chip lv${b.lv}">${LEVELS[b.lv]}</span><span class="chip eco" title="${esc((TASKS[b.t]||[""])[0])}">ECO ${b.t}</span>${st==="skip"?'<span class="chip">Unanswered</span>':""}${S.flag[id]?'<span class="chip" style="color:var(--flag)">Flagged</span>':""}</div>
      ${b.ctx?`<div class="ctx">${esc(b.ctx)}</div>`:""}<p class="qtext">${esc(b.q)}</p><div class="opts">${opts}</div>
      <div class="explain"><div class="exhead"><b>Answer: ${okLetters(b,perm)}</b>${langSwitch()}</div>${shortHTML(b)}${detailHTML(b,perm)}<div class="exfoot">${reportLink(b)}</div></div></article>`}).join("");
  return `
  <header class="mast"><div><div class="label">${modeName[S.mode]} · ${n} question${n===1?"":"s"}${S.t?" · "+when(S.t):""}</div><h1>${S.fromHistory?"Review":"Results"}</h1></div>
    <div class="spec"><div><b>${fmt(S.elapsed)}</b><small>time used</small></div><div><b>${n?fmt(S.elapsed/n):"0:00"}</b><small>per question</small></div></div></header>
  <section class="score">
    <div class="big"><div class="label">Score</div><div class="pct" style="color:var(--${pctClass(p)==="mid"?"flag":pctClass(p)})">${p}%</div>
      <div class="sub">${c} correct · ${n-c-skipped} incorrect · ${skipped} unanswered</div><p class="verdict">${verdict}</p></div>
    <div class="panel"><h3>By domain</h3>${byD}<h3 style="margin-top:6px">By difficulty</h3>${byL}
      <div class="muted" style="font-size:12px">The vertical line on each bar marks 70%, a reference point only: PMI does not publish its passing score. Your real PMI score report also shows results by domain.</div></div>
  </section>
  ${weak.length?`<section class="panel weakpanel"><h3>Study these tasks first</h3>
    <p class="muted" style="margin:0 0 10px;font-size:14px">Your ${weak.length===1?"weakest ECO task":`${weak.length} weakest ECO tasks`} in this attempt. Practise each with instant feedback.</p>
    <ul class="weaklist">${weak.map(x=>`<li><div><b class="mono">${x.t}</b> ${esc(TASKS[x.t][1])} <span class="muted">· ${x.c}/${x.n} correct (${Math.round(x.c/x.n*100)}%)</span></div><button class="btn sm primary" data-practask="${x.t}">Practise ${x.t}</button></li>`).join("")}</ul>
  </section>`:""}
  <section class="panel tpanel">
    <details${tStats.length<=6?" open":""}><summary><h3>By ECO task <span class="muted" style="font-weight:400">(${tStats.length} tasks)</span></h3></summary>
      <div class="tgrid">${byT}</div></details>
  </section>
  <div class="actions">
    <button class="btn primary" data-act="retryThis" ${wrongIds.length?"":"disabled"}>Retry ${wrongIds.length} mistake${wrongIds.length===1?"":"s"}</button>
    <button class="btn" data-act="redoThis">Retake all ${n}</button>
    <button class="btn" data-act="history">Back to history</button>
    ${feedbackLink("btn")}
  </div>
  ${SITE.feedbackForm?`<p class="muted" style="font-size:14px;margin:8px 0 0">How useful was this practice? <a href="${esc(SITE.feedbackForm)}" target="_blank" rel="noopener">Rate the app from 1 to 5</a>. It takes 30 seconds, and no email is needed.</p>`:""}
  <div class="tabs" role="tablist">
    ${[["all","All",flt.all.length],["wrong","Incorrect",flt.wrong.length],["skip","Unanswered",flt.skip.length],["flag","Flagged",flt.flag.length]].map(([k,t,cnt])=>`<button class="tab ${reviewFilter===k?"on":""}" data-filter="${k}" role="tab" aria-selected="${reviewFilter===k}">${t} · ${cnt}</button>`).join("")}
  </div>
  <section class="rev">${items||'<div class="empty">No questions here.</div>'}</section>`;
}

function isLocked(b){const v=S.ans[b.id];return S.instant&&v!==undefined&&(!multi(b)||v.length>=need(b))}
function pick(orig){const b=q();if(isLocked(b))return;
  if(multi(b)){const v=(S.ans[b.id]||[]).slice();const i=v.indexOf(orig);
    if(i>=0)v.splice(i,1);else{if(v.length>=need(b))v.shift();v.push(orig)}
    if(v.length)S.ans[b.id]=v.sort((x,y)=>x-y);else delete S.ans[b.id]}
  else S.ans[b.id]=orig;
  if(isLocked(b)&&okAns(S.ans[b.id],b)){const w=store.get("wrong",[]);if(w.includes(b.id))store.set("wrong",w.filter(x=>x!==b.id))}  // answered right with feedback: leaves the mistakes list now
  save();render()}
/* ---------- events ---------- */
document.addEventListener("click",e=>{
  const t=e.target.closest("[data-act],[data-fc],[data-lang],[data-practask],[data-pick],[data-jump],[data-filter],[data-review],[data-redo],[data-redowrong]");if(!t)return;
  if(t.dataset.review){const h=fromHistory(+t.dataset.review);if(h){S=h;reviewFilter="all";go("result")}return}
  if(t.dataset.redo){const h=fromHistory(+t.dataset.redo);if(h)redo(h);return}
  if(t.dataset.redowrong){const h=fromHistory(+t.dataset.redowrong);if(h){const w=h.ids.filter(id=>!okAns(h.ans[id],BANK[id-1]));if(w.length)newSession("retry",shuffle(w),{instant:true})}return}
  if(t.dataset.practask){const ids=shuffleKeepGroups(BANK.filter(b=>b.mode==="exam"&&b.t===t.dataset.practask).map(b=>b.id)).slice(0,20);
    if(ids.length)newSession("custom",ids,{instant:true});return}
  if(t.dataset.fc){fcAct(t.dataset.fc);return}
  if(t.dataset.lang){lang=t.dataset.lang;store.set("lang",lang);const y=window.scrollY;render();window.scrollTo(0,y);return}
  if(t.dataset.pick!==undefined){pick(+t.dataset.pick);return}
  if(t.dataset.jump!==undefined){const i=+t.dataset.jump;if(!canGo(i))return;S.idx=i;save();render();return}
  if(t.dataset.filter){reviewFilter=t.dataset.filter;render();return}
  const a=t.dataset.act;
  if(a==="close"&&t.classList.contains("overlay")&&e.target!==t)return;
  switch(a){
    case "full":confirmKind="start";confirmOpen=true;render();$(".dialog .primary")?.focus();break;
    case "startFull":{const ids=fullMockIds();newSession("full",ids,{limit:180*60});break}
    case "custom":{const p=pool();const ids=($("#oShuffle").checked?shuffleKeepGroups(p):p).slice(0,+$("#oCount").value);
      newSession("custom",ids,{shuffleOpts:$("#oOpts").checked,instant:$("#oInstant").checked,limit:$("#oTimer").checked?ids.length*72:0});break}
    case "retryAll":{const w=store.get("wrong",[]);if(w.length)newSession("retry",shuffle(w),{instant:true});break}
    case "retryThis":{const w=S.ids.filter(id=>!isRight(id));if(w.length)newSession("retry",shuffle(w),{instant:true});break}
    case "resume":S=store.get("session",null);if(S)go("exam");break;
    case "discard":confirmKind="discard";confirmOpen=true;render();$(".dialog .primary")?.focus();break;
    case "discardYes":store.del("session");S=null;confirmOpen=false;render();break;
    case "prev":goPrev();break;
    case "next":goNext();break;
    case "endsec":endSection();break;
    case "sec2":startSection2();break;
    case "tasksAll":case "tasksNone":document.querySelectorAll(".taskgrid input").forEach(i=>i.checked=a==="tasksAll");syncCustom();break;
    case "flag":{const id=q().id;S.flag[id]=!S.flag[id];save();render();break}
    case "rail":railCollapsed=!railCollapsed;render();break;
    case "ask":confirmKind="submit";confirmOpen=true;render();$(".dialog .primary")?.focus();break;
    case "close":confirmOpen=false;render();break;
    case "submit":submit();break;
    case "pause":save();S=null;go("home");break;
    case "home":S=null;go("home");break;
    case "redoThis":redo(S);break;
    case "history":S=null;go("home");document.querySelector(".ledger")?.scrollIntoView();break;
  }
});
document.addEventListener("change",e=>{if(view==="home"&&e.target.matches("input"))syncCustom()});
document.addEventListener("input",e=>{if(e.target.id==="oCount")$("#oCountOut").textContent=e.target.value});
document.addEventListener("keydown",e=>{
  // keep keyboard focus inside an open dialog
  if(e.key==="Tab"&&confirmOpen){const d=$(".dialog");if(d){const f=[...d.querySelectorAll("button,a[href],input")].filter(x=>!x.disabled);if(f.length){const first=f[0],last=f[f.length-1];
    if(e.shiftKey&&(document.activeElement===first||!d.contains(document.activeElement))){e.preventDefault();last.focus();return}
    if(!e.shiftKey&&(document.activeElement===last||!d.contains(document.activeElement))){e.preventDefault();first.focus();return}}}}
  if(view==="home"&&confirmOpen&&e.key==="Escape"){confirmOpen=false;render();return}
  if(view!=="exam"||!S||S.phase==="break"||e.metaKey||e.ctrlKey||e.altKey)return;
  if(confirmOpen){if(e.key==="Escape"){confirmOpen=false;render()}return}
  const k=e.key.toLowerCase();let pos=-1;
  const nb=q().o.length;
  if(k.length===1&&"abcde".indexOf(k)>=0&&"abcde".indexOf(k)<nb)pos="abcde".indexOf(k);else if(k.length===1&&k>="1"&&k<="5"&&+k<=nb)pos=+k-1;
  if(pos>=0){pick(S.perm[q().id][pos]);return}
  if(e.key==="ArrowRight")goNext();
  else if(e.key==="ArrowLeft")goPrev();
  else if(k==="f"){const id=q().id;S.flag[id]=!S.flag[id];save();render()}
});
document.addEventListener("toggle",e=>{if(e.target.matches&&e.target.matches("details.more")){detailOpen=e.target.open;store.set("detailOpen",detailOpen)}},true);
document.addEventListener("visibilitychange",()=>{if(document.hidden)save()});


/* ---------- site navigation, footer and info pages ---------- */
function navHTML(cur){
  const a=(href,k,t)=>`<a href="${href}"${cur===k?' aria-current="page"':""}>${t}</a>`;
  return `<nav class="topnav" aria-label="Main"><a class="brand" href="#/">CAPM <span>Practice Room</span></a>
    <div class="links">${a("#/","home","Practice")}${a("#/cards","cards","Flashcards")}${a("#/guide","guide","Exam guide")}${a("#/about","about","About")}</div></nav>`;
}
function footHTML(){
  return `<footer class="foot">
    <div><a class="btn sm" href="${SITE.kofi}" target="_blank" rel="noopener">☕ Support this project</a></div>
    <div class="links">${SITE.feedbackForm?`<a href="${esc(SITE.feedbackForm)}" target="_blank" rel="noopener">Share feedback</a>`:""}<a href="#/guide">Exam guide</a><a href="#/about">About</a><a href="${SITE.repo}" target="_blank" rel="noopener">GitHub</a></div>
    <p class="muted">CAPM®, PMP®, PMBOK® and PMI® are registered marks of the Project Management Institute, Inc. This free app is not affiliated with or endorsed by PMI and contains no real exam questions.</p>
  </footer>`;
}
const ext=(href,t)=>`<a href="${href}" target="_blank" rel="noopener">${t}</a>`;
function aboutHTML(){
  const n=BANK.length,ex=BANK.filter(b=>b.mode==="exam").length,df=n-ex;
  const own=BANK.filter(b=>b.org==="own").length;
  const og=BANK.filter(b=>b.org==="cc"&&/Oguz/.test(b.src)).length,fa=BANK.filter(b=>b.org==="cc"&&/Farag/.test(b.src)).length;
  return `<article class="page">
  <header class="mast"><div><div class="label">About</div><h1>About this app</h1></div></header>
  <p class="lead">CAPM Practice Room is a free place to practise for the PMI Certified Associate in Project Management (CAPM) exam: timed full mock exams, custom practice, and a detailed explanation for every answer. No account, no ads, no fees.</p>

  <h2>Where the questions come from</h2>
  <p>The bank has <b>${n}</b> questions: ${ex} exam-style questions and ${df} definition questions for reviewing key terms. Every question is tagged with its domain and task from the <b>CAPM Exam Content Outline (ECO) 2023</b>, which this app follows. Question bank last updated: <b>${SITE.bankUpdated}</b>.</p>
  <div class="tablewrap"><table class="hist">
    <thead><tr><th>Source</th><th>Licence</th><th>Questions</th></tr></thead>
    <tbody>
      <tr><td>Written for CAPM Practice Room</td><td>CC BY-NC-SA 4.0</td><td class="mono">${own}</td></tr>
      <tr><td>Adapted from Abdullah Oguz, ${ext("https://pressbooks.ulib.csuohio.edu/projectmanagement2ndedition/","<i>Project Management, 2nd Edition</i>")}, Cleveland State University</td><td>${ext("https://creativecommons.org/licenses/by-nc/4.0/","CC BY-NC 4.0")}</td><td class="mono">${og}</td></tr>
      <tr><td>Adapted from Adam Farag (ed.), ${ext("https://ecampusontario.pressbooks.pub/essentialsofprojectmanagement/","<i>Essentials of Project Management</i>")}, Fanshawe College</td><td>${ext("https://creativecommons.org/licenses/by-nc-sa/4.0/","CC BY-NC-SA 4.0")}</td><td class="mono">${fa}</td></tr>
    </tbody></table></div>
  <p class="muted">Adapted questions were reworded as CAPM-style questions, given new explanations and translated into Vietnamese. Each one names its source under its explanation. The bank contains no real or leaked PMI exam questions and nothing copied from commercial prep providers.</p>

  <h2>Licences</h2>
  <ul>
    <li><b>Code</b>: MIT licence (${ext(SITE.repo+"/blob/main/LICENSE","LICENSE")}).</li>
    <li><b>Questions and explanations</b>: ${ext("https://creativecommons.org/licenses/by-nc-sa/4.0/","CC BY-NC-SA 4.0")}. You may share and adapt them for non-commercial use with credit, under the same licence (${ext(SITE.repo+"/blob/main/CONTENT-LICENSE.md","details")}).</li>
  </ul>

  <h2>Disclaimer</h2>
  <p>CAPM®, PMP®, PMBOK® and PMI® are registered marks of the Project Management Institute, Inc. CAPM Practice Room is an independent, non-commercial project and is not affiliated with, endorsed by or sponsored by PMI. Exam facts follow the CAPM ECO 2023 and the PMI Certification Handbook; check ${ext(SITE.pmi,"PMI's CAPM page")} for the latest rules.</p>

  <h2>Your data</h2>
  <p>There is no account. Your attempts, mistakes and settings are saved only in this browser, on this device. Clearing your browser data deletes them.</p>
  <p>To see how many people use the app, page visits are counted with ${ext("https://www.goatcounter.com","GoatCounter")}. It uses no cookies and does not collect personal data; it counts which pages are opened and which modes are started and finished, never your answers or scores.</p>

  <h2>Who made this</h2>
  <p>Built by <b>${esc(SITE.maker)}</b> while preparing for the CAPM, as a free resource for other candidates. ${ext(SITE.github,"GitHub")}${SITE.linkedin?` · ${ext(SITE.linkedin,"LinkedIn")}`:""}</p>
  <p>Found a wrong answer or a bug? ${SITE.feedbackForm?ext(SITE.feedbackForm,"Tell us with the feedback form")+" (no email needed) or "+ext(SITE.repo+"/issues","open a GitHub issue"):ext(SITE.repo+"/issues","Report it on GitHub")}. If the app helped you, you can ${ext(SITE.kofi,"buy me a coffee on Ko-fi")}.</p>
  </article>`;
}
function guideHTML(){
  const dRows=DOMAINS.map(d=>`<tr><td><b>Domain ${d.n}</b> · ${esc(d.name)}</td><td class="mono">${d.w}%</td><td class="mono">${MOCK_N[d.n]}</td></tr>`).join("");
  const tasks=DOMAINS.map(d=>`<li><b>Domain ${d.n}</b><ul>${Object.keys(TASKS).filter(t=>t.startsWith(d.n+".")).map(t=>`<li><span class="mono">${t}</span> ${esc(TASKS[t][0])}</li>`).join("")}</ul></li>`).join("");
  return `<article class="page">
  <header class="mast"><div><div class="label">Exam guide</div><h1>How the CAPM exam works</h1></div></header>
  <p class="lead">A five-minute overview of the Certified Associate in Project Management (CAPM) exam, based on the CAPM Exam Content Outline (ECO) 2023 and the PMI Certification Handbook (June 2026 edition).</p>

  <h2>Exam structure</h2>
  <ul>
    <li><b>150 questions</b>: 135 scored and 15 unscored pretest questions, mixed in at random. You cannot tell which ones are pretest.</li>
    <li><b>3 hours</b>. An optional tutorial before and a survey after do not count toward the 3 hours.</li>
    <li><b>A 10-minute break</b> appears after question 75, once you have reviewed your answers. After the break starts you <b>cannot return</b> to questions 1–75.</li>
  </ul>

  <h2>Question types</h2>
  <p>Multiple choice (one answer), multiple response ("Select two"), drag-and-drop and matching, hot spot (click an area of an image), and short animation or comic-strip scenarios followed by a question. Online-proctored exams use comic strips only. <span class="muted">This app currently has multiple-choice and multiple-response questions.</span></p>

  <h2>What is tested</h2>
  <p>Four domains. Predictive, agile and business-analysis ideas appear across all of them, not only in their own domain.</p>
  <div class="tablewrap"><table class="hist">
    <thead><tr><th>Domain</th><th>Weight</th><th>≈ Questions in 150</th></tr></thead>
    <tbody>${dRows}</tbody></table></div>
  <details class="taskpick"><summary>The 19 tasks of the ECO 2023</summary><ul class="tasks">${tasks}</ul></details>

  <h2>Who can take it</h2>
  <ul>
    <li><b>Eligibility</b>: a secondary diploma (high school, GED or global equivalent) plus <b>23 hours</b> of project management education, completed before the exam.</li>
    <li><b>Where</b>: at a test centre or online with a remote proctor.</li>
    <li><b>Attempts</b>: up to 3 within your 1-year eligibility period. After 3 unsuccessful attempts you wait 1 year before reapplying.</li>
    <li><b>Keeping it</b>: renew every 3 years by earning 15 professional development units (PDUs).</li>
  </ul>

  <h2>Exam day</h2>
  <ul>
    <li>Arrive 30 minutes early with a valid photo ID.</li>
    <li>A calculator is built into the exam software.</li>
    <li>The exam is offered in English and several translated versions (not Vietnamese); translated versions let you view the English text alongside.</li>
  </ul>

  <h2>Scoring</h2>
  <p>PMI does not publish a passing score. The exam is criteria-based: your answers are compared with the standard expected of a qualified associate, using psychometric analysis. Your score report shows pass or fail and how you did in each domain. <b>This app uses 70% as a reference mark</b> so you can track progress, not as PMI's cut-off.</p>

  <h2>PMBOK 7 or PMBOK 8?</h2>
  <p>The CAPM still follows the <b>ECO 2023</b>, and its reference list uses PMBOK Guide 7th Edition terms. Do not confuse it with the PMP: the PMP exam changed on 9 July 2026 and PMBOK Guide 8th Edition is out. If you read newer material, the main PMBOK 8 changes are: process groups become "focus areas", 12 principles become 6, and there are 7 new performance domains (governance, scope, schedule, finance, stakeholders, resources, risk). Questions in this app flag PMBOK 8 differences where they matter.</p>

  <h2>What to read</h2>
  <p>References listed in the ECO: <i>PMBOK Guide</i> 7th Edition, <i>Process Groups: A Practice Guide</i>, <i>The PMI Guide to Business Analysis</i>, <i>Business Analysis for Practitioners</i> and the <i>Agile Practice Guide</i>. Quick reads: ${ext("https://scrumguides.org/scrum-guide.html","the Scrum Guide")}, ${ext("https://agilemanifesto.org/","the Agile Manifesto")} and ${ext("https://www.pmi.org/about/ethics/code","PMI's Code of Ethics")}.</p>

  <h2>How to study with this app</h2>
  <ol>
    <li>Learn the key terms with <a href="#/cards">Flashcards</a>.</li>
    <li>Practise by domain or ECO task with instant feedback, at about <b>72 seconds per question</b>, the real exam pace.</li>
    <li>Take a timed 150-question mock exam.</li>
    <li>Retry your mistakes and practise your weakest tasks from the results page.</li>
  </ol>
  <p><a class="btn primary" href="#/">Start practising</a></p>

  <p class="note">Sources: ${ext(SITE.pmi,"PMI's CAPM page")}, which links the CAPM ECO 2023 and the PMI Certification Handbook. Fees depend on region and PMI membership: see PMI's site. Rules can change; check PMI before you book. Last checked ${SITE.bankUpdated}.</p>
  </article>`;
}

/* ---------- flashcards (C1–C3): the definition questions as cards; progress kept in this browser ---------- */
const FC={ids:[],idx:0,flipped:false,domains:[1,2,3,4],againOnly:false};
let cardMarks=store.get("cards",{});   // id -> "know" | "again"
const fcPool=()=>BANK.filter(b=>b.mode==="definition"&&FC.domains.includes(b.d)&&(!FC.againOnly||cardMarks[b.id]==="again")).map(b=>b.id);
function fcBuild(){FC.ids=shuffle(fcPool());FC.idx=0;FC.flipped=false}
const fcCard=()=>BANK[FC.ids[FC.idx]-1];
function fcAct(a){
  if(a==="flip")FC.flipped=!FC.flipped;
  else if(a==="next"){if(FC.idx<FC.ids.length-1){FC.idx++;FC.flipped=false}}
  else if(a==="prev"){if(FC.idx>0){FC.idx--;FC.flipped=false}}
  else if(a==="know"||a==="again"){const b=fcCard();cardMarks[b.id]=a;store.set("cards",cardMarks);
    if(FC.idx<FC.ids.length-1){FC.idx++;FC.flipped=false}}
  else if(a==="shuffle")fcBuild();
  else if(a==="againOnly"){FC.againOnly=!FC.againOnly;fcBuild()}
  else if(a.startsWith("d")){const d=+a.slice(1);FC.domains=FC.domains.includes(d)?FC.domains.filter(x=>x!==d):[...FC.domains,d].sort();fcBuild()}
  else if(a==="related"){view="cardq";render();window.scrollTo(0,0);return}
  else if(a==="back"){view="cards";render();window.scrollTo(0,0);return}
  else if(a==="reset"){cardMarks={};store.set("cards",cardMarks);fcBuild()}
  render();
}
function cardsHTML(){
  const all=BANK.filter(b=>b.mode==="definition"),known=all.filter(b=>cardMarks[b.id]==="know").length,again=all.filter(b=>cardMarks[b.id]==="again").length;
  const chips=DOMAINS.map(d=>`<button class="tab ${FC.domains.includes(d.n)?"on":""}" data-fc="d${d.n}" aria-pressed="${FC.domains.includes(d.n)}">D${d.n} · ${esc(d.short)} · ${all.filter(b=>b.d===d.n).length}</button>`).join("");
  const head=`<header class="mast"><div><div class="label">Flashcards</div><h1>Learn the key terms</h1></div>
    <div class="spec"><div><b>${known}/${all.length}</b><small>cards known</small></div><div><b>${again}</b><small>to review again</small></div></div></header>
    <div class="fcbar"><div class="tabs" role="group" aria-label="Domains">${chips}</div>
      <label class="chk inline"><input type="checkbox" data-fc="againOnly" ${FC.againOnly?"checked":""}><span>Only cards marked “Review again”</span></label></div>`;
  if(!FC.ids.length)return head+`<div class="empty">${FC.againOnly?"No cards marked “Review again” in these domains. Nice work!":"Pick at least one domain."}</div>`;
  const b=fcCard(),ans=(Array.isArray(b.a)?b.a:[b.a]),mark=cardMarks[b.id];
  const opts=b.o.map((o,i)=>`<li class="${FC.flipped&&ans.includes(i)?"right":""}"><span class="k">${L[i]}</span><span>${esc(o)}</span></li>`).join("");
  const back=FC.flipped?`<div class="fcback"${lang==="vi"?' lang="vi"':""}><div class="exhead"><b>Answer: ${ans.map(i=>L[i]).join(", ")}</b>${langSwitch()}</div>${shortHTML(b)}
      ${b.rel?`<button class="btn sm" data-fc="related">Try a related question →</button>`:""}${reportLink(b)}</div>`:"";
  return head+`<section class="fccard ${FC.flipped?"flipped":""}" aria-live="polite">
    <div class="meta"><span class="qnum">CARD ${FC.idx+1} / ${FC.ids.length}</span><span class="chip">Domain ${b.d}</span><span class="chip eco">ECO ${b.t}</span>${mark?`<span class="chip ${mark==="know"?"known":""}">${mark==="know"?"Known":"Review again"}</span>`:""}</div>
    <div class="fcface" data-fc="flip"><p class="qtext">${esc(b.q)}</p><ol class="fcopts">${opts}</ol>
      ${FC.flipped?"":`<span class="hint">Tap the card or press Space to show the answer</span>`}</div>
    ${back}
    <div class="qnav"><button class="btn" data-fc="prev" ${FC.idx?"":"disabled"}>← Previous</button>
      <div class="grp">${FC.flipped?`<button class="btn" data-fc="again">Review again</button><button class="btn primary" data-fc="know">Know it</button>`:`<button class="btn primary" data-fc="flip">Show answer</button>`}
      <button class="btn" data-fc="next" ${FC.idx<FC.ids.length-1?"":"disabled"}>Next →</button></div></div>
  </section>
  <p class="hint">Shortcuts: Space to flip, ← → to move, K for “Know it”, R for “Review again”. Swipe left or right on a phone. <button class="linkbtn" data-fc="shuffle">Shuffle again</button> · <button class="linkbtn" data-fc="reset">Clear my progress</button></p>`;
}
function cardQHTML(){
  const c=fcCard(),b=BANK[c.rel-1];if(!b){view="cards";return cardsHTML()}
  const perm=b.o.map((_,i)=>i);
  const opts=perm.map((o,k)=>`<div class="opt ${isAns(b,o)?"right":""}"><span class="k">${L[k]}</span><span class="t">${esc(b.o[o])}</span></div>`).join("");
  return `<section class="qcard cardq"><div class="meta"><span class="qnum">RELATED QUESTION</span><span class="chip">Domain ${b.d}</span><span class="chip eco">ECO ${b.t}</span><span class="chip lv${b.lv}">${LEVELS[b.lv]}</span></div>
    ${b.ctx?`<div class="ctx">${esc(b.ctx)}</div>`:""}<p class="qtext">${esc(b.q)}</p><div class="opts">${opts}</div>
    <div class="explain"><div class="exhead"><b>Answer: ${okLetters(b,perm)}</b>${langSwitch()}</div>${shortHTML(b)}${detailHTML(b,perm)}<div class="exfoot">${reportLink(b)}</div></div>
    <div class="qnav"><button class="btn primary" data-fc="back">← Back to card ${FC.idx+1}</button></div></section>`;
}
// keyboard and swipe for flashcards
document.addEventListener("keydown",e=>{if(view!=="cards"||!FC.ids.length||e.metaKey||e.ctrlKey||e.altKey)return;
  if(e.target.matches("input,textarea"))return;
  const k=e.key.toLowerCase();
  if(e.key===" "){e.preventDefault();fcAct("flip")}else if(e.key==="ArrowRight")fcAct("next");else if(e.key==="ArrowLeft")fcAct("prev");
  else if(k==="k"&&FC.flipped)fcAct("know");else if(k==="r"&&FC.flipped)fcAct("again")});
let touchX=null;
document.addEventListener("touchstart",e=>{if(view==="cards"&&e.target.closest(".fccard"))touchX=e.touches[0].clientX},{passive:true});
document.addEventListener("touchend",e=>{if(touchX===null)return;const dx=e.changedTouches[0].clientX-touchX;touchX=null;if(Math.abs(dx)>50)fcAct(dx<0?"next":"prev")},{passive:true});

function routeFromHash(){
  const h=location.hash.replace(/^#\/?/,"");
  if(view==="exam"||view==="result")return;
  if(view==="cardq")return;
  view=h==="about"?"about":h==="guide"?"guide":h==="cards"?"cards":"home";
  if(view==="cards"&&!FC.ids.length)fcBuild();
}
window.addEventListener("hashchange",()=>{if(view==="exam"||view==="result")return;if(view==="cardq")view="cards";routeFromHash();render();window.scrollTo(0,0)});

/* ---------- start: load the question bank, then draw ---------- */
async function loadBank(){
  const app=$("#app");
  app.innerHTML='<p class="empty">Loading questions…</p>';
  try{
    const res=await fetch("data/questions.json");
    if(!res.ok)throw new Error("HTTP "+res.status);
    const data=await res.json();
    BANK=[];
    // map the file's readable fields (docs/question-schema.md) to the short names the views use;
    data.forEach(x=>{const ex=x.explanation;BANK[x.id-1]={id:x.id,d:x.domain,lv:x.difficulty,q:x.question,o:x.options,a:x.answer,
      ex,t:x.task,ctx:x.context||"",n8:x.pmbok8Note||"",
      src:x.source.text,org:x.source.type,mode:x.mode,rel:x.related||0}});
    const byCtx={};BANK.forEach(b=>{if(b.ctx){(byCtx[b.ctx]=byCtx[b.ctx]||[]).push(b.id)}});
    GROUP={};Object.values(byCtx).forEach(g=>{if(g.length>1)g.forEach(id=>GROUP[id]=Math.min(...g))});
    routeFromHash();render();
  }catch(err){
    app.innerHTML=`<div class="empty"><b>Could not load the questions.</b><br>If you opened index.html straight from your disk, run a local web server instead (see the README). <small class="muted">${esc(err.message)}</small></div>`;
  }
}
loadBank();
