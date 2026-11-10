import {readFile} from 'node:fs/promises';
import {catalogs} from '../src/data.js';
import {validate} from './validation.js';
const challenges=JSON.parse(await readFile(new URL('../src/challenges.json',import.meta.url),'utf8'));
const errors=validate(catalogs,challenges);
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`✓ ${Object.keys(catalogs).length} catálogos y ${challenges.length} retos válidos (14 por modalidad). Soluciones comprobadas por enumeración exhaustiva.`);
