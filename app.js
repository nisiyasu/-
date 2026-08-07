(() => {
  "use strict";
  const storage={
    get(key,fallback){try{return localStorage.getItem(key)||fallback}catch{return fallback}},
    set(key,value){try{localStorage.setItem(key,value)}catch{} }
  };
  const state={view:"homeView",category:"ALL",viewMode:storage.get("lcc.saved.viewMode","card"),titleMode:storage.get("lcc.saved.titleMode","original"),query:"",items:[],loadedAt:null};
  const $=(s,root=document)=>root.querySelector(s); const $$=(s,root=document)=>[...root.querySelectorAll(s)];
  const assets=window.LCC_ASSETS||{};
  const iconMap={"日記":assets.diary,"気付き":assets.insight,"ルール":assets.rule,"その他":assets.other};
  if(assets.home)$("#homeSkin").src=assets.home;
  if(assets.save)$("#savedHero").style.backgroundImage=`url("${assets.save}")`;

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
    side.append(time,open);article.append(img,copy,side);return article;
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
  function setView(id){state.view=id;$$('.view').forEach(v=>v.classList.toggle('active',v.id===id));$$('.nav-btn').forEach(btn=>{const active=btn.dataset.view===id;btn.classList.toggle('active',active);if(active)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current')});window.scrollTo({top:0,behavior:'instant'})}
  let toastTimer;function toast(message){const el=$("#commandToast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),1800)}
  function openDetail(id){const item=state.items.find(x=>x.id===id);if(!item)return;$("#detailCategory").textContent=item.category;$("#detailTitle").textContent=item.organized_title;$("#detailMeta").textContent=fmtDateTime(item.created_at);$("#detailOriginal").textContent=item.original_text;$("#detailBody").textContent=item.body;$("#detailModal").classList.remove("hidden");document.body.style.overflow="hidden";$(".modal-close").focus()}
  function closeDetail(){$("#detailModal").classList.add("hidden");document.body.style.overflow=""}

  $$(".nav-btn").forEach(btn=>btn.addEventListener("click",()=>setView(btn.dataset.view)));
  $$(".command-hit").forEach(btn=>btn.addEventListener("click",()=>toast(`${btn.dataset.command}｜接続先は未設定`)));
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
  renderSaved();loadItems();
})();
