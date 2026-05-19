export const smokeFrag = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uMouse;        // in clip-space-ish coords (-aspect..aspect, -1..1)
uniform float uMouseStrength;
uniform vec3  uColorA;       // primary tint (violet)
uniform vec3  uColorB;       // secondary tint (cyan)

// --- hash / noise utils ---
vec3 hash3(vec3 p) {
  p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
           dot(p, vec3(269.5, 183.3, 246.1)),
           dot(p, vec3(113.5, 271.9, 124.6)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float snoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(
      mix(dot(hash3(i + vec3(0,0,0)), f - vec3(0,0,0)),
          dot(hash3(i + vec3(1,0,0)), f - vec3(1,0,0)), u.x),
      mix(dot(hash3(i + vec3(0,1,0)), f - vec3(0,1,0)),
          dot(hash3(i + vec3(1,1,0)), f - vec3(1,1,0)), u.x), u.y),
    mix(
      mix(dot(hash3(i + vec3(0,0,1)), f - vec3(0,0,1)),
          dot(hash3(i + vec3(1,0,1)), f - vec3(1,0,1)), u.x),
      mix(dot(hash3(i + vec3(0,1,1)), f - vec3(0,1,1)),
          dot(hash3(i + vec3(1,1,1)), f - vec3(1,1,1)), u.x), u.y),
    u.z);
}

float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * snoise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

// Curl of 2D noise (gives divergence-free / fluid-like flow)
vec2 curl(vec2 p, float t) {
  float e = 0.08;
  float n1 = snoise(vec3(p.x, p.y + e, t));
  float n2 = snoise(vec3(p.x, p.y - e, t));
  float n3 = snoise(vec3(p.x + e, p.y, t));
  float n4 = snoise(vec3(p.x - e, p.y, t));
  return vec2(n1 - n2, -(n3 - n4)) / (2.0 * e);
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0) * 2.0;

  float t = uTime * 0.06;

  // mouse repulsion field
  vec2 toMouse = p - uMouse;
  float md = length(toMouse) + 0.0001;
  vec2 repel = normalize(toMouse) * exp(-md * 2.2) * uMouseStrength * 0.55;

  // ambient flow
  vec2 flow = curl(p * 0.9 + vec2(0.0, t * 0.6), t) * 0.35;
  flow += repel;

  // domain-warped fbm density
  vec2 q = p + flow;
  float d1 = fbm(vec3(q * 1.1, t));
  float d2 = fbm(vec3(q * 2.3 + d1, t * 1.3 + 5.0));
  float density = smoothstep(-0.25, 0.85, d1 * 0.6 + d2 * 0.5);

  // a "void" carved around the cursor
  float voidMask = 1.0 - exp(-md * 2.6 / max(uMouseStrength, 0.001));
  density *= mix(0.35, 1.0, voidMask);

  // cold base
  vec3 bg = vec3(0.020, 0.022, 0.030);
  vec3 cold = vec3(0.78, 0.85, 0.95);
  vec3 smoke = mix(bg, cold, density);

  // subtle violet/cyan tinting in highlights
  float hi = pow(density, 2.2);
  smoke += uColorA * hi * 0.10;
  smoke += uColorB * pow(density, 3.0) * 0.06;

  // faint floating particles (cheap)
  float sp = snoise(vec3(p * 22.0, t * 4.0));
  float particles = smoothstep(0.93, 0.99, sp) * 0.25;
  smoke += vec3(particles);

  // vignette
  float vig = smoothstep(1.6, 0.2, length(p) * 0.9);
  smoke *= mix(0.55, 1.0, vig);

  gl_FragColor = vec4(smoke, 1.0);
}
`;
