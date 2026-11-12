import {cityRows,populationRows} from './round-source-data.js';
import {oscarWinners} from './oscar-winners.js';
import {normalize} from './core.js';

function catalog(id, category, title, subject, unit, source, criterion, rows, descending=false) {
 const entries=rows.map(([name,value,...aliases],i)=>({id:id+'-'+i,name,value,aliases,detail:category}));
 const sorted=[...entries].sort((a,b)=>descending?b.value-a.value:a.value-b.value);
 sorted.forEach((entry,i)=>{entry.rank=i&&entry.value===sorted[i-1].value?sorted[i-1].rank:i+1;});
 return {id,category,title,subject,unit,source:{name:category+' · Fuente de los datos',url:source},
  criterion,rankCriterion:criterion,universe:'',referenceDate:'2026-11-11',version:1,entries};
}

const city={
 ...catalog('european-cities','Geografía','Ciudades desde Madrid','ciudades','km',
  'https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-populated-places/',
  'Distancias en línea recta desde Madrid, redondeadas a 100 km.',[]),
 valueStep:100,
 universe:'Ciudades y localidades europeas de Natural Earth 5.1.2.',
 entries:cityRows.map(([id,name,value,detail,aliases])=>({id,name,value,detail,aliases}))
};

const countries={
 ...catalog('world-population-2023','Geografía','Población del mundo','países y territorios','millones de habitantes',
  'https://data.worldbank.org/indicator/SP.POP.TOTL',
  'Población de 2023. Los valores de los golpes se redondean al millón más cercano.',[]),
 rankCriterion:'Población de 2023, de mayor a menor, con las cifras sin redondear.',
 universe:'Países y territorios con datos publicados por el Banco Mundial.',
 entries:populationRows.map(([id,name,people,english],i)=>({
  id,name,value:Math.round(people/1e6),rank:i+1,detail:'País o territorio',
  aliases:[english,...(id==='US'?['EEUU','USA','Estados Unidos']:id==='GB'?['Reino Unido','UK']:[])]
 }))
};

const oscars=catalog('oscars-favorites','Cine','Películas premiadas','películas','Óscar',
 'https://awardsdatabase.oscars.org/',
 'Premios Óscar competitivos ganados por cada película.',
 [['Titanic',11],['Ben-Hur',11,'Ben Hur'],['El retorno del rey',11,'El señor de los anillos','The Return of the King','The Lord of the Rings: The Return of the King'],
 ['West Side Story',10,'Amor sin barreras'],['Gigi',9],['El último emperador',9,'The Last Emperor'],
 ['El paciente inglés',9,'The English Patient'],['Amadeus',8],['Gandhi',8],['Slumdog Millionaire',8],
 ['La lista de Schindler',7,'Schindler’s List'],['Gravity',7,'Gravedad'],['Oppenheimer',7],
 ['Todo a la vez en todas partes',7,'Everything Everywhere All at Once'],['La La Land',6],
 ['Mad Max: Furia en la carretera',6,'Mad Max Fury Road'],['Forrest Gump',6],['Chicago',6],
 ['Gladiator',5],['Braveheart',5],['Mary Poppins',5],['El silencio de los corderos',5,'The Silence of the Lambs'],
 ['Salvar al soldado Ryan',5,'Saving Private Ryan'],['El discurso del rey',4,'The King’s Speech'],
 ['Parásitos',4,'Parasite'],['El viaje de Chihiro',1,'Spirited Away'],
 ['Toy Story 3',2],['Coco',2],['Frozen',2],['El rey león',2,'The Lion King'],
 ['Pulp Fiction',1],['Barbie',1]],true);
const spanishOscarTitles={
 Interstellar:'Interestelar',
 'Inception':'Origen',
 'The Matrix':'Matrix',
 'The Dark Knight':'El caballero oscuro',
 'The Godfather':'El padrino',
 'The Godfather Part II':'El padrino II',
 'Back to the Future':'Regreso al futuro',
 'Jurassic Park':'Parque Jurásico',
 'Finding Nemo':'Buscando a Nemo',
 'The Incredibles':'Los Increíbles',
 'Finding Dory':'Buscando a Dory',
 'The Lord of the Rings: The Fellowship of the Ring':'La comunidad del anillo',
 'The Lord of the Rings: The Two Towers':'Las dos torres',
 'Star Wars':'La guerra de las galaxias',
 'The Empire Strikes Back':'El imperio contraataca',
 'Return of the Jedi':'El retorno del Jedi',
 'Raiders of the Lost Ark':'En busca del arca perdida',
 'Indiana Jones and the Temple of Doom':'Indiana Jones y el templo maldito',
 'Indiana Jones and the Last Crusade':'Indiana Jones y la última cruzada',
 'Pirates of the Caribbean: Dead Man’s Chest':'Piratas del Caribe: El cofre del hombre muerto',
 'The Grand Budapest Hotel':'El gran hotel Budapest',
 'The Imitation Game':'Descifrando Enigma',
 'The Theory of Everything':'La teoría del todo',
 'American Sniper':'El francotirador',
 'Gone with the Wind':'Lo que el viento se llevó',
 'The Sound of Music':'Sonrisas y lágrimas',
 'The Departed':'Infiltrados',
 'No Country for Old Men':'No es país para viejos',
 'The Curious Case of Benjamin Button':'El curioso caso de Benjamin Button',
 'A Beautiful Mind':'Una mente maravillosa',
 'Life of Pi':'La vida de Pi',
 'The Shawshank Redemption':'Cadena perpetua',
 'Little Miss Sunshine':'Pequeña Miss Sunshine',
 'The Pianist':'El pianista',
 'Life Is Beautiful':'La vida es bella',
 'Brokeback Mountain':'En terreno vedado',
 'The Social Network':'La red social',
 'Big Hero 6':'Big Hero 6',
 'Inside Out':'Del revés'
};
const localized=new Map(Object.entries(spanishOscarTitles).map(([title,name])=>[normalize(title),name]));
const curatedTitles=new Set(oscars.entries.flatMap(e=>[e.name,...e.aliases].map(normalize)));
for(const [index,[year,title,value]] of oscarWinners.entries()){
 const key=normalize(title);
 if(curatedTitles.has(key))continue;
 const name=localized.get(key)||title;
 const aliases=name!==title?[title]:[];
 if(title==='Inception')aliases.push('El origen');
 if(title==='The Dark Knight')aliases.push('Batman: El caballero de la noche');
 if(title==='Back to the Future')aliases.push('Volver al futuro');
 oscars.entries.push({id:'academy-'+year+'-'+index,name,value,aliases,detail:'Óscar '+year});
}
oscars.universe='Películas premiadas en las ceremonias de 1960 a 2016 y una selección de ganadoras posteriores. Se aceptan títulos originales y nombres en español de muchas películas conocidas.';

const champions=catalog('world-cup-titles-2022','Deporte','Campeones del Mundial','selecciones','Mundiales',
 'https://www.archives.fifa.com/fifa_world_cup',
 'Títulos del Mundial masculino hasta Catar 2022, inclusive.',
 [['Brasil',5],['Alemania',4],['Italia',4],['Argentina',3],['Francia',2],['Uruguay',2],['España',1],['Inglaterra',1]],true);

const eurovision=catalog('eurovision-wins-2025','Música','Ganadores de Eurovisión','países','victorias',
 'https://www.eurovision.com/eurovision-song-contest/history/',
 'Victorias en Eurovisión hasta 2025, incluido el empate de 1969.',
 [['Irlanda',7],['Suecia',7],['Francia',5],['Luxemburgo',5],['Países Bajos',5,'Holanda'],['Reino Unido',5],
 ['Israel',4],['Austria',3],['Dinamarca',3],['Italia',3],['Noruega',3],['Suiza',3],['Ucrania',3],
 ['Alemania',2],['España',2],['Bélgica',1],['Portugal',1],['Grecia',1],['Finlandia',1],
 ['Turquía',1],['Estonia',1],['Letonia',1],['Rusia',1],['Serbia',1],['Azerbaiyán',1],
 ['Mónaco',1],['Yugoslavia',1]],true);

const films=catalog('pixar-first-films','Cine','Primeras películas de Pixar','películas','año de estreno',
 'https://www.pixar.com/feature-films',
 'Los primeros 14 largometrajes de Pixar por orden de estreno.',
 [['Toy Story',1995],['Bichos',1998,"A Bug’s Life"],['Toy Story 2',1999],['Monstruos S. A.',2001,'Monsters Inc'],
 ['Buscando a Nemo',2003,'Finding Nemo'],['Los Increíbles',2004,'The Incredibles'],['Cars',2006],
 ['Ratatouille',2007],['WALL-E',2008,'WALL E'],['Up',2009],['Toy Story 3',2010],['Cars 2',2011],
 ['Brave',2012],['Monstruos University',2013,'Monsters University']]);

const planets=catalog('planets-from-sun','Espacio','Planetas del sistema solar','planetas','posición',
 'https://science.nasa.gov/solar-system/planet-sizes-and-locations-in-our-solar-system/',
 'Los ocho planetas ordenados desde el Sol.',
 [['Mercurio',1],['Venus',2],['Tierra',3],['Marte',4],['Júpiter',5],['Saturno',6],['Urano',7],['Neptuno',8]]);

const planetSizes=catalog('planet-size-order','Espacio','Tamaño de los planetas','planetas','km de diámetro',
 'https://science.nasa.gov/solar-system/planet-sizes-and-locations-in-our-solar-system/',
 'Diámetro ecuatorial de los planetas, de mayor a menor.',
 [['Mercurio',4879],['Venus',12104],['Tierra',12756],['Marte',6792],['Júpiter',142984],['Saturno',120536],['Urano',51118],['Neptuno',49528]],true);

const firstCup=catalog('first-world-cup-title','Deporte','Primer Mundial ganado','selecciones','año',
 'https://www.archives.fifa.com/fifa_world_cup',
 'Orden del primer título de cada selección en el Mundial masculino hasta 2022.',
 [['Uruguay',1930],['Italia',1934],['Alemania',1954],['Brasil',1958],['Inglaterra',1966],['Argentina',1978],['Francia',1998],['España',2010]]);

export const roundCatalogs=Object.fromEntries([city,countries,oscars,champions,eurovision,films,planets,planetSizes,firstCup].map(c=>[c.id,c]));
