// Original vector artwork. All scenery is decorative; the visible caption explains the shot.
export function courseSVG({id='course',hero=false,ballX=120,ballY=260,label='Campo de golf con salida, calle, green y bandera'}={}) {
 return `<svg class="course-svg ${hero?'hero-course':''}" viewBox="0 0 900 390" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">
 <defs>
  <pattern id="${id}-stripes" width="70" height="70" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)"><rect width="35" height="70" fill="#b4c982"/><rect x="35" width="35" height="70" fill="#bfd18e"/></pattern>
  <radialGradient id="${id}-ball" cx="32%" cy="25%"><stop stop-color="#fff"/><stop offset=".8" stop-color="#fffdf3"/><stop offset="1" stop-color="#d4d4bd"/></radialGradient>
  <filter id="${id}-shadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#193f32" flood-opacity=".13"/></filter>
 </defs>
 ${hero?'<path d="M0 52Q225 0 450 35T900 58V390H0Z" fill="#b8dce9"/>':''}
 <path d="M0 205Q80 130 168 162T350 139T565 148T760 130T900 166V390H0Z" fill="#e5ead3"/>
 <path d="M20 285C-26 190 156 150 266 170S410 132 494 129S714 111 809 164S946 289 834 332S633 337 559 359S326 385 240 347S54 355 20 285" fill="#6c9464"/>
 <path d="M63 278C35 219 166 185 259 206S422 165 504 164S697 146 780 189S867 268 800 295S620 290 538 320S331 344 246 311S89 329 63 278" fill="url(#${id}-stripes)"/>
 <path d="M65 279C57 228 169 201 259 220S420 178 505 178S687 161 771 201" fill="none" stroke="#d8e6ad" stroke-width="2" opacity=".7"/>
 <path d="M139 306C247 270 282 332 391 320S496 298 534 301" fill="none" stroke="#9ab875" stroke-width="2"/>
 <path d="M507 223C533 179 669 184 737 219S757 288 700 298S539 301 513 275S493 246 507 223" fill="#d4e3a0"/>
 <path d="M533 226C559 199 661 203 711 225S738 268 695 278S563 284 541 266S517 243 533 226" fill="none" stroke="#e9efc9" stroke-width="2"/>
 <path d="M409 203C425 174 482 175 484 192S445 207 455 222S420 237 408 224S402 215 409 203" fill="#e8d6a7" stroke="#f5e8c7" stroke-width="7"/>
 <path d="M738 318C763 306 779 312 802 306S852 302 853 319S812 342 790 336S752 340 738 330Z" fill="#e8d6a7" stroke="#f5e8c7" stroke-width="6"/>
 <path d="M15 325Q66 304 104 334T205 354L221 390H0V334Z" fill="#93bdbe"/>
 <path d="M20 345Q58 331 91 347M109 362Q146 352 168 361M27 371Q65 358 88 371" fill="none" stroke="#d9e7db" stroke-width="3" stroke-linecap="round"/>
 ${[[76,170,26],[126,149,34],[193,159,22],[325,142,23],[775,141,30],[821,166,23],[855,185,32]].map(([x,y,r])=>`<ellipse cx="${x+9}" cy="${y+31}" rx="${r}" ry="10" fill="#244f38" opacity=".15"/><path d="M${x} ${y}v32" stroke="#786e49" stroke-width="6"/><circle cx="${x}" cy="${y}" r="${r}" fill="#31634d"/><path d="M${x-r*.5} ${y+r*.3}Q${x-15} ${y-22} ${x+r*.4} ${y-r*.6}" fill="none" stroke="#4b7e58" stroke-width="7" stroke-linecap="round"/>`).join('')}
 <ellipse cx="120" cy="264" rx="38" ry="13" fill="#d8e6aa"/><path d="M96 263h-6m60 0h-6" stroke="#f8f4df" stroke-width="6" stroke-linecap="round"/>
 <ellipse cx="650" cy="265" rx="12" ry="4" fill="#214d38"/>
 <path d="M650 265V115" stroke="#fdf9e8" stroke-width="5"/><path d="M652 116L706 130L652 151Z" fill="#e8825c"/>
 <path d="M652 116L706 130L689 136L652 126Z" fill="#f4a179"/>
 ${hero?`<path d="M162 244Q360 6 631 234" fill="none" stroke="#fcf9e9" stroke-width="3" stroke-dasharray="5 10" stroke-linecap="round"/>
 <g stroke-linecap="round">
  <path d="M99 255L55 181" stroke="#506773" stroke-width="3"/>
  <path d="M63 195L55 181" stroke="#234e3c" stroke-width="6"/>
  <path d="M94 249C87 247 81 251 81 258C81 266 88 271 100 270L108 266L106 253Z" fill="#234e3c" stroke="#173e32" stroke-width="1.5"/>
  <path d="M105 254L108 266" stroke="#c9d6d5" stroke-width="3"/>
  <path d="M87 253Q94 250 100 254" fill="none" stroke="#628276" stroke-width="2"/>
 </g>`:''}
 <g class="impact" opacity="0" stroke="#fffdf1" stroke-width="3" stroke-linecap="round"><path d="M104 244l-8-8m19 3-1-10m15 13 6-8"/></g>
 <ellipse class="ball-shadow" cx="${ballX}" cy="267" rx="10" ry="3" fill="#214c35" opacity=".25"/>
 <circle class="golf-ball" cx="${ballX}" cy="${ballY}" r="7" fill="url(#${id}-ball)" stroke="#e2e2cf" stroke-width=".6"/>
 <g fill="#365d44" font-family="Arial,sans-serif" font-size="11" letter-spacing="2"><text x="120" y="298" text-anchor="middle">SALIDA</text><text x="650" y="322" text-anchor="middle">${hero?'EL OBJETIVO':'EL HOYO'}</text></g>
 <g fill="#416a4c" opacity=".55"><path d="M274 173l4-8 4 9m-97 169 3-8 5 8m439 24 5-9 4 9m-275 2 3-7 4 7" stroke="#416a4c" stroke-width="2" fill="none"/></g>
 </svg>`;
}
