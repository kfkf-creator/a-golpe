import {mkdir,cp,writeFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const name of ['index.html','favicon.svg','src']) await cp(name,'dist/'+name,{recursive:true});
await writeFile('dist/_headers','/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n');
console.log('Web estática preparada en dist/. Sin dependencias de ejecución ni servicios externos.');
