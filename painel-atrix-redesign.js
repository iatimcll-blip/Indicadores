(function () {
  "use strict";

  const STORAGE_KEY = "atrix-theme";
  const DISPLAY_NAME = "Painel Jarvis - Marcellus";

  const icons = {
    light:
      '<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path></svg>',
    dark:
      '<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.8 6.8 0 0 0 9.8 9.8z"></path></svg>',
  };

  let syncTimer = 0;
  let themeButton = null;

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      // Storage can be unavailable in local file contexts.
    }
  }

  function preferredTheme() {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  function applyTheme(theme, persist) {
    const selected = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", selected);
    if (persist) setStoredTheme(selected);
    updateThemeButton(selected);
    scheduleSync(80);
  }

  function initTheme() {
    applyTheme(getStoredTheme() || preferredTheme(), false);

    if (!window.matchMedia) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = function (event) {
      if (!getStoredTheme()) applyTheme(event.matches ? "dark" : "light", false);
    };

    if (media.addEventListener) media.addEventListener("change", onChange);
    else if (media.addListener) media.addListener(onChange);
  }

  function updateThemeButton(theme) {
    if (!themeButton) return;
    const next = theme === "dark" ? "light" : "dark";
    themeButton.innerHTML = theme === "dark" ? icons.dark : icons.light;
    themeButton.setAttribute("aria-label", "Alternar para tema " + (next === "dark" ? "escuro" : "claro"));
    themeButton.setAttribute("title", "Alternar tema");
  }

  function optionalImage(src, className, alt) {
    const image = document.createElement("img");
    image.src = src;
    image.alt = alt;
    image.className = className;
    image.hidden = true;
    image.onload = function () {
      image.hidden = false;
    };
    image.onerror = function () {
      image.hidden = true;
    };
    return image;
  }

  function buildHeader() {
    const header = document.querySelector(".header");
    if (!header || header.dataset.redesignReady === "true") return;
    header.dataset.redesignReady = "true";

    const heading = header.querySelector("h1");
    const upload = header.querySelector(".upload-btn");
    const updatedAt = document.getElementById("updatedAt");

    if (heading) {
      heading.textContent = "";
      const title = document.createElement("span");
      title.className = "redesign-title";
      title.textContent = DISPLAY_NAME;

      const subtitle = document.createElement("span");
      subtitle.className = "redesign-subtitle";
      subtitle.append(document.createTextNode("B2B abertos · SLA em horário comercial · "));
      if (updatedAt) subtitle.appendChild(updatedAt);

      heading.append(title, subtitle);
    }

    const brand = document.createElement("div");
    brand.className = "redesign-brand";
    brand.append(optionalImage("assets/Logomarca.png", "redesign-logo", "Logomarca"));
    if (heading) brand.appendChild(heading);
    header.insertBefore(brand, header.firstChild);

    const actions = document.createElement("div");
    actions.className = "redesign-actions";

    if (upload) actions.appendChild(upload);

    themeButton = document.createElement("button");
    themeButton.type = "button";
    themeButton.className = "redesign-theme-toggle";
    themeButton.addEventListener("click", function () {
      const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      applyTheme(current === "dark" ? "light" : "dark", true);
    });
    actions.appendChild(themeButton);
    header.appendChild(actions);

    const strip = document.createElement("div");
    strip.className = "redesign-jarvis-strip";
    strip.innerHTML =
      '<div class="redesign-jarvis-identity"><span class="redesign-jarvis-image-slot"></span><span>Jarvis Monitor</span></div>' +
      '<div class="redesign-counter"><span class="redesign-counter-label">Abertos</span><span class="redesign-counter-value" id="redesignOpenCount">--</span></div>' +
      '<div class="redesign-counter"><span class="redesign-counter-label">Encerrados</span><span class="redesign-counter-value">--</span></div>' +
      '<div class="redesign-counter"><span class="redesign-counter-label">Repetidos</span><span class="redesign-counter-value">--</span></div>' +
      '<div class="redesign-status-legend" aria-label="Legenda de status">' +
      '<span class="redesign-legend-pill"><span class="redesign-legend-dot ok"></span>OK</span>' +
      '<span class="redesign-legend-pill"><span class="redesign-legend-dot attention"></span>Atenção</span>' +
      '<span class="redesign-legend-pill"><span class="redesign-legend-dot critical"></span>Crítico</span>' +
      '<span class="redesign-legend-pill"><span class="redesign-legend-dot"></span>Neutro</span>' +
      "</div>";

    const imageSlot = strip.querySelector(".redesign-jarvis-image-slot");
    imageSlot.replaceWith(optionalImage("assets/jarvis.png", "redesign-jarvis-image", "Jarvis"));
    header.appendChild(strip);

    updateThemeButton(document.documentElement.getAttribute("data-theme"));
  }

  function relocateFilters() {
    const container = document.querySelector(".container");
    const header = document.querySelector(".header");
    const filters = document.querySelector(".filters");
    if (!container || !header || !filters || document.querySelector(".redesign-filter-bar")) return;

    const bar = document.createElement("div");
    bar.className = "redesign-filter-bar";

    const title = document.createElement("div");
    title.className = "redesign-filter-title";
    title.textContent = "Filtros";

    bar.append(title, filters);
    header.insertAdjacentElement("afterend", bar);
  }

  function reorderSections() {
    const kpis = document.querySelector(".kpi-row");
    const charts = document.querySelector(".charts-row");
    const rankings = document.querySelector(".rankings-row");

    if (kpis && charts && kpis.nextElementSibling !== charts) {
      kpis.insertAdjacentElement("afterend", charts);
    }

    if (charts && rankings && charts.nextElementSibling !== rankings) {
      charts.insertAdjacentElement("afterend", rankings);
    }
  }

  function buildFooter() {
    const container = document.querySelector(".container");
    if (!container || document.querySelector(".redesign-footer")) return;

    const footer = document.createElement("footer");
    footer.className = "redesign-footer";
    footer.textContent = "© 2026 · MCLL Monitoramento B2B · Wanderson Marcellus Penha Costa";
    container.appendChild(footer);
  }

  function getData() {
    try {
      if (typeof DATA !== "undefined" && Array.isArray(DATA)) return DATA;
    } catch (error) {
      return [];
    }
    return [];
  }

  function enhanceKpis() {
    const cards = Array.from(document.querySelectorAll(".kpi"));
    const labels = ["Em aberto", "SLA médio", "Outlier +24h", "Aguardando"];
    const data = getData();
    const within8 = data.filter(function (item) {
      return Number(item.sla) <= 8;
    }).length;
    const metas = [
      "Fila atual de chamados",
      data.length ? "Dentro de 8h: " + within8 : "Meta: até 8h",
      "Crítico acima de 24h",
      "Substatus pendente",
    ];

    cards.forEach(function (card, index) {
      const label = card.querySelector(".kpi-label");
      if (label && labels[index]) label.textContent = labels[index];

      let meta = card.querySelector(".redesign-kpi-meta");
      if (!meta) {
        meta = document.createElement("div");
        meta.className = "redesign-kpi-meta";
        card.appendChild(meta);
      }
      meta.textContent = metas[index] || "";
    });
  }

  function syncCounters() {
    const source = document.getElementById("kpiTotal");
    const target = document.getElementById("redesignOpenCount");
    if (source && target) target.textContent = source.textContent || "--";
  }

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function tuneChart(chart, colors) {
    if (!chart || !chart.data || !chart.data.datasets || !chart.data.datasets[0]) return;

    const dataset = chart.data.datasets[0];
    dataset.backgroundColor = colors;
    dataset.borderColor = colors;
    dataset.borderWidth = 0;

    const text = cssVar("--text-muted") || "#5c636e";
    const border = cssVar("--border") || "rgba(0,0,0,.1)";
    if (chart.options && chart.options.scales) {
      Object.keys(chart.options.scales).forEach(function (key) {
        const scale = chart.options.scales[key];
        scale.ticks = scale.ticks || {};
        scale.grid = scale.grid || {};
        scale.ticks.color = text;
        scale.grid.color = key === "x" ? "transparent" : border;
      });
    }

    chart.update("none");
  }

  function applyChartPalette() {
    const accent = cssVar("--accent") || "#2e6be6";
    const neutral = cssVar("--text-muted") || "#5c636e";
    const ok = cssVar("--status-ok") || "#1e9e6a";
    const attention = cssVar("--status-attention") || "#c98a14";
    const critical = cssVar("--status-critical") || "#d23b3b";

    try {
      if (typeof chartUF !== "undefined" && chartUF) {
        const values = chartUF.data.datasets[0].data || [];
        tuneChart(
          chartUF,
          values.map(function (_, index) {
            return index % 2 === 0 ? accent : neutral;
          })
        );
      }
    } catch (error) {
      // Chart variables are owned by the original dashboard script.
    }

    try {
      if (typeof chartAging !== "undefined" && chartAging) {
        tuneChart(chartAging, [ok, ok, attention, critical, critical]);
      }
    } catch (error) {
      // Chart variables are owned by the original dashboard script.
    }
  }

  function scheduleSync(delay) {
    window.clearTimeout(syncTimer);
    syncTimer = window.setTimeout(syncDynamicBits, delay || 120);
  }

  function syncDynamicBits() {
    document.title = DISPLAY_NAME;
    syncCounters();
    enhanceKpis();
    applyChartPalette();
  }

  function init() {
    initTheme();
    buildHeader();
    relocateFilters();
    reorderSections();
    buildFooter();
    syncDynamicBits();

    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
      fileInput.addEventListener("change", function () {
        scheduleSync(250);
      });
    }

    window.addEventListener("resize", function () {
      scheduleSync(120);
    });

    window.setInterval(syncDynamicBits, 5000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
