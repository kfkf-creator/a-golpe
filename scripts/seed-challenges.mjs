// Only for initial content authoring. Do NOT regenerate a published calendar.
import {writeFile} from 'node:fs/promises';
import {catalogs} from '../src/data.js';
import {bestSolutions} from '../src/core.js';
const combo=['atoms-118-v2','states-area-2010-v1','planets-diameter-v1','medals-2024-gold-v2'];
const ranking=['medals-2024-gold-v2','planets-diameter-v1','atoms-118-v2','states-area-2010-v1'];
const goals=[75,750000,246000,100,90,900000,295000,85,105,600000,200000,65,65,1100000];
const ranks=[9,4,17,12,15,6,24,25,7,3,12,35,5,5];
const challenges=[];
for(let i=0;i<14;i++) {
 const date=new Date(Date.UTC(2026,10,7+i)).toISOString().slice(0,10);
 for(const mode of ['combination','ranking']) {
  const catalogId=(mode==='combination'?combo:ranking)[i%4],catalog=catalogs[catalogId];
  const c={id:`${mode}-${date}`,date,mode,version:1,catalogId,target:mode==='combination'?goals[i]:ranks[i]};
  c.prompt=mode==='combination'?`Elige cinco ${catalog.subject} para sumar cerca de ${c.target} ${catalog.unit}.`:`¿Qué nombre ocupa el puesto ${c.target}?`;
  if(mode==='combination'){const best=bestSolutions(catalog,c.target);c.solution=best.example;c.bestDistance=best.distance;c.nearRoutes=best.nearCount;}
  challenges.push(c);
 }
}
await writeFile('src/challenges.json',JSON.stringify(challenges,null,2)+'\n');
console.log(`${challenges.length} retos guardados.`);
