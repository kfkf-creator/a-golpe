import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {catalogs} from '../src/data.js';
import {madridDate,search,emptyState,commit,restore,score,stateKey,shareText,ballDestination} from '../src/core.js';
import {validate} from '../scripts/validation.js';
const challenges=JSON.parse(await readFile(new URL('../src/challenges.json',import.meta.url),'utf8'));
const combo=challenges.find(c=>c.date==='2026-11-10'&&c.mode==='combination'),cat=catalogs[combo.catalogId];
const rank=challenges.find(c=>c.date==='2026-11-10'&&c.mode==='ranking'),rankCat=catalogs[rank.catalogId];
test('Par 5: se oculta el cálculo hasta cinco nombres y se bloquean repetidos',()=>{
 let s=emptyState();for(const id of ['usa','jpn','fra','ita']){s=commit(s,id,combo,cat);assert.equal(score(combo,cat,s.picks),null);assert.equal(s.completed,false);assert.equal(commit(s,id,combo,cat),s);}
 s=commit(s,'can',combo,cat);assert.equal(score(combo,cat,s.picks).actual,97);assert.equal(score(combo,cat,s.picks).distance,3);assert.equal(score(combo,cat,s.picks).delta,-3);assert.equal(s.completed,true);assert.equal(commit(s,'chn',combo,cat),s);
});
test('Par 5: corto y pasado tienen distancia absoluta simétrica; exacta se celebra',()=>{
 const short=score(combo,cat,['usa','jpn','fra','ita','can']);const over=score(combo,cat,['usa','jpn','fra','ned','ita']);const exact=score(combo,cat,['usa','jpn','fra','gbr','nzl']);
 assert.equal(short.distance,3);assert.equal(over.distance,3);assert.equal(over.delta,3);assert.equal(exact.distance,0);assert.equal(exact.exact,true);
});
test('Hole in One: exacta, puesto menor y puesto mayor; la pelota y el número coinciden',()=>{
 for(const targetRank of [rank.target-4,rank.target,rank.target+4]){const e=rankCat.entries.find(e=>e.rank===targetRank),s=commit(emptyState(),e.id,rank,rankCat),r=score(rank,rankCat,s.picks);assert.equal(r.distance,Math.abs(targetRank-rank.target));assert.equal(s.completed,true);const p=ballDestination(rank,r,1);assert.equal(Math.sign(p.x-650),Math.sign(targetRank-rank.target));}
});
test('Búsqueda sin tildes, símbolos, variantes y alias devuelve una sola entidad',()=>{
 assert.equal(search(cat,'eeuu')[0].name,'Estados Unidos');assert.equal(search(cat,'EE. UU.').length,1);assert.equal(search(cat,'Holanda')[0].name,'Países Bajos');assert.equal(search(cat,'japon')[0].name,'Japón');assert.equal(search(cat,'japon',['jpn']).length,0);assert.equal(search(catalogs['atoms-30-v1'],'Fe')[0].name,'Hierro');assert.equal(new Set(search(cat,'a').map(e=>e.id)).size,search(cat,'a').length);
});
test('Guardado inmediatamente tras confirmar: recarga recupera cada golpe una sola vez',()=>{
 let s=emptyState();for(const id of ['usa','jpn','fra','ita','can']){s=commit(s,id,combo,cat);const stored=JSON.stringify(s);s=restore(stored,combo,cat);assert.equal(s.picks.filter(x=>x===id).length,1);assert.equal(commit(s,id,combo,cat),s);}assert.equal(s.completed,true);assert.equal(score(combo,cat,s.picks).distance,3);
});
test('Estados dañados no permiten resultados inválidos',()=>{for(const raw of ['no-json',JSON.stringify({picks:['fake']}),JSON.stringify({picks:['usa','usa']}),JSON.stringify({picks:['usa','chn','jpn','aus','fra','ned']})])assert.deepEqual(restore(raw,combo,cat),emptyState());});
test('El día cambia a medianoche de Madrid en invierno, verano y cambios de hora',()=>{
 for(const [time,date] of [['2026-11-10T22:59:59Z','2026-11-10'],['2026-11-10T23:00:00Z','2026-11-11'],['2026-07-10T21:59:59Z','2026-07-10'],['2026-07-10T22:00:00Z','2026-07-11'],['2026-03-28T23:00:00Z','2026-03-29'],['2026-10-25T23:00:00Z','2026-10-26']])assert.equal(madridDate(new Date(time)),date);
});
test('Archivo, versión, fecha y práctica tienen las claves previstas',()=>{const keys=[stateKey(combo),stateKey({...combo,version:2}),stateKey({...combo,date:'2026-11-09'}),stateKey(rank),stateKey(combo,'practice','a'),stateKey(combo,'practice','b')];assert.equal(new Set(keys).size,6);});
test('Las cuatro primeras trayectorias no dependen de valores ocultos',()=>{for(let i=1;i<5;i++){assert.deepEqual(ballDestination(combo,{delta:-100000},i),ballDestination({...combo,target:999999},{delta:99999},i));assert.equal(ballDestination(combo,null,i).hidden,true);}assert.notEqual(ballDestination(combo,{delta:-3},5).x,ballDestination(combo,{delta:3},5).x);});
test('Compartir incluye fecha, modalidad y distancia, nunca nombres, cifras individuales ni respuesta exacta',()=>{const result=score(combo,cat,['usa','jpn','fra','ita','can']),text=shareText(combo,cat,result);assert.match(text,/10 de noviembre de 2026/);assert.match(text,/Par 5/);assert.match(text,/A 3 oros/);for(const entry of result.entries)assert.equal(text.includes(entry.name),false);assert.equal(text.includes('97'),false);assert.match(shareText(combo,cat,result,'practice'),/Práctica/);const e=rankCat.entries.find(e=>e.rank===rank.target+1),r=score(rank,rankCat,[e.id]);assert.equal(shareText(rank,rankCat,r).includes(e.name),false);});
test('Calendario: misma fecha mismo reto, 14 por modalidad y agotamiento explícito',()=>{for(const mode of ['combination','ranking'])assert.equal(challenges.filter(c=>c.mode===mode).length,14);assert.equal(challenges.filter(c=>c.date==='2026-11-21').length,0);assert.equal(challenges.filter(c=>c.date==='2026-11-09').length,2);});
test('Validador rechaza datos incompletos, IDs, fechas, objetivos y empates ambiguos',()=>{
 const badCats=structuredClone(catalogs),bad=structuredClone(challenges);delete badCats[combo.catalogId].source;badCats[combo.catalogId].entries[1].id=badCats[combo.catalogId].entries[0].id;bad[1].target=9999;bad[2].date=bad[0].date;bad[3].id=bad[1].id;
 const errors=validate(badCats,bad,{exhaustive:false});for(const term of ['fuente','identificador repetido','objetivo inexistente','fecha duplicada'])assert.ok(errors.some(e=>e.includes(term)),term);
 const tied=structuredClone(catalogs);tied[rank.catalogId].entries.find(e=>e.rank===rank.target+1).rank=rank.target;assert.ok(validate(tied,challenges,{exhaustive:false}).some(e=>e.includes('ambiguo')));
});
test('Todos los catálogos y mejores soluciones pasan la validación exhaustiva',()=>assert.deepEqual(validate(catalogs,challenges),[]));
