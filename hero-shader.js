import { shaderRegistry, cloneSettings } from "./shader-lab/shader-registry.js?v=8";
import { drawStaticFallback } from "./shader-lab/fallback.js?v=8";

const SHADERS_RUNTIME_URL = "https://esm.sh/shaders@3.0.445/js/bundle";
const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
const saveData = navigator.connection?.saveData === true;
const root = document.documentElement;

const byId = (id) => shaderRegistry.find((entry) => entry.id === id);

export const productionShaders = [
  {
    entry: byId("contour-field"),
    variant: "quiet",
    renderOpacity: 0.08,
    settings: {
      opacity: 0.02,
      scale: 0.2,
      speed: 0.8,
      density: 5,
      lineWeight: 0.5,
      contrast: 0.2,
      interaction: 0.45,
      accent: 0,
    },
  },
  {
    entry: byId("ordered-dither"),
    variant: "quiet",
    renderOpacity: 0.08,
    settings: {
      opacity: 0.02,
      scale: 1,
      speed: 0.4,
      density: 0.5,
      lineWeight: 0.4,
      contrast: 0.41,
    },
  },
  {
    entry: byId("flow-field"),
    variant: "quiet",
    renderOpacity: 0.16,
    settings: {
      opacity: 0.02,
      scale: 0.6,
      speed: 0,
      density: 14000,
      lineWeight: 0.3,
      contrast: -0.5,
      interaction: 0.15,
      accent: 0,
      seed: 0,
    },
  },
  {
    entry: byId("wireframe-terrain"),
    variant: "quiet",
    renderOpacity: 0.2,
    settings: {
      opacity: 0.07,
      scale: 32,
      speed: 0.53,
      density: 2.5,
      lineWeight: 0.75,
      contrast: 0.14,
      interaction: 0.08,
      accent: 0,
      seed: 14,
    },
  },
];

const component = (type, id, props = {}, children) => ({
  type,
  id,
  props,
  ...(children ? { children } : {}),
});

export function buildProductionPreset(config, environment = {}) {
  const { entry, settings: s } = config;
  const dark = environment.dark === true;
  const interactive = environment.interactive === true && environment.reduced !== true;
  const moving = environment.reduced !== true;
  const paper = dark ? "#171719" : "#fffefa";
  const ink = dark ? "#f2f1ed" : "#19191b";
  const subtle = dark ? "#29292c" : "#eeeeec";
  const line = dark ? "#48484b" : "#d5d5d2";
  const speed = moving ? s.speed : 0;
  const components = [
    component("SolidColor", `${entry.id}-paper`, { color: paper }),
  ];

  if (entry.id === "contour-field") {
    components.push(
      component("ContourLines", "contour-lines", {
        backgroundColor: "transparent",
        colorMode: "custom",
        gamma: 0.75,
        levels: 5,
        lineColor: ink,
        lineWidth: 0.5,
        softness: 0,
        source: "alpha",
      }, [
        component("Blob", "contour-source", {
          center: { x: 0.72, y: 0.52 },
          colorA: paper,
          colorB: subtle,
          colorSpace: "oklab",
          deformation: 0.176,
          highlightColor: line,
          highlightIntensity: 0,
          seed: 42,
          size: 0.72,
          softness: 0.9,
          speed,
        }),
      ]),
      component("Liquify", "contour-interaction", {
        decay: 0.7,
        intensity: interactive ? 0.45 : 0,
        radius: 1.8,
      }),
    );
  }

  if (entry.id === "ordered-dither") {
    components.push(
      component("Dither", "dither-field", {
        colorA: "transparent",
        colorB: ink,
        pattern: "bayer8",
        threshold: 0.41,
      }, [
        component("SineWave", "dither-wave", {
          angle: 24,
          color: "#ffffff",
          frequency: 0.5,
          position: { x: 0.69, y: 0.7 },
          softness: 0.7,
          speed,
          thickness: 0.4,
        }),
      ]),
    );
  }

  if (entry.id === "flow-field") {
    components.push(
      component("ParticleField", "flow-particles", {
        count: 14000,
        cursorMode: interactive ? "push" : "none",
        cursorRadius: 0.22,
        cursorStrength: interactive ? 0.15 : 0,
        depth: 0.16,
        depthShading: 0.06,
        offsetX: 0.2,
        particleShape: "dot",
        particleSize: 0.3,
        rotationX: -4,
        rotationY: 6,
        rotationZ: -8,
        wobble: 0,
        zoom: 1.18,
      }, [
        component("GaborNoise", "flow-source", {
          balance: -0.48,
          colorSpace: "oklab",
          contrast: -0.5,
          frequency: 4,
          scale: 0.6,
          seed: 0,
          speed,
          stops: [
            { color: paper, position: 0 },
            { color: ink, position: 0.77 },
            { color: paper, position: 1 },
          ],
        }),
      ]),
    );
  }

  if (entry.id === "wireframe-terrain") {
    components.push(
      component("Surface3D", "terrain-surface", {
        amplitude: 0.14,
        cursorIntensity: interactive ? 0.08 : 0,
        cursorSpeed: 0.18,
        edgePinning: 0.7,
        edges: "transparent",
        farCutoff: 0.78,
        frequency: 2.5,
        glossiness: 0,
        height: 0,
        highlights: 0,
        lighting: 0,
        nearCutoff: 0,
        octaves: 2,
        roll: 0,
        seed: 14,
        speed,
        tilt: 35,
        waveType: "fractal",
        zoom: 1,
      }, [
        component("Grid", "terrain-grid", {
          cellColor: "transparent",
          cells: 32,
          color: ink,
          softness: 0.05,
          thickness: 0.75,
        }),
      ]),
    );
  }

  return { components, toneMapping: "neutral" };
}

const elements = {
  hero: document.querySelector("[data-hero]"),
  stage: document.querySelector("[data-hero-shader]"),
  canvas: document.querySelector("[data-hero-shader-canvas]"),
  fallback: document.querySelector("[data-hero-shader-fallback]"),
  select: document.querySelector("[data-hero-shader-select]"),
  motion: document.querySelector("[data-hero-motion]"),
  status: document.querySelector("[data-hero-runtime-status]"),
  open: document.querySelector("[data-display-open]"),
  opens: [...document.querySelectorAll("[data-display-open]")],
  close: document.querySelector("[data-display-close]"),
  dialog: document.querySelector("[data-display-dialog]"),
};

if (Object.values(elements).every(Boolean)) {
  const state = {
    config: productionShaders[0],
    settings: cloneSettings(productionShaders[0].settings),
    motionOverride: null,
    heroVisible: true,
    instance: null,
    runtime: null,
    runtimePromise: null,
    mountToken: 0,
  };

  const isDark = () => root.dataset.theme === "dark";
  const isReduced = () => state.motionOverride ?? motionQuery.matches;
  const shouldPause = () => (
    isReduced()
    || !state.heroVisible
    || document.hidden
  );

  function recordConfiguration() {
    const { entry, variant } = state.config;
    elements.stage.dataset.shader = entry.id;
    elements.stage.dataset.variant = variant;
    elements.stage.dataset.theme = isDark() ? "dark" : "light";
    elements.stage.dataset.opacity = String(state.settings.opacity);
    elements.stage.dataset.settings = JSON.stringify(state.settings);
    elements.stage.style.setProperty("--active-shader-opacity", state.config.renderOpacity);
  }

  function renderControls() {
    elements.select.value = state.config.entry.id;
    elements.motion.textContent = isReduced() ? "Full motion" : "Reduced motion";
    elements.motion.setAttribute("aria-pressed", String(isReduced()));
    recordConfiguration();
  }

  function renderStatus(label) {
    if (label) {
      elements.status.textContent = label;
      return;
    }
    const engine = "gpu" in navigator ? "WebGPU" : "WebGL";
    elements.status.textContent = `${engine} / ${shouldPause() ? "paused" : "live"}`;
  }

  function drawFallback(label = "Static fallback") {
    elements.stage.dataset.fallback = "true";
    drawStaticFallback(elements.fallback, state.config.entry, state.settings, isDark());
    renderStatus(label);
  }

  function syncCanvas() {
    if (!state.instance) return;
    const rect = elements.stage.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    elements.canvas.style.width = `${Math.max(1, rect.width)}px`;
    elements.canvas.style.height = `${Math.max(1, rect.height)}px`;
    state.instance.resize(
      Math.max(1, Math.round(rect.width * dpr)),
      Math.max(1, Math.round(rect.height * dpr)),
    );
  }

  async function loadRuntime() {
    if (state.runtime) return state.runtime;
    if (!state.runtimePromise) {
      state.runtimePromise = import(SHADERS_RUNTIME_URL)
        .then((module) => {
          state.runtime = module;
          return module;
        })
        .catch((error) => {
          state.runtimePromise = null;
          throw error;
        });
    }
    return state.runtimePromise;
  }

  function syncActivity() {
    elements.stage.dataset.activity = shouldPause() ? "paused" : "live";
    if (state.instance) {
      if (shouldPause()) state.instance.pause();
      else state.instance.resume();
    }
    renderStatus(elements.stage.dataset.fallback === "true" ? elements.status.textContent : undefined);
  }

  async function mountShader() {
    const token = ++state.mountToken;
    if (state.instance) {
      state.instance.destroy();
      state.instance = null;
    }

    recordConfiguration();
    drawFallback(saveData ? "Static / data saver" : "Static / loading");
    if (saveData) return;

    try {
      const { createShader } = await loadRuntime();
      if (token !== state.mountToken) return;
      const preset = buildProductionPreset(state.config, {
        dark: isDark(),
        interactive: true,
        reduced: isReduced(),
      });
      const instance = await createShader(
        elements.canvas,
        { components: preset.components },
        {
          disableTelemetry: true,
          enablePerformanceTracking: false,
          observeElement: false,
          toneMapping: preset.toneMapping,
          onError: (reason) => {
            if (token === state.mountToken) drawFallback(`Static / ${reason}`);
          },
        },
      );
      if (token !== state.mountToken) {
        instance.destroy();
        return;
      }
      state.instance = instance;
      syncCanvas();
      elements.stage.dataset.fallback = "false";
      syncActivity();
    } catch (error) {
      console.warn("Hero shader runtime unavailable; using static fallback.", error);
      drawFallback("Static / GPU unavailable");
    }
  }

  function selectShader(id) {
    const config = productionShaders.find(({ entry }) => entry.id === id);
    if (!config) return;
    state.config = config;
    state.settings = cloneSettings(config.settings);
    renderControls();
    mountShader();
  }

  elements.select.addEventListener("change", () => selectShader(elements.select.value));
  elements.motion.addEventListener("click", () => {
    state.motionOverride = !isReduced();
    renderControls();
    mountShader();
  });

  elements.opens.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      elements.dialog.showModal();
      elements.opens.forEach((control) => control.setAttribute("aria-expanded", "true"));
    });
  });
  elements.close.addEventListener("click", () => elements.dialog.close());
  elements.dialog.addEventListener("close", () => {
    elements.opens.forEach((control) => control.setAttribute("aria-expanded", "false"));
  });
  elements.dialog.addEventListener("pointerdown", (event) => {
    if (event.target === elements.dialog) elements.dialog.close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && elements.dialog.open) {
      event.preventDefault();
      elements.dialog.close();
    }
  });

  const heroObserver = new IntersectionObserver(([entry]) => {
    state.heroVisible = entry.isIntersecting;
    if (!state.heroVisible && elements.dialog.open) elements.dialog.close();
    syncActivity();
  }, { threshold: 0 });
  heroObserver.observe(elements.hero);

  const themeObserver = new MutationObserver((records) => {
    if (records.some(({ attributeName }) => attributeName === "data-theme")) mountShader();
  });
  themeObserver.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  motionQuery.addEventListener?.("change", () => {
    if (state.motionOverride === null) {
      renderControls();
      mountShader();
    }
  });
  document.addEventListener("visibilitychange", syncActivity);

  const resizeObserver = new ResizeObserver(() => {
    syncCanvas();
    drawStaticFallback(elements.fallback, state.config.entry, state.settings, isDark());
  });
  resizeObserver.observe(elements.stage);

  addEventListener("pagehide", () => {
    heroObserver.disconnect();
    themeObserver.disconnect();
    resizeObserver.disconnect();
    state.instance?.destroy();
  }, { once: true });

  renderControls();
  drawFallback("Static / loading");
  mountShader();
}
