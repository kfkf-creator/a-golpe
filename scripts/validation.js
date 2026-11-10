import {bestSolutions} from '../src/core.js';
export function validate(catalogs,challenges,{exhaustive=true}={}) {
 const errors=[],seenCatalogIds=new Set(),challengeIds=new Set(),dates=new Set();
 const check=(ok,msg)=>{if(!ok)errors.push(msg);};
 for(const [key,cat] of Object.entries(catalogs)){
  const tag=`Catálogo ${key}`;check(key===cat.id,`${tag}: ID no coincide`);check(!seenCatalogIds.has(cat.id),`${tag}: ID repetido`);seenCatalogIds.add(cat.id);
  for(const field of ['title','category','unit','criterion','universe','rankCriterion','referenceDate'])check(typeof cat[field]==='string'&&cat[field].trim().length>0,`${tag}: falta ${field}`);
  check(Number.isInteger(cat.version)&&cat.version>0,`${tag}: versión inválida`);
  check(/^\d{4}-\d{2}-\d{2}$/.test(cat.referenceDate),`${tag}: fecha de referencia inválida`);
  check(!!cat.source?.name&&/^https:\/\//.test(cat.source?.url||''),`${tag}: falta fuente HTTPS`);
  check(Array.isArray(cat.entries)&&cat.entries.length>=5,`${tag}: menos de cinco nombres`);
  const ids=new Set(),names=new Set();
  for(const e of cat.entries||[]){check(e.id&&!ids.has(e.id),`${tag}: identificador repetido o vacío ${e.id}`);ids.add(e.id);check(e.name&&!names.has(e.name),`${tag}: nombre repetido o vacío ${e.name}`);names.add(e.name);check(Number.isFinite(e.value)&&e.value>=0,`${tag}/${e.id}: valor inválido`);check(Array.isArray(e.aliases)&&e.aliases.every(x=>typeof x==='string'),`${tag}/${e.id}: alias inválidos`);check(Number.isInteger(e.rank)&&e.rank>0&&e.rank<=cat.entries.length,`${tag}/${e.id}: puesto inválido`);}
 }
 for(const c of challenges){const tag=`Reto ${c.id}`,cat=catalogs[c.catalogId];check(!challengeIds.has(c.id),`${tag}: identificador repetido`);challengeIds.add(c.id);
  check(['combination','ranking'].includes(c.mode),`${tag}: modalidad inválida`);
  const dateKey=`${c.date}:${c.mode}`;check(!dates.has(dateKey),`${tag}: fecha duplicada para la modalidad`);dates.add(dateKey);
  check(/^\d{4}-\d{2}-\d{2}$/.test(c.date)&&!isNaN(Date.parse(c.date))&&new Date(c.date).toISOString().slice(0,10)===c.date,`${tag}: fecha inválida`);
  check(Number.isInteger(c.version)&&c.version>0,`${tag}: versión inválida`);check(typeof c.prompt==='string'&&c.prompt.length>10,`${tag}: falta enunciado`);check(Number.isFinite(c.target)&&c.target>0,`${tag}: objetivo inválido`);check(!!cat,`${tag}: catálogo inexistente`);if(!cat)continue;
  if(c.mode==='ranking'){check(Number.isInteger(c.target),`${tag}: puesto no entero`);check(cat.entries.filter(e=>e.rank===c.target).length===1,`${tag}: objetivo inexistente o ambiguo`);}
  else if(c.mode==='combination'){
   check(Array.isArray(c.solution)&&c.solution.length===5&&new Set(c.solution).size===5,`${tag}: solución debe tener cinco nombres distintos`);
   const entries=(c.solution||[]).map(id=>cat.entries.find(e=>e.id===id));check(entries.every(Boolean),`${tag}: solución con IDs desconocidos`);
   if(entries.length===5&&entries.every(Boolean))check(Math.abs(entries.reduce((s,e)=>s+e.value,0)-c.target)===c.bestDistance,`${tag}: ejemplo no coincide con distancia óptima`);
   if(exhaustive){const best=bestSolutions(cat,c.target);check(best.distance===c.bestDistance,`${tag}: mínimo incorrecto`);check(best.distance<=Math.max(1,c.target*.01),`${tag}: mejor solución demasiado lejos`);check(best.nearCount>=3,`${tag}: menos de tres rutas a un 10%`);check(best.nearCount===c.nearRoutes,`${tag}: recuento de rutas incorrecto`);}
  }
 }
 for(const mode of ['combination','ranking'])check(challenges.filter(c=>c.mode===mode).length>=14,`Faltan retos: mínimo 14 en ${mode}`);
 return errors;
}
