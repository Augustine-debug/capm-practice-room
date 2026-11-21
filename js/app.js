/* CAPM Practice Room · app logic. Questions are loaded from data/questions.json. */
const DOMAINS=[
 {n:1,name:"Project Management Fundamentals & Core Concepts",vi:"Nền tảng & khái niệm cốt lõi",w:36},
 {n:2,name:"Predictive, Plan-Based Methodologies",vi:"Phương pháp dự đoán (plan-based)",w:17},
 {n:3,name:"Agile Frameworks/Methodologies",vi:"Agile",w:20},
 {n:4,name:"Business Analysis Frameworks",vi:"Phân tích nghiệp vụ (BA)",w:27}
];
const LEVELS={1:"Cơ bản (Basic)",2:"Trung bình (Intermediate)",3:"Nâng cao (Advanced)"};
/* ECO 2023 tasks: code -> [English, Vietnamese] */
const TASKS={"1.1":["Demonstrate an understanding of the various project life cycles and processes","Vòng đời và quy trình dự án"],"1.2":["Demonstrate an understanding of project management planning","Lập kế hoạch quản lý dự án"],"1.3":["Demonstrate an understanding of project roles and responsibilities","Vai trò và trách nhiệm trong dự án"],"1.4":["Determine how to follow and execute planned strategies or frameworks","Thực thi chiến lược, khung đã lập (giao tiếp, rủi ro…)"],"1.5":["Demonstrate an understanding of common problem-solving tools and techniques","Công cụ, kỹ thuật giải quyết vấn đề"],"2.1":["Explain when it is appropriate to use a predictive, plan-based approach","Khi nào dùng predictive"],"2.2":["Demonstrate an understanding of a project management plan schedule","Lịch và kế hoạch dự án (WBS, critical path…)"],"2.3":["Determine how to document project controls of predictive, plan-based projects","Kiểm soát và artifact dự án predictive (EVM…)"],"3.1":["Explain when it is appropriate to use an adaptive approach","Khi nào dùng adaptive"],"3.2":["Determine how to plan project iterations","Lập kế hoạch iteration"],"3.3":["Determine how to document project controls for an adaptive project","Kiểm soát và artifact dự án adaptive"],"3.4":["Explain the components of an adaptive plan","Thành phần các phương pháp adaptive (Scrum, XP, SAFe, Kanban)"],"3.5":["Determine how to prepare and execute task management steps","Chuẩn bị và thực hiện quản lý task"],"4.1":["Demonstrate an understanding of business analysis (BA) roles and responsibilities","Vai trò và trách nhiệm BA"],"4.2":["Determine how to conduct stakeholder communication","Giao tiếp với stakeholder"],"4.3":["Determine how to gather requirements","Thu thập yêu cầu"],"4.4":["Demonstrate an understanding of product roadmaps","Product roadmap"],"4.5":["Determine how project methodologies influence business analysis processes","Ảnh hưởng của phương pháp lên BA"],"4.6":["Validate requirements through product delivery","Xác nhận yêu cầu qua bàn giao sản phẩm"]};

let BANK=[];  // filled by loadBank() from data/questions.json; BANK[id-1] = question with that id
const multi=b=>Array.isArray(b.a);
const need=b=>multi(b)?b.a.length:1;
const okAns=(v,b)=>v!==undefined&&(multi(b)?Array.isArray(v)&&v.length===b.a.length&&v.every(i=>b.a.includes(i)):v===b.a);
const isAns=(b,i)=>multi(b)?b.a.includes(i):i===b.a;
const picked=(v,i)=>Array.isArray(v)?v.includes(i):v===i;
const BANK_V=1;   // question-bank version, stored with each attempt
const MOCK_N={1:54,2:26,3:30,4:40}; // full mock: 150 questions drawn by ECO domain weight
function fullMockIds(){return shuffle(DOMAINS.flatMap(d=>shuffle(BANK.filter(b=>b.d===d.n&&b.mode==="exam").map(b=>b.id)).slice(0,MOCK_N[d.n])))}
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
const modeName={full:"Thi thử đầy đủ (Full mock)",custom:"Luyện tập tùy chọn (Custom practice)",retry:"Ôn câu sai (Review mistakes)"};

let S=null;          // active session
let view="home";
let tick=null;
let reviewFilter="all";
let railCollapsed=true;
let confirmOpen=false;
let confirmKind="submit";
let detailOpen=store.get("detailOpen",false);
const okLetters=(b,perm)=>perm.map((o,k)=>isAns(b,o)?L[k]:"").filter(Boolean).join(", ");
function detailHTML(b,perm){
  const ok=okLetters(b,perm);
  const wrong=perm.map((orig,pos)=>isAns(b,orig)?"":`<li><span class="wl">${L[pos]} sai · wrong</span><span>${esc(b.x[L[orig]])}</span></li>`).join("");
  const tk=TASKS[b.t];
  return `<details class="more"${detailOpen?" open":""}><summary>Giải thích chi tiết (Detailed explanation)</summary>
    <div class="why"><span class="wl ok">Vì sao ${ok} đúng · why correct</span><p>${esc(b.w)}</p></div>
    <ul class="wrongs">${wrong}</ul>
    ${b.n8?`<div class="n8"><span class="wl n8l">Ghi chú PMBOK 8 · PMBOK 8 note</span><p>${esc(b.n8)}</p></div>`:""}
    ${b.src?`<p class="ecoline muted">Nguồn: ${esc(b.src)}</p>`:""}
    ${tk?`<p class="ecoline"><span class="wl eco">ECO ${b.t}</span> ${esc(tk[1])} <span class="muted">(${esc(tk[0])})</span></p>`:""}</details>`;
}

/* ---------- session ---------- */
function newSession(mode,ids,opt){
  const perm={};ids.forEach(id=>{const r=BANK[id-1].o.map((_,i)=>i);perm[id]=opt.shuffleOpts?shuffle(r):r});
  S={mode,ids,perm,ans:{},flag:{},idx:0,elapsed:0,limit:opt.limit||0,instant:!!opt.instant,started:Date.now(),done:false};
  if(mode==="full"&&ids.length>SEC){S.phase="s1";S.brk=0}
  save();go("exam");
}
function save(){if(S&&!S.done)store.set("session",S);else store.del("session")}
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
  S.done=true;stopTick();
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
  const ids=shuffle(src.ids);
  const shuffleOpts=src.ids.some(id=>src.perm[id]&&src.perm[id].some((v,i)=>v!==i));
  newSession(src.mode,ids,{shuffleOpts,instant:src.instant,
    limit:src.mode==="full"?180*60:(src.limit?ids.length*72:0)});
}
const when=t=>new Date(t).toLocaleString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
function scopeOf(h){
  if(!h.ids)return "";
  const ds=[...new Set(h.ids.map(id=>BANK[id-1].d))].sort();
  return ds.length===4?"4 domain":ds.map(d=>"D"+d).join(", ");
}

/* ---------- views ---------- */
function render(){
  const app=$("#app");
  if(view==="home")app.innerHTML=homeHTML();
  else if(view==="exam")app.innerHTML=examHTML();
  else app.innerHTML=resultHTML();
  if(view==="home")syncCustom();
}

function homeHTML(){
  const saved=store.get("session",null);
  const wrong=store.get("wrong",[]);
  const hist=store.get("history",[]);
  const dChecks=DOMAINS.map(d=>`<label class="chk"><input type="checkbox" id="cd${d.n}" data-d="${d.n}" checked><span><b>Domain ${d.n}</b> · ${d.w}%<br><small class="muted">${esc(d.vi)} · ${esc(d.name)}</small></span><span class="n">${BANK.filter(b=>b.d===d.n).length}</span></label>`).join("");
  const tChecks=Object.keys(TASKS).map(t=>`<label class="chk"><input type="checkbox" id="ct${t.replace(".","_")}" data-t="${t}" checked><span><b class="mono">${t}</b> ${esc(TASKS[t][1])}<br><small class="muted">${esc(TASKS[t][0])}</small></span><span class="n">${BANK.filter(b=>b.t===t).length}</span></label>`).join("");
  const lChecks=[1,2,3].map(l=>`<label class="chk"><input type="checkbox" id="cl${l}" data-l="${l}" checked><span>${LEVELS[l]}</span><span class="n">${BANK.filter(b=>b.lv===l).length}</span></label>`).join("");
  return `
  <header class="mast">
    <div><div class="label">CAPM · Exam Content Outline 2023</div><h1>Phòng thi thử <span>CAPM</span></h1></div>
    <div class="spec"><div><b>150</b><small>câu hỏi · questions</small></div><div><b>180′</b><small>thời gian · time</small></div><div><b>72″</b><small>mỗi câu · pacing</small></div><div><b>135</b><small>câu tính điểm · scored</small></div><div><b>10′</b><small>nghỉ sau câu 75 · break</small></div></div>
  </header>
  ${saved&&!saved.done?`<div class="resume"><div><b>Bạn đang làm dở một bài (in progress).</b> <span class="muted">${modeName[saved.mode]} · đã trả lời ${Object.keys(saved.ans).length}/${saved.ids.length} câu · ${fmt(saved.elapsed)}</span></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-act="discard">Bỏ bài này</button><button class="btn primary" data-act="resume">Làm tiếp (Resume)</button></div></div>`:""}
  <section class="modes">
    <article class="mode">
      <div class="label">Chế độ 1</div>
      <h2>Thi thử đầy đủ <span class="en">Full mock exam</span></h2>
      <p>150 câu rút ngẫu nhiên từ ${BANK.filter(b=>b.mode==="exam").length} câu thi thử theo đúng tỉ trọng (domain weighting) 4 domain (D1 54 · D2 26 · D3 30 · D4 40), xáo trộn thứ tự, đếm ngược 3 giờ (timed). Chia 2 phần như thi thật: hết câu 75 có một lần nghỉ 10 phút (scheduled break, đồng hồ thi tạm dừng), sau đó không quay lại phần 1 được. Chỉ xem đáp án sau khi nộp bài (submit).</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary go" data-act="full">Bắt đầu thi 150 câu (Start exam)</button></div>
    </article>
    <article class="mode">
      <div class="label">Chế độ 3</div>
      <h2>Ôn câu sai <span class="en">Review mistakes</span></h2>
      <p>${wrong.length?`Bạn đang có <b class="mono">${wrong.length}</b> câu từng làm sai (incorrect) hoặc bỏ trống (unanswered). Câu nào làm đúng sẽ tự rời khỏi danh sách.`:"Chưa có câu sai nào. Sau mỗi lần nộp bài (submit), câu sai và câu bỏ trống sẽ được gom vào đây."}</p>
      <button class="btn go" data-act="retryAll" ${wrong.length?"":"disabled"}>Ôn ${wrong.length||""} câu sai (instant feedback)</button>
    </article>
    <article class="mode wide">
      <div class="label">Chế độ 2</div>
      <h2>Luyện tập tùy chọn <span class="en">Custom practice</span></h2>
      <div class="form">
        <fieldset><legend class="label">Domain</legend>${dChecks}</fieldset>
        <fieldset><legend class="label">Mức độ · Level</legend>${lChecks}
          <legend class="label" style="margin-top:10px">Tùy chọn · Options</legend>
          <label class="chk"><input type="checkbox" id="oShuffle" checked><span>Trộn thứ tự câu hỏi (shuffle questions)</span></label>
          <label class="chk"><input type="checkbox" id="oOpts"><span>Đảo thứ tự đáp án (shuffle options)</span></label>
          <label class="chk"><input type="checkbox" id="oInstant" checked><span>Hiện đáp án và giải thích ngay sau mỗi câu (instant feedback)</span></label>
          <label class="chk"><input type="checkbox" id="oTimer"><span>Bấm giờ 72 giây/câu như thi thật (timed)</span></label>
        </fieldset>
      </div>
      <details class="taskpick"><summary>Lọc theo nhiệm vụ ECO (filter by ECO task) <span id="taskInfo" class="muted"></span></summary>
        <div class="trow"><button type="button" class="btn sm" data-act="tasksAll">Chọn tất cả (all)</button><button type="button" class="btn sm" data-act="tasksNone">Bỏ chọn hết (none)</button></div>
        <div class="taskgrid">${tChecks}</div></details>
      <div class="row">
        <div style="flex:1;min-width:220px"><div class="label" style="margin-bottom:6px">Số câu · Questions <span id="poolInfo" class="muted" style="text-transform:none;letter-spacing:0;font-weight:400"></span></div>
          <div class="range"><input type="range" id="oCount" min="1" max="${BANK.length}" value="20"><output id="oCountOut">20</output></div></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary" id="startCustom" data-act="custom">Bắt đầu luyện tập (Start)</button></div>
      </div>
    </article>
  </section>
  <section class="ledger">
    <h2>Lịch sử làm bài <span class="en">History</span></h2>
    <p class="muted" style="margin:0 0 10px;font-size:14px">Mở lại một lần làm bài để xem lại (review) từng câu kèm giải thích, làm lại (retake) nguyên đề, hoặc chỉ làm lại các câu sai của lần đó.</p>
    <div class="tablewrap">${hist.length?`<table class="hist"><thead><tr><th>Thời điểm</th><th>Chế độ</th><th>Kết quả</th><th>Điểm</th><th>Thời gian</th><th>Ôn tập</th></tr></thead><tbody>
      ${hist.map(h=>{const p=Math.round(h.c/h.n*100);const ok=!!h.ids;const wrongN=ok?h.ids.filter(id=>!okAns(h.ans[id],BANK[id-1])).length:0;
        return `<tr><td>${when(h.t)}</td><td>${modeName[h.mode]}${ok?`<br><small class="muted">${scopeOf(h)}</small>`:""}${h.drop?`<br><small class="muted">Bộ câu cũ · ${h.drop} câu đã thay mới, không còn để xem lại</small>`:""}</td><td class="mono">${h.c}/${h.n}</td><td><span class="pill ${pctClass(p)}">${p}%</span></td><td class="mono">${fmt(h.s)}</td>
        <td>${ok?`<div class="hact"><button class="btn sm primary" data-review="${h.t}">Xem lại (Review)</button><button class="btn sm" data-redo="${h.t}">Làm lại (Retake)</button>${wrongN?`<button class="btn sm" data-redowrong="${h.t}">${wrongN} câu sai</button>`:""}</div>`
          :`<small class="muted">Bài cũ, không lưu chi tiết</small>`}</td></tr>`}).join("")}
    </tbody></table>`:`<div class="empty">Chưa có lần làm bài nào. Kết quả của bạn sẽ được lưu ở đây, chỉ trên trình duyệt này.</div>`}</div>
    <p class="note">Theo PMI Certification Handbook (6/2026) và CAPM ECO 2023: đề có 150 câu, gồm 135 câu tính điểm (scored) và 15 câu thử nghiệm không tính điểm (pretest/unscored) nằm lẫn ngẫu nhiên; thời gian 3 giờ, nghỉ 10 phút sau câu 75. Điểm đậu theo tiêu chí (criteria-based passing score) và không công bố; app dùng 70% làm mốc tham khảo (reference mark). Đề thật còn có dạng kéo thả/ghép cặp (drag-and-drop/matching), hotspot; app này dùng trắc nghiệm một đáp án (multiple choice) và nhiều đáp án (multiple response, "Select two/three"). Ngân hàng có ${BANK.length} câu (${BANK.filter(b=>b.mode==="exam").length} câu thi thử, ${BANK.filter(b=>b.mode==="definition").length} câu ôn định nghĩa): phần lớn tự soạn, ${BANK.filter(b=>b.org!=="own").length} câu phỏng theo nguồn mở giấy phép CC, có ghi nguồn ở từng câu. Mỗi câu gắn nhãn nhiệm vụ ECO (ECO task); thuật ngữ theo PMBOK 7, kèm ghi chú PMBOK 8 ở những câu có thay đổi. Tiến độ và lịch sử được lưu trên trình duyệt bạn đang dùng.</p>
  </section>`;
}

function pool(){
  const ds=DOMAINS.filter(d=>$("#cd"+d.n)?.checked).map(d=>d.n);
  const ls=[1,2,3].filter(l=>$("#cl"+l)?.checked);
  const ts=new Set(Object.keys(TASKS).filter(t=>{const el=document.getElementById("ct"+t.replace(".","_"));return !el||el.checked}));
  return BANK.filter(b=>ds.includes(b.d)&&ls.includes(b.lv)&&ts.has(b.t)).map(b=>b.id);
}
function syncCustom(){
  const p=pool(),r=$("#oCount"),o=$("#oCountOut");if(!r)return;
  const max=Math.max(1,p.length);r.max=max;if(+r.value>max)r.value=max;
  o.textContent=p.length?r.value:0;
  $("#poolInfo").textContent=`(có ${p.length} câu phù hợp)`;
  const tAll=Object.keys(TASKS).length,tOn=document.querySelectorAll(".taskgrid input:checked").length;
  const ti=$("#taskInfo");if(ti)ti.textContent=`· ${tOn===tAll?"tất cả":tOn}/${tAll} task`;
  $("#startCustom").disabled=!p.length;
}

function breakHTML(){
  const s1=S.ids.slice(0,SEC),a1=s1.filter(id=>S.ans[id]!==undefined).length;
  return `<section class="breakbox">
    <div class="label">Thi thử đầy đủ · Full mock · Hết phần 1</div>
    <h2>Nghỉ giải lao <span class="en">Scheduled break</span></h2>
    <div class="brkclock"><b id="brk">${fmt(BREAK-S.brk)}</b><small>còn lại · remaining</small></div>
    <p>Bạn đã khóa phần 1 (câu 1–75, đã trả lời ${a1}/${SEC}). Đồng hồ thi đang dừng (exam clock paused), còn <b class="mono">${fmt(S.limit-S.elapsed)}</b> cho phần 2. Hết 10 phút, phần 2 tự bắt đầu. Bạn có thể vào sớm hơn.</p>
    <div class="row"><button class="btn ghost" data-act="pause">Tạm dừng (Pause)</button><button class="btn primary" data-act="sec2">Bắt đầu phần 2 (Start section 2) →</button></div>
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
    return `<button class="${c}" data-jump="${i}" aria-label="Câu ${i+1}"${lk?" disabled":""}>${i+1}</button>`}).join("");
  const [r0,r1]=secRange();
  const secIds=S.ids.slice(r0,r1+1),secUn=secIds.filter(id=>S.ans[id]===undefined).length;
  const unanswered=n-answered,flagged=Object.values(S.flag).filter(Boolean).length;
  return `
  <div class="bar">
    <div class="title">${modeName[S.mode]}</div>
    <div class="stat"><b>${S.idx+1}/${n}</b><small>câu</small></div>
    <div class="stat hideable"><b>${answered}</b><small>đã làm</small></div>
    ${S.phase?`<div class="stat hideable"><b>${S.phase==="s1"?1:2}/2</b><small>phần</small></div>`:""}
    <div class="stat timer ${S.limit&&rem<=300?"low":""}" id="timer"><b>${fmt(rem)}</b><small>${S.limit?"còn lại":"đã dùng"}</small></div>
    <div class="spacer"></div>
    <button class="btn ghost" data-act="pause">Tạm dừng (Pause)</button>
    <button class="btn primary" data-act="ask">Nộp bài</button>
    <div class="progress"><i style="width:${answered/n*100}%"></i></div>
  </div>
  <div class="exam">
    <main class="qcard">
      <div class="meta"><span class="qnum">CÂU ${S.idx+1}</span><span class="chip">Domain ${d.n} · ${esc(d.vi)}</span><span class="chip lv${b.lv}">${LEVELS[b.lv]}</span><span class="chip eco" title="${esc((TASKS[b.t]||[""])[0])}">ECO ${b.t}</span>${multi(b)?`<span class="chip new">Chọn ${need(b)} · Select ${need(b)}</span>`:""}<span class="chip">#${b.id}</span></div>
      ${b.ctx?`<div class="ctx">${esc(b.ctx)}</div>`:""}
      <p class="qtext">${esc(b.q)}</p>
      <div class="opts">${opts}</div>
      ${multi(b)&&!locked?`<p class="hint" style="margin:-4px 0 12px">Câu nhiều đáp án (multiple response): đã chọn ${(sel||[]).length}/${need(b)}. Bấm lại để bỏ chọn.</p>`:""}
      ${locked?`<div class="explain ${okAns(sel,b)?"ok":"bad"}"><b>${okAns(sel,b)?"Chính xác (Correct)":"Chưa đúng (Incorrect) — đáp án "+okLetters(b,perm)}</b>${esc(b.e)}${detailHTML(b,perm)}</div>`:""}
      <div class="qnav">
        <button class="btn" data-act="prev" ${S.idx===r0?"disabled":""}>← Câu trước (Prev)</button>
        <div class="grp">
          <button class="btn ${S.flag[b.id]?"flagon":""}" data-act="flag">${S.flag[b.id]?"Bỏ đánh dấu (Unflag)":"Đánh dấu xem lại (Flag)"}</button>
          ${S.phase==="s1"&&S.idx===SEC-1?`<button class="btn primary" data-act="next">Kết thúc phần 1 (End section 1) →</button>`:S.idx<n-1?`<button class="btn primary" data-act="next">Câu sau (Next) →</button>`:`<button class="btn primary" data-act="ask">Nộp bài</button>`}
        </div>
      </div>
      <p class="hint">Phím tắt (shortcuts): A–E hoặc 1–5 để chọn, ← → để chuyển câu, F để đánh dấu (flag).</p>
    </main>
    <aside class="rail ${railCollapsed?"collapsed":""}">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
        <div class="label">Bảng câu hỏi · Navigator</div>
        <button class="btn ghost railtoggle" data-act="rail" style="min-height:32px;padding:4px 10px">${railCollapsed?"Hiện":"Ẩn"}</button>
      </div>
      <div class="legend"><span><i class="a"></i>Đã làm (answered)</span><span><i></i>Chưa làm</span><span><i class="f"></i>Đánh dấu (flagged)</span></div>
      <div class="grid">${cells}</div>
      <div class="muted" style="font-size:13px">${unanswered} chưa làm · ${flagged} đánh dấu${S.phase?` · ${S.phase==="s1"?"phần 1: câu 1–75":"phần 2: câu 76–150 (phần 1 đã khóa)"}`:""}</div>
    </aside>
  </div>
  ${confirmOpen&&confirmKind==="sec"?`<div class="overlay" data-act="close"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlgT">
    <h3 id="dlgT">Kết thúc phần 1? <span class="en">End section 1?</span></h3>
    <p style="margin:0">Sau khi kết thúc, bạn được nghỉ 10 phút rồi sang phần 2 và <b>không quay lại câu 1–75 được</b> (no return).${secUn?` Phần 1 còn <b>${secUn}</b> câu chưa trả lời.`:" Bạn đã trả lời hết phần 1."}</p>
    <div class="row"><button class="btn" data-act="close">Ở lại phần 1 (Stay)</button><button class="btn primary" data-act="endsec">Kết thúc phần 1 (End section)</button></div>
  </div></div>`:""}
  ${confirmOpen&&confirmKind!=="sec"?`<div class="overlay" data-act="close"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlgT">
    <h3 id="dlgT">Nộp bài? <span class="en">Submit exam?</span></h3>
    <p style="margin:0">${unanswered?`Còn <b>${unanswered}</b> câu chưa trả lời, sẽ được tính là sai (incorrect).`:"Bạn đã trả lời tất cả câu hỏi."}${flagged?` Có <b>${flagged}</b> câu đang đánh dấu xem lại.`:""}</p>
    <div class="row"><button class="btn" data-act="close">Làm tiếp (Continue)</button><button class="btn primary" data-act="submit">Nộp bài</button></div>
  </div></div>`:""}`;
}

function bar(label,c,n,w){const p=n?Math.round(c/n*100):0;
  const col=p>=75?"var(--ok)":p>=65?"var(--flag)":"var(--bad)";
  return `<div class="brk"><div class="top"><span>${label}</span><span>${c}/${n} · ${p}%</span></div><div class="track"><i style="width:${p}%;background:${col}"></i><span class="mark" title="Mốc 70%"></span></div></div>`}

function resultHTML(){
  const ids=S.ids,n=ids.length,c=ids.filter(isRight).length,p=Math.round(c/n*100);
  const skipped=ids.filter(id=>S.ans[id]===undefined).length;
  const verdict=p>=75?"Vững vàng (on track). Bạn đang trên mốc tham khảo 70% với khoảng dư an toàn (safety margin)."
    :p>=65?"Sát ngưỡng (borderline). Ôn lại các domain dưới 70% trước khi thi."
    :"Cần ôn thêm (needs work). Tập trung vào domain có tỉ lệ thấp nhất (weakest domain) và làm lại câu sai.";
  const byD=DOMAINS.map(d=>{const s=ids.filter(id=>BANK[id-1].d===d.n);return s.length?bar(`D${d.n} · ${d.vi} <span class="muted">(${d.w}%)</span>`,s.filter(isRight).length,s.length):""}).join("");
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
      return `<div class="opt ${cls}"><span class="k">${L[k]}</span><span class="t">${esc(b.o[orig])}${picked(sel,orig)?' <small class="muted">· bạn chọn (your answer)</small>':""}</span></div>`}).join("");
    return `<article class="ritem ${st}"><div class="meta"><span class="qnum">CÂU ${pos+1}</span><span class="chip">Domain ${b.d}</span><span class="chip lv${b.lv}">${LEVELS[b.lv]}</span><span class="chip eco" title="${esc((TASKS[b.t]||[""])[0])}">ECO ${b.t}</span>${st==="skip"?'<span class="chip">Bỏ trống · Unanswered</span>':""}${S.flag[id]?'<span class="chip" style="color:var(--flag)">Đã đánh dấu · Flagged</span>':""}</div>
      ${b.ctx?`<div class="ctx">${esc(b.ctx)}</div>`:""}<p class="qtext">${esc(b.q)}</p><div class="opts">${opts}</div>
      <div class="explain"><b>Đáp án ${okLetters(b,perm)}</b>${esc(b.e)}${detailHTML(b,perm)}</div></article>`}).join("");
  return `
  <header class="mast"><div><div class="label">${modeName[S.mode]} · ${n} câu${S.t?" · "+when(S.t):""}${S.drop?` · ${S.drop} câu cũ đã thay mới, không hiển thị`:""}</div><h1>${S.fromHistory?"Xem lại bài làm":"Kết quả"} <span class="en">${S.fromHistory?"Review":"Results"}</span></h1></div>
    <div class="spec"><div><b>${fmt(S.elapsed)}</b><small>thời gian làm · time used</small></div><div><b>${n?fmt(S.elapsed/n):"0:00"}</b><small>trung bình/câu · per question</small></div></div></header>
  <section class="score">
    <div class="big"><div class="label">Điểm · Score</div><div class="pct" style="color:var(--${pctClass(p)==="mid"?"flag":pctClass(p)})">${p}%</div>
      <div class="sub">${c} đúng (correct) · ${n-c-skipped} sai (incorrect) · ${skipped} bỏ trống (unanswered)</div><p class="verdict">${verdict}</p></div>
    <div class="panel"><h3>Theo domain · By domain</h3>${byD}<h3 style="margin-top:6px">Theo mức độ · By level</h3>${byL}
      <div class="muted" style="font-size:12px">Vạch đứng trên mỗi thanh là mốc 70% (reference pass mark). Bảng điểm thật của PMI cũng báo kết quả theo từng domain.</div></div>
  </section>
  <section class="panel tpanel">
    <details${tStats.length<=6?" open":""}><summary><h3>Theo nhiệm vụ ECO · By ECO task <span class="muted" style="font-weight:400">(${tStats.length} task)</span></h3></summary>
      ${weak.length?`<p class="weak">Cần ôn trước (weakest tasks): ${weak.map(x=>`<b class="mono">${x.t}</b> ${esc(TASKS[x.t][1])} (${x.c}/${x.n})`).join(" · ")}</p>`:""}
      <div class="tgrid">${byT}</div></details>
  </section>
  <div class="actions">
    <button class="btn primary" data-act="retryThis" ${wrongIds.length?"":"disabled"}>Làm lại ${wrongIds.length} câu sai (Retry mistakes)</button>
    <button class="btn" data-act="redoThis">Làm lại cả bài (Retake · ${n} câu)</button>
    <button class="btn" data-act="history">Về lịch sử làm bài (History)</button>
  </div>
  <div class="tabs" role="tablist">
    ${[["all","Tất cả · All",flt.all.length],["wrong","Sai · Incorrect",flt.wrong.length],["skip","Bỏ trống · Unanswered",flt.skip.length],["flag","Đánh dấu · Flagged",flt.flag.length]].map(([k,t,cnt])=>`<button class="tab ${reviewFilter===k?"on":""}" data-filter="${k}" role="tab" aria-selected="${reviewFilter===k}">${t} · ${cnt}</button>`).join("")}
  </div>
  <section class="rev">${items||'<div class="empty">Không có câu nào trong mục này (no questions here).</div>'}</section>`;
}

function isLocked(b){const v=S.ans[b.id];return S.instant&&v!==undefined&&(!multi(b)||v.length>=need(b))}
function pick(orig){const b=q();if(isLocked(b))return;
  if(multi(b)){const v=(S.ans[b.id]||[]).slice();const i=v.indexOf(orig);
    if(i>=0)v.splice(i,1);else{if(v.length>=need(b))v.shift();v.push(orig)}
    if(v.length)S.ans[b.id]=v.sort((x,y)=>x-y);else delete S.ans[b.id]}
  else S.ans[b.id]=orig;
  save();render()}
/* ---------- events ---------- */
document.addEventListener("click",e=>{
  const t=e.target.closest("[data-act],[data-pick],[data-jump],[data-filter],[data-review],[data-redo],[data-redowrong]");if(!t)return;
  if(t.dataset.review){const h=fromHistory(+t.dataset.review);if(h){S=h;reviewFilter="all";go("result")}return}
  if(t.dataset.redo){const h=fromHistory(+t.dataset.redo);if(h)redo(h);return}
  if(t.dataset.redowrong){const h=fromHistory(+t.dataset.redowrong);if(h){const w=h.ids.filter(id=>!okAns(h.ans[id],BANK[id-1]));if(w.length)newSession("retry",shuffle(w),{instant:true})}return}
  if(t.dataset.pick!==undefined){pick(+t.dataset.pick);return}
  if(t.dataset.jump!==undefined){const i=+t.dataset.jump;if(!canGo(i))return;S.idx=i;save();render();return}
  if(t.dataset.filter){reviewFilter=t.dataset.filter;render();return}
  const a=t.dataset.act;
  if(a==="close"&&t.classList.contains("overlay")&&e.target!==t)return;
  switch(a){
    case "full":{const ids=fullMockIds();newSession("full",ids,{limit:180*60});break}
    case "custom":{const p=pool();const ids=($("#oShuffle").checked?shuffle(p):p).slice(0,+$("#oCount").value);
      newSession("custom",ids,{shuffleOpts:$("#oOpts").checked,instant:$("#oInstant").checked,limit:$("#oTimer").checked?ids.length*72:0});break}
    case "retryAll":{const w=store.get("wrong",[]);if(w.length)newSession("retry",shuffle(w),{instant:true});break}
    case "retryThis":{const w=S.ids.filter(id=>!isRight(id));if(w.length)newSession("retry",shuffle(w),{instant:true});break}
    case "resume":S=store.get("session",null);if(S)go("exam");break;
    case "discard":store.del("session");S=null;render();break;
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

/* ---------- start: load the question bank, then draw ---------- */
async function loadBank(){
  const app=$("#app");
  app.innerHTML='<p class="empty">Đang tải ngân hàng câu hỏi… (loading questions)</p>';
  try{
    const res=await fetch("data/questions.json");
    if(!res.ok)throw new Error("HTTP "+res.status);
    const data=await res.json();
    BANK=[];
    // map the file's readable fields (docs/question-schema.md) to the short names the views use;
    // explanations show in Vietnamese for now, the EN/VI switch comes with E2 (#18)
    data.forEach(x=>{const ex=x.explanation;BANK[x.id-1]={id:x.id,d:x.domain,lv:x.difficulty,q:x.question,o:x.options,a:x.answer,
      e:ex.short.vi,w:ex.whyCorrect.vi,x:ex.whyWrong.vi,ex,t:x.task,ctx:x.context||"",n8:x.pmbok8Note||"",
      src:x.source.text,org:x.source.type,mode:x.mode,rel:x.related||0}});
    render();
  }catch(err){
    app.innerHTML=`<div class="empty"><b>Không tải được ngân hàng câu hỏi (could not load questions).</b><br>Nếu bạn đang mở file index.html trực tiếp trên máy, hãy chạy một web server cục bộ, xem README (run a local server, see README). <small class="muted">${esc(err.message)}</small></div>`;
  }
}
loadBank();
