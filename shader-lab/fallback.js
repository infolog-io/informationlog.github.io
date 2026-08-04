const TAU = Math.PI * 2;

function mulberry32(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function fitCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  const context = canvas.getContext("2d");
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { context, width: rect.width, height: rect.height };
}

export function drawStaticFallback(canvas, entry, settings, dark = false) {
  const { context: ctx, width, height } = fitCanvas(canvas);
  const paper = dark ? "#171719" : "#fffefa";
  const ink = dark ? "#f2f1ed" : "#19191b";
  const faint = dark ? "#343438" : "#d7d7d3";
  const random = mulberry32((settings.seed ?? 17) + Number(entry.number) * 101);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, width, height);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (entry.id === "flow-field" || entry.id === "data-wind") {
    ctx.fillStyle = ink;
    const count = Math.min(1200, Math.max(220, Math.round((settings.density ?? 3000) / 5)));
    for (let index = 0; index < count; index += 1) {
      const x = width * (0.35 + random() * 0.63);
      const y = height * (0.08 + random() * 0.84);
      const bend = Math.sin(y * 0.015 + x * 0.004) * 26;
      const px = x + bend;
      ctx.globalAlpha = entry.id === "data-wind" ? 0.38 : 0.25;
      if (entry.id === "data-wind") {
        ctx.strokeStyle = ink;
        ctx.lineWidth = Math.max(0.4, settings.lineWeight ?? 0.4);
        ctx.beginPath();
        ctx.moveTo(px, y);
        ctx.lineTo(px + 4 + random() * 5, y - 1 + random() * 2);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(px, y, Math.max(0.35, (settings.lineWeight ?? 0.35) * 0.65), 0, TAU);
        ctx.fill();
      }
    }
  }

  if (entry.id === "contour-field") {
    ctx.strokeStyle = ink;
    ctx.globalAlpha = 0.38;
    ctx.lineWidth = settings.lineWeight ?? 0.6;
    const levels = Math.round(settings.density ?? 8);
    for (let level = 0; level < levels; level += 1) {
      ctx.beginPath();
      for (let x = width * 0.36; x <= width * 1.03; x += 6) {
        const y = height * 0.52 +
          Math.sin(x * 0.006 + level * 0.56) * (height * 0.14) +
          (level - levels / 2) * 12;
        if (x === width * 0.36) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  if (entry.id === "ordered-dither") {
    const pixel = Math.max(2, Math.round(settings.scale ?? 3));
    for (let y = 0; y < height; y += pixel * 2) {
      for (let x = width * 0.42; x < width; x += pixel * 2) {
        const wave = Math.sin(x * 0.008) * height * 0.1 + height * 0.56;
        const distance = Math.abs(y - wave);
        if (distance < height * 0.17 && random() > distance / (height * 0.17)) {
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = ink;
          ctx.fillRect(x, y, pixel * 0.55, pixel * 0.55);
        }
      }
    }
  }

  if (entry.id === "voronoi-structure") {
    ctx.strokeStyle = faint;
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = settings.lineWeight ?? 0.5;
    const points = Array.from({ length: 8 }, () => [
      width * (0.35 + random() * 0.7),
      height * (-0.1 + random() * 1.2),
    ]);
    points.forEach(([x, y], index) => {
      ctx.beginPath();
      ctx.arc(x, y, width * (0.16 + random() * 0.12), index * 0.4, index * 0.4 + Math.PI * 1.45);
      ctx.stroke();
    });
  }

  if (entry.id === "sparse-network") {
    drawReferenceNetwork(ctx, width, height, settings, ink);
  }

  if (entry.id === "data-refraction") {
    ctx.strokeStyle = faint;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 0.7;
    const spacing = Math.max(9, 280 / (settings.scale ?? 18));
    for (let y = 0; y < height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(width * 0.43, y);
      const displacement = Math.sin(y * 0.075) * (settings.contrast ?? 0.05) * 60;
      ctx.lineTo(width * 0.7 + displacement, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  if (entry.id === "reaction-diffusion") {
    ctx.strokeStyle = faint;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 1;
    for (let index = 0; index < 18; index += 1) {
      const x = width * (0.52 + random() * 0.42);
      const y = height * (0.08 + random() * 0.84);
      ctx.beginPath();
      ctx.ellipse(x, y, 18 + random() * 90, 8 + random() * 32, random() * Math.PI, 0, TAU);
      ctx.stroke();
    }
  }

  if (entry.id === "wireframe-terrain") {
    ctx.strokeStyle = faint;
    ctx.globalAlpha = 0.65;
    ctx.lineWidth = Math.max(0.5, settings.lineWeight ?? 0.22);
    const startX = width * 0.4;
    for (let row = 0; row < 18; row += 1) {
      ctx.beginPath();
      for (let col = 0; col < 28; col += 1) {
        const x = startX + col * ((width - startX) / 27);
        const baseY = height * 0.4 + row * height * 0.027;
        const y = baseY + Math.sin(col * 0.45 + row * 0.2) * 10 * (row / 18);
        if (col === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    for (let col = 0; col < 28; col += 1) {
      ctx.beginPath();
      for (let row = 0; row < 18; row += 1) {
        const x = startX + col * ((width - startX) / 27);
        const baseY = height * 0.4 + row * height * 0.027;
        const y = baseY + Math.sin(col * 0.45 + row * 0.2) * 10 * (row / 18);
        if (row === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  if (entry.id === "cellular-system") {
    const cells = Math.max(12, Math.round((settings.density ?? 26) * 0.65));
    const size = width / cells;
    ctx.fillStyle = ink;
    for (let row = 0; row < Math.ceil(height / size); row += 1) {
      for (let col = Math.floor(cells * 0.38); col < cells; col += 1) {
        const field = Math.sin(col * 0.7) + Math.cos(row * 0.9) + random() * 1.4;
        if (field > 1.85) {
          ctx.globalAlpha = 0.22;
          ctx.fillRect(col * size + size * 0.32, row * size + size * 0.32, size * 0.36, size * 0.36);
        }
      }
    }
  }

  ctx.globalAlpha = 1;
}

function drawReferenceNetwork(ctx, width, height, settings, ink) {
  const anchor = { x: width * 0.53, y: height * 0.52 };
  const leftX = width * 0.16;
  const branches = Math.round(settings.density ?? 7);
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.globalAlpha = 0.65;
  ctx.lineWidth = Math.max(0.55, settings.lineWeight ?? 0.6);
  for (let index = 0; index < branches - 1; index += 1) {
    const ratio = branches <= 2 ? 0.5 : index / (branches - 2);
    const startY = height * (0.2 + ratio * 0.64);
    ctx.beginPath();
    ctx.moveTo(leftX, startY);
    ctx.bezierCurveTo(width * 0.31, startY, width * 0.39, anchor.y, anchor.x, anchor.y);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(anchor.x, anchor.y);
  ctx.lineTo(width * 0.82, anchor.y);
  ctx.stroke();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = darkOrPaper(ctx, ink);
  ctx.beginPath();
  ctx.arc(anchor.x, anchor.y, 5, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.4;
  ctx.stroke();
}

function darkOrPaper(ctx, ink) {
  return ink.toLowerCase() === "#19191b" ? "#fffefa" : "#171719";
}

export class NetworkOverlay {
  constructor(svg, getState) {
    this.svg = svg;
    this.getState = getState;
    this.frame = 0;
    this.pointer = { x: 0.5, y: 0.5, active: false };
    this.onPointer = (event) => {
      const rect = svg.getBoundingClientRect();
      this.pointer = {
        x: (event.clientX - rect.left) / Math.max(1, rect.width),
        y: (event.clientY - rect.top) / Math.max(1, rect.height),
        active: true,
      };
    };
    svg.addEventListener("pointermove", this.onPointer, { passive: true });
    svg.addEventListener("pointerleave", () => { this.pointer.active = false; }, { passive: true });
  }

  render(time = 0) {
    const state = this.getState();
    if (!state.active) {
      this.svg.replaceChildren();
      return;
    }
    const width = this.svg.clientWidth || 1;
    const height = this.svg.clientHeight || 1;
    const s = state.settings;
    const moving = !state.paused && !state.reduced && !document.hidden;
    const drift = moving ? Math.sin(time * 0.0001 * (1 + s.speed * 8)) : 0;
    const anchor = { x: width * 0.53, y: height * (0.52 + drift * 0.004) };
    const count = Math.round(s.density);
    const ink = state.dark ? "#f2f1ed" : "#19191b";
    const accent = s.accent > 0.05 ? (state.dark ? "#4545ff" : "#0000ff") : ink;
    const nodes = [];
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < count - 1; index += 1) {
      const ratio = count <= 2 ? 0.5 : index / (count - 2);
      const startX = width * (0.12 + (index % 2) * 0.02);
      let startY = height * (0.18 + ratio * 0.66);
      startY += moving ? Math.sin(time * 0.00012 + index * 1.7) * height * 0.009 : 0;
      if (this.pointer.active && state.interactive) {
        const dx = startX / width - this.pointer.x;
        const dy = startY / height - this.pointer.y;
        const distance = Math.max(0.03, Math.hypot(dx, dy));
        const force = Math.max(0, 0.18 - distance) * s.interaction * 1.4;
        startY += (dy / distance) * force * height;
      }
      nodes.push({ x: startX, y: startY });
    }

    nodes.forEach((node, index) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const controlX = width * (0.31 + (index % 2) * 0.025);
      path.setAttribute("d", `M ${node.x} ${node.y} C ${controlX} ${node.y}, ${width * 0.42} ${anchor.y}, ${anchor.x} ${anchor.y}`);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", index === Math.floor(nodes.length / 2) ? accent : ink);
      path.setAttribute("stroke-width", String(Math.max(0.55, s.lineWeight)));
      fragment.append(path);
    });

    const onward = document.createElementNS("http://www.w3.org/2000/svg", "path");
    onward.setAttribute("d", `M ${anchor.x} ${anchor.y} L ${width * 0.84} ${anchor.y}`);
    onward.setAttribute("fill", "none");
    onward.setAttribute("stroke", ink);
    onward.setAttribute("stroke-width", String(Math.max(0.55, s.lineWeight)));
    fragment.append(onward);

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", String(anchor.x));
    circle.setAttribute("cy", String(anchor.y));
    circle.setAttribute("r", String(Math.max(4, 4 + s.lineWeight)));
    circle.setAttribute("fill", state.dark ? "#171719" : "#fffefa");
    circle.setAttribute("stroke", accent);
    circle.setAttribute("stroke-width", "1.5");
    fragment.append(circle);
    this.svg.replaceChildren(fragment);

    if (moving) this.frame = requestAnimationFrame((next) => this.render(next));
  }

  start() {
    cancelAnimationFrame(this.frame);
    this.render(performance.now());
  }

  stop() {
    cancelAnimationFrame(this.frame);
  }

  destroy() {
    this.stop();
    this.svg.removeEventListener("pointermove", this.onPointer);
    this.svg.replaceChildren();
  }
}
