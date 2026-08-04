const root = document.documentElement;
const toggles = document.querySelectorAll("[data-theme-toggle]");
const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
const compactRailQuery = matchMedia(
  "(max-width: 39.999rem), (max-width: 55.999rem) and (max-height: 40rem)",
);
const scrollProgress = document.querySelector("[data-scroll-progress]");
const hero = document.querySelector("[data-hero]");
const heroIndex = document.querySelector("[data-hero-index]");
const primaryNav = document.querySelector(".pill-nav");
const sectionRail = document.querySelector("[data-section-rail]");
const sectionNumber = document.querySelector("[data-section-number]");
const sectionLabel = document.querySelector("[data-section-label]");
const sectionStops = [...document.querySelectorAll("[data-section-key]")];
const sectionNames = {
  practice: "Practice",
  approach: "Approach",
  expertise: "Expertise",
  background: "Background",
};
let scrollProgressFrame;

function renderScrollProgress() {
  const heroBoundary = hero ? hero.offsetTop + hero.offsetHeight : 0;
  const pageEnd = Math.max(root.scrollHeight - innerHeight, heroBoundary);
  const contentRange = Math.max(pageEnd - heroBoundary, 1);
  const railVisible = Boolean(hero && scrollY >= heroBoundary);
  const progress = railVisible
    ? Math.min(Math.max((scrollY - heroBoundary) / contentRange, 0), 1)
    : 0;

  root.dataset.railVisible = String(railVisible);
  root.style.setProperty("--content-progress", progress.toFixed(4));
  if (scrollProgress) scrollProgress.dataset.progress = progress.toFixed(4);

  if (heroIndex && primaryNav) {
    const indexTop = heroIndex.getBoundingClientRect().top;
    const heroBottom = hero.getBoundingClientRect().bottom;
    hero.style.setProperty(
      "--hero-index-height",
      `${Math.max(0, heroBottom - indexTop)}px`,
    );
    const navExit = Math.max(
      -primaryNav.offsetHeight,
      Math.min(0, indexTop - primaryNav.offsetHeight),
    );
    primaryNav.style.setProperty("--nav-exit", `${navExit}px`);
  }

  if (sectionRail && sectionStops.length) {
    const probe = scrollY + innerHeight * 0.32;
    const active = sectionStops.reduce((current, section) => (
      section.offsetTop <= probe ? section : current
    ), sectionStops[0]);
    const key = active.dataset.sectionKey;
    if (sectionNumber) {
      sectionNumber.textContent = compactRailQuery.matches
        ? active.dataset.sectionNumber
        : `${active.dataset.sectionNumber} / 04`;
    }
    if (sectionLabel) sectionLabel.textContent = sectionNames[key] || key;
    sectionRail.dataset.activeSection = key;
  }

  scrollProgressFrame = undefined;
}

function requestScrollProgress() {
  if (scrollProgressFrame !== undefined) return;
  scrollProgressFrame = requestAnimationFrame(renderScrollProgress);
}

addEventListener("scroll", requestScrollProgress, { passive: true });
addEventListener("resize", requestScrollProgress);

function currentTheme() {
  return root.dataset.theme === "dark" ? "dark" : "light";
}

function renderThemeControls() {
  const theme = currentTheme();
  toggles.forEach((toggle) => {
    const next = theme === "dark" ? "light" : "dark";
    toggle.setAttribute("aria-pressed", String(theme === "dark"));
    toggle.setAttribute("aria-label", `Switch to ${next} theme`);
    const label = toggle.querySelector("[data-theme-label]");
    if (label) label.textContent = next;
  });
}

toggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    localStorage.setItem("infolog-theme", next);
    renderThemeControls();
  });
});

document.querySelectorAll(".pill-nav__mobile a").forEach((link) => {
  link.addEventListener("click", () => {
    const menu = link.closest("details");
    const summary = menu?.querySelector("summary");
    menu?.removeAttribute("open");
    requestAnimationFrame(() => summary?.focus({ preventScroll: true }));
  });
});

document.querySelectorAll(".pill-nav__mobile").forEach((menu) => {
  const summary = menu.querySelector("summary");
  const panel = menu.querySelector(":scope > div");
  if (!summary || !panel) return;
  let isClosing = false;

  const renderMenuState = () => {
    summary.textContent = menu.open ? "Close" : "Menu";
    summary.setAttribute("aria-expanded", String(menu.open));
  };

  summary.addEventListener("click", (event) => {
    if (isClosing) {
      event.preventDefault();
      return;
    }
    if (!menu.open || motionQuery.matches) return;

    event.preventDefault();
    isClosing = true;
    panel.getAnimations().forEach((animation) => animation.cancel());
    const animation = panel.animate(
      [
        { opacity: 1, transform: "translateY(0)" },
        { opacity: 0, transform: "translateY(-4px)" },
      ],
      {
        duration: 140,
        easing: "cubic-bezier(0.4, 0, 1, 1)",
      },
    );
    animation.finished
      .catch(() => {})
      .finally(() => {
        menu.open = false;
        isClosing = false;
      });
  });

  menu.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !menu.open) return;
    event.preventDefault();
    menu.open = false;
    summary.focus({ preventScroll: true });
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key !== "Escape"
      || !menu.open
      || document.querySelector("[data-display-dialog]")?.open
    ) return;
    event.preventDefault();
    menu.open = false;
    summary.focus({ preventScroll: true });
  });

  document.addEventListener("pointerdown", (event) => {
    if (!menu.open || menu.contains(event.target)) return;
    event.preventDefault();
    menu.open = false;
    summary.focus({ preventScroll: true });
  });

  menu.addEventListener("toggle", () => {
    renderMenuState();
    if (!menu.open || motionQuery.matches || isClosing) return;

    panel.getAnimations().forEach((animation) => animation.cancel());
    panel.animate(
      [
        { opacity: 0, transform: "translateY(-4px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration: 180,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    );
  });
  renderMenuState();
});

const expertiseRows = [...document.querySelectorAll("[data-expertise-index]")];
const expertiseNumber = document.querySelector("[data-expertise-number]");
const expertiseDiagram = document.querySelector("[data-expertise-diagram]");
const expertiseTitle = document.querySelector("[data-expertise-title]");
const expertiseDescription = document.querySelector("[data-expertise-detail-description]");

function activateExpertise(index) {
  const row = expertiseRows[index];
  if (!row || !expertiseNumber || !expertiseDiagram || !expertiseTitle || !expertiseDescription) return;

  expertiseRows.forEach((item, itemIndex) => {
    item.setAttribute("aria-pressed", String(itemIndex === index));
  });
  expertiseNumber.textContent = `${String(index + 1).padStart(2, "0")} / ${String(expertiseRows.length).padStart(2, "0")}`;
  expertiseTitle.innerHTML = row.querySelector(".expertise-ledger__name")?.innerHTML || "";
  expertiseDescription.textContent = row.dataset.expertiseDescription || "";
  expertiseDiagram.setAttribute("aria-label", row.dataset.expertiseDiagramLabel || "");

  const diagram = row.querySelector(".system-diagram")?.cloneNode(true);
  if (diagram) {
    diagram.classList.remove("system-diagram--row");
    diagram.classList.add("system-diagram--detail");
    diagram.removeAttribute("aria-hidden");
    expertiseDiagram.replaceChildren(diagram);
  }

  if (!motionQuery.matches) {
    expertiseDiagram.closest(".expertise-ledger__detail")?.animate(
      [
        { opacity: 0.55, transform: "translateY(6px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration: 220,
        easing: "cubic-bezier(0.23, 1, 0.32, 1)",
      },
    );
  }
}

expertiseRows.forEach((row, index) => {
  row.addEventListener("click", () => activateExpertise(index));
  row.addEventListener("keydown", (event) => {
    if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
    event.preventDefault();
    const delta = event.key === "ArrowDown" ? 1 : -1;
    const next = (index + delta + expertiseRows.length) % expertiseRows.length;
    expertiseRows[next].focus();
    activateExpertise(next);
  });
});

const scrambleCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&()[]{}~^";
const scrambleStates = new Map();
let scrambleIntersectionObserver;
let locomotiveScroll;

function randomScrambleCharacter(token) {
  const characters = token.scrambleCharacters || scrambleCharacters;
  return characters[Math.floor(Math.random() * characters.length)];
}

function escapeCharacter(character) {
  if (character === "&") return "&amp;";
  if (character === "<") return "&lt;";
  if (character === ">") return "&gt;";
  return character;
}

function createScrambleTokens(element) {
  const style = getComputedStyle(element);
  const context = document.createElement("canvas").getContext("2d");
  const candidates = [...scrambleCharacters];
  const pools = new Map();
  const tokens = [];
  let lineTop;

  if (context) {
    context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  }

  function characterPool(character) {
    if (!context) return scrambleCharacters;
    if (pools.has(character)) return pools.get(character);

    const width = context.measureText(character).width;
    const pool = candidates
      .map((candidate) => ({
        candidate,
        difference: Math.abs(context.measureText(candidate).width - width),
      }))
      .sort((a, b) => a.difference - b.difference)
      .slice(0, 6)
      .map(({ candidate }) => candidate)
      .join("");
    pools.set(character, pool);
    return pool;
  }

  function addBreak() {
    if (tokens.at(-1)?.break) return;
    tokens.push({ character: "<br>", resolved: true, break: true });
    lineTop = undefined;
  }

  function visit(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      [...node.textContent].forEach((character, index) => {
        if (!/\s/.test(character)) {
          const range = document.createRange();
          range.setStart(node, index);
          range.setEnd(node, index + 1);
          const top = range.getBoundingClientRect().top;
          if (lineTop !== undefined && Math.abs(top - lineTop) > 1) addBreak();
          lineTop = top;
        }
        tokens.push({
          character,
          scrambleCharacters: characterPool(character),
          resolved: /\s/.test(character),
          break: false,
        });
      });
      return;
    }

    if (node.nodeName === "BR") {
      addBreak();
      return;
    }

    node.childNodes.forEach(visit);
  }

  element.childNodes.forEach(visit);
  return tokens;
}

function renderScramble(element, state) {
  element.innerHTML = state.tokens
    .map((token) => {
      if (token.break) return "<br>";
      if (token.resolved) return escapeCharacter(token.character);
      return escapeCharacter(randomScrambleCharacter(token));
    })
    .join("");
}

function clearScrambleTimers(state) {
  state.timers.forEach((timer) => clearTimeout(timer));
  state.timers.clear();
}

function finishScramble(element, state) {
  clearScrambleTimers(state);
  element.innerHTML = state.originalHTML;
  element.style.height = state.inlineHeight;
  element.style.overflow = state.inlineOverflow;
  element.style.whiteSpace = state.inlineWhiteSpace;
  element.dataset.scrambleState = "complete";
  state.running = false;
  state.complete = true;
}

function resetScramble(element, state) {
  clearScrambleTimers(state);
  element.innerHTML = state.originalHTML;
  element.style.height = state.inlineHeight;
  element.style.overflow = state.inlineOverflow;
  element.style.whiteSpace = state.inlineWhiteSpace;
  element.dataset.scrambleState = "idle";
  state.tokens = [];
  state.running = false;
  state.complete = false;
}

function scheduleScramble(state, callback, delay) {
  const timer = setTimeout(() => {
    state.timers.delete(timer);
    callback();
  }, delay);
  state.timers.add(timer);
  return timer;
}

function startScramble(element) {
  const state = scrambleStates.get(element);
  if (!state || state.running || state.complete || motionQuery.matches) return;

  state.running = true;
  state.tokens = createScrambleTokens(element);
  state.inlineHeight = element.style.height;
  state.inlineOverflow = element.style.overflow;
  state.inlineWhiteSpace = element.style.whiteSpace;
  element.style.height = `${element.offsetHeight}px`;
  element.style.overflow = "visible";
  element.style.whiteSpace = "nowrap";
  element.dataset.scrambleState = "running";

  renderScramble(element, state);
  const previewCycle = setInterval(() => renderScramble(element, state), 50);
  state.timers.add(previewCycle);

  scheduleScramble(state, () => {
    clearInterval(previewCycle);
    state.timers.delete(previewCycle);

    const unresolved = state.tokens.filter((token) => !token.break && token.character !== " ");
    const duration = unresolved.length * 15;
    const resolveCycle = setInterval(() => renderScramble(element, state), 50);
    state.timers.add(resolveCycle);

    unresolved.forEach((token, index) => {
      const progress = index / Math.max(unresolved.length - 1, 1);
      const easedProgress = progress * (2 - progress);
      scheduleScramble(state, () => {
        token.resolved = true;
      }, easedProgress * duration);
    });

    scheduleScramble(state, () => {
      clearInterval(resolveCycle);
      state.timers.delete(resolveCycle);
      finishScramble(element, state);
    }, duration + 80);
  }, 400);
}

function prepareScrollScrambles() {
  document.querySelectorAll("[data-scroll-scramble]").forEach((element) => {
    if (scrambleStates.has(element)) return;
    const originalHTML = element.innerHTML.trim();
    element.setAttribute("aria-label", element.textContent.trim().replace(/\s+/g, " "));
    element.dataset.scrambleState = "idle";
    scrambleStates.set(element, {
      originalHTML,
      tokens: [],
      timers: new Set(),
      inlineHeight: "",
      inlineOverflow: "",
      inlineWhiteSpace: "",
      running: false,
      complete: false,
      visible: false,
    });
  });
}

function startScrambleObserver() {
  scrambleIntersectionObserver?.disconnect();
  scrambleIntersectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const state = scrambleStates.get(entry.target);
      if (!state) return;

      if (entry.isIntersecting) {
        if (state.visible) return;
        state.visible = true;
        startScramble(entry.target);
        return;
      }

      if (!state.visible) return;
      state.visible = false;
      resetScramble(entry.target, state);
    });
  }, {
    threshold: 0.1,
  });
  scrambleStates.forEach((_, element) => scrambleIntersectionObserver.observe(element));
}

function stopScrambleObserver() {
  scrambleIntersectionObserver?.disconnect();
  scrambleIntersectionObserver = undefined;
  scrambleStates.forEach((state, element) => {
    state.visible = false;
    resetScramble(element, state);
  });
}

function initializeScrollMotion() {
  locomotiveScroll?.destroy();
  locomotiveScroll = undefined;
  root.classList.remove("scroll-motion-ready");

  if (motionQuery.matches || typeof window.LocomotiveScroll !== "function") {
    stopScrambleObserver();
    root.dataset.scrollEngine = "native";
    return;
  }

  try {
    startScrambleObserver();
    locomotiveScroll = new window.LocomotiveScroll({
      lenisOptions: {
        lerp: 0.14,
        smoothWheel: true,
        smoothTouch: false,
        normalizeWheel: true,
        wheelMultiplier: 0.9,
      },
    });
    root.classList.add("scroll-motion-ready");
    root.dataset.scrollEngine = "locomotive";
  } catch (error) {
    console.error("[infolog-scroll] Locomotive Scroll failed to initialize.", error);
    stopScrambleObserver();
    root.dataset.scrollEngine = "native";
  }
}

document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach((link) => {
  link.addEventListener("click", (event) => {
    if (!locomotiveScroll || motionQuery.matches) return;

    const target = document.querySelector(link.hash);
    if (!target) return;

    event.preventDefault();
    locomotiveScroll.scrollTo(target, {
      offset: -96,
      duration: 0.65,
      easing: (progress) => 1 - Math.pow(1 - progress, 4),
    });
    history.pushState(null, "", link.hash);
  });
});

let motionMeasurementsReady = false;
motionQuery.addEventListener?.("change", () => {
  if (motionMeasurementsReady) initializeScrollMotion();
});
prepareScrollScrambles();
Promise.resolve(document.fonts?.ready)
  .catch(() => {})
  .then(() => {
    motionMeasurementsReady = true;
    initializeScrollMotion();
    requestScrollProgress();
  });

requestScrollProgress();
renderThemeControls();
