import {catalogs as classicCatalogs} from './data.js';
import {roundCatalogs} from './round-catalogs.js';
import {formatNumber as fmt,normalize,madridDate,dateLabel,search,limitFor,blindFor,modeName,tally,stateKey,emptyState,restore,commit,score,ballDestination,shareText} from './core.js';
import {courseSVG} from './course.js';

const app=document.querySelector('#app');
const catalogs={...classicCatalogs,...roundCatalogs};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=(name,size=20)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${({progress:'<circle cx="5" cy="17" r="2" fill="currentColor" stroke="none"/><path d="M7 14q4-7 8-3" stroke-dasharray="1 2.4"/><path d="M18 19V5l4 2-4 2M15 19h6"/>',blind:'<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z"/><path d="m3 21 18-18"/>',under:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',flag:'<path d="M5 21V3l14 4-14 5"/>',arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',back:'<path d="M20 12H4m6-6-6 6 6 6"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',check:'<path d="m5 12 4 4L19 6"/>',share:'<path d="M12 16V3m-4 4 4-4 4 4M5 12v8h14v-8"/>',copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',sound:'<path d="m3 9 4 0 5-5v16l-5-5H3ZM16 8q6 4 0 8"/>',leaf:'<path d="M5 19C-2 5 15 2 21 3c0 13-7 19-16 16Zm0 0L16 8"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>'})[name]||''}</svg>`;
let challenges=[],today=madridDate(),route={},active=null,selected=null,suggestions=[],suggestionIndex=-1,animating=false,animationFrame=0,animationDone=null,storageFailed=false;
const reducedQuery=matchMedia('(prefers-reduced-motion: reduce)');
let sound=false,motionOff=false;
try {sound=localStorage.getItem('golf:sound')==='true';motionOff=localStorage.getItem('golf:motion')==='true';}catch{storageFailed=true;}
const isReduced=()=>reducedQuery.matches||motionOff;
const canonicalContext=context=>context==='practice'?'practice':'daily';
const keyFor=(c,context,attempt='')=>stateKey(c,canonicalContext(context),attempt);
const readState=(c,context='daily',attempt='')=>{try{return restore(localStorage.getItem(keyFor(c,context,attempt)),c,catalogs[c.catalogId]);}catch{storageFailed=true;return emptyState();}};
function saveState(c,state,context,attempt='') {
 try {localStorage.setItem(keyFor(c,context,attempt),JSON.stringify({...state,challengeId:c.id,context:canonicalContext(context),attempt}));return true;}
 catch{storageFailed=true;toast('No se puede guardar. Conserva esta pestaña abierta para seguir jugando.');return false;}
}
function toast(text){const el=document.querySelector('#toast');el.textContent=text;el.classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('visible'),3500);}
function announce(text){document.querySelector('#announcer').textContent=text;}
function href(c,context='daily',attempt=''){return `#play/${c.mode}/${c.date}/${context}${attempt?'/'+encodeURIComponent(attempt):''}${c.hole?(attempt?'':'/')+'/'+c.hole:''}`;}
function statusSpanish(c){const s=readState(c);return s.completed?'Completado':s.picks.length?'En juego':'Sin jugar';}
function header(current='home') {
 return `<header class="site-header"><a class="brand" href="#" aria-label="A Golpe, inicio"><img class="brand-symbol" src="./favicon.svg" alt=""><span>A Golpe<span class="brand-small">de cultura general</span></span></a><nav aria-label="Navegación principal"><a href="#" class="${current==='home'?'active':''}">El campo</a><a href="#archive" class="${current==='archive'?'active':''}">Archivo</a><a href="#history" class="${current==='history'?'active':''}">Mi tarjeta</a></nav><button class="help-button" data-action="help" aria-label="Cómo se juega">?</button></header>`;
}
function footer(){return `<footer class="site-footer"><span>${icon('flag',16)} Un poco de saber. Un buen golpe.</span><span>Sin registro · Tu progreso se guarda aquí</span><button class="text-button" data-action="about">Datos y privacidad</button></footer>`;}
function storageNotice(){return storageFailed?'<p class="notice" role="alert">El navegador no permite guardar la partida. Puedes jugar, pero al cerrar o recargar se perderá este progreso.</p>':'';}
function home(){
 const daily=dailyHoles(today);
 return `${header()}<main id="main"><section class="hero"><div class="hero-copy"><div class="eyebrow"><span class="live-dot"></span> TU PAUSA DIARIA, EN EL GREEN</div><h1>Mucho ojo.<br><em>Buen golpe.</em></h1><p>El juego te da una cifra.<br>Tú apuntas y das el golpe.</p><a class="hero-link" href="#daily">Salir al campo ${icon('arrow',19)}</a></div><div class="hero-art">${courseSVG({hero:true,id:'hero'})}<span class="art-note">No hace falta saberlo todo.<br>Solo acercarse un poco más.</span></div></section>${storageNotice()}<section class="daily-section" id="daily"><div class="section-title"><div><h2>Hoy se sale al campo.</h2>${daily.length===6?'<p>Seis hoyos, cuatro modalidades.</p>':''}</div><span class="date-label">${dateLabel(today)} <span>· Madrid</span></span></div>${daily.length?`<div class="challenge-grid">${daily.filter(c=>!c.hole||c.hole<=4).map(c=>challengeCard(c,daily)).join('')}</div><div class="daily-meta"><span>${icon('clock',16)} Nueva vuelta a medianoche de Madrid</span><a href="#archive">¿Con ganas de otro hoyo? Visita el archivo ${icon('arrow',16)}</a></div>`:`<div class="empty-card"><h3>El campo de hoy aún no está preparado.</h3><p>El calendario disponible va del ${dateLabel(challenges[0].date)} al ${dateLabel(challenges.at(-1).date)}. Mientras preparamos más retos, puedes jugar los anteriores.</p><a class="button primary" href="#archive">Ir al archivo ${icon('arrow')}</a></div>`}</section><section class="how-strip" aria-label="Cómo jugar"><div><span>01</span><p><strong>Prepara tu golpe.</strong><br>Busca entre las opciones del hoyo.</p></div><div><span>02</span><p><strong>Confía en tu golpe.</strong><br>Selecciona, confirma y mira volar.</p></div><div><span>03</span><p><strong>Compara tu distancia.</strong><br>Cuanto más cerca, mejor partida.</p></div></section></main>${footer()}`;
}
function dailyHoles(date){
 const day=challenges.filter(c=>c.date===date);
 const round=day.filter(c=>c.hole);
 return round.length?round:day;
}
function challengeCard(c,daily){
 const combo=c.mode!=='ranking',cat=catalogs[c.catalogId];
 const group=c.hole===4?daily.filter(h=>h.mode==='ranking'):[c];
 const states=group.map(h=>readState(h));
 const done=states.filter(s=>s.completed).length, started=states.some(s=>s.picks.length);
 const next=group.find((h,i)=>!states[i].completed)||c;
 const description={par:'Ve tu suma después de cada golpe.',blind:'Descubre la suma al final del hoyo.',under:'Llega a la cifra con el mínimo de golpes.',combination:'Cinco golpes para acercarte a la cifra.',ranking:group.length===3?'Tres hoyos, un golpe en cada uno.':'Un golpe para acercarte al puesto.'}[c.mode];
 return `<a class="challenge-card ${combo?"combination-card":"ranking-card"} mode-card-${c.mode}" href="${href(next)}"><div class="card-top"><span class="status-pill ${done===group.length?"done":""}">${group.length>1?`${done} de ${group.length} hoyos`:statusSpanish(c)}</span></div><div class="card-main"><div><h3>${modeName(c)}</h3><p>${description}</p></div><div class="card-emblem" aria-hidden="true">${icon(({par:"progress",blind:"blind",under:"under"})[c.mode]||"flag",48)}</div></div><div class="card-bottom"><span>${group.length===3?"Hoyos 4–6":c.hole?`Hoyo ${c.hole} · ${cat.category}`:cat.category}<b>${combo?(c.mode==="under"?`${fmt(c.target)} ${cat.unit}`:`Par ${limitFor(c)} · ${fmt(c.target)} ${cat.unit}`):group.length===3?"Tres temas":`Puesto ${c.target}`}</b></span><span class="card-cta">${done===group.length?"Ver resultado":started?"Continuar":"Jugar"} ${icon("arrow",24)}</span></div></a>`;
}
function parseRoute(){const parts=location.hash.slice(1).split('/');return {page:parts[0]||'home',mode:parts[1],date:parts[2],context:parts[3]||'daily',attempt:parts[4]||'',hole:Number(parts[5])||undefined};}
function render({focus=false}={}){
 if(animating){cancelAnimationFrame(animationFrame);animationDone=null;animating=false;}
 route=parseRoute();selected=null;suggestions=[];suggestionIndex=-1;active=null;
 if(route.page==='play'){
  const c=challenges.find(c=>c.mode===route.mode&&c.date===route.date&&c.hole===route.hole);
  if(c&&c.date<=today&&['daily','archive','practice'].includes(route.context)){
   if(route.context==='practice'&&!route.attempt){location.replace(href(c,'practice',crypto.randomUUID()));return;}
   active={c,cat:catalogs[c.catalogId],state:readState(c,route.context,route.attempt)};
   app.innerHTML=game();
  } else app.innerHTML=`${header()}<main id="main" class="content-page"><h1>Este hoyo aún no está abierto.</h1><p>Elige uno de los retos disponibles.</p><a class="button primary" href="#archive">Ver archivo</a></main>${footer()}`;
 }else if(route.page==='archive'||route.page==='practice')app.innerHTML=archive();
 else if(route.page==='round')app.innerHTML=roundScorecard();
 else if(route.page==='history')app.innerHTML=history();
 else app.innerHTML=home();
 bindSearch();
 if(focus){const heading=document.querySelector('main h1');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}window.scrollTo(0,0);}
}
function game(){const {c,cat,state}=active,combo=c.mode!=='ranking',result=score(c,cat,state.picks,state.completed),done=state.completed&&!animating;
 const dest=state.picks.length?ballDestination(c,result||(!blindFor(c)?tally(c,cat,state.picks):null),state.picks.length):{x:120,y:260};
 const holes=c.hole?dailyHoles(c.date):challenges.filter(x=>x.date===c.date&&!x.hole);
 return `${header()}<main id="main" class="game-page"><div class="game-nav"><a href="${route.context==='daily'?'#':'#archive'}" class="back-link">${icon('back',17)} ${route.context==='daily'?'El campo':'Archivo'}</a><nav class="mode-switch hole-switch" aria-label="Hoyos de la vuelta">${holes.map(h=>`<a class="${h.id===c.id?'selected':''}" ${h.id===c.id?'aria-current="step"':''} href="${href(h,route.context,route.attempt)}" aria-label="${h.hole?'Hoyo '+h.hole+' · ':''}${modeName(h)}">${h.hole||modeName(h)}</a>`).join('')}</nav><button class="text-button" data-action="help">Cómo jugar ${icon('flag',16)}</button></div>${storageNotice()}${c.date!==today?`<div class="context-banner">${route.context==='practice'?'Campo de práctica':'Hoyo del archivo'} · ${dateLabel(c.date)}${route.context==='practice'?' · No cuenta como resultado diario.':''}</div>`:route.context==='practice'?'<div class="context-banner">Campo de práctica · No cuenta como resultado diario.</div>':''}<div class="game-layout"><section class="field-panel"><div class="field-header"><span class="eyebrow">${c.hole?`HOYO ${c.hole} DE 6 · ${modeName(c)} · `:''}${cat.category.toUpperCase()} <span>· ${dateLabel(c.date)}</span></span><h1 class="challenge-prompt">${esc(c.hole?c.prompt:cat.prompts[c.mode].replace("{objetivo}", fmt(c.target)))}</h1></div><div class="target-badge"><span>${combo?'TU OBJETIVO':'BUSCA EL PUESTO'}</span><strong>${combo?fmt(c.target):'#'+c.target}</strong><small>${combo?cat.unit:cat.subject}</small></div><div id="field" class="playing-field">${courseSVG({id:'game',ballX:dest.x,ballY:done&&result.exact?265:260,label:done?resultCaption(c,cat,result):'Campo de golf. El hoyo representa tu objetivo.'})}</div><div class="field-caption" id="field-caption">${done?resultCaption(c,cat,result):combo?(blindFor(c)?'La suma se revela al terminar.':state.picks.length?`Llevas ${fmt(tally(c,cat,state.picks).actual)} ${cat.unit}.`:'La bandera marca tu objetivo.'):'La bandera es el objetivo. ¿Dónde caerá tu pelota?'}</div><div class="field-tools"><button class="small-button ${sound?'on':''}" data-action="sound" aria-pressed="${sound}">${icon('sound',16)} Sonido ${sound?'sí':'no'}</button><button class="small-button" data-action="motion" aria-pressed="${isReduced()}">${icon('leaf',16)} ${isReduced()?'Sin movimiento':'Animación activa'}</button><button class="small-button skip-animation" data-action="skip" hidden>Saltar animación ${icon('arrow',16)}</button></div><details class="criteria"><summary>Qué cuenta en este hoyo</summary><p>${esc(combo?cat.criterion:cat.rankCriterion)} ${esc(cat.universe)}</p><p>${combo?(blindFor(c)?'Todas las cifras se revelan al terminar.':'Cada golpe actualiza el acumulado.'):'Un puesto menor cae antes de la bandera; un puesto mayor, después.'}</p></details></section><section class="play-panel ${done?'result-panel':''}" aria-label="${done?'Resultado':'Tu tarjeta de juego'}">${done?resultPanel(c,cat,result):inputPanel(c,cat,state)}</section></div></main>${footer()}`;
}
function resultCaption(c,cat,r){if(r.exact)return c.mode==='ranking'?'¡Hoyo en uno! La pelota está dentro.':'¡Diana exacta! La pelota está dentro.';return c.mode==='ranking'?`Puesto ${r.actual}: ${r.delta<0?'antes':'después'} de la bandera. A ${fmt(r.distance)} puestos del hoyo.`:`${r.delta<0?'Te quedaste corto':'Te pasaste'}: ${fmt(r.distance)} ${cat.unit} ${r.delta<0?'por debajo':'por encima'} del objetivo.`;}
function inputPanel(c,cat,state){const combo=c.mode!=='ranking';return `<div class="panel-heading"><span class="eyebrow">TU TARJETA</span><span>${combo?`Golpe ${state.picks.length+1} de ${limitFor(c)}`:'Un golpe. Tu mejor intuición.'}</span></div><h2>${state.picks.length?'Prepara tu siguiente golpe.':'Todo empieza con un golpe.'}</h2><p class="panel-intro">${combo?(c.mode==='under'?'Intenta clavar la cifra con el mínimo de golpes. Puedes plantarte cuando quieras.':`Usa los ${limitFor(c)} golpes. ${blindFor(c)?'Verás la suma al final.':'Verás la suma tras cada golpe.'}`):'Busca, elige y da tu único golpe. Cuanto más cerca del puesto, mejor.'}</p><div class="search-area"><label for="name-search">${combo?'Tu próxima elección':'Tu elección'}</label><div class="search-input-wrap">${icon('search')}<input id="name-search" type="text" role="combobox" aria-autocomplete="list" aria-controls="suggestions" aria-expanded="false" aria-describedby="search-help" autocomplete="off" autocapitalize="words" placeholder="Buscar ${cat.subject}…"><button class="clear-search" data-action="clear" aria-label="Borrar selección" hidden>${icon('close',16)}</button></div><ul id="suggestions" role="listbox" aria-label="Opciones disponibles" hidden></ul><p id="search-help" class="search-help">Escribe para buscar.</p><div id="recognized" class="recognized" hidden></div><button class="button primary strike" data-action="strike" disabled>${icon('flag')} Dar golpe ${icon('arrow')}</button></div>${combo?`<ol class="shot-list" aria-label="Golpes del hoyo">${Array.from({length:limitFor(c)},(_,i)=>{const e=cat.entries.find(e=>e.id===state.picks[i]);return `<li class="${e?'locked':i===state.picks.length?'next':''}"><span class="shot-number">${e?icon('check',14):i+1}</span><span>${e?esc(e.name):i===state.picks.length?'Tu próximo golpe':'Por jugar'}</span><span class="hidden-value" aria-label="${e?(blindFor(c)?'Valor oculto':'Valor del golpe'):'Sin jugar'}">${e?(blindFor(c)?'?':fmt(e.value)):'—'}</span></li>`;}).join('')}</ol>${blindFor(c)?'<p class="hidden-note">Las cifras se destapan al terminar.</p>':`<p class="hidden-note">Acumulado <strong>${fmt(tally(c,cat,state.picks)?.actual||0)} ${cat.unit}</strong> · Objetivo ${fmt(c.target)}</p>`}${c.mode==='under'&&state.picks.length?'<button class="button secondary" data-action="finish-hole">Cerrar hoyo con esta suma</button>':''}`:`<div class="ranking-note"><span class="mini-hole">${icon('flag',28)}</span><p><strong>El hoyo es el puesto ${c.target}.</strong><br>Quedarte a 2 por arriba o por abajo cuenta igual: a 2 puestos.</p></div>`}`;}
function roundHref(date,context=route.context,attempt=route.attempt){
 return `#round/card/${date}/${context}${attempt?'/'+encodeURIComponent(attempt):''}`;
}
function roundRows(date,context,attempt){
 if(date>today)return [];
 return dailyHoles(date).filter(c=>c.hole).map(c=>{
  const cat=catalogs[c.catalogId],state=readState(c,context,attempt);
  return {c,cat,state,result:state.completed?score(c,cat,state.picks,true):null};
 });
}
function holeOutcome({c,cat,result}){
 if(!result)return 'Pendiente';
 if(c.mode==='ranking'&&result.exact)return 'Hoyo en uno';
 const distance=result.exact?'Cifra exacta':`A ${fmt(result.distance)} ${c.mode==='ranking'?'puestos':cat.unit}`;
 if(c.mode!=='under')return distance;
 const shots=result.entries.length;
 return `${distance} · ${shots} ${shots===1?'golpe':'golpes'}`;
}
function roundScorecard(){
 const rows=roundRows(route.date,route.context,route.attempt);
 if(!rows.length)return `${header()}<main id="main" class="content-page"><h1>Esta vuelta aún no está abierta.</h1><a class="button primary" href="#archive">Ver archivo</a></main>${footer()}`;
 const played=rows.filter(row=>row.result),next=rows.find(row=>!row.result);
 const ranking=played.filter(row=>row.c.mode==='ranking');
 const distance=ranking.reduce((total,row)=>total+row.result.distance,0);
 const aces=ranking.filter(row=>row.result.exact).length;
 return `${header('history')}<main id="main" class="content-page round-card-page">
 <a class="back-link" href="${route.context==='archive'?'#archive':'#daily'}">${icon('back',17)} ${route.context==='archive'?'Archivo':'El campo'}</a>
 <h1>Tarjeta de la vuelta</h1>
 <p class="page-lead">${dateLabel(route.date)}${route.context==='practice'?' · Práctica':''}</p>
 <div class="round-card-stats">
  <div><strong>${played.length}/${rows.length}</strong><span>Hoyos jugados</span></div>
  <div><strong>${aces}/3</strong><span>Hoyos en uno</span></div>
  <div><strong>${ranking.length===3?fmt(distance):'—'}</strong><span>Puestos de distancia en Hole in One</span></div>
 </div>
 <ol class="round-card-holes" aria-label="Resultados de los seis hoyos">${rows.map(row=>`<li>
  <a href="${href(row.c,route.context,route.attempt)}"><span class="round-hole-number">${row.c.hole}</span>
  <span><strong>${modeName(row.c)}</strong><small>${row.cat.category}</small></span>
  <b>${holeOutcome(row)}</b>${icon('arrow',16)}</a></li>`).join('')}</ol>
 ${next?`<a class="button primary next-hole" href="${href(next.c,route.context,route.attempt)}">Jugar hoyo ${next.c.hole} ${icon('arrow',18)}</a>`:shareButtons(false)}
 </main>${footer()}`;
}
function afterHole(c){
 if(!c.hole)return '';
 const next=dailyHoles(c.date).find(h=>h.hole===c.hole+1);
 const destination=next?href(next,route.context,route.attempt):roundHref(c.date);
 return `<a class="button primary next-hole" href="${destination}">${next?'Pasar al siguiente hoyo':'Ver resultados de la vuelta'} ${icon('arrow',20)}</a>`;
}
function currentShare(){
 if(route.page==='round'){
  const rows=roundRows(route.date,route.context,route.attempt);
  const ranking=rows.filter(row=>row.c.mode==='ranking'&&row.result);
  const distance=ranking.reduce((sum,row)=>sum+row.result.distance,0);
  const aces=ranking.filter(row=>row.result.exact).length;
  return [
   '⛳ A Golpe · Tarjeta de la vuelta',
   dateLabel(route.date)+(route.context==='practice'?' · Práctica':''),
   ...rows.map(row=>`Hoyo ${row.c.hole} · ${modeName(row.c)} · ${holeOutcome(row)}`),
   `Hole in One · ${distance} puestos en total · ${aces}/3 hoyos en uno`,
   location.origin+location.pathname
  ].join('\n');
 }
 const {c,cat,state}=active;
 return shareText(c,cat,score(c,cat,state.picks,state.completed),route.context);
}
function shareButtons(compact){
 const type=compact?'text-button':'button';
 return `<div class="share-area ${compact?'share-compact':'share-round'}">
 <button class="${type} ${compact?'':'primary'}" data-action="share">${icon('share',compact?15:20)} Compartir resultado</button>
 <button class="${type} ${compact?'':'secondary'}" data-action="copy">${icon('copy',compact?15:18)} Copiar resumen</button>
 <textarea id="share-summary" readonly aria-label="Resumen sin spoilers para compartir" hidden>${esc(currentShare())}</textarea>
 </div>`;
}
function resultPanel(c,cat,r){const combo=c.mode!=='ranking',unit=combo?cat.unit:'puestos';const sorted=combo?[]:[...cat.entries].sort((a,b)=>a.rank-b.rank);const exact=sorted.find(e=>e.rank===c.target);
 let rows=[];
 if(!combo){const ids=new Set([c.target-2,c.target-1,c.target,c.target+1,c.target+2,r.actual-1,r.actual,r.actual+1]);rows=sorted.filter(e=>ids.has(e.rank));}
 return `<div class="panel-heading"><span class="eyebrow">${route.context==='practice'?'PRÁCTICA TERMINADA':'TARJETA COMPLETADA'}</span><span class="completed-check">${icon('check',16)} ${r.entries.length} de ${limitFor(c)}</span></div><div class="result-heading"><span class="eyebrow">${r.exact?'DIRECTO AL HOYO':r.delta<0?'TE QUEDASTE CORTO':'TE PASASTE'}</span><h2>${r.exact?(combo?'¡Diana exacta!':'¡Hoyo en uno!'):`A <strong>${fmt(r.distance)}</strong> ${unit}`}</h2><p>${r.exact?'Ni más, ni menos. Un golpe para recordar.':'del hoyo. ¿Algún amigo se habrá acercado más?'}</p></div>${combo?`<div class="total-row"><span>Tu suma <strong>${fmt(r.actual)}</strong></span><span>Objetivo <strong>${fmt(c.target)}</strong></span></div><ol class="reveal-list">${r.entries.map((e,i)=>`<li><span><small>${i+1}</small> ${esc(e.name)}</span><strong>${fmt(e.value)} <small>${cat.unit}</small></strong></li>`).join('')}</ol><p class="result-detail">${fmt(r.distance)} ${cat.unit} ${r.exact?'de distancia':r.delta<0?'por debajo del objetivo':'por encima del objetivo'}.</p>`:`<div class="total-row"><span>Tu elección <strong>#${r.actual} ${esc(r.entries[0].name)}</strong></span><span>Objetivo <strong>#${c.target}</strong></span></div><p class="exact-answer">La respuesta exacta: <strong>${esc(exact.name)}</strong>.</p><details class="ranking-detail" open><summary>Así queda el ranking</summary><ol class="ranking-list">${rows.map((e,i)=>`${i&&e.rank>rows[i-1].rank+1?'<li class="rank-gap" aria-label="Puestos intermedios omitidos">···</li>':''}<li class="${e.rank===c.target?'target-row':''} ${e.id===r.entries[0].id?'chosen-row':''}"><span class="rank-number">${e.rank}</span><span>${esc(e.name)}<small>${e.rank===c.target?'⚑ Objetivo':e.id===r.entries[0].id?'● Tu pelota':''}</small></span><span>${fmt(e.value)} <small>${cat.unit}</small></span></li>`).join('')}</ol></details>`}${afterHole(c)}${shareButtons(Boolean(c.hole))}<details class="source-details"><summary>${combo?'Ver una solución y la fuente':'Fuente y criterio del ranking'}</summary>${combo?`<p>${c.mode==='under'?`Mínimo para acertar: ${c.solution.length} golpes.`:'Una combinación comprobada:'}</p><ul>${c.solution.map(id=>{const e=cat.entries.find(x=>x.id===id);return `<li>${esc(e.name)} · ${fmt(e.value)} ${cat.unit}</li>`;}).join('')}</ul><p>Distancia mínima posible: <strong>${fmt(c.bestDistance)} ${cat.unit}</strong>.</p>`:''}<p>${esc(combo?cat.criterion:cat.rankCriterion)} ${esc(cat.universe)}</p><a href="${cat.source.url}" target="_blank" rel="noopener noreferrer">${esc(cat.source.name)} ↗</a><p>Referencia: ${dateLabel(cat.referenceDate)} · Catálogo ${esc(cat.id)} · Reto v${c.version}.</p></details><div class="after-game"><a href="#">Volver al campo ${icon('arrow',17)}</a><button class="text-button" data-action="practice">Probar en práctica</button></div>`;
}
function archiveHoles(date,practice){
 const holes=dailyHoles(date);
 const entry=c=>{const cat=catalogs[c.catalogId];return `<a class="archive-entry" href="${href(c,practice?'practice':date===today?'daily':'archive',practice?crypto.randomUUID():'')}"><span class="archive-icon">${icon('flag')}</span><span><strong>${modeName(c)} <small>· ${cat.category}</small></strong><span>${c.hole?`Hoyo ${c.hole} · `:''}${cat.title}</span></span><span class="entry-status">${practice?'Practicar':statusSpanish(c)} ${icon('arrow',18)}</span></a>`;};
 return holes.map(entry).join('');
}
function archive(){const practice=route.page==='practice',dates=[...new Set(challenges.filter(c=>c.date<=today).map(c=>c.date))].reverse();return `${header('archive')}<main id="main" class="content-page"><div class="eyebrow">EL CLUB ESTÁ ABIERTO</div><h1>${practice?'Campo de práctica.':'Siempre queda otro hoyo.'}</h1><p class="page-lead">${practice?'Prueba libremente. Cada partida es independiente y no cambia tu tarjeta diaria.':'Recupera los hoyos anteriores o ensaya en práctica. Cada fecha conserva sus datos y tu partida.'}</p><div class="archive-tabs"><a class="${!practice?'active':''}" href="#archive">Archivo diario</a><a class="${practice?'active':''}" href="#practice">Práctica libre</a></div><div class="archive-list">${dates.map(date=>`<section class="archive-day"><h2>${date===today?'Hoy':new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'))}<small>${date.slice(0,4)}</small></h2><div>${archiveHoles(date,practice)}</div></section>`).join('')}</div><p class="fine-print">Los retos futuros se abren a medianoche de Madrid. Si se acaba el calendario, este archivo seguirá disponible.</p></main>${footer()}`;}
function todayCard(){
 const rows=roundRows(today,'daily','');
 if(!rows.length)return '';
 const completed=rows.filter(row=>row.result).length;
 const next=rows.find(row=>!row.result);
 return `<section class="my-scorecard" aria-labelledby="today-title">
  <div class="my-scorecard-head">
   <div><span>${dateLabel(today)}</span><h2 id="today-title">Vuelta de hoy</h2></div>
   <div class="my-scorecard-progress"><strong>${completed}/${rows.length}</strong><span>hoyos jugados</span></div>
  </div>
  <ol class="round-card-holes">${rows.map(({c,cat,state,result})=>`<li><a href="${href(c)}">
   <span class="round-hole-number ${result?'played':''}">${c.hole}</span>
   <span><strong>${modeName(c)}</strong><small>${cat.category}</small></span>
   <b>${result?holeOutcome({c,cat,result}):state.picks.length?'En juego':'Pendiente'}</b>${icon('arrow',16)}
  </a></li>`).join('')}</ol>
  <div class="my-scorecard-actions">
   ${next?`<a class="button primary" href="${href(next.c)}">Jugar hoyo ${next.c.hole} ${icon('arrow',16)}</a>`:''}
   <a class="button ${next?'secondary':'primary'}" href="${roundHref(today,'daily','')}">Ver tarjeta de la vuelta ${icon('arrow',16)}</a>
  </div>
 </section>`;
}
function history(){
 const groups=new Map();
 try{
  for(let i=0;i<localStorage.length;i++){
   const key=localStorage.key(i);
   if(!key?.startsWith('golf:v1:'))continue;
   try{
    const saved=JSON.parse(localStorage.getItem(key));
    const c=challenges.find(h=>h.id===saved?.challengeId);
    if(!c||(c.hole&&c.date===today&&saved.context!=='practice'))continue;
    const cat=catalogs[c.catalogId], state=restore(saved,c,cat);
    if(!state.picks.length)continue;
    if(!groups.has(c.date))groups.set(c.date,[]);
    groups.get(c.date).push({c,cat,state,context:saved.context,attempt:saved.attempt});
   }catch{}
  }
 }catch{storageFailed=true;}
 const days=[...groups].sort(([a],[b])=>b.localeCompare(a));
 return `${header('history')}<main id="main" class="content-page my-card-page">
  <h1>Mi tarjeta</h1>
  ${storageNotice()}${todayCard()}
  <section class="my-card-history" aria-labelledby="history-title"><h2 id="history-title">Historial</h2>
  ${days.length?days.map(([date,records])=>`<details class="history-day">
   <summary><strong>${dateLabel(date)}</strong><span>${records.length} ${records.length===1?'partida':'partidas'}</span></summary>
   ${records.sort((a,b)=>(a.c.hole||0)-(b.c.hole||0)||(b.state.updatedAt||'').localeCompare(a.state.updatedAt||'')).map(({c,cat,state,context,attempt})=>{
    const result=score(c,cat,state.picks,state.completed);
    const linkContext=context==='practice'?'practice':date===today?'daily':'archive';
    return `<a class="history-entry" href="${href(c,linkContext,attempt)}"><span>${c.hole||icon('flag',18)}</span>
     <div><strong>${modeName(c)}</strong><span>${cat.category}${context==='practice'?' · Práctica':''}</span></div>
     <b>${result?holeOutcome({c,cat,result}):'En juego'}</b>${icon('arrow',16)}
    </a>`;
   }).join('')}
  </details>`).join(''):'<p class="my-card-empty">Aquí verás tus partidas anteriores.</p>'}
  </section>
 </main>${footer()}`;
}
function bindSearch(){const input=document.querySelector('#name-search');if(!input)return;
 input.addEventListener('input',()=>{selected=null;suggestionIndex=-1;updateSelection();showSuggestions();});
 input.addEventListener('keydown',e=>{
  if(e.key==='Escape'||e.key==='Tab'){hideSuggestions();return;}
  if((e.key==='ArrowDown'||e.key==='ArrowUp')&&normalize(input.value)&&!selected){e.preventDefault();if(document.querySelector('#suggestions').hidden)showSuggestions();suggestionIndex=Math.max(0,Math.min(suggestions.length-1,suggestionIndex+(e.key==='ArrowDown'?1:-1)));highlightSuggestion();}
  if(e.key==='Enter'){e.preventDefault();if(!document.querySelector('#suggestions').hidden&&suggestions.length)choose(suggestions[Math.max(0,suggestionIndex)].id);}
 });
}
function showSuggestions(){
 if(!active||animating)return;
 const input=document.querySelector('#name-search'),list=document.querySelector('#suggestions');
 const query=normalize(input.value);
 const matches=query?search(active.cat,query,active.state.picks):[];
 suggestions=matches.slice(0,8);
 const hint=document.querySelector('#search-help');
 hint.textContent=query&&!matches.length?'No encontramos coincidencias. Prueba otra escritura.':'Escribe para buscar.';
 if(!suggestions.length){list.replaceChildren();hideSuggestions();return;}
 input.setAttribute('aria-expanded','true');
 list.hidden=false;
 list.innerHTML=suggestions.map(e=>`<li role="option" id="option-${e.id}" data-choice="${e.id}" aria-selected="false"><span>${esc(e.name)}<small>${esc(e.detail)}</small></span><span aria-hidden="true">↵</span></li>`).join('');
 announce(`${matches.length} coincidencias. Usa las flechas y pulsa Intro para seleccionar.`);
}
function highlightSuggestion(){const input=document.querySelector('#name-search');document.querySelectorAll('[data-choice]').forEach((el,i)=>{el.setAttribute('aria-selected',i===suggestionIndex);if(i===suggestionIndex){input.setAttribute('aria-activedescendant',el.id);el.scrollIntoView({block:'nearest'});}});}
function hideSuggestions(){const list=document.querySelector('#suggestions'),input=document.querySelector('#name-search');if(list)list.hidden=true;if(input){input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');}}
function choose(id){if(!active||animating)return;selected=active.cat.entries.find(e=>e.id===id);if(!selected||active.state.picks.includes(id))return;document.querySelector('#name-search').value=selected.name;hideSuggestions();updateSelection();announce(`${selected.name}, seleccionado. Pulsa Dar golpe para confirmar.`);}
function updateSelection(){const btn=document.querySelector('[data-action="strike"]'),recognized=document.querySelector('#recognized');if(!btn)return;btn.disabled=!selected||animating;recognized.hidden=!selected;recognized.innerHTML=selected?`${icon('check',15)} <span>Vas a jugar: <strong>${esc(selected.name)}</strong></span>`:'';document.querySelector('.clear-search').hidden=!document.querySelector('#name-search').value;}
async function strike(){if(!active||!selected||animating||active.state.completed)return;const gameAtImpact=active,routeAtImpact=route;const chosen=selected.id;animating=true;document.querySelector('[data-action="strike"]').disabled=true;hideSuggestions();const initial=active.state.picks.join('|');
 const transaction=()=>{if(active!==gameAtImpact||route!==routeAtImpact)return false;const fresh=storageFailed?active.state:readState(active.c,route.context,route.attempt);if(fresh.picks.join('|')!==initial){active.state=fresh;return false;}const next=commit(fresh,chosen,active.c,active.cat);if(next===fresh)return false;active.state=next;saveState(active.c,next,route.context,route.attempt);return true;};
 let accepted;try{accepted=navigator.locks?await navigator.locks.request(keyFor(active.c,route.context,route.attempt),transaction):transaction();}catch{accepted=transaction();}
 if(active!==gameAtImpact||route!==routeAtImpact)return;
 if(!accepted){animating=false;render();toast('La partida cambió en otra pestaña. Ya está actualizada.');return;}
 selected=null;const input=document.querySelector('#name-search');input.disabled=true;document.querySelector('.clear-search').disabled=true;
 const {c,cat,state}=active,r=score(c,cat,state.picks,state.completed),dest=ballDestination(c,r||(!blindFor(c)?tally(c,cat,state.picks):null),state.picks.length);
 const previous=state.picks.length>1?ballDestination(c,blindFor(c)?null:tally(c,cat,state.picks.slice(0,-1)),state.picks.length-1):{x:120,y:260};
 document.querySelector('#field-caption').textContent=state.completed?'La pelota está en el aire…':(blindFor(c)?'Golpe confirmado. Su cifra sigue oculta.':'Golpe confirmado. Actualizando la suma…');
 document.querySelector('[data-action="skip"]').hidden=false;
 announce(state.completed?'Último golpe confirmado. Revelando el resultado.':`Golpe ${state.picks.length} confirmado.${blindFor(c)?' Valor oculto.':''}`);
 playSound();
 animationDone=()=>{cancelAnimationFrame(animationFrame);animationDone=null;animating=false;app.innerHTML=game();bindSearch();if(state.completed){const h=document.querySelector('.result-heading h2');h.tabIndex=-1;h.focus({preventScroll:true});announce(resultCaption(c,cat,r));}else{document.querySelector('#name-search').focus({preventScroll:true});announce(`Golpe ${state.picks.length} guardado.${blindFor(c)?'':' Acumulado: '+fmt(tally(c,cat,state.picks).actual)+' '+cat.unit+'.'} Prepara el siguiente golpe.`);}};
 if(isReduced()){animationDone();return;}
 const ball=document.querySelector('.golf-ball'),shadow=document.querySelector('.ball-shadow'),impact=document.querySelector('.impact');impact.setAttribute('transform',`translate(${previous.x-120} 0)`);const start=performance.now(),duration=1700;
 const roll=c.mode==='par'?Math.min(12,(dest.x-previous.x)/3):12;
 const tick=now=>{if(!animationDone)return;const t=Math.min(1,(now-start)/duration);let x,y;
  if(t<.1){x=previous.x;y=260;impact.setAttribute('opacity',String(1-t/.1));}
  else if(t<.76){const p=(t-.1)/.66;x=previous.x+(dest.x-previous.x-roll)*p;y=260-130*Math.sin(Math.PI*p);}
  else if(t<.90){const p=(t-.76)/.14;x=dest.x-roll+roll*7/12*p;y=260-16*Math.sin(Math.PI*p);}
  else{const p=(t-.90)/.10;x=dest.x-roll*5/12*(1-p);y=260+(r?.exact?5*p:0);}
  ball.setAttribute('cx',x);ball.setAttribute('cy',y);ball.setAttribute('r',r?.exact&&t>.94?7*(1-(t-.94)/.06):7);shadow.setAttribute('cx',x);shadow.setAttribute('opacity',.12+.13*(y/260));
  if(t<1)animationFrame=requestAnimationFrame(tick);else animationDone();
 };animationFrame=requestAnimationFrame(tick);
}
async function closeUnderPar(){
 const session=active, currentRoute=route;
 if(!session||session.c.mode!=='under'||animating)return;
 const {c}=session;
 const finish=()=>{
  if(active!==session||route!==currentRoute)return;
  const latest=storageFailed?session.state:readState(c,route.context,route.attempt);
  if(!latest.picks.length||latest.completed)return;
  session.state={...latest,completed:true,updatedAt:new Date().toISOString()};
  saveState(c,session.state,route.context,route.attempt);
  app.innerHTML=game();
  const heading=app.querySelector('.result-heading h2');
  heading.tabIndex=-1;
  heading.focus();
 };
 if(navigator.locks)await navigator.locks.request(keyFor(c,route.context,route.attempt),finish);
 else finish();
}
let audioContext;
function playSound(){if(!sound)return;try{audioContext ||= new (window.AudioContext||window.webkitAudioContext)();audioContext.resume();const o=audioContext.createOscillator(),g=audioContext.createGain();o.type='sine';o.frequency.setValueAtTime(850,audioContext.currentTime);o.frequency.exponentialRampToValueAtTime(170,audioContext.currentTime+.12);g.gain.setValueAtTime(.07,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.14);o.connect(g).connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+.15);}catch{}}
async function copyResult(){const text=currentShare();try{await navigator.clipboard.writeText(text);toast('Resumen copiado. ¡A ver quién se acerca más!');}catch{const area=document.querySelector('#share-summary');area.hidden=false;area.focus();area.select();toast('Selecciona y copia el resumen con tu dispositivo.');}}
function modal(kind){const old=document.querySelector('dialog');if(old)old.remove();const d=document.createElement('dialog');d.className='info-dialog';d.innerHTML=`<button class="dialog-close" aria-label="Cerrar">${icon('close')}</button>${kind==='about'?`<div class="eyebrow">UN JUEGO SIN LETRA PEQUEÑA</div><h2>Datos claros.<br>Tu partida es tuya.</h2><p>Este juego funciona sin cuentas, anuncios, cookies de seguimiento ni servicios de pago. Tus golpes se guardan con almacenamiento local en este navegador; no se envían a un servidor.</p><p>Si borras los datos del navegador, perderás el historial. Si el guardado no está disponible, te lo indicaremos.</p><h3>Datos congelados por reto</h3><p>Las cifras corresponden a la fecha indicada, no necesariamente a la actualidad. La fuente y el catálogo aparecen al terminar para evitar pistas durante la partida.</p><p>No hay clasificación global: compara la distancia compartida con amigos que hayan jugado el mismo reto.</p>`:`<div class="eyebrow">BIENVENIDO AL GREEN</div><h2>El objetivo es una cifra.<br>Acércate golpe a golpe.</h2><div class="help-mode"><b>Par del día y Par a ciegas</b><p>Usa todos los golpes del par indicado. En Par del día ves el acumulado tras cada golpe. En Par a ciegas, las cifras se revelan al final. Si quieres probar ambos, empieza por el hoyo a ciegas.</p></div><div class="help-mode"><b>Bajo Par</b><p>Intenta clavar la cifra en el mínimo de golpes. Puedes cerrar el hoyo cuando quieras después del primer golpe. Primero cuenta la distancia y, si empatas, el menor número de golpes.</p></div><div class="help-mode"><b>Hole in One</b><p>Juega tres hoyos con un golpe en cada uno. La tarjeta suma los puestos que te faltaron o te sobraron en cada hoyo.</p></div><p><strong>A 3 por encima o por debajo es lo mismo: a 3 del hoyo.</strong> Las distancias grandes se comprimen en el campo; el texto siempre muestra la cifra exacta.</p><p>Puedes cambiar tu elección antes de pulsar <strong>Dar golpe</strong>. Después, el golpe queda guardado. Las flechas y la tecla Intro te permiten seleccionar desde el teclado.</p><p>Cada día se abre una vuelta de seis hoyos a medianoche de Madrid.</p><button class="button primary dialog-start">Al campo ${icon('arrow')}</button>`}`;
 document.body.append(d);d.showModal();d.querySelector('.dialog-close').onclick=()=>d.close();d.querySelector('.dialog-start')?.addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});d.addEventListener('close',()=>d.remove());}
app.addEventListener('click',async e=>{const option=e.target.closest('[data-choice]');if(option){choose(option.dataset.choice);return;}const button=e.target.closest('[data-action]');if(!button)return;switch(button.dataset.action){
 case 'help':modal('help');break;case 'about':modal('about');break;case 'strike':await strike();break;case 'skip':animationDone?.();break;
 case 'clear':selected=null;document.querySelector('#name-search').value='';updateSelection();document.querySelector('#name-search').focus();showSuggestions();break;
 case 'sound':sound=!sound;try{localStorage.setItem('golf:sound',sound);}catch{}button.innerHTML=`${icon('sound',16)} Sonido ${sound?'sí':'no'}`;button.setAttribute('aria-pressed',sound);break;
 case 'motion':motionOff=!motionOff;try{localStorage.setItem('golf:motion',motionOff);}catch{}button.innerHTML=`${icon('leaf',16)} ${isReduced()?'Sin movimiento':'Animación activa'}`;button.setAttribute('aria-pressed',isReduced());if(isReduced())animationDone?.();break;
 case 'copy':await copyResult();break;
 case 'share':{const text=currentShare();if(navigator.share){try{await navigator.share({title:'A Golpe',text});}catch(error){if(error.name!=='AbortError')await copyResult();}}else await copyResult();break;}
 case 'finish-hole':await closeUnderPar();break;
 case 'practice':location.hash=href(active.c,'practice',crypto.randomUUID());break;
 }});
document.addEventListener('click',e=>{if(!e.target.closest('.search-area'))hideSuggestions();});
window.addEventListener('hashchange',()=>{if(['#daily','#main'].includes(location.hash)){const element=document.querySelector(location.hash);if(element){element.scrollIntoView({behavior:isReduced()?'instant':'smooth'});if(location.hash==='#main'){element.tabIndex=-1;element.focus({preventScroll:true});}return;}}render({focus:true});});
window.addEventListener('storage',e=>{if(active&&e.key===keyFor(active.c,route.context,route.attempt)&&!animating){render();toast('Partida actualizada desde otra pestaña.');}});
function checkDay(){const newDate=madridDate();if(newDate!==today){today=newDate;render();toast('Ya es un nuevo día en Madrid. Los retos de hoy se han actualizado.');}}
setInterval(checkDay,15000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkDay();});
reducedQuery.addEventListener('change',()=>{if(isReduced())animationDone?.();if(active&&!animating)render();});
try{const response=await fetch(new URL('./challenges.json',import.meta.url));if(!response.ok)throw new Error();const old=await response.json();const rounds=await fetch(new URL('./rounds.json',import.meta.url));if(!rounds.ok)throw new Error();challenges=[...old,...await rounds.json()].sort((a,b)=>a.date.localeCompare(b.date));render();}catch{app.innerHTML='<main class="content-page"><h1>No hemos podido abrir el campo.</h1><p>Comprueba la conexión y vuelve a cargar la página.</p><button onclick="location.reload()">Reintentar</button></main>';}
