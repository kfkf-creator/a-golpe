import assert from 'node:assert/strict';
import test from 'node:test';
import rounds from '../src/rounds.json' with {type:'json'};
import {roundCatalogs} from '../src/round-catalogs.js';
import {limitFor,commit,restore,emptyState,score,tally,ballDestination,stateKey,bestSolutions} from '../src/core.js';

test('La vuelta tiene seis hoyos, tres temas de Hole in One y pares de distinta longitud',()=>{
 const dates=[...new Set(rounds.map(c=>c.date))];
 assert.equal(dates.length,17);
 assert.deepEqual(dates.slice(0,3),['2026-11-07','2026-11-08','2026-11-09']);
 assert.deepEqual([...new Set(rounds.filter(c=>c.mode==='par').map(limitFor))].sort(),[3,5,6,7]);
 for(const date of dates){
  const [par,blind,under,...ranking]=rounds.filter(c=>c.date===date);
  assert.deepEqual([par,blind,under,...ranking].map(c=>c.hole),[1,2,3,4,5,6]);
  assert.notEqual(par.prompt,blind.prompt);
  assert.notEqual(par.catalogId,blind.catalogId);
  assert.notEqual(stateKey(par),stateKey(blind));
  assert.equal(new Set(ranking.map(c=>roundCatalogs[c.catalogId].category)).size,3);
  for(const c of ranking)assert.equal(roundCatalogs[c.catalogId].entries.filter(e=>e.rank===c.target).length,1);
  for(const c of [par,blind,under]){
   const cat=roundCatalogs[c.catalogId];
   assert.equal(tally(c,cat,c.solution).distance,c.bestDistance);
   assert.ok(c.bestDistance<=c.target*0.01);
   if(c.mode==='under'){
    assert.equal(c.bestDistance,0);
    for(let n=1;n<c.solution.length;n++)assert.notEqual(bestSolutions(cat,c.target,n).distance,0);
   } else assert.equal(c.solution.length,limitFor(c));
  }
 }
});

test('Par fijo no acaba al acertar antes de tiempo y el vuelo a ciegas no revela el acumulado',()=>{
 const cat={entries:[{id:'a',value:40},{id:'b',value:60},{id:'c',value:5}]};
 const par={mode:'par',shots:3,target:100};
 const blind={...par,mode:'blind'};
 const early=commit(commit(emptyState(),'a',par,cat),'b',par,cat);
 assert.equal(early.completed,false);
 assert.equal(tally(par,cat,early.picks).actual,100);
 assert.equal(score(par,cat,early.picks),null);
 assert.equal(ballDestination(par,tally(par,cat,early.picks),2).x,650);
 assert.equal(ballDestination(par,{actual:25},1).x,252.5);
 assert.equal(ballDestination(par,{actual:50},1).x,385);
 assert.ok(ballDestination(par,{actual:120},3).x>650);
 assert.deepEqual(ballDestination(blind,{delta:100},2),ballDestination(blind,{delta:-100},2));
 const final=commit(early,'c',par,cat);
 assert.equal(score(par,cat,final.picks).delta,5);
});

test('Bajo Par guarda tanto el acierto temprano como un hoyo cerrado con diferencia',()=>{
 const c=rounds.find(c=>c.mode==='under'), cat=roundCatalogs[c.catalogId];
 let s=emptyState();
 for(const id of c.solution)s=commit(s,id,c,cat);
 assert.equal(s.completed,true);
 assert.equal(score(c,cat,s.picks,s.completed).distance,0);
 assert.equal(restore(JSON.stringify(s),c,cat).completed,true);
 const partial=commit(emptyState(),c.solution[0],c,cat);
 assert.equal(partial.completed,false);
 const closed=restore({...partial,completed:true},c,cat);
 assert.equal(closed.completed,true);
 assert.ok(score(c,cat,closed.picks,closed.completed).distance>0);
});

test('El catálogo amplio encuentra las ciudades y el buscador no sugiere sin texto',async()=>{
 const {search}=await import('../src/core.js');
 const city=roundCatalogs['european-cities'];
 assert.ok(city.entries.length>900);
 assert.deepEqual(search(city,''),[]);
 for(const [query,name] of [['Mallorca','Palma de Mallorca'],['Palma Mallorca','Palma de Mallorca'],['Lyon','Lyon'],['Marsella','Marsella']]){
  const match=search(city,query)[0];
  assert.equal(match.name,name);
  assert.ok(!search(city,query,[match.id]).some(e=>e.id===match.id));
 }
});

test('Interestelar se encuentra por sus dos títulos y suma un Óscar',async()=>{
 const {search}=await import('../src/core.js');
 const films=roundCatalogs['oscars-favorites'];
 const [film]=search(films,'Interestelar');
 assert.equal(film.name,'Interestelar');
 assert.equal(film.value,1);
 assert.equal(search(films,'Interstellar')[0].id,film.id);
 assert.equal(search(films,'Interstellar',[film.id]).length,0);
});
