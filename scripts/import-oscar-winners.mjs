import {writeFile} from 'node:fs/promises';
const origin='https://www.oscars.org/oscars/ceremonies/';
const decode=s=>s.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi,(_,code)=>{
 if(code.startsWith('#'))return String.fromCodePoint(code[1].toLowerCase()==='x'?parseInt(code.slice(2),16):Number(code.slice(1)));
 return {amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',nbsp:' '}[code.toLowerCase()];
}).replace(/\s+/g,' ').trim();
async function ceremony(year){
 for(let attempt=0;attempt<3;attempt++){
  try{
   const response=await fetch(origin+year,{signal:AbortSignal.timeout(15000)});
   if(!response.ok)throw Error('HTTP '+response.status);
   const html=await response.text();
   const films=html.matchAll(/class="award-ceremony__film-title">([^<]+)<\/div>\s*<div class="award-ceremony__film-details">\s*<div class="award-ceremony__film-nominations">[\s\S]*?<\/div>\s*<ul class="award-ceremony__film-categories">([\s\S]*?)<\/ul>/g);
   const winners=[...films].flatMap(([,title,categories])=>{
    const awards=[...categories.matchAll(/class="award-ceremony__category-name">\s*<span class="winner">[^<]*<\/span>([^<]+)/g)];
    const wins=awards.filter(([,category])=>!/(honorary|special achievement|special award|scientific|technical award)/i.test(category)).length;
    return wins?[[year,decode(title),wins]]:[];
   });
   if(winners.length<5)throw Error('faltan películas ganadoras');
   return winners;
  }catch(error){if(attempt===2)throw Error(year+': '+error.message);}
 }
}
const rows=[];
for(let year=1960;year<=2016;year+=5){
 const batch=Array.from({length:Math.min(5,2017-year)},(_,i)=>ceremony(year+i));
 rows.push(...(await Promise.all(batch)).flat());
}
await writeFile('src/oscar-winners.js',
 '// Competitive film awards from the Academy ceremony summaries, 1960–2016.\n'+
 'export const oscarWinners='+JSON.stringify(rows)+';\n');
console.log(rows.length+' películas premiadas; Interestelar:',rows.find(r=>r[1]==='Interstellar'));
