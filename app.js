const FEEDS = [
  {name:"Vogue Business", url:"https://news.google.com/rss/search?q=site%3Avogue.com%2Fbusiness%20fashion%20when%3A7d&hl=en-US&gl=US&ceid=US%3Aen", cat:"industry"},
  {name:"Vogue", url:"https://news.google.com/rss/search?q=site%3Avogue.com%20fashion%20when%3A7d&hl=en-US&gl=US&ceid=US%3Aen", cat:"runway"},
  {name:"WWD", url:"https://news.google.com/rss/search?q=site%3Awwd.com%20fashion%20when%3A7d&hl=en-US&gl=US&ceid=US%3Aen", cat:"industry"},
  {name:"Hypebeast", url:"https://news.google.com/rss/search?q=site%3Ahypebeast.com%20fashion%20when%3A7d&hl=en-US&gl=US&ceid=US%3Aen", cat:"culture"}
];

const FALLBACK = [
 {title:"Vogue Business continues its Fashion Industry coverage",source:"Vogue Business",cat:"industry",time:"TODAY",url:"https://www.vogue.com/business/fashion"},
 {title:"Milan remains at the center of the September fashion conversation",source:"Vogue",cat:"runway",time:"TODAY",url:"https://www.vogue.com/fashion"},
 {title:"WWD tracks the latest runway and footwear moments from Milan",source:"WWD",cat:"runway",time:"TODAY",url:"https://wwd.com/"},
 {title:"Fashion and technology move closer together",source:"GuidfromM Desk",cat:"tech",time:"TODAY",url:"https://www.guidfromm.info"}
];

let allItems = [];

function stripHTML(str){ const d=document.createElement("div"); d.innerHTML=str||""; return d.textContent||d.innerText||""; }
function cleanTitle(title){ return stripHTML(title).replace(/\s+-\s+(Vogue|WWD|Hypebeast|Vogue Business).*$/i,"").trim(); }
function timeAgo(date){
  const diff=Math.max(0,Date.now()-new Date(date).getTime());
  const mins=Math.floor(diff/60000);
  if(mins<60) return `${mins||1} MIN AGO`;
  const hrs=Math.floor(mins/60);
  if(hrs<24) return `${hrs} HR AGO`;
  return `${Math.floor(hrs/24)}D AGO`;
}
async function getFeed(feed){
  const proxy="https://api.allorigins.win/raw?url="+encodeURIComponent(feed.url);
  const res=await fetch(proxy,{signal:AbortSignal.timeout(7000)});
  if(!res.ok) throw new Error("feed failed");
  const xml=await res.text();
  const doc=new DOMParser().parseFromString(xml,"text/xml");
  return [...doc.querySelectorAll("item")].slice(0,6).map(item=>({
    title:cleanTitle(item.querySelector("title")?.textContent),
    source:feed.name, cat:feed.cat,
    time:timeAgo(item.querySelector("pubDate")?.textContent),
    url:item.querySelector("link")?.textContent || feed.url,
    date:new Date(item.querySelector("pubDate")?.textContent||Date.now()).getTime(),
    excerpt:stripHTML(item.querySelector("description")?.textContent||"").replace(/\s+/g," ").slice(0,150)
  }));
}
function render(items){
  const grid=document.getElementById("newsGrid");
  grid.innerHTML="";
  items.slice(0,12).forEach((item,i)=>{
    const el=document.createElement("article");
    el.className="news-card";
    el.dataset.cat=item.cat;
    el.innerHTML=`
      <div class="news-top"><span>${item.cat.toUpperCase()}</span><span>${item.time}</span></div>
      <h3>${escapeHTML(item.title)}</h3>
      <p>${escapeHTML(item.excerpt||"Latest reporting from the fashion industry.")}</p>
      <div class="news-bottom"><span>${escapeHTML(item.source)}</span><a href="${safeURL(item.url)}" target="_blank" rel="noopener">Original ↗</a></div>`;
    grid.appendChild(el);
  });
}
function escapeHTML(s){return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function safeURL(u){try{const x=new URL(u); return ["http:","https:"].includes(x.protocol)?x.href:"#"}catch{return "#"}}

async function loadNews(){
  const results=await Promise.allSettled(FEEDS.map(getFeed));
  allItems=results.flatMap(r=>r.status==="fulfilled"?r.value:[]);
  allItems.sort((a,b)=>(b.date||0)-(a.date||0));
  if(!allItems.length) allItems=FALLBACK;
  render(allItems);
  const status=document.getElementById("feedStatus");
  const live=results.filter(r=>r.status==="fulfilled").length;
  status.textContent=live ? `LIVE DESK · ${live}/${FEEDS.length} external feeds connected · refreshes when the page is opened` : "DESK PREVIEW · External feeds are temporarily unavailable; showing attributed fallback links.";
  document.getElementById("tickerTrack").textContent=allItems.slice(0,8).map(x=>`${x.source} — ${x.title}`).join("   •   ");
}
document.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));
  btn.classList.add("active");
  const f=btn.dataset.filter;
  render(f==="all"?allItems:allItems.filter(x=>x.cat===f));
}));
const menu=document.getElementById("mobileMenu");
document.getElementById("menuBtn").addEventListener("click",()=>menu.classList.add("open"));
document.getElementById("closeMenu").addEventListener("click",()=>menu.classList.remove("open"));
menu.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>menu.classList.remove("open")));
loadNews();
