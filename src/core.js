export const formatNumber = n => new Intl.NumberFormat('es-ES',{maximumFractionDigits:2,useGrouping:true}).format(n);
export const normalize = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ').trim();
export function madridDate(now=new Date()) {
 const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const get=t=>p.find(x=>x.type===t).value;return `${get('year')}-${get('month')}-${get('day')}`;
}
export function dateLabel(date) {return new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));}
export function search(catalog,query,used=[]) {
 const q=normalize(query);return catalog.entries.filter(e=>!used.includes(e.id)&&[e.name,...e.aliases].some(n=>normalize(n).includes(q)))
 .sort((a,b)=>Number(normalize(b.name)===q||b.aliases.some(x=>normalize(x)===q))-Number(normalize(a.name)===q||a.aliases.some(x=>normalize(x)===q))||a.name.localeCompare(b.name,'es'));
}
export const limitFor = challenge => challenge.mode==='combination'?5:1;
export const stateKey = (challenge,context='daily',attempt='') => `golf:v1:${context}:${challenge.date}:${challenge.mode}:${challenge.id}:v${challenge.version}:${attempt}`;
export const emptyState = () => ({picks:[],completed:false,updatedAt:null});
export function restore(raw,challenge,catalog) {
 try {const value=typeof raw==='string'?JSON.parse(raw):raw;
  if(!value||!Array.isArray(value.picks))return emptyState();
  if(value.picks.length>limitFor(challenge)||new Set(value.picks).size!==value.picks.length||value.picks.some(id=>!catalog.entries.some(e=>e.id===id)))return emptyState();
  return {...emptyState(),picks:value.picks,completed:value.picks.length===limitFor(challenge),updatedAt:value.updatedAt||null};
 }catch{return emptyState();}
}
export function commit(state,id,challenge,catalog,now=new Date().toISOString()) {
 if(state.completed||state.picks.length>=limitFor(challenge)||state.picks.includes(id)||!catalog.entries.some(e=>e.id===id))return state;
 const picks=[...state.picks,id];return {picks,completed:picks.length===limitFor(challenge),updatedAt:now};
}
export function score(challenge,catalog,picks) {
 if(picks.length!==limitFor(challenge))return null;
 const entries=picks.map(id=>catalog.entries.find(e=>e.id===id));
 if(entries.some(e=>!e)||new Set(picks).size!==picks.length)return null;
 const actual=challenge.mode==='combination'?entries.reduce((s,e)=>s+e.value,0):entries[0].rank;
 return {actual,delta:actual-challenge.target,distance:Math.abs(actual-challenge.target),entries,exact:actual===challenge.target};
}
// First four shots never read values, target or score. Their path depends only on shot number.
export function ballDestination(challenge,result,shot) {
 if(challenge.mode==='combination'&&shot<5)return {x:150+shot*60,y:260,hidden:true};
 if(!result)return {x:120,y:260,hidden:true};
 const scale=challenge.mode==='ranking'?5:Math.max(challenge.target*0.08,1);
 const offset=result.delta===0?0:Math.sign(result.delta)*(12+155*(1-Math.exp(-Math.abs(result.delta)/scale)));
 return {x:650+offset,y:260,hidden:false};
}
export function shareText(challenge,catalog,result,context='daily') {
 const mode=challenge.mode==='combination'?'Par 5':'Hole in One';
 const unit=challenge.mode==='ranking'?'puestos':catalog.unit;
 return `⛳ A Golpe\n${dateLabel(challenge.date)} · ${mode}${context==='practice'?' · Práctica':context==='archive'?' · Archivo':''}\n${challenge.mode==='combination'?'● ● ● ● ●':'●'} → ⚑\n${result.exact?(challenge.mode==='ranking'?'¡Hoyo en uno!':'¡Diana exacta!'):`A ${formatNumber(result.distance)} ${unit} del hoyo`}\n¿Te has quedado más cerca?`;
}
export function* combinations(entries,k=5,start=0,prefix=[]) {
 if(k===0){yield prefix;return;}
 for(let i=start;i<=entries.length-k;i++)yield* combinations(entries,k-1,i+1,[...prefix,entries[i]]);
}
export function bestSolutions(catalog,target) {
 if(catalog.entries.every(e=>Number.isInteger(e.value)&&e.value>=0&&e.value<=200)) {
  // Count distinct selections by size and sum without enumerating every group.
  const totals=Array.from({length:6},()=>new Map());
  totals[0].set(0,{count:1,example:[]});
  for(const entry of catalog.entries) {
   for(let size=5;size>0;size--) {
    for(const [sum,previous] of totals[size-1]) {
     const next=sum+entry.value;
     const existing=totals[size].get(next);
     if(existing) existing.count+=previous.count;
     else totals[size].set(next,{count:previous.count,example:[...previous.example,entry.id]});
    }
   }
  }
  let distance=Infinity,example=[],nearCount=0;
  for(const [sum,selection] of totals[5]) {
   const gap=Math.abs(sum-target);
   if(gap<distance){distance=gap;example=selection.example;}
   if(gap<=Math.max(3,target*0.1))nearCount+=selection.count;
  }
  return {distance,example,nearCount};
 }
 let distance=Infinity,example=[],nearCount=0;
 for(const group of combinations(catalog.entries)) {
  const d=Math.abs(group.reduce((s,e)=>s+e.value,0)-target);
  if(d<distance){distance=d;example=group.map(e=>e.id);}
  if(d<=Math.max(3,target*0.1))nearCount++;
 }
 return {distance,example,nearCount};
}
