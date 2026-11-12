import {writeFile} from 'node:fs/promises';
import {bestSolutions,formatNumber as fmt} from '../src/core.js';
import {roundCatalogs} from '../src/round-catalogs.js';

const city='european-cities', pop='world-population-2023', film='oscars-favorites';
const cup='world-cup-titles-2022', song='eurovision-wins-2025';
const plans=[
 [[city,3,2000],[song,5,20],[film,20]],
 [[film,5,40],[city,3,2500],[cup,10]],
 [[pop,6,300],[film,5,30],[song,10]],
 [[song,7,25],[pop,5,200],[city,6000]],
 [[city,5,4000],[cup,6,18],[film,25]],
 [[film,6,45],[song,3,15],[pop,150]],
 [[pop,7,500],[city,5,3500],[cup,15]],
 [[cup,5,15],[film,7,50],[song,20]],
 [[song,6,22],[pop,3,150],[city,6500]],
 [[city,7,6000],[film,3,20],[cup,20]],
 [[film,3,25],[song,7,30],[pop,200]],
 [[pop,5,400],[cup,7,20],[film,30]],
 [[city,6,5000],[song,5,18],[film,15]],
 [[song,3,12],[city,7,7000],[pop,300]]
];

function promptFor(id,target,shots){
 const amount=fmt(target);
 const subject={ [city]:'ciudades europeas', [pop]:'países', [film]:'películas', [cup]:'selecciones', [song]:'países' }[id];
 const metric={
  [city]:amount+' km desde Madrid', [pop]:amount+' millones de habitantes', [film]:amount+' premios Óscar',
  [cup]:amount+' Mundiales', [song]:amount+' victorias en Eurovisión'
 }[id];
 return shots?'Suma '+metric+' con '+shots+' '+subject+'.':'Suma '+metric+' con el mínimo de golpes.';
}

const ord=['','primer','segundo','tercer','cuarto','quinto','sexto','séptimo','octavo'];
const rankPacks=[
 {id:pop,targets:[3,1,2,5,4,6,7,8,9,10,11,12],prompt:n=>n===1?'¿Cuál es el país más poblado del mundo?':'¿Cuál es el '+n+'.º país más poblado del mundo?'},
 {id:'pixar-first-films',targets:[3,5,1,6,2,8,4,7,9,10,11,12],prompt:n=>n===1?'¿Cuál fue la primera película de Pixar?':'¿Qué película de Pixar se estrenó en '+roundCatalogs['pixar-first-films'].entries[n-1].value+'?'},
 {id:'planets-from-sun',targets:[3,6,1,5,2,4,7,8,9,10,11],prompt:n=>n===1?'¿Qué planeta está más cerca del Sol?':'¿Cuál es el '+ord[n]+' planeta desde el Sol?'},
 {id:'first-world-cup-title',targets:[1,8,2,4,5,6,7],prompt:n=>n===1?'¿Qué selección ganó el primer Mundial?':'¿Qué selección ganó su primer Mundial en '+roundCatalogs['first-world-cup-title'].entries[n-1].value+'?'}
];
const omissions=[3,1,3,2,3,0,3,2,3,1,3,0,3,2];
const rounds=[];
const earlierRounds=[
 {date:'2026-11-07',plan:[[film,5,35],[song,3,10],[cup,12]],ranking:[[0,13],[1,13],[2,12]]},
 {date:'2026-11-08',plan:[[city,5,3000],[cup,3,10],[film,35]],ranking:[[0,14],[2,14],[3,3]]},
 {date:'2026-11-09',plan:[[pop,3,250],[film,5,45],[song,15]],ranking:[[0,15],[1,14],[2,13]]}
];
const datedPlans=plans.map((plan,index)=>({
 date:new Date(Date.UTC(2026,10,10+index)).toISOString().slice(0,10),
 plan,
 ranking:rankPacks.flatMap((pack,i)=>i===omissions[index]?[]:[[i,pack.targets.shift()]])
}));
for(const {date,plan:[par,blind,under],ranking} of [...earlierRounds,...datedPlans]){
 const make=(mode,hole,catalogId,target,prompt,extra)=>({
  id:date+'-h'+hole+'-v4',date,mode,hole,catalogId,target,prompt,version:4,...extra
 });
 for(const [hole,mode,[id,shots,target]] of [[1,'par',par],[2,'blind',blind]]){
  const best=bestSolutions(roundCatalogs[id],target,shots);
  if(best.distance!==0)throw Error(date+' '+mode+' sin solución exacta ('+best.distance+')');
  rounds.push(make(mode,hole,id,target,promptFor(id,target,shots),{shots,solution:best.example,bestDistance:best.distance}));
 }
 const [id,target]=under;
 let optimum;
 for(let size=1;size<=7;size++){
  const b=bestSolutions(roundCatalogs[id],target,size);
  if(b.distance===0){optimum=b.example;break;}
 }
 if(!optimum||optimum.length<2)throw Error(date+' Bajo Par sin una solución de al menos dos golpes');
 rounds.push(make('under',3,id,target,promptFor(id,target),{shots:7,solution:optimum,bestDistance:0}));
 for(const [i,[packIndex,rank]] of ranking.entries()){
  const pack=rankPacks[packIndex];
  let target=rank;
  if(!target)throw Error('Faltan preguntas de '+pack.id);
  const bySize=pack.id==='planets-from-sun'&&target>8;
  if(bySize)target-=8;
  const question=bySize
   ? (target===1?'¿Cuál es el planeta más grande?':'¿Cuál es el '+ord[target]+' planeta más grande?')
   : pack.prompt(target);
  rounds.push(make('ranking',4+i,bySize?'planet-size-order':pack.id,target,question,{shots:1}));
 }
}
await writeFile('src/rounds.json',JSON.stringify(rounds,null,2)+'\n');
