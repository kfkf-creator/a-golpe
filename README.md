# Golf de cultura general

Juego diario en español con 14 retos de Combinación y 14 de Ranking. El calendario abarca del 7 al 20 de noviembre de 2026, ambos inclusive, con cambio de día a medianoche de Madrid. Los retos anteriores quedan disponibles en el archivo y en práctica.

## Abrir, comprobar y preparar la publicación

Desde esta carpeta, con Node.js 22 o posterior:

```sh
npm run dev       # Abre http://127.0.0.1:4173
npm test          # Puntuación, guardado, búsqueda, fechas, datos y más
npm run validate  # Catálogos, calendario y soluciones comprobadas
npm run build     # Genera dist/
npm run preview   # Sirve dist/ en el mismo puerto, si está libre
```

El proyecto no requiere instalar paquetes. Para publicar, sirve el contenido de `dist/` desde un alojamiento estático con HTTPS. Las rutas usan el fragmento de la URL, por lo que no necesitan reglas de reescritura. La publicación queda pendiente de la solicitud del propietario.

El progreso se guarda en el navegador y está asociado a la dirección desde la que se abre el juego. Las cifras se ocultan en la interfaz. Al tratarse de un sitio estático, los datos se distribuyen al navegador junto con el juego.

## Añadir retos

1. Reutiliza un catálogo de `src/data.js` o añade una versión nueva con identificadores estables, nombres y alias. Incluye el criterio, el universo, las unidades, la fecha de referencia y el enlace a la fuente. Conserva intactas las versiones ya usadas. En Ranking, asigna puestos según el criterio y los desempates de la fuente. Si persiste un empate, comparte el puesto y elige otro para el objetivo.
2. Añade una fila por modalidad y fecha en `src/challenges.json`. Usa una fecha ISO de Madrid y un ID único. Mantén el calendario en orden ascendente. `catalogId` fija la versión de los datos. Si debes corregir un reto, conserva el registro anterior en el control de versiones e incrementa `version` para distinguir su progreso.
3. En Combinación, usa `bestSolutions(catalog, target)` de `src/core.js` para obtener una solución de cinco IDs, la distancia mínima y el número de combinaciones cercanas. Guarda estos resultados en `solution`, `bestDistance` y `nearRoutes`. El validador exige al menos tres rutas cercanas y un mínimo de distancia del 1 % como máximo, con margen de una unidad para cifras pequeñas. En Ranking, elige un puesto existente con una única respuesta.
4. Ejecuta `npm run validate`, `npm test` y `npm run build`. Comprueba el nuevo reto en el navegador al abrir su fecha. `scripts/seed-challenges.mjs` documenta la creación inicial del calendario. Para añadir fechas, edita el JSON sin volver a sembrar el calendario.

Los cuatro catálogos iniciales enlazan a [Olympedia](https://www.olympedia.org/editions/63), [Royal Society of Chemistry](https://periodic-table.rsc.org/), [NASA](https://nssdc.gsfc.nasa.gov/planetary/factsheet/) y [U.S. Census Bureau](https://www.census.gov/geographies/reference-files/2010/geo/state-area.html). Las fuentes también aparecen en el resultado de cada reto.

## Comprobaciones de navegador

- Combinación a 3 oros por debajo en escritorio y 3 por encima en práctica móvil. Comprobación del quinto golpe y de las cifras ocultas durante los cuatro primeros.
- Ranking a 4 puestos por cada lado de la bandera y hoyo en uno. Verificación del tramo de ranking y la respuesta exacta.
- Búsqueda por alias y sin tildes, navegación con flechas e Intro, confirmación explícita y exclusión de nombres usados.
- Recarga durante el primer golpe y tras el segundo. Reanudación sin duplicados.
- Archivo del 9 de noviembre, historial separado para práctica y copia al portapapeles sin nombres. La prueba automatizada de Madrid cubre medianoche de invierno y verano.
- Interfaz en escritorio y a 390 px, animación normal, salto y opción sin movimiento.
