(() => {
  "use strict";

  const storage={
    get(key,fallback){try{return localStorage.getItem(key)||fallback}catch{return fallback}},
    set(key,value){try{localStorage.setItem(key,value)}catch{} }
  };
  const readJSON=(key,fallback)=>{try{return JSON.parse(storage.get(key,""))||fallback}catch{return fallback}};
  const writeJSON=(key,value)=>storage.set(key,JSON.stringify(value));

  const state={
    view:"homeView",
    category:"ALL",
    viewMode:storage.get("lcc.saved.viewMode","card"),
    titleMode:storage.get("lcc.saved.titleMode","original"),
    query:"",
    items:[],
    loadedAt:null,
    commandHistory:readJSON("lcc.home.commandHistory",{})
  };

  const $=(s,root=document)=>root.querySelector(s);
  const $$=(s,root=document)=>[...root.querySelectorAll(s)];
  const assets=window.LCC_ASSETS||{};
  const iconMap={"日記":assets.diary,"気付き":assets.insight,"ルール":assets.rule,"その他":assets.other};
  const COMMANDS=["瞑想","イメージング","アファメーション","リーディング","ジャーナリング","エクササイズ","BTC1チャット"];
  const PRIVATE_SOURCE_REPO="https://github.com/nisiyasu/life-command-center";

  if(assets.home)$("#homeSkin").src=assets.home;
  if(assets.save)$("#savedHero").style.backgroundImage=`url("${assets.save}")`;

  function localDateKey(date=new Date()){
    const y=date.getFullYear();
    const m=String(date.getMonth()+1).padStart(2,"0");
    const d=String(date.getDate()).padStart(2,"0");
    return `${y}-${m}-${d}`;
  }

  function shiftDateKey(key,days){
    const [y,m,d]=key.split("-").map(Number);
    const date=new Date(y,m-1,d,12,0,0,0);
    date.setDate(date.getDate()+days);
    return localDateKey(date);
  }

  function activeCount(record){
    if(!record||typeof record!=="object")return 0;
    return COMMANDS.reduce((sum,command)=>sum+(record[command]===true?1:0),0);
  }

  function totalCommandCount(){
    return Object.values(state.commandHistory).reduce((sum,record)=>sum+activeCount(record),0);
  }

  function streakDays(){
    const today=localDateKey();
    let cursor=today;
    if(activeCount(state.commandHistory[cursor])===0){
      cursor=shiftDateKey(today,-1);
      if(activeCount(state.commandHistory[cursor])===0)return 0;
    }
    let streak=0;
    while(activeCount(state.commandHistory[cursor])>0){
      streak+=1;
      cursor=shiftDateKey(cursor,-1);
      if(streak>36500)break;
    }
    return streak;
  }

  function saveCommandHistory(){
    writeJSON("lcc.home.commandHistory",state.commandHistory);
  }

  function renderHomeProgress(){
    const today=localDateKey();
    const record=state.commandHistory[today]||{};
    const todayCount=activeCount(record);
    const total=totalCommandCount();
    const streak=streakDays();

    $$(".command-hit").forEach(btn=>{
      const done=record[btn.dataset.command]===true;
      btn.classList.toggle("is-done",done);
      btn.setAttribute("aria-pressed",String(done));
      btn.setAttribute("aria-label",`${btn.dataset.command} ${done?"達成済み":"未達成"}`);
    });

    const todayEl=$("#todayProgress");
    const totalEl=$("#totalProgress");
    const streakEl=$("#streakProgress");
    const msgEl=$("#progressMessage");
    const dateEl=$("#progressDate");
    if(todayEl)todayEl.textContent=`${todayCount}/7`;
    if(totalEl)totalEl.textContent=String(total);
    if(streakEl)streakEl.textContent=`${streak}日`;
    if(msgEl){
      if(todayCount===7)msgEl.textContent="TODAY CLEARED";
      else if(todayCount===0)msgEl.textContent="今日の一歩を積み上げる";
      else msgEl.textContent=`今日 ${todayCount}つ積み上げ`;
    }
    if(dateEl){
      const now=new Date();
      dateEl.textContent=`${now.getMonth()+1}/${now.getDate()}`;
    }
  }

  function toggleCommand(command){
    if(!COMMANDS.includes(command))return;
    const today=localDateKey();
    const record={...(state.commandHistory[today]||{})};
    const next=record[command]!==true;
    if(next)record[command]=true;
    else delete record[command];
    if(activeCount(record)===0)delete state.commandHistory[today];
    else state.commandHistory[today]=record;
    saveCommandHistory();
    renderHomeProgress();
    const todayCount=activeCount(state.commandHistory[today]);
    const total=totalCommandCount();
    toast(next?`${command} DONE｜今日 ${todayCount}/7｜累計 ${total}`:`${command} を取り消しました｜今日 ${todayCount}/7`);
  }

  function sourceUrl(item){
    const direct=String(item?.source_url||"").trim();
    if(direct.startsWith("https://github.com/"))return direct;
    const path=String(item?.source_path||"").trim().replace(/^\/+/,"");
    if(path){
      const encoded=path.split("/").map(encodeURIComponent).join("/");
      return `${PRIVATE_SOURCE_REPO}/blob/main/${encoded}`;
    }
    return PRIVATE_SOURCE_REPO;
  }

  function makeSourceLink(item,{compact=false}={}){
    const a=document.createElement("a");
    a.className=compact?"source-link source-link--compact":"source-link";
    a.href=sourceUrl(item);
    a.target="_blank";
    a.rel="noopener noreferrer";
    a.setAttribute("aria-label",`${item.organized_title||"保存項目"}のGitHub原本を開く`);
    a.textContent=compact?"GitHub ↗":"GitHub原本を開く ↗";
    return a;
  }

  async function loadItems({announce=false}={}){
    const status=$("#syncStatus");status.textContent="同期中…";
    try{
      const res=await fetch(`./data/saved-items.json?t=${Date.now()}`,{cache:"no-store"});
      if(!res.ok)throw new Error(`HTTP ${res.status}`);
      const payload=await res.json();
      if(!payload||!Array.isArray(payload.items))throw new Error("INVALID_INDEX");
      state.items=payload.items.map(item=>({...item}));
      state.loadedAt=new Date();
      renderSaved();
      status.textContent=`最終同期 ${fmtTime(state.loadedAt)}`;
      if(announce)toast("保存リストを更新しました");
    }catch(err){
      console.error(err);status.textContent="同期失敗";
      if(announce)toast("更新に失敗しました。もう一度お試しください");
    }
  }

  function fmtTime(date){return new Intl.DateTimeFormat("ja-JP",{hour:"2-digit",minute:"2-digit",hour12:false}).format(date)}
  function fmtDateTime(iso){try{const d=new Date(iso);if(Number.isNaN(d.getTime()))return "";const date=new Intl.DateTimeFormat("ja-JP",{year:"numeric",month:"2-digit",day:"2-digit"}).format(d);const time=new Intl.DateTimeFormat("ja-JP",{hour:"2-digit",minute:"2-digit",hour12:false}).format(d);return `${date} ${time}`}catch{return ""}}
  function filteredItems(){const q=state.query.trim().toLocaleLowerCase("ja");return state.items.filter(item=>state.category==="ALL"||item.category===state.category).filter(item=>!q||[item.organized_title,item.original_text,item.body].some(v=>String(v||"").toLocaleLowerCase("ja").includes(q))).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))}
  function safeText(text){return document.createTextNode(String(text??""))}

  function makeCard(item){
    const article=document.createElement("article");article.className=`saved-card cat-${item.category}`;article.dataset.id=item.id;
    const img=document.createElement("img");img.className="card-icon";img.src=iconMap[item.category]||iconMap["その他"]||"";img.alt="";img.loading="lazy";
    const copy=document.createElement("div");copy.className="card-copy";
    const label=document.createElement("span");label.className="category-label";label.append(safeText(item.category));
    const title=document.createElement("h3");title.className="card-title";title.append(safeText(state.titleMode==="original"?item.original_text:item.organized_title));copy.append(label,title);
    const side=document.createElement("div");side.className="card-side";
    const time=document.createElement("span");time.className="card-time";time.append(safeText(fmtDateTime(item.created_at).replace(" ","\n")));
    const open=document.createElement("button");open.className="open-btn";open.type="button";open.dataset.open=item.id;open.setAttribute("aria-label",`${item.organized_title}を開く`);open.textContent="開く ›";
    const source=makeSourceLink(item,{compact:true});
    side.append(time,open,source);article.append(img,copy,side);return article;
  }

  function renderSaved(){
    const list=$("#savedList");list.classList.toggle("card-mode",state.viewMode==="card");list.classList.toggle("list-mode",state.viewMode==="list");list.replaceChildren();
    const items=filteredItems();items.forEach(item=>list.append(makeCard(item)));
    $("#resultCount").textContent=`${items.length}件`;
    $("#activeSummary").textContent=`${state.category} / ${state.titleMode==="original"?"俺の原文":"整理タイトル"}`;
    $("#emptyState").classList.toggle("hidden",items.length!==0);
    $$("#categoryBar .chip").forEach(btn=>btn.classList.toggle("active",btn.dataset.category===state.category));
    $("#cardModeBtn").classList.toggle("active",state.viewMode==="card");$("#listModeBtn").classList.toggle("active",state.viewMode==="list");
    $("#organizedBtn").classList.toggle("active",state.titleMode==="organized");$("#originalBtn").classList.toggle("active",state.titleMode==="original");
  }

  function setView(id){state.view=id;$$('.view').forEach(v=>v.classList.toggle('active',v.id===id));$$('.nav-btn').forEach(btn=>{const active=btn.dataset.view===id;btn.classList.toggle('active',active);if(active)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current')});window.scrollTo({top:0,behavior:'auto'})}
  let toastTimer;function toast(message){const el=$("#commandToast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),1800)}
  function openDetail(id){
    const item=state.items.find(x=>x.id===id);if(!item)return;
    $("#detailCategory").textContent=item.category;
    $("#detailTitle").textContent=item.organized_title;
    $("#detailMeta").textContent=fmtDateTime(item.created_at);
    $("#detailOriginal").textContent=item.original_text;
    $("#detailBody").textContent=item.body;
    const source=$("#detailSourceLink");
    if(source){source.href=sourceUrl(item);source.setAttribute("aria-label",`${item.organized_title}のGitHub原本を開く`)}
    $("#detailModal").classList.remove("hidden");document.body.style.overflow="hidden";$(".modal-close").focus();
  }
  function closeDetail(){$("#detailModal").classList.add("hidden");document.body.style.overflow=""}

  $$(".nav-btn").forEach(btn=>btn.addEventListener("click",()=>setView(btn.dataset.view)));
  $$(".command-hit").forEach(btn=>btn.addEventListener("click",()=>toggleCommand(btn.dataset.command)));
  $("#searchInput").addEventListener("input",e=>{state.query=e.target.value;renderSaved()});
  $("#filterFocus").addEventListener("click",()=>$("#categoryBar").scrollIntoView({behavior:"smooth",block:"center"}));
  $("#categoryBar").addEventListener("click",e=>{const btn=e.target.closest("[data-category]");if(!btn)return;state.category=btn.dataset.category;renderSaved()});
  $$('[data-viewmode]').forEach(btn=>btn.addEventListener('click',()=>{state.viewMode=btn.dataset.viewmode;storage.set('lcc.saved.viewMode',state.viewMode);renderSaved()}));
  $$('[data-titlemode]').forEach(btn=>btn.addEventListener('click',()=>{state.titleMode=btn.dataset.titlemode;storage.set('lcc.saved.titleMode',state.titleMode);renderSaved()}));
  $("#sortSelect").addEventListener("change",renderSaved);
  $("#refreshBtn").addEventListener("click",()=>loadItems({announce:true}));
  $("#savedList").addEventListener("click",e=>{const btn=e.target.closest("[data-open]");if(btn)openDetail(btn.dataset.open)});
  $$('[data-close-modal]').forEach(el=>el.addEventListener('click',closeDetail));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$("#detailModal").classList.contains('hidden'))closeDetail()});

  renderHomeProgress();
  renderSaved();
  loadItems();
})();
