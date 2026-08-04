const r = (key, label, min, max, step) => ({ key, label, min, max, step });
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const mixHex = (from, to, amount) => {
  const a = from.replace("#", "");
  const b = to.replace("#", "");
  return `#${[0, 2, 4]
    .map((index) => {
      const start = Number.parseInt(a.slice(index, index + 2), 16);
      const end = Number.parseInt(b.slice(index, index + 2), 16);
      return Math.round(start + (end - start) * clamp(amount, 0, 1))
        .toString(16)
        .padStart(2, "0");
    })
    .join("")}`;
};

const common = {
  opacity: r("opacity", "Opacity", 0.02, 0.22, 0.01),
  speed: r("speed", "Speed", 0, 0.8, 0.01),
  accent: r("accent", "Blue accent", 0, 0.3, 0.01),
  seed: r("seed", "Variation", 0, 100, 1),
};

export const shaderRegistry = [
  {
    id: "flow-field",
    number: "01",
    name: "Flow Field",
    rationale: "Particles converge like routed information; the broad quiet zone keeps the hero authoritative.",
    source: ["Scanner Noise 6", "Scanner Noise", "400bfadc-949b-4bd0-8e63-91886bf96c96"],
    performance: "medium",
    reducedMotion: "Freezes the field and removes cursor forces.",
    controls: [
      common.opacity,
      r("scale", "Scale", 0.6, 2.2, 0.1),
      common.speed,
      r("density", "Particles", 1000, 16000, 500),
      r("lineWeight", "Particle size", 0.3, 1.2, 0.05),
      r("contrast", "Contrast", -0.5, 2, 0.1),
      r("interaction", "Interaction", 0, 0.7, 0.01),
      common.accent,
      common.seed,
    ],
    variants: {
      quiet: { opacity: 0.07, scale: 1.5, speed: 0.04, density: 4500, lineWeight: 0.34, contrast: 0.2, interaction: 0.12, accent: 0, seed: 12 },
      visible: { opacity: 0.11, scale: 1.25, speed: 0.08, density: 7500, lineWeight: 0.42, contrast: 0.65, interaction: 0.2, accent: 0.04, seed: 34 },
      experimental: { opacity: 0.15, scale: 0.9, speed: 0.16, density: 12000, lineWeight: 0.48, contrast: 1.1, interaction: 0.35, accent: 0.12, seed: 71 },
    },
    evaluation: ["Low legibility risk", "Medium performance risk", "Medium originality risk", "Shortlist"],
  },
  {
    id: "contour-field",
    number: "02",
    name: "Contour Field",
    rationale: "Contours turn invisible system state into a measured, architectural surface.",
    source: ["Drifting Contours 2", "Drifting Contours", "cbd60141-39ab-4fc6-8bb7-3ea885a669dc"],
    performance: "low",
    reducedMotion: "Stops field evolution and keeps the authored contour state.",
    controls: [
      common.opacity,
      r("scale", "Scale", 0.2, 2.5, 0.1),
      common.speed,
      r("density", "Contour levels", 3, 24, 1),
      r("lineWeight", "Line weight", 0.5, 2.5, 0.1),
      r("contrast", "Contrast", 0.2, 2.5, 0.1),
      r("interaction", "Deformation", 0, 2, 0.05),
      common.accent,
    ],
    variants: {
      quiet: { opacity: 0.075, scale: 0.62, speed: 0.04, density: 8, lineWeight: 0.6, contrast: 0.65, interaction: 0.25, accent: 0 },
      visible: { opacity: 0.12, scale: 0.85, speed: 0.08, density: 12, lineWeight: 0.8, contrast: 0.9, interaction: 0.45, accent: 0.03 },
      experimental: { opacity: 0.17, scale: 1.25, speed: 0.16, density: 18, lineWeight: 1.05, contrast: 1.25, interaction: 0.8, accent: 0.1 },
    },
    evaluation: ["Low legibility risk", "Low performance risk", "Medium originality risk", "Production candidate"],
  },
  {
    id: "ordered-dither",
    number: "03",
    name: "Ordered Dither",
    rationale: "A workstation texture signals computation without turning early-computing language into novelty.",
    source: ["Faded Dither", "Faded Dither", "43b4ed10-a99c-44ac-85b6-c593a29c4dd2"],
    performance: "low",
    reducedMotion: "Holds a static ordered matrix at the current threshold.",
    controls: [
      common.opacity,
      r("scale", "Pixel size", 1, 12, 1),
      common.speed,
      r("density", "Wave frequency", 0.2, 4, 0.1),
      r("lineWeight", "Wave thickness", 0.05, 1.2, 0.05),
      r("contrast", "Threshold", 0.25, 0.75, 0.01),
    ],
    variants: {
      quiet: { opacity: 0.065, scale: 3, speed: 0.03, density: 0.45, lineWeight: 0.18, contrast: 0.55 },
      visible: { opacity: 0.11, scale: 4, speed: 0.07, density: 0.7, lineWeight: 0.28, contrast: 0.5 },
      experimental: { opacity: 0.16, scale: 6, speed: 0.14, density: 1.15, lineWeight: 0.42, contrast: 0.45 },
    },
    evaluation: ["Medium legibility risk", "Low performance risk", "Medium originality risk", "Explore"],
  },
  {
    id: "voronoi-structure",
    number: "04",
    name: "Voronoi Structure",
    rationale: "Broad territories behave like an organizational system negotiating boundaries over time.",
    source: ["Liquid Cells 9", "Liquid Cells", "f678c239-4625-4816-a904-8f451012caf9"],
    performance: "low",
    reducedMotion: "Freezes cell motion while keeping structural borders visible.",
    controls: [
      common.opacity,
      r("scale", "Cell scale", 1, 10, 0.5),
      common.speed,
      r("lineWeight", "Border weight", 0.5, 2.5, 0.1),
      r("contrast", "Contrast", 0.25, 2.5, 0.05),
      common.accent,
      common.seed,
    ],
    variants: {
      quiet: { opacity: 0.08, scale: 2.5, speed: 0.04, lineWeight: 0.5, contrast: 0.55, accent: 0, seed: 18 },
      visible: { opacity: 0.13, scale: 3.5, speed: 0.09, lineWeight: 0.7, contrast: 0.85, accent: 0.02, seed: 48 },
      experimental: { opacity: 0.18, scale: 5, speed: 0.18, lineWeight: 1, contrast: 1.2, accent: 0.09, seed: 77 },
    },
    evaluation: ["Low legibility risk", "Low performance risk", "Medium originality risk", "Shortlist"],
  },
  {
    id: "sparse-network",
    number: "05",
    name: "Sparse Network",
    rationale: "Seven points assemble into a living systems diagram, borrowing the reference’s converging hairlines and empty field.",
    source: ["Chevron Nodes 4", "Chevron Nodes", "aa947814-153d-4aa3-aead-f849344582da"],
    performance: "low",
    reducedMotion: "Locks the network in one sparse arrangement.",
    controls: [
      common.opacity,
      r("scale", "Node spread", 0.6, 1.5, 0.05),
      common.speed,
      r("density", "Node count", 5, 12, 1),
      r("lineWeight", "Line weight", 0.5, 2, 0.1),
      r("contrast", "Connection reach", 0.15, 0.55, 0.01),
      r("interaction", "Interaction", 0, 0.7, 0.01),
      common.accent,
      common.seed,
    ],
    variants: {
      quiet: { opacity: 0.09, scale: 0.9, speed: 0.04, density: 7, lineWeight: 0.6, contrast: 0.3, interaction: 0.12, accent: 0, seed: 23 },
      visible: { opacity: 0.14, scale: 1, speed: 0.08, density: 8, lineWeight: 0.8, contrast: 0.36, interaction: 0.22, accent: 0.03, seed: 52 },
      experimental: { opacity: 0.2, scale: 1.15, speed: 0.15, density: 10, lineWeight: 1, contrast: 0.45, interaction: 0.38, accent: 0.12, seed: 84 },
    },
    evaluation: ["Low legibility risk", "Low performance risk", "Low originality risk", "Production candidate"],
  },
  {
    id: "data-refraction",
    number: "06",
    name: "Data Refraction",
    rationale: "A fractional horizontal displacement makes the surface feel computed rather than decorated.",
    source: ["Holographic Waves 5", "Holographic Waves", "966f8ac9-0c62-42e2-a0c1-76e725e04968"],
    performance: "low",
    reducedMotion: "Stops phase motion and disables pointer-local distortion.",
    controls: [
      common.opacity,
      r("scale", "Scan density", 4, 30, 1),
      common.speed,
      r("lineWeight", "Line balance", 0.5, 0.98, 0.01),
      r("contrast", "Displacement", 0, 0.35, 0.01),
      r("interaction", "Local refraction", 0, 1, 0.01),
    ],
    variants: {
      quiet: { opacity: 0.055, scale: 18, speed: 0.03, lineWeight: 0.9, contrast: 0.05, interaction: 0.12 },
      visible: { opacity: 0.09, scale: 22, speed: 0.07, lineWeight: 0.86, contrast: 0.09, interaction: 0.22 },
      experimental: { opacity: 0.14, scale: 28, speed: 0.15, lineWeight: 0.8, contrast: 0.16, interaction: 0.4 },
    },
    evaluation: ["Very low legibility risk", "Low performance risk", "Low originality risk", "Production candidate"],
  },
  {
    id: "reaction-diffusion",
    number: "07",
    name: "Reaction Diffusion",
    rationale: "A living material suggests intelligence as process rather than an illustrated machine.",
    source: ["Lost Data 6", "Lost Data", "7a929a6f-b669-461d-8bea-33dc527f18f8"],
    performance: "high",
    reducedMotion: "Pauses the simulation on its current material state.",
    controls: [
      common.opacity,
      r("scale", "Feature size", 1, 6, 0.1),
      r("speed", "Simulation speed", 1, 12, 1),
      r("density", "Pattern threshold", 0.1, 0.55, 0.01),
      r("contrast", "Contrast", 0.05, 0.85, 0.01),
      r("interaction", "Brush strength", 0, 0.8, 0.01),
      common.accent,
    ],
    variants: {
      quiet: { opacity: 0.07, scale: 5.4, speed: 1, density: 0.42, contrast: 0.18, interaction: 0.12, accent: 0 },
      visible: { opacity: 0.12, scale: 4.5, speed: 2, density: 0.35, contrast: 0.32, interaction: 0.24, accent: 0.02 },
      experimental: { opacity: 0.18, scale: 3.5, speed: 4, density: 0.28, contrast: 0.52, interaction: 0.42, accent: 0.1 },
    },
    evaluation: ["Medium legibility risk", "High performance risk", "Medium originality risk", "Explore"],
  },
  {
    id: "wireframe-terrain",
    number: "08",
    name: "Wireframe Terrain",
    rationale: "A low CAD surface turns logistics into spatial structure while leaving the copy plane untouched.",
    source: ["Vertex Mesh 2", "Vertex Mesh", "e847a10c-bdc6-4fa2-8206-a43eaefb21e2"],
    performance: "medium",
    reducedMotion: "Freezes the terrain and removes cursor ripples.",
    controls: [
      common.opacity,
      r("scale", "Grid scale", 6, 32, 1),
      common.speed,
      r("density", "Surface frequency", 0.4, 3, 0.1),
      r("lineWeight", "Line weight", 0.1, 1.2, 0.05),
      r("contrast", "Terrain height", 0.05, 0.65, 0.01),
      r("interaction", "Cursor ripples", 0, 0.8, 0.01),
      common.accent,
      common.seed,
    ],
    variants: {
      quiet: { opacity: 0.08, scale: 15, speed: 0.03, density: 0.8, lineWeight: 0.22, contrast: 0.14, interaction: 0.08, accent: 0, seed: 14 },
      visible: { opacity: 0.13, scale: 19, speed: 0.07, density: 1.1, lineWeight: 0.3, contrast: 0.22, interaction: 0.16, accent: 0.03, seed: 41 },
      experimental: { opacity: 0.19, scale: 24, speed: 0.14, density: 1.6, lineWeight: 0.42, contrast: 0.34, interaction: 0.28, accent: 0.1, seed: 79 },
    },
    evaluation: ["Low legibility risk", "Medium performance risk", "Medium originality risk", "Shortlist"],
  },
  {
    id: "cellular-system",
    number: "09",
    name: "Cellular System",
    rationale: "Local cell rules model organizational behavior without reproducing a familiar game board.",
    source: ["Collapsing Grid 8", "Collapsing Grid", "2544e480-8170-41f6-85f0-67e8c97227da"],
    performance: "low",
    reducedMotion: "Holds one deterministic formation with no cell morphing.",
    controls: [
      common.opacity,
      r("scale", "Cell scale", 0.5, 3.5, 0.1),
      common.speed,
      r("density", "Grid density", 8, 60, 1),
      r("lineWeight", "Cell gap", 0.1, 0.85, 0.01),
      r("contrast", "Formation contrast", -0.5, 3, 0.1),
      common.accent,
      common.seed,
    ],
    variants: {
      quiet: { opacity: 0.075, scale: 1.8, speed: 0.03, density: 26, lineWeight: 0.68, contrast: 0.6, accent: 0, seed: 9 },
      visible: { opacity: 0.12, scale: 1.45, speed: 0.08, density: 34, lineWeight: 0.58, contrast: 1.1, accent: 0.02, seed: 46 },
      experimental: { opacity: 0.18, scale: 1.05, speed: 0.16, density: 44, lineWeight: 0.46, contrast: 1.8, accent: 0.1, seed: 82 },
    },
    evaluation: ["Medium legibility risk", "Low performance risk", "Low originality risk", "Explore"],
  },
  {
    id: "data-wind",
    number: "10",
    name: "Data Wind",
    rationale: "Direction and inertia make information flow legible as a physical system.",
    source: ["Flowing Dots", "Flowing Dots", "14d0668c-818f-4c6d-b6b0-d3cd2cf53acd"],
    performance: "high",
    reducedMotion: "Freezes the particle simulation as a velocity-field still.",
    controls: [
      common.opacity,
      r("speed", "Flow speed", 0.2, 2, 0.05),
      r("density", "Particles", 1000, 12000, 500),
      r("lineWeight", "Mark size", 0.3, 2, 0.05),
      r("contrast", "Swirl", 0, 30, 1),
      r("interaction", "Obstruction force", 0, 1.5, 0.05),
      r("accent", "Blue accent", 0, 0.35, 0.01),
    ],
    variants: {
      quiet: { opacity: 0.075, speed: 0.28, density: 2500, lineWeight: 0.4, contrast: 4, interaction: 0.12, accent: 0 },
      visible: { opacity: 0.12, speed: 0.48, density: 4500, lineWeight: 0.52, contrast: 8, interaction: 0.25, accent: 0.04 },
      experimental: { opacity: 0.18, speed: 0.78, density: 7000, lineWeight: 0.68, contrast: 16, interaction: 0.5, accent: 0.16 },
    },
    evaluation: ["Low legibility risk", "High performance risk", "Low originality risk", "Shortlist"],
  },
];

const palettes = {
  light: { paper: "#fffefa", ink: "#19191b", subtle: "#eeeeec", line: "#d5d5d2", blue: "#0000ff" },
  dark: { paper: "#171719", ink: "#f2f1ed", subtle: "#29292c", line: "#48484b", blue: "#4545ff" },
};

const c = (type, id, props = {}, children) => ({ type, id, props, ...(children ? { children } : {}) });

export function buildShaderPreset(entry, s, environment = {}) {
  const p = palettes[environment.dark ? "dark" : "light"];
  const interactive = environment.interactive && !environment.reduced;
  const moving = !environment.reduced;
  const accent = mixHex(p.ink, p.blue, s.accent ?? 0);
  const speed = moving ? s.speed ?? 0 : 0;
  const components = [c("SolidColor", `${entry.id}-paper`, { color: p.paper })];

  if (entry.id === "flow-field") {
    components.push(
      c("ParticleField", "flow-particles", {
        count: Math.round(s.density), cursorMode: interactive ? "push" : "none",
        cursorRadius: 0.22, cursorStrength: interactive ? s.interaction : 0,
        depth: 0.16, depthShading: 0.06, offsetX: 0.2, particleShape: "dot",
        particleSize: s.lineWeight, rotationX: -4, rotationY: 6, rotationZ: -8,
        wobble: speed * 0.55, zoom: 1.18,
      }, [
        c("GaborNoise", "flow-source", {
          balance: -0.48, colorSpace: "oklab", contrast: s.contrast, frequency: 4,
          scale: s.scale, seed: s.seed, speed,
          stops: [{ color: p.paper, position: 0 }, { color: accent, position: 0.77 }, { color: p.paper, position: 1 }],
        }),
      ]),
    );
  }

  if (entry.id === "contour-field") {
    components.push(
      c("ContourLines", "contour-lines", {
        backgroundColor: "transparent", colorMode: "custom", gamma: 0.75,
        levels: Math.round(s.density), lineColor: accent, lineWidth: s.lineWeight,
        softness: 0, source: "alpha",
      }, [
        c("Blob", "contour-source", {
          center: { x: 0.72, y: 0.52 },
          colorA: p.paper, colorB: p.subtle, colorSpace: "oklab",
          deformation: 0.16 + s.contrast * 0.08,
          highlightColor: p.line, highlightIntensity: 0,
          seed: 42, size: Math.max(0.72, s.scale),
          softness: 0.9, speed,
        }),
      ]),
      c("Liquify", "contour-interaction", {
        decay: 0.7,
        intensity: interactive ? s.interaction : 0,
        radius: 1.8,
      }),
    );
  }

  if (entry.id === "ordered-dither") {
    components.push(
      c("Dither", "dither-field", {
        colorA: "transparent", colorB: accent, colorMode: "custom",
        pattern: "bayer8", pixelSize: Math.round(s.scale), spread: 0.45, threshold: s.contrast,
      }, [
        c("SineWave", "dither-wave", {
          amplitude: 0.28, angle: 10, color: "#ffffff", frequency: s.density,
          position: { x: 0.72, y: 0.58 }, softness: 0.82, speed, thickness: s.lineWeight,
        }),
      ]),
    );
  }

  if (entry.id === "voronoi-structure") {
    const cellProps = {
      balance: -0.18, colorA: p.paper, colorB: p.subtle, colorSpace: "oklab",
      contrast: s.contrast, distance: "euclidean", jitter: 0.42, mode: "f1",
      octaves: 1, scale: s.scale, seed: s.seed, speed,
    };
    components.push(
      c("WorleyNoise", "cell-tone", cellProps),
      c("ContourLines", "cell-borders", {
        backgroundColor: "transparent", colorMode: "custom", gamma: 0.9,
        levels: 3, lineColor: mixHex(p.line, accent, s.accent ?? 0),
        lineWidth: s.lineWeight, softness: 0.1, source: "luminance",
      }, [c("WorleyNoise", "cell-border-source", { ...cellProps, colorA: "#ffffff", colorB: "#000000" })]),
    );
  }

  if (entry.id === "sparse-network") {
    components.push(c("Boids", "network-agents", {
      agentShape: "dot", alignment: 1.9, cohesion: 0.35, colorA: p.line, colorB: accent,
      colorSpace: "oklab", count: 100, cursorMode: interactive ? "repel" : "none",
      cursorStrength: interactive ? s.interaction : 0, perception: 0.22, seed: s.seed,
      separation: 2.2, size: 0.5, speed: Math.max(0.2, speed * 2), trails: 0,
    }));
  }

  if (entry.id === "data-refraction") {
    components.push(
      c("Stripes", "refraction-lines", {
        angle: 90, balance: s.lineWeight, colorA: p.paper, colorB: p.subtle,
        colorSpace: "oklab", density: Math.round(s.scale), softness: 0, speed,
      }),
      c("WaveDistortion", "refraction-wave", {
        angle: 0, edges: "mirror", frequency: 2.2, speed, strength: s.contrast, waveType: "sine",
      }),
      c("GridDistortion", "refraction-interaction", {
        decay: 7, edges: "mirror", gridSize: 64,
        intensity: interactive ? s.interaction : 0, radius: 0.7,
      }),
    );
  }

  if (entry.id === "reaction-diffusion") {
    components.push(c("ReactionDiffusion", "reaction-field", {
      brushSize: 0.07, brushStrength: interactive ? s.interaction : 0,
      colorA: p.paper, colorB: mixHex(p.paper, accent, 0.13),
      colorC: mixHex(p.paper, accent, 0.22), colorSpace: "oklab",
      contrast: s.contrast, diffusionRatio: 0.58, featureSize: s.scale,
      preset: "solitons", relief: 0, speed: Math.max(1, Math.round(s.speed)), threshold: s.density,
    }));
  }

  if (entry.id === "wireframe-terrain") {
    components.push(c("Surface3D", "terrain-surface", {
      amplitude: s.contrast, cursorIntensity: interactive ? s.interaction : 0,
      cursorSpeed: 0.18, edgePinning: 0.7, edges: "transparent",
      farCutoff: 0.78, frequency: s.density, glossiness: 0, height: -0.38,
      highlights: 0, lighting: 0, nearCutoff: 0.16, octaves: 2, roll: -7,
      seed: s.seed, speed, tilt: 64, waveType: "fractal", zoom: 1.32,
    }, [
      c("Grid", "terrain-grid", {
        cellColor: "transparent", cells: Math.round(s.scale), color: accent,
        softness: 0.05, thickness: s.lineWeight,
      }),
    ]));
  }

  if (entry.id === "cellular-system") {
    components.push(c("Pixelate", "cellular-grid", {
      gap: s.lineWeight, roundness: 0, scale: Math.round(s.density),
    }, [
      c("BlockNoise", "cellular-source", {
        balance: -0.52, colorA: accent, colorB: p.paper, colorSpace: "oklab",
        contrast: s.contrast, scale: s.scale, seed: s.seed, speed,
      }),
    ]));
  }

  if (entry.id === "data-wind") {
    components.push(c("ParticleFlow", "wind-field", {
      ambient: moving ? 0.06 : 0, colorA: accent,
      colorB: mixHex(accent, p.blue, s.accent ?? 0), colorSpace: "oklab",
      count: Math.round(s.density), force: interactive ? s.interaction : 0,
      momentum: 0.88, shape: "streak", size: s.lineWeight,
      speed: moving ? s.speed : 0.2, swirl: s.contrast, trails: 0,
    }));
  }

  return { components, toneMapping: "neutral" };
}

export const cloneSettings = (settings) =>
  Object.fromEntries(Object.entries(settings).map(([key, value]) => [key, Number(value)]));
