// Catálogos congelados. Nunca modificar una versión utilizada por un reto publicado.
const row = (id,name,value,aliases=[],extra={}) => ({id,name,value,aliases,...extra});
const atomNames='Hidrógeno|Helio|Litio|Berilio|Boro|Carbono|Nitrógeno|Oxígeno|Flúor|Neón|Sodio|Magnesio|Aluminio|Silicio|Fósforo|Azufre|Cloro|Argón|Potasio|Calcio|Escandio|Titanio|Vanadio|Cromo|Manganeso|Hierro|Cobalto|Níquel|Cobre|Zinc'.split('|');
const symbols='H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn'.split(' ');
const atoms=atomNames.map((name,i)=>row('atom-'+symbols[i].toLowerCase(),name,i+1,[symbols[i],...(name==='Zinc'?['Cinc']:[])],{rank:i+1,detail:'Elemento químico'}));
const medals=[
 ['usa','Estados Unidos',40,44,42,['EEUU','EE. UU.','USA','United States']],
 ['chn','China',40,27,24,['República Popular China']],['jpn','Japón',20,12,13,['Japan']],
 ['aus','Australia',18,19,16,[]],['fra','Francia',16,26,22,['France']],
 ['ned','Países Bajos',15,7,12,['Holanda','Netherlands']],['gbr','Gran Bretaña',14,22,29,['Reino Unido','UK','Great Britain']],
 ['kor','Corea del Sur',13,9,10,['República de Corea','South Korea']],['ita','Italia',12,13,15,['Italy']],
 ['ger','Alemania',12,13,8,['Germany']],['nzl','Nueva Zelanda',10,7,3,['New Zealand']],
 ['can','Canadá',9,7,11,['Canada']],['uzb','Uzbekistán',8,2,3,['Uzbekistan']],
 ['hun','Hungría',6,7,6,['Hungary']],['esp','España',5,4,9,['Spain']],['swe','Suecia',4,4,3,['Sweden']],
 ['ken','Kenia',4,2,5,['Kenya']],['nor','Noruega',4,1,3,['Norway']],['irl','Irlanda',4,0,3,['Ireland']],['bra','Brasil',3,7,10,['Brazil']]
].map(([id,name,value,silver,bronze,aliases],i)=>row(id,name,value,aliases,{silver,bronze,rank:i+1,detail:'Delegación olímpica'}));
const planets=[['mercury','Mercurio',4879,['Mercury']],['venus','Venus',12104,[]],['earth','Tierra',12756,['Earth','La Tierra']],['mars','Marte',6792,['Mars']],['jupiter','Júpiter',142984,['Jupiter']],['saturn','Saturno',120536,['Saturn']],['uranus','Urano',51118,['Uranus']],['neptune','Neptuno',49528,['Neptune']]]
 .map(([id,name,value,aliases])=>row(id,name,value,aliases,{detail:'Planeta del sistema solar'}));
[...planets].sort((a,b)=>b.value-a.value).forEach((e,i)=>e.rank=i+1);
const stateRows=[
 ['Alabama',135767],['Alaska',1723337],['Arizona',295234],['Arkansas',137732],['California',423967],['Colorado',269601],['Connecticut',14357],['Delaware',6446],['Florida',170312],['Georgia',153910],['Hawái',28313,'Hawaii'],['Idaho',216443],['Illinois',149995],['Indiana',94326],['Iowa',145746],['Kansas',213100],['Kentucky',104656],['Luisiana',135659,'Louisiana'],['Maine',91633],['Maryland',32131],['Massachusetts',27336],['Míchigan',250487,'Michigan'],['Minnesota',225163],['Misisipi',125438,'Mississippi'],['Misuri',180540,'Missouri'],['Montana',380831],['Nebraska',200330],['Nevada',286380],['Nuevo Hampshire',24214,'New Hampshire'],['Nueva Jersey',22591,'New Jersey'],['Nuevo México',314917,'New Mexico'],['Nueva York',141297,'New York'],['Carolina del Norte',139391,'North Carolina'],['Dakota del Norte',183108,'North Dakota'],['Ohio',116098],['Oklahoma',181037],['Oregón',254799,'Oregon'],['Pensilvania',119280,'Pennsylvania'],['Rhode Island',4001],['Carolina del Sur',82933,'South Carolina'],['Dakota del Sur',199729,'South Dakota'],['Tennessee',109153],['Texas',695662,'Tejas'],['Utah',219882],['Vermont',24906],['Virginia',110787],['Washington',184661],['Virginia Occidental',62756,'West Virginia'],['Wisconsin',169635],['Wyoming',253335]
];
const states=stateRows.map(([name,value,alias])=>row((alias||name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replaceAll(' ','-'),name,value,alias?[alias]:[],{detail:'Estado de EE. UU.'}));
[...states].sort((a,b)=>b.value-a.value).forEach((e,i)=>e.rank=i+1);
export const catalogs={
 'medals-2024-v1':{id:'medals-2024-v1',category:'Deporte',title:'El oro de París',
  prompts: {"combination":"Elige cinco delegaciones de los Juegos Olímpicos de París 2024 que, juntas, sumen lo más cerca posible de {objetivo} medallas de oro.","ranking":"¿Qué delegación terminó en el puesto {objetivo} del medallero de los Juegos Olímpicos de París 2024? Se ordena por oros, luego por platas y después por bronces."},
  subject:'delegaciones',unit:'oros',referenceDate:'2024-08-11',version:1,
  criterion:'Medallas de oro en los Juegos Olímpicos de París 2024.',universe:'Las 20 primeras delegaciones del medallero de París 2024.',rankCriterion:'Medallero de París 2024: más oros, después más platas y después más bronces.',
  source:{name:'Olympedia · París 2024',url:'https://www.olympedia.org/editions/63'},entries:medals},
 'atoms-30-v1':{id:'atoms-30-v1',category:'Ciencia',title:'Una buena química',
  prompts: {"combination":"Elige cinco elementos químicos de los primeros 30 de la tabla periódica. Intenta que sus números atómicos sumen {objetivo} protones.","ranking":"¿Qué elemento químico ocupa el puesto {objetivo} al ordenar los primeros 30 elementos de la tabla periódica de menor a mayor número atómico?"},
  subject:'elementos',unit:'protones',referenceDate:'2026-11-10',version:1,
  criterion:'Número atómico: protones de un átomo de cada elemento.',universe:'Los primeros 30 elementos de la tabla periódica, de hidrógeno a zinc.',rankCriterion:'Número atómico, de menor a mayor. El primero es el de menos protones.',
  source:{name:'Royal Society of Chemistry · Tabla periódica',url:'https://periodic-table.rsc.org/'},entries:atoms},
 'planets-diameter-v1':{id:'planets-diameter-v1',category:'Espacio',title:'A lo grande, planeta',
  prompts: {"combination":"Elige cinco planetas del sistema solar cuyos diámetros ecuatoriales sumen lo más cerca posible de {objetivo} km.","ranking":"¿Qué planeta ocupa el puesto {objetivo} al ordenar los ocho planetas del sistema solar de mayor a menor diámetro ecuatorial?"},
  subject:'planetas',unit:'km',referenceDate:'2026-11-10',version:1,
  criterion:'Diámetro ecuatorial en kilómetros, según la tabla métrica de NASA.',universe:'Los ocho planetas del sistema solar. Se excluyen lunas y planetas enanos.',rankCriterion:'Diámetro ecuatorial, de mayor a menor.',
  source:{name:'NASA · Planetary Fact Sheet',url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/'},entries:planets},
 'states-area-2010-v1':{id:'states-area-2010-v1',category:'Geografía',title:'Un mapa a lo grande',
  prompts: {"combination":"Elige cinco estados de Estados Unidos cuya superficie total (tierra y agua) sume lo más cerca posible de {objetivo} km², según el censo de 2010.","ranking":"¿Qué estado de Estados Unidos ocupa el puesto {objetivo} al ordenar los 50 estados de mayor a menor superficie total (tierra y agua)? Datos del censo de 2010."},
  subject:'estados',unit:'km²',referenceDate:'2010-01-01',version:1,
  criterion:'Superficie total (tierra y agua) en km², cifras enteras de la tabla del censo de 2010.',universe:'Los 50 estados de Estados Unidos. No incluye Washington D. C. ni territorios.',rankCriterion:'Superficie total (tierra y agua), de mayor a menor. Censo de 2010.',
  source:{name:'U.S. Census Bureau · State Area Measurements',url:'https://www.census.gov/geographies/reference-files/2010/geo/state-area.html'},entries:states}
};

const extraAtomNames = 'Galio Germanio Arsénico Selenio Bromo Kriptón Rubidio Estroncio Itrio Circonio Niobio Molibdeno Tecnecio Rutenio Rodio Paladio Plata Cadmio Indio Estaño Antimonio Telurio Yodo Xenón Cesio Bario Lantano Cerio Praseodimio Neodimio Prometio Samario Europio Gadolinio Terbio Disprosio Holmio Erbio Tulio Iterbio Lutecio Hafnio Tántalo Wolframio Renio Osmio Iridio Platino Oro Mercurio Talio Plomo Bismuto Polonio Astato Radón Francio Radio Actinio Torio Protactinio Uranio Neptunio Plutonio Americio Curio Berkelio Californio Einsteinio Fermio Mendelevio Nobelio Lawrencio Rutherfordio Dubnio Seaborgio Bohrio Hassio Meitnerio Darmstatio Roentgenio Copernicio Nihonio Flerovio Moscovio Livermorio Teneso Oganesón'.split(' ');
const extraSymbols = 'Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' ');
const fullAtoms = [...atoms, ...extraAtomNames.map((name, i) => {
 const symbol = extraSymbols[i];
 const atomicNumber = i + 31;
 return row('atom-' + symbol.toLowerCase(), name, atomicNumber, [symbol], {rank:atomicNumber, detail:'Elemento químico'});
})];

const otherGoldWinners = [
 ['iri','Irán',3,6,3],['ukr','Ucrania',3,5,4],['rou','Rumanía',3,4,2],
 ['geo','Georgia',3,3,1],['bel','Bélgica',3,1,6],['bul','Bulgaria',3,1,3],
 ['srb','Serbia',3,1,1],['cze','Chequia',3,0,2],['den','Dinamarca',2,2,5],
 ['aze','Azerbaiyán',2,2,3],['cro','Croacia',2,2,3],['cub','Cuba',2,1,6],
 ['brn','Baréin',2,1,1],['slo','Eslovenia',2,1,0],['tpe','Taipéi Chino',2,0,5],
 ['aut','Austria',2,0,3],['hkg','Hong Kong',2,0,2],['phi','Filipinas',2,0,2],
 ['alg','Argelia',2,0,1],['ina','Indonesia',2,0,1],['isr','Israel',1,5,1],
 ['pol','Polonia',1,4,5],['kaz','Kazajistán',1,3,3],['jam','Jamaica',1,3,2],
 ['rsa','Sudáfrica',1,3,2],['tha','Tailandia',1,3,2],['ain','Atletas Individuales Neutrales',1,3,1],
 ['eth','Etiopía',1,3,0],['sui','Suiza',1,2,5],['ecu','Ecuador',1,2,2],
 ['por','Portugal',1,2,1],['gre','Grecia',1,1,6],['arg','Argentina',1,1,1],
 ['egy','Egipto',1,1,1],['tun','Túnez',1,1,1],['bot','Botsuana',1,1,0],
 ['chi','Chile',1,1,0],['lca','Santa Lucía',1,1,0],['uga','Uganda',1,1,0],
 ['dom','República Dominicana',1,0,2],['gua','Guatemala',1,0,1],
 ['mar','Marruecos',1,0,1],['dma','Dominica',1,0,0],['pak','Pakistán',1,0,0]
].map(([id,name,gold,silver,bronze]) => row(id,name,gold,[id.toUpperCase()],{silver,bronze,detail:'Delegación olímpica'}));
const goldWinners = [...medals, ...otherGoldWinners];
goldWinners.sort((a,b) => b.value-a.value || b.silver-a.silver || b.bronze-a.bronze);
const rankedGoldWinners = goldWinners.map(entry => ({
 ...entry, rank: goldWinners.findIndex(candidate =>
  candidate.value === entry.value && candidate.silver === entry.silver && candidate.bronze === entry.bronze
 ) + 1
}));

const originalAtoms = catalogs['atoms-30-v1'];
catalogs['atoms-118-v2'] = {
 ...originalAtoms, id:'atoms-118-v2', version:2, entries:fullAtoms,
 universe:'Los 118 elementos de la tabla periódica.',
 prompts:{
  combination:'Elige cinco elementos de la tabla periódica e intenta que sus números atómicos sumen {objetivo} protones.',
  ranking:'¿Qué elemento ocupa el puesto {objetivo} al ordenar los 118 elementos de la tabla periódica de menor a mayor número atómico?'
 }
};

const originalMedals = catalogs['medals-2024-v1'];
catalogs['medals-2024-gold-v2'] = {
 ...originalMedals, id:'medals-2024-gold-v2', version:2, entries:rankedGoldWinners,
 universe:'Las 64 delegaciones con al menos un oro en el medallero de París 2024.',
 prompts:{
  combination:'Elige cinco delegaciones que ganaron oro en París 2024. Intenta que juntas sumen {objetivo} medallas de oro.',
  ranking:originalMedals.prompts.ranking + ' Puedes elegir cualquier delegación que ganó al menos un oro.'
 }
};
