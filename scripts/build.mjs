import {createHash} from 'node:crypto';
import {mkdir,cp,readFile,readdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';

const hash = createHash('sha256');
const files = await readdir('src', {recursive:true,withFileTypes:true});
const paths = files.filter(file => file.isFile()).map(file => join(file.parentPath,file.name)).sort();
for (const path of paths) {
  hash.update(await readFile(path));
}
const assetFolder = 'assets-' + hash.digest('hex').slice(0,16);
const html = await readFile('index.html','utf8');

await mkdir('dist',{recursive:true});
await cp('favicon.svg','dist/favicon.svg');
await cp('src','dist/src',{recursive:true});
await cp('src','dist/'+assetFolder,{recursive:true});
await writeFile('dist/index.html',html.replaceAll('./src/','./'+assetFolder+'/'));
await writeFile('dist/_headers','/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n');
console.log('Web estática preparada en dist/. Sin dependencias de ejecución ni servicios externos.');
