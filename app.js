const root = document.documentElement;
root.classList.add("js");

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const canvas = document.querySelector("[data-signal-canvas]");
const modeLinks = [...document.querySelectorAll("[data-signal-mode]")];
const catalogLinks = [...document.querySelectorAll("[data-catalog-link]")];
const catalogSections = [...document.querySelectorAll("[data-catalog-section]")];
const chamber = document.querySelector("[data-signal-chamber]");
const heroCopy = chamber?.querySelector(".hero-copy");
const signalFigure = chamber?.querySelector(".signal-figure");
const fieldMode = document.querySelector("[data-field-mode]");
const fieldCoordinates = document.querySelector("[data-field-coordinates]");

const modes = {
  product: { lobes: 3, skew: 0.16, pulse: 0.72 },
  promise: { lobes: 4, skew: -0.12, pulse: 0.58 },
  practice: { lobes: 5, skew: 0.08, pulse: 0.44 },
};

class SignalField {
  constructor(element) {
    this.canvas = element;
    this.context = element.getContext("2d", { alpha: false });
    this.mode = "product";
    this.pointer = {
      targetX: 0,
      targetY: 0,
      x: 0,
      y: 0,
      targetStrength: 0,
      strength: 0,
    };
    this.targetConfig = { ...modes.product };
    this.config = { ...modes.product };
    this.scrollProgress = 0;
    this.visible = true;
    this.frame = 0;
    this.lastTime = 0;
    this.lastFrameTime = 0;
    this.coordinateText = "";
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      if (this.visible) this.start();
      else this.stop();
    }, { rootMargin: "15% 0px" });

    this.onPointerMove = (event) => {
      const rect = this.canvas.getBoundingClientRect();
      this.pointer.targetX = (event.clientX - rect.left) / rect.width - 0.5;
      this.pointer.targetY = (event.clientY - rect.top) / rect.height - 0.5;
      this.pointer.targetStrength = 1;
      if (reducedMotion.matches) this.snapToTargets();
    };

    this.onPointerLeave = () => {
      this.pointer.targetX = 0;
      this.pointer.targetY = 0;
      this.pointer.targetStrength = 0;
      if (reducedMotion.matches) this.snapToTargets();
    };

    this.resizeObserver.observe(this.canvas);
    this.intersectionObserver.observe(this.canvas);
    this.canvas.addEventListener("pointermove", this.onPointerMove, { passive: true });
    this.canvas.addEventListener("pointerleave", this.onPointerLeave, { passive: true });
    this.resize();
    root.classList.add("signal-ready");
  }

  setMode(mode) {
    if (!modes[mode] || mode === this.mode) return;
    this.mode = mode;
    this.targetConfig = { ...modes[mode] };
    if (fieldMode) fieldMode.textContent = `${mode.toUpperCase()} ${mode === "product" ? "101" : mode === "promise" ? "202" : "303"}`;
    modeLinks.forEach((link) => {
      if (link.dataset.signalMode === mode) link.dataset.active = "true";
      else delete link.dataset.active;
    });
    if (reducedMotion.matches) this.snapToTargets();
  }

  snapToTargets() {
    this.pointer.x = this.pointer.targetX;
    this.pointer.y = this.pointer.targetY;
    this.pointer.strength = this.pointer.targetStrength;
    this.config = { ...this.targetConfig };
    this.updateCoordinateReadout();
    this.draw(0);
  }

  updateCoordinateReadout() {
    if (!fieldCoordinates) return;
    const x = this.pointer.strength > 0.001 ? this.pointer.x : 0;
    const y = this.pointer.strength > 0.001 ? this.pointer.y : 0;
    const text = `X ${x >= 0 ? "+" : ""}${x.toFixed(2)} / Y ${y >= 0 ? "+" : ""}${y.toFixed(2)}`;
    if (text !== this.coordinateText) {
      fieldCoordinates.textContent = text;
      this.coordinateText = text;
    }
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const density = Math.min(devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width * density));
    const height = Math.max(1, Math.round(rect.height * density));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    this.density = density;
    this.width = rect.width;
    this.height = rect.height;
    this.draw(this.lastTime);
  }

  start() {
    if (this.frame || reducedMotion.matches) {
      this.draw(this.lastTime);
      return;
    }
    this.frame = requestAnimationFrame((time) => this.tick(time));
  }

  stop() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  tick(time) {
    this.frame = 0;
    const deltaMs = this.lastFrameTime
      ? Math.min(Math.max(time - this.lastFrameTime, 0), 64)
      : 1000 / 60;
    const pointerAmount = 1 - Math.pow(0.001, deltaMs / 160);
    const configAmount = 1 - Math.pow(0.001, deltaMs / 240);
    this.pointer.x += (this.pointer.targetX - this.pointer.x) * pointerAmount;
    this.pointer.y += (this.pointer.targetY - this.pointer.y) * pointerAmount;
    this.pointer.strength += (this.pointer.targetStrength - this.pointer.strength) * pointerAmount;
    Object.keys(this.config).forEach((key) => {
      this.config[key] += (this.targetConfig[key] - this.config[key]) * configAmount;
    });
    this.lastFrameTime = time;
    this.lastTime = time;
    this.updateCoordinateReadout();
    this.draw(time);
    if (this.visible && !reducedMotion.matches) this.start();
  }

  line(alpha = 1, width = 1) {
    this.context.strokeStyle = `rgba(243, 243, 239, ${alpha})`;
    this.context.lineWidth = width * this.density;
  }

  draw(time = 0) {
    if (!this.context || !this.width || !this.height) return;

    const ctx = this.context;
    const d = this.density;
    const w = this.width;
    const h = this.height;
    const cx = w * (w > 820 ? 0.67 : 0.54);
    const cy = h * (0.48 + this.scrollProgress * 0.035);
    const radius = Math.min(w, h) * (0.43 + this.scrollProgress * 0.055);
    const phase = reducedMotion.matches ? 0 : time * 0.00012;
    const config = this.config;
    const pointerX = this.pointer.x;
    const pointerY = this.pointer.y;

    ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, w, h);
    ctx.lineCap = "square";
    ctx.lineJoin = "round";

    this.line(0.34, 0.65);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    this.line(0.24, 0.6);
    ctx.beginPath();
    ctx.moveTo(cx - radius * 1.05, cy);
    ctx.lineTo(cx + radius * 1.05, cy);
    ctx.moveTo(cx, cy - radius * 1.05);
    ctx.lineTo(cx, cy + radius * 1.05);
    ctx.stroke();

    for (let index = 0; index < 64; index += 1) {
      const angle = (index / 64) * Math.PI * 2;
      const long = index % 8 === 0;
      const inner = radius + (long ? 7 : 3);
      const outer = radius + (long ? 15 : 8);
      this.line(long ? 0.72 : 0.38, long ? 0.8 : 0.55);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
      ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
      ctx.stroke();
    }

    const levels = 19;
    const pointCount = 220;
    for (let level = levels - 1; level >= 0; level -= 1) {
      const progress = level / Math.max(levels - 1, 1);
      const base = radius * (0.24 + progress * 0.57);
      const active = level === 8;
      this.line(active ? 0.96 : 0.1 + progress * 0.2, active ? 2.15 : 0.72);
      ctx.beginPath();

      for (let point = 0; point <= pointCount; point += 1) {
        const angle = (point / pointCount) * Math.PI * 2;
        const travel = phase * (0.55 + progress * 0.5);
        const primary = Math.sin(angle * config.lobes + travel + level * 0.14);
        const secondary = Math.cos(angle * 2 - travel * 0.7 + level * 0.23);
        const fine = Math.sin(angle * 7 + level * 0.31 - travel * 1.2);
        const pointerDelta = Math.atan2(pointerY, pointerX) - angle;
        const pointerDistance = Math.abs(Math.atan2(Math.sin(pointerDelta), Math.cos(pointerDelta)));
        const pointerPull = Math.max(0, 1 - pointerDistance / Math.PI)
          * 0.06
          * this.pointer.strength;
        const modulation = 1
          + primary * (0.12 + config.pulse * 0.05)
          + secondary * 0.065
          + fine * 0.018
          + pointerPull;
        const xScale = 1 + config.skew + pointerX * 0.09 * this.pointer.strength;
        const yScale = 0.72 - config.skew * 0.35 + pointerY * 0.07 * this.pointer.strength;
        const x = cx + Math.cos(angle) * base * modulation * xScale;
        const y = cy + Math.sin(angle) * base * modulation * yScale;

        if (point === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    const orbitColors = ["#2e69c9", "#e9c91d", "#4c9b67"];
    orbitColors.forEach((color, index) => {
      const orbitPhase = reducedMotion.matches ? index * 2.1 : phase * (1.5 + index * 0.18) + index * 2.1;
      const orbitRadius = radius * (0.72 + index * 0.12);
      ctx.strokeStyle = color;
      ctx.lineWidth = (index === 0 ? 1.4 : 0.9) * d;
      ctx.globalAlpha = this.mode === ["product", "promise", "practice"][index] ? 0.95 : 0.34;
      ctx.beginPath();
      ctx.arc(cx, cy, orbitRadius, orbitPhase, orbitPhase + Math.PI * (0.28 + index * 0.06));
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.fillRect(
        cx + Math.cos(orbitPhase) * orbitRadius - 2,
        cy + Math.sin(orbitPhase) * orbitRadius - 2,
        4,
        4,
      );
    });
    ctx.globalAlpha = 1;

    ctx.fillStyle = "rgba(243, 243, 239, 0.92)";
    ctx.fillRect(cx - 2, cy - 2, 4, 4);

    this.line(0.7, 0.8);
    ctx.strokeRect(cx - radius - 3, cy - 3, 6, 6);
    ctx.strokeRect(cx + radius - 3, cy - 3, 6, 6);
    ctx.strokeRect(cx - 3, cy - radius - 3, 6, 6);
    ctx.strokeRect(cx - 3, cy + radius - 3, 6, 6);
  }
}

let signalField;
if (canvas?.getContext) {
  signalField = new SignalField(canvas);
  modeLinks[0]?.setAttribute("data-active", "true");
}

let updateChamberLayout = () => {};

if (chamber) {
  let chamberFrame = 0;
  updateChamberLayout = () => {
    chamberFrame = 0;
    const rect = chamber.getBoundingClientRect();
    const progress = reducedMotion.matches
      ? 0
      : Math.min(1, Math.max(0, -rect.top / Math.max(rect.height * 0.7, 1)));
    if (heroCopy) {
      heroCopy.style.transform = reducedMotion.matches
        ? "translate3d(0, 0, 0)"
        : `translate3d(0, ${(-progress * 28).toFixed(1)}px, 0)`;
    }
    if (signalFigure) {
      signalFigure.style.transform = reducedMotion.matches
        ? "scale(1)"
        : `scale(${(0.94 + progress * 0.06).toFixed(3)})`;
    }
    if (signalField) signalField.scrollProgress = progress;
  };
  const requestChamberUpdate = () => {
    if (!chamberFrame) chamberFrame = requestAnimationFrame(updateChamberLayout);
  };
  addEventListener("scroll", requestChamberUpdate, { passive: true });
  addEventListener("resize", requestChamberUpdate, { passive: true });
  updateChamberLayout();
}

modeLinks.forEach((link) => {
  const activate = () => signalField?.setMode(link.dataset.signalMode);
  link.addEventListener("pointerenter", activate, { passive: true });
  link.addEventListener("focus", activate);
  link.addEventListener("click", activate);
});

let plotObserver;
const acquiredPlots = new WeakSet();

const setupPlotAcquisition = () => {
  plotObserver?.disconnect();
  plotObserver = undefined;
  if (reducedMotion.matches
    || !("IntersectionObserver" in window)
    || typeof Element.prototype.animate !== "function") return;

  const plots = catalogSections
    .map((section) => section.querySelector(".plot-active"))
    .filter((path) => path && !acquiredPlots.has(path));
  if (!plots.length) return;

  plotObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.25) return;
      const path = entry.target;
      const length = path.getTotalLength();
      const dash = `${length}`;
      path.animate([
        { strokeDasharray: dash, strokeDashoffset: dash, opacity: 0.35 },
        { strokeDasharray: dash, strokeDashoffset: "0", opacity: 1 },
      ], {
        duration: 650,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "none",
      });
      path.style.strokeDasharray = dash;
      path.style.strokeDashoffset = "0";
      path.style.opacity = "1";
      acquiredPlots.add(path);
      plotObserver.unobserve(path);
    });
  }, { threshold: [0.25] });

  plots.forEach((path) => plotObserver.observe(path));
};

setupPlotAcquisition();

reducedMotion.addEventListener?.("change", () => {
  if (reducedMotion.matches) plotObserver?.disconnect();
  else setupPlotAcquisition();
  updateChamberLayout();
  if (!signalField) return;
  if (reducedMotion.matches) {
    signalField.stop();
    signalField.snapToTargets();
  } else {
    signalField.lastFrameTime = 0;
    signalField.start();
  }
});

if (catalogSections.length && "IntersectionObserver" in window) {
  const visibleSections = new Map();
  const updateCurrentSection = () => {
    const visible = [...visibleSections.entries()]
      .filter(([, ratio]) => ratio > 0)
      .sort((a, b) => b[1] - a[1]);
    const current = visible[0]?.[0];
    catalogLinks.forEach((link) => {
      if (link.dataset.catalogLink === current) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      visibleSections.set(entry.target.dataset.catalogSection, entry.isIntersecting ? entry.intersectionRatio : 0);
    });
    updateCurrentSection();
  }, {
    rootMargin: "-15% 0px -55%",
    threshold: [0, 0.15, 0.35, 0.6],
  });

  catalogSections.forEach((section) => sectionObserver.observe(section));
}
