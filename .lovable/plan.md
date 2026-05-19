# Sfondo cinematico fumo/nebula per VapeSearch

Aggiungo uno sfondo fullscreen premium, ambient, con simulazione fluida del fumo reattiva al mouse, integrato come layer di sfondo della landing page (`Index.tsx`) sotto il contenuto attuale.

## Obiettivo visivo

- Canvas fullscreen fisso (`position: fixed; inset: 0; z-index: -1`) dietro tutta la pagina
- Base #050505/#0a0a0a, fumo bianco/grigio freddo con tint blu (190-220° hue) e leggero viola dal design system esistente
- Glow diffuso, profondità multilayer, particelle floating quasi invisibili, blur cinematografico
- Movimento ambient continuo anche senza mouse
- Mouse = campo repulsivo: il fumo si scosta, crea un "vuoto" con inerzia e ritorno morbido

## Tecnologia

- **OGL** (libreria WebGL minimale, ~10KB) — più leggera di Three.js, perfetta per un singolo shader fullscreen
- Fragment shader GLSL con **fluid-like advection semplificata**: domain warping multi-octave su simplex/curl noise + repulsione dal cursore tramite uniform `uMouse` e `uMouseVelocity`
- Approccio non una vera Navier-Stokes (troppo pesante e non necessaria per il look "ambient"): uso **curl noise + flow field** che dà l'aspetto fluido senza il costo
- Render a `devicePixelRatio` capped a 1.5 per retina senza esagerare
- RequestAnimationFrame con delta-time, target 60 FPS

## Interazione mouse

- Cattura posizione mouse con easing (lerp ~0.08) per inerzia naturale
- Calcolo velocità (delta posizione) passato come uniform per creare "scia"
- Nello shader: distanza dal mouse → falloff gaussiano → distorsione del campo noise verso l'esterno (repulsione)
- Su touch device: nessun handler mouse, solo ambient

## Performance & fallback

Device detection all'avvio:
- `navigator.hardwareConcurrency < 4`
- `navigator.deviceMemory < 4` (se disponibile)
- `matchMedia('(prefers-reduced-motion: reduce)')`
- User agent mobile + viewport < 768px
- Test rapido: se `getContext('webgl2')` fallisce → WebGL1, se WebGL fallisce del tutto → CSS

Tier WebGL (desktop performante):
- Shader completo con 4-5 ottave di noise, particelle, glow

Tier CSS fallback (mobile/low-end/reduced-motion):
- Background con 3 gradienti radiali animati che si muovono lentamente
- Layer SVG noise statico
- Particelle CSS leggere (5-10 div con animazione `float-slow`)
- Stesso mood, costo CPU/GPU minimo

## File da creare/modificare

```text
src/components/SmokeBackground.tsx      [nuovo] componente che decide WebGL vs CSS
src/components/SmokeBackgroundWebGL.tsx [nuovo] canvas OGL + shader
src/components/SmokeBackgroundCSS.tsx   [nuovo] fallback con gradienti animati
src/shaders/smoke.frag.ts               [nuovo] fragment shader GLSL
src/shaders/smoke.vert.ts               [nuovo] vertex shader (full-screen quad)
src/lib/detectPerformance.ts            [nuovo] device capability detection
src/pages/Index.tsx                     [modifica] inserimento <SmokeBackground/>
src/index.css                           [modifica] keyframes drift per fallback
package.json                            [modifica] aggiunta dipendenza ogl
```

## Integrazione con la landing esistente

- L'attuale `bg-gradient-hero` su `body` viene mantenuto come baseline ma reso semi-trasparente quando il canvas è attivo
- L'`<img>` hero-vapor.jpg può restare con `opacity-40` sopra il canvas, o essere rimosso a favore del fumo puro — proporrò di **mantenerlo ridotto a opacity-20** per coerenza
- Il canvas è `pointer-events: none` quindi non interferisce con search bar, click, scroll
- Colori dello shader presi dalle CSS variables (`--primary`, `--secondary`) per coerenza con il design system viola/ciano

## Dettagli tecnici shader (riassunto)

```glsl
// pseudo
vec2 p = uv * 2.0 - 1.0;
vec2 mouseField = p - uMouse;
float mouseDist = length(mouseField);
vec2 repel = normalize(mouseField) * exp(-mouseDist*3.0) * 0.4;
vec2 flow = curlNoise(p*1.5 + uTime*0.05) + repel;
float density = fbm(p + flow*0.3, 5 octaves);
vec3 smoke = mix(bgDark, coldWhite, density);
smoke += primaryGlow * pow(density, 3.0) * 0.15;
```

## Cosa NON cambio

- Nessuna modifica a logica di ricerca, auth, profilo, edge functions
- Nessuna modifica a layout/componenti UI esistenti oltre l'inserimento del background
- Nessuna modifica al design system (riuso token esistenti)
