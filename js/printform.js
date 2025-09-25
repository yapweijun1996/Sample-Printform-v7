/* eslint-disable no-console */

const TRUE_TOKENS = new Set(["y", "yes", "true", "1"]);
const FALSE_TOKENS = new Set(["n", "no", "false", "0"]);

const DEFAULT_CONFIG = {
  papersizeWidth: 750,
  papersizeHeight: 1050,
  heightOfDummyRowItem: 18,
  repeatHeader: true,
  repeatDocinfo: true,
  repeatDocinfo002: true,
  repeatDocinfo003: true,
  repeatDocinfo004: true,
  repeatDocinfo005: true,
  repeatRowheader: true,
  repeatFooter: false,
  repeatFooter002: false,
  repeatFooter003: false,
  repeatFooter004: false,
  repeatFooter005: false,
  repeatFooterLogo: false,
  insertDummyRowItemWhileFormatTable: true,
  insertDummyRowWhileFormatTable: false,
  insertFooterSpacerWhileFormatTable: true,
  insertFooterSpacerWithDummyRowItemWhileFormatTable: true,
  customDummyRowItemContent: "",
  debug: false
};

const DOCINFO_VARIANTS = [
  { key: "docInfo", className: "pdocinfo", repeatFlag: "repeatDocinfo" },
  { key: "docInfo002", className: "pdocinfo002", repeatFlag: "repeatDocinfo002" },
  { key: "docInfo003", className: "pdocinfo003", repeatFlag: "repeatDocinfo003" },
  { key: "docInfo004", className: "pdocinfo004", repeatFlag: "repeatDocinfo004" },
  { key: "docInfo005", className: "pdocinfo005", repeatFlag: "repeatDocinfo005" }
];

const FOOTER_VARIANTS = [
  { key: "footer", className: "pfooter", repeatFlag: "repeatFooter" },
  { key: "footer002", className: "pfooter002", repeatFlag: "repeatFooter002" },
  { key: "footer003", className: "pfooter003", repeatFlag: "repeatFooter003" },
  { key: "footer004", className: "pfooter004", repeatFlag: "repeatFooter004" },
  { key: "footer005", className: "pfooter005", repeatFlag: "repeatFooter005" }
];

const FOOTER_LOGO_VARIANT = { key: "footerLogo", className: "pfooter_logo", repeatFlag: "repeatFooterLogo" };

function parseBooleanFlag(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const lowered = String(value).trim().toLowerCase();
  if (TRUE_TOKENS.has(lowered)) return true;
  if (FALSE_TOKENS.has(lowered)) return false;
  return fallback;
}

function parseNumber(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function normalizeHeight(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.round(num));
}

function getLegacyConfig() {
  const g = typeof window === "undefined" ? {} : window;
  const config = {};
  if (g.papersize_width !== undefined) {
    config.papersizeWidth = parseNumber(g.papersize_width, DEFAULT_CONFIG.papersizeWidth);
  }
  if (g.papersize_height !== undefined) {
    config.papersizeHeight = parseNumber(g.papersize_height, DEFAULT_CONFIG.papersizeHeight);
  }
  if (g.height_of_dummy_row_item !== undefined) {
    config.heightOfDummyRowItem = parseNumber(g.height_of_dummy_row_item, DEFAULT_CONFIG.heightOfDummyRowItem);
  }
  if (g.repeat_header !== undefined) {
    config.repeatHeader = parseBooleanFlag(g.repeat_header, DEFAULT_CONFIG.repeatHeader);
  }
  if (g.repeat_docinfo !== undefined) {
    config.repeatDocinfo = parseBooleanFlag(g.repeat_docinfo, DEFAULT_CONFIG.repeatDocinfo);
  }
  if (g.repeat_docinfo002 !== undefined) {
    config.repeatDocinfo002 = parseBooleanFlag(g.repeat_docinfo002, DEFAULT_CONFIG.repeatDocinfo002);
  }
  if (g.repeat_docinfo003 !== undefined) {
    config.repeatDocinfo003 = parseBooleanFlag(g.repeat_docinfo003, DEFAULT_CONFIG.repeatDocinfo003);
  }
  if (g.repeat_docinfo004 !== undefined) {
    config.repeatDocinfo004 = parseBooleanFlag(g.repeat_docinfo004, DEFAULT_CONFIG.repeatDocinfo004);
  }
  if (g.repeat_docinfo005 !== undefined) {
    config.repeatDocinfo005 = parseBooleanFlag(g.repeat_docinfo005, DEFAULT_CONFIG.repeatDocinfo005);
  }
  if (g.repeat_rowheader !== undefined) {
    config.repeatRowheader = parseBooleanFlag(g.repeat_rowheader, DEFAULT_CONFIG.repeatRowheader);
  }
  if (g.repeat_footer !== undefined) {
    config.repeatFooter = parseBooleanFlag(g.repeat_footer, DEFAULT_CONFIG.repeatFooter);
  }
  if (g.repeat_footer002 !== undefined) {
    config.repeatFooter002 = parseBooleanFlag(g.repeat_footer002, DEFAULT_CONFIG.repeatFooter002);
  }
  if (g.repeat_footer003 !== undefined) {
    config.repeatFooter003 = parseBooleanFlag(g.repeat_footer003, DEFAULT_CONFIG.repeatFooter003);
  }
  if (g.repeat_footer004 !== undefined) {
    config.repeatFooter004 = parseBooleanFlag(g.repeat_footer004, DEFAULT_CONFIG.repeatFooter004);
  }
  if (g.repeat_footer005 !== undefined) {
    config.repeatFooter005 = parseBooleanFlag(g.repeat_footer005, DEFAULT_CONFIG.repeatFooter005);
  }
  if (g.repeat_footer_logo !== undefined) {
    config.repeatFooterLogo = parseBooleanFlag(g.repeat_footer_logo, DEFAULT_CONFIG.repeatFooterLogo);
  }
  if (g.insert_dummy_row_item_while_format_table !== undefined) {
    config.insertDummyRowItemWhileFormatTable = parseBooleanFlag(
      g.insert_dummy_row_item_while_format_table,
      DEFAULT_CONFIG.insertDummyRowItemWhileFormatTable
    );
  }
  if (g.insert_dummy_row_while_format_table !== undefined) {
    config.insertDummyRowWhileFormatTable = parseBooleanFlag(
      g.insert_dummy_row_while_format_table,
      DEFAULT_CONFIG.insertDummyRowWhileFormatTable
    );
  }
  if (g.insert_footer_spacer_while_format_table !== undefined) {
    config.insertFooterSpacerWhileFormatTable = parseBooleanFlag(
      g.insert_footer_spacer_while_format_table,
      DEFAULT_CONFIG.insertFooterSpacerWhileFormatTable
    );
  }
  if (g.insert_footer_spacer_with_dummy_row_item_while_format_table !== undefined) {
    config.insertFooterSpacerWithDummyRowItemWhileFormatTable = parseBooleanFlag(
      g.insert_footer_spacer_with_dummy_row_item_while_format_table,
      DEFAULT_CONFIG.insertFooterSpacerWithDummyRowItemWhileFormatTable
    );
  }
  if (g.custom_dummy_row_item_content !== undefined) {
    config.customDummyRowItemContent = g.custom_dummy_row_item_content;
  }
  if (g.debug_printform !== undefined) {
    config.debug = parseBooleanFlag(g.debug_printform, DEFAULT_CONFIG.debug);
  }
  return config;
}

function getDatasetConfig(dataset) {
  const config = {};
  if (dataset.papersizeWidth) {
    config.papersizeWidth = parseNumber(dataset.papersizeWidth, DEFAULT_CONFIG.papersizeWidth);
  }
  if (dataset.papersizeHeight) {
    config.papersizeHeight = parseNumber(dataset.papersizeHeight, DEFAULT_CONFIG.papersizeHeight);
  }
  if (dataset.heightOfDummyRowItem) {
    config.heightOfDummyRowItem = parseNumber(dataset.heightOfDummyRowItem, DEFAULT_CONFIG.heightOfDummyRowItem);
  }
  if (dataset.repeatHeader) {
    config.repeatHeader = parseBooleanFlag(dataset.repeatHeader, DEFAULT_CONFIG.repeatHeader);
  }
  if (dataset.repeatDocinfo) {
    config.repeatDocinfo = parseBooleanFlag(dataset.repeatDocinfo, DEFAULT_CONFIG.repeatDocinfo);
  }
  if (dataset.repeatDocinfo002) {
    config.repeatDocinfo002 = parseBooleanFlag(dataset.repeatDocinfo002, DEFAULT_CONFIG.repeatDocinfo002);
  }
  if (dataset.repeatDocinfo003) {
    config.repeatDocinfo003 = parseBooleanFlag(dataset.repeatDocinfo003, DEFAULT_CONFIG.repeatDocinfo003);
  }
  if (dataset.repeatDocinfo004) {
    config.repeatDocinfo004 = parseBooleanFlag(dataset.repeatDocinfo004, DEFAULT_CONFIG.repeatDocinfo004);
  }
  if (dataset.repeatDocinfo005) {
    config.repeatDocinfo005 = parseBooleanFlag(dataset.repeatDocinfo005, DEFAULT_CONFIG.repeatDocinfo005);
  }
  if (dataset.repeatRowheader) {
    config.repeatRowheader = parseBooleanFlag(dataset.repeatRowheader, DEFAULT_CONFIG.repeatRowheader);
  }
  if (dataset.repeatFooter) {
    config.repeatFooter = parseBooleanFlag(dataset.repeatFooter, DEFAULT_CONFIG.repeatFooter);
  }
  if (dataset.repeatFooter002) {
    config.repeatFooter002 = parseBooleanFlag(dataset.repeatFooter002, DEFAULT_CONFIG.repeatFooter002);
  }
  if (dataset.repeatFooter003) {
    config.repeatFooter003 = parseBooleanFlag(dataset.repeatFooter003, DEFAULT_CONFIG.repeatFooter003);
  }
  if (dataset.repeatFooter004) {
    config.repeatFooter004 = parseBooleanFlag(dataset.repeatFooter004, DEFAULT_CONFIG.repeatFooter004);
  }
  if (dataset.repeatFooter005) {
    config.repeatFooter005 = parseBooleanFlag(dataset.repeatFooter005, DEFAULT_CONFIG.repeatFooter005);
  }
  if (dataset.repeatFooterLogo) {
    config.repeatFooterLogo = parseBooleanFlag(dataset.repeatFooterLogo, DEFAULT_CONFIG.repeatFooterLogo);
  }
  if (dataset.insertDummyRowItemWhileFormatTable) {
    config.insertDummyRowItemWhileFormatTable = parseBooleanFlag(
      dataset.insertDummyRowItemWhileFormatTable,
      DEFAULT_CONFIG.insertDummyRowItemWhileFormatTable
    );
  }
  if (dataset.insertDummyRowWhileFormatTable) {
    config.insertDummyRowWhileFormatTable = parseBooleanFlag(
      dataset.insertDummyRowWhileFormatTable,
      DEFAULT_CONFIG.insertDummyRowWhileFormatTable
    );
  }
  if (dataset.insertFooterSpacerWhileFormatTable) {
    config.insertFooterSpacerWhileFormatTable = parseBooleanFlag(
      dataset.insertFooterSpacerWhileFormatTable,
      DEFAULT_CONFIG.insertFooterSpacerWhileFormatTable
    );
  }
  if (dataset.insertFooterSpacerWithDummyRowItemWhileFormatTable) {
    config.insertFooterSpacerWithDummyRowItemWhileFormatTable = parseBooleanFlag(
      dataset.insertFooterSpacerWithDummyRowItemWhileFormatTable,
      DEFAULT_CONFIG.insertFooterSpacerWithDummyRowItemWhileFormatTable
    );
  }
  if (dataset.customDummyRowItemContent) {
    config.customDummyRowItemContent = dataset.customDummyRowItemContent;
  }
  if (dataset.debug) {
    config.debug = parseBooleanFlag(dataset.debug, DEFAULT_CONFIG.debug);
  }
  return config;
}

function resolveTemplateOverride(formEl, fallback) {
  const template = formEl.querySelector("template.custom-dummy-row-item-content");
  if (template) {
    return template.innerHTML.trim();
  }
  return fallback;
}

function getPrintformConfig(formEl, overrides = {}) {
  const legacy = getLegacyConfig();
  const datasetConfig = getDatasetConfig(formEl.dataset || {});
  const merged = {
    ...DEFAULT_CONFIG,
    ...legacy,
    ...datasetConfig,
    ...overrides
  };
  merged.customDummyRowItemContent = resolveTemplateOverride(
    formEl,
    overrides.customDummyRowItemContent !== undefined
      ? overrides.customDummyRowItemContent
      : merged.customDummyRowItemContent
  );
  merged.debug = parseBooleanFlag(merged.debug, DEFAULT_CONFIG.debug);
  return merged;
}

function createDummyRowTable(config, height) {
  const table = document.createElement("table");
  table.className = "dummy_row";
  table.setAttribute("width", `${config.papersizeWidth}px`);
  table.setAttribute("cellspacing", "0");
  table.setAttribute("cellpadding", "0");
  table.innerHTML = `<tr style="height:${normalizeHeight(height)}px;"><td style="border:0px solid black;"></td></tr>`;
  return table;
}

function createDummyRowItemTable(config) {
  const table = document.createElement("table");
  table.className = "dummy_row_item";
  table.setAttribute("width", `${config.papersizeWidth}px`);
  table.setAttribute("cellspacing", "0");
  table.setAttribute("cellpadding", "0");
  if (config.customDummyRowItemContent) {
    table.innerHTML = config.customDummyRowItemContent;
  } else {
    table.innerHTML = `<tr style="height:${normalizeHeight(config.heightOfDummyRowItem)}px;"><td style="border:0px solid black;"></td></tr>`;
  }
  return table;
}

function appendDummyRowItems(config, target, diffHeight) {
  const itemHeight = normalizeHeight(config.heightOfDummyRowItem);
  const remaining = normalizeHeight(diffHeight);
  if (itemHeight <= 0 || remaining <= 0) return;
  const count = Math.floor(remaining / itemHeight);
  for (let index = 0; index < count; index += 1) {
    target.appendChild(createDummyRowItemTable(config));
  }
}

function appendDummyRow(config, target, diffHeight) {
  const remaining = normalizeHeight(diffHeight);
  if (remaining <= 0) return;
  target.appendChild(createDummyRowTable(config, remaining));
}

function applyDummyRowItemsStep(config, container, heightPerPage, currentHeight) {
  if (!config.insertDummyRowItemWhileFormatTable) {
    return normalizeHeight(currentHeight);
  }
  const remaining = normalizeHeight(heightPerPage - currentHeight);
  if (remaining > 0) {
    appendDummyRowItems(config, container, remaining);
    const itemHeight = normalizeHeight(config.heightOfDummyRowItem);
    if (itemHeight > 0) {
      const remainder = normalizeHeight(remaining % itemHeight);
      return normalizeHeight(heightPerPage - remainder);
    }
  }
  return normalizeHeight(currentHeight);
}

function applyDummyRowStep(config, container, heightPerPage, currentHeight) {
  if (!config.insertDummyRowWhileFormatTable) {
    return normalizeHeight(currentHeight);
  }
  const remaining = normalizeHeight(heightPerPage - currentHeight);
  if (remaining > 0) {
    appendDummyRow(config, container, remaining);
    return normalizeHeight(currentHeight + remaining);
  }
  return normalizeHeight(currentHeight);
}

function applyFooterSpacerWithDummyStep(config, container, heightPerPage, currentHeight) {
  if (!config.insertFooterSpacerWithDummyRowItemWhileFormatTable) {
    return {
      currentHeight: normalizeHeight(currentHeight),
      skipFooterSpacer: false
    };
  }
  const remaining = normalizeHeight(heightPerPage - currentHeight);
  let workingHeight = normalizeHeight(currentHeight);
  if (remaining > 0) {
    appendDummyRowItems(config, container, remaining);
    const itemHeight = normalizeHeight(config.heightOfDummyRowItem);
    if (itemHeight > 0) {
      const remainder = normalizeHeight(remaining % itemHeight);
      workingHeight = normalizeHeight(heightPerPage - remainder);
    }
  }
  return {
    currentHeight: workingHeight,
    skipFooterSpacer: true
  };
}

function applyFooterSpacerStep(config, container, heightPerPage, currentHeight, footerState, spacerTemplate) {
  if (!config.insertFooterSpacerWhileFormatTable) return;
  const clone = spacerTemplate.cloneNode(true);
  let remaining = normalizeHeight(heightPerPage - currentHeight);
  if (footerState && footerState.nonRepeating) {
    remaining -= normalizeHeight(footerState.nonRepeating);
  }
  clone.style.height = `${Math.max(0, remaining)}px`;
  container.appendChild(clone);
}

function markAsProcessed(element, baseClass) {
  if (!element || !baseClass) return;
  if (element.classList.contains(`${baseClass}_processed`)) return;
  element.classList.remove(baseClass);
  element.classList.add(`${baseClass}_processed`);
}

function measureHeight(element) {
  return element ? normalizeHeight(element.offsetHeight || element.getBoundingClientRect().height) : 0;
}

function createPageBreakDivider() {
  const div = document.createElement("div");
  div.classList.add("div_page_break_before");
  div.style.pageBreakBefore = "always";
  div.style.height = "0px";
  return div;
}

function appendClone(target, element, logFn, label) {
  if (!element) return;
  const clone = element.cloneNode(true);
  target.appendChild(clone);
  if (logFn) logFn(`append ${label}`);
}

function appendRowItem(target, element, logFn, index) {
  if (!element) return;
  const clone = element.cloneNode(true);
  target.appendChild(clone);
  if (logFn) logFn(`append prowitem ${index}`);
}
class PrintFormFormatter {
  constructor(formEl, config) {
    this.formEl = formEl;
    this.config = config;
    this.debug = Boolean(config.debug);
  }

  log(message) {
    if (this.debug) {
      console.log(`[printform] ${message}`);
    }
  }

  initializeOutputContainer() {
    const container = document.createElement("div");
    container.classList.add("printform_formatter");
    this.formEl.parentNode.insertBefore(container, this.formEl);
    return container;
  }

  collectSections() {
    const docInfos = DOCINFO_VARIANTS.map((variant) => {
      const element = this.formEl.querySelector(`.${variant.className}`);
      if (!element) return null;
      return {
        key: variant.key,
        className: variant.className,
        repeatFlag: variant.repeatFlag,
        element
      };
    }).filter(Boolean);

    const footerVariants = FOOTER_VARIANTS.map((variant) => {
      const element = this.formEl.querySelector(`.${variant.className}`);
      if (!element) return null;
      return {
        key: variant.key,
        className: variant.className,
        repeatFlag: variant.repeatFlag,
        element
      };
    }).filter(Boolean);

    return {
      header: this.formEl.querySelector(".pheader"),
      docInfos,
      rowHeader: this.formEl.querySelector(".prowheader"),
      footerVariants,
      footerLogo: this.formEl.querySelector(`.${FOOTER_LOGO_VARIANT.className}`),
      rows: Array.from(this.formEl.querySelectorAll(".prowitem"))
    };
  }

  createFooterSpacerTemplate() {
    const spacer = document.createElement("div");
    spacer.classList.add("pfooter_spacer", "paper_width");
    spacer.style.height = "0px";
    return spacer;
  }

  ensureFirstPageSections(container, sections, heights, logFn) {
    let consumedHeight = 0;
    if (sections.header) {
      appendClone(container, sections.header, logFn, "pheader");
      if (!this.config.repeatHeader) {
        consumedHeight += heights.header;
      }
    }
    sections.docInfos.forEach((docInfo) => {
      appendClone(container, docInfo.element, logFn, docInfo.className);
      if (!this.config[docInfo.repeatFlag]) {
        consumedHeight += heights.docInfos[docInfo.key] || 0;
      }
    });
    if (sections.rowHeader) {
      appendClone(container, sections.rowHeader, logFn, "prowheader");
      if (!this.config.repeatRowheader) {
        consumedHeight += heights.rowHeader;
      }
    }
    return consumedHeight;
  }

  appendRepeatingSections(container, sections, logFn) {
    if (this.config.repeatHeader) {
      appendClone(container, sections.header, logFn, "pheader");
    }
    sections.docInfos.forEach((docInfo) => {
      if (this.config[docInfo.repeatFlag]) {
        appendClone(container, docInfo.element, logFn, docInfo.className);
      }
    });
    if (this.config.repeatRowheader) {
      appendClone(container, sections.rowHeader, logFn, "prowheader");
    }
  }

  appendRepeatingFooters(container, sections, logFn) {
    sections.footerVariants.forEach((footer) => {
      if (this.config[footer.repeatFlag]) {
        appendClone(container, footer.element, logFn, footer.className);
      }
    });
    if (this.config.repeatFooterLogo) {
      appendClone(container, sections.footerLogo, logFn, FOOTER_LOGO_VARIANT.className);
    }
  }

  appendFinalFooters(container, sections, logFn) {
    sections.footerVariants.forEach((footer) => {
      appendClone(container, footer.element, logFn, footer.className);
    });
    appendClone(container, sections.footerLogo, logFn, FOOTER_LOGO_VARIANT.className);
  }

  applyRemainderSpacing(container, heightPerPage, currentHeight, footerState, spacerTemplate) {
    let workingHeight = normalizeHeight(currentHeight);
    workingHeight = applyDummyRowItemsStep(this.config, container, heightPerPage, workingHeight);
    workingHeight = applyDummyRowStep(this.config, container, heightPerPage, workingHeight);
    const footerSpacerState = applyFooterSpacerWithDummyStep(
      this.config,
      container,
      heightPerPage,
      workingHeight
    );
    workingHeight = footerSpacerState.currentHeight;
    if (!footerSpacerState.skipFooterSpacer) {
      applyFooterSpacerStep(
        this.config,
        container,
        heightPerPage,
        workingHeight,
        footerState,
        spacerTemplate
      );
    }
    return workingHeight;
  }

  computeHeightPerPage(sections, heights) {
    let available = this.config.papersizeHeight;
    if (this.config.repeatHeader) {
      available -= heights.header;
    }
    sections.docInfos.forEach((docInfo) => {
      if (this.config[docInfo.repeatFlag]) {
        available -= heights.docInfos[docInfo.key] || 0;
      }
    });
    if (this.config.repeatRowheader) {
      available -= heights.rowHeader;
    }
    sections.footerVariants.forEach((footer) => {
      if (this.config[footer.repeatFlag]) {
        available -= heights.footerVariants[footer.key] || 0;
      }
    });
    if (this.config.repeatFooterLogo) {
      available -= heights.footerLogo;
    }
    return Math.max(0, available);
  }

  computeFooterState(sections, heights) {
    const footerLogoHeight = heights.footerLogo || 0;
    const totalFooterHeight = sections.footerVariants.reduce((sum, footer) => {
      const height = heights.footerVariants[footer.key] || 0;
      return sum + height;
    }, 0);
    const totalFinal = totalFooterHeight + footerLogoHeight;
    const repeating = sections.footerVariants.reduce((sum, footer) => {
      const height = heights.footerVariants[footer.key] || 0;
      return this.config[footer.repeatFlag] ? sum + height : sum;
    }, this.config.repeatFooterLogo ? footerLogoHeight : 0);
    const nonRepeating = Math.max(0, totalFinal - repeating);
    return {
      totalFinal,
      repeating,
      nonRepeating
    };
  }

  format() {
    const logFn = this.debug ? this.log.bind(this) : null;
    const container = this.initializeOutputContainer();
    const sections = this.collectSections();
    const heights = {
      header: measureHeight(sections.header),
      docInfos: {},
      rowHeader: measureHeight(sections.rowHeader),
      footerVariants: {},
      footerLogo: measureHeight(sections.footerLogo)
    };

    sections.docInfos.forEach((docInfo) => {
      heights.docInfos[docInfo.key] = measureHeight(docInfo.element);
    });
    sections.footerVariants.forEach((footer) => {
      heights.footerVariants[footer.key] = measureHeight(footer.element);
    });

    const footerSpacerTemplate = this.createFooterSpacerTemplate();

    markAsProcessed(sections.header, "pheader");
    sections.docInfos.forEach((docInfo) => {
      markAsProcessed(docInfo.element, docInfo.className);
    });
    markAsProcessed(sections.rowHeader, "prowheader");
    sections.footerVariants.forEach((footer) => {
      markAsProcessed(footer.element, footer.className);
    });
    markAsProcessed(sections.footerLogo, FOOTER_LOGO_VARIANT.className);

    const footerState = this.computeFooterState(sections, heights);
    const heightPerPage = this.computeHeightPerPage(sections, heights);
    let currentHeight = 0;

    sections.rows.forEach((row, index) => {
      const rowHeight = measureHeight(row);
      if (!rowHeight) {
        markAsProcessed(row, "prowitem");
        return;
      }

      if (currentHeight === 0) {
        currentHeight += this.ensureFirstPageSections(container, sections, heights, logFn);
      }

      currentHeight += rowHeight;
      markAsProcessed(row, "prowitem");

      if (row.classList.contains("tb_page_break_before")) {
        currentHeight -= rowHeight;
        currentHeight = this.applyRemainderSpacing(
          container,
          heightPerPage,
          currentHeight,
          footerState,
          footerSpacerTemplate
        );
        this.appendRepeatingFooters(container, sections, logFn);
        container.appendChild(createPageBreakDivider());
        this.appendRepeatingSections(container, sections, logFn);
        appendRowItem(container, row, logFn, index);
        currentHeight = rowHeight;
      } else if (currentHeight <= heightPerPage) {
        appendRowItem(container, row, logFn, index);
      } else {
        currentHeight -= rowHeight;
        currentHeight = this.applyRemainderSpacing(
          container,
          heightPerPage,
          currentHeight,
          footerState,
          footerSpacerTemplate
        );
        this.appendRepeatingFooters(container, sections, logFn);
        container.appendChild(createPageBreakDivider());
        this.appendRepeatingSections(container, sections, logFn);
        appendRowItem(container, row, logFn, index);
        currentHeight = rowHeight;
      }
    });

    currentHeight += footerState.totalFinal;
    currentHeight -= footerState.repeating;

    if (currentHeight <= heightPerPage) {
      currentHeight = this.applyRemainderSpacing(
        container,
        heightPerPage,
        currentHeight,
        footerState,
        footerSpacerTemplate
      );
      this.appendFinalFooters(container, sections, logFn);
    } else {
      currentHeight -= footerState.totalFinal;
      currentHeight += footerState.repeating;
      currentHeight = this.applyRemainderSpacing(
        container,
        heightPerPage,
        currentHeight,
        footerState,
        footerSpacerTemplate
      );
      this.appendRepeatingFooters(container, sections, logFn);
      container.appendChild(createPageBreakDivider());
      this.appendRepeatingSections(container, sections, logFn);
      currentHeight = footerState.totalFinal - footerState.repeating;
      currentHeight = this.applyRemainderSpacing(
        container,
        heightPerPage,
        currentHeight,
        footerState,
        footerSpacerTemplate
      );
      this.appendFinalFooters(container, sections, logFn);
    }

    container.classList.add("printform_formatter_processed");
    this.formEl.remove();
    return container;
  }
}

function pauseInMilliseconds(time) {
  return new Promise((resolve, reject) => {
    if (typeof time === "number" && time > 0) {
      setTimeout(resolve, time);
    } else {
      reject(new Error("Invalid time value"));
    }
  });
}

async function formatAllPrintForms(overrides = {}) {
  if (!overrides.force && window.__printFormProcessed) {
    return;
  }
  const forms = Array.from(document.querySelectorAll(".printform"));
  for (let index = 0; index < forms.length; index += 1) {
    const formEl = forms[index];
    const config = getPrintformConfig(formEl, overrides);
    try {
      await pauseInMilliseconds(1);
    } catch (error) {
      console.error("pauseInMilliseconds error", error);
    }
    try {
      const formatter = new PrintFormFormatter(formEl, config);
      const formatted = formatter.format();
      if (index > 0 && formatted && formatted.parentNode) {
        formatted.parentNode.insertBefore(createPageBreakDivider(), formatted);
      }
    } catch (error) {
      console.error("printform format error", error);
    }
  }
  window.__printFormProcessed = true;
}

function formatSinglePrintForm(formEl, overrides = {}) {
  const config = getPrintformConfig(formEl, overrides);
  const formatter = new PrintFormFormatter(formEl, config);
  return formatter.format();
}

window.PrintForm = window.PrintForm || {};
window.PrintForm.formatAll = formatAllPrintForms;
window.PrintForm.format = formatSinglePrintForm;

document.addEventListener("DOMContentLoaded", () => {
  formatAllPrintForms();
});
