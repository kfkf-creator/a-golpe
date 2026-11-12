import {writeFile} from 'node:fs/promises';
const read=async url=>{
 const response=await fetch(url);
 if(!response.ok)throw Error(response.status+' '+url);
 return response.json();
};
const [places,[,population],[,economies]]=await Promise.all([
 read('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_populated_places_simple.geojson'),
 read('https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?date=2023&format=json&per_page=400'),
 read('https://api.worldbank.org/v2/country?format=json&per_page=400')
]);
const european=new Set('AL AD AT BE BA BG BY CH CY CZ DE DK EE ES FI FR GB GR HR HU IE IS IT LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS RU SE SI SK SM TR UA VA XK'.split(' '));
const spanishCities={
 Palma:['Palma de Mallorca','Mallorca','Ciutat de Mallorca'],Marseille:['Marsella'],Lyon:['Lión'],
 London:['Londres'],Paris:['París'],Rome:['Roma'],Lisbon:['Lisboa'],Berlin:['Berlín'],
 Brussels:['Bruselas'],Amsterdam:['Ámsterdam'],Athens:['Atenas'],Dublin:['Dublín'],
 Wien:['Viena'],Praha:['Praga'],Warsaw:['Varsovia'],Munich:['Múnich'],Copenhagen:['Copenhague'],
 Moscow:['Moscú'],Istanbul:['Estambul'],Kiev:['Kiev','Kyiv'],Seville:['Sevilla']
};
const regionNames=new Intl.DisplayNames(['es'],{type:'region'});
const rad=Math.PI/180;
function km(lat,lon){
 const d=Math.sin((lat-40.42)*rad/2)**2+Math.cos(lat*rad)*Math.cos(40.42*rad)*Math.sin((lon+3.70)*rad/2)**2;
 return Math.round(12742*Math.asin(Math.sqrt(d))/100)*100;
}
const seen=new Set();
const cities=[];
for(const {properties:p} of places.features){
 if(!european.has(p.iso_a2)||p.name==='Madrid')continue;
 if(['RU','TR'].includes(p.iso_a2)&&p.longitude>40)continue;
 const translated=spanishCities[p.name]||[];
 const name=p.name==='Palma'&&p.iso_a2==='ES'?'Palma de Mallorca':translated[0]&&p.name!=='Lyon'?translated[0]:p.name;
 const key=p.iso_a2+':'+name.toLowerCase();
 if(seen.has(key))continue;
 seen.add(key);
 const aliases=[...new Set([p.name,p.nameascii,p.namealt,...translated].filter(x=>x&&x!==name))];
 cities.push([String(p.ne_id),name,km(p.latitude,p.longitude),regionNames.of(p.iso_a2),aliases]);
}
const countries=population.filter(p=>p.value!=null&&p.countryiso3code&&economies.some(e=>e.id===p.countryiso3code&&e.region.value!=='Aggregates'&&/^[A-Z]{2}$/.test(e.iso2Code)))
 .sort((a,b)=>b.value-a.value).map(p=>[p.country.id,regionNames.of(p.country.id),p.value,p.country.value]);
await writeFile('src/round-source-data.js',
 '// Natural Earth 5.1.2 and World Bank SP.POP.TOTL (2023). Regenerate with scripts/import-round-data.mjs.\n'+
 'export const cityRows='+JSON.stringify(cities)+';\nexport const populationRows='+JSON.stringify(countries)+';\n');
console.log(cities.length+' ciudades; '+countries.length+' países y territorios');
