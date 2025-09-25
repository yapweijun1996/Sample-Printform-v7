/* eslint-disable no-console */

const TRUE_TOKENS = new Set(["y", "yes", "true", "1"]);
const FALSE_TOKENS = new Set(["n", "no", "false", "0"]);

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

function parseString(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
}

function normalizeHeight(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.round(num));
}

function ensurePageNumberPlaceholder(element) {
  if (!element) return null;
  if (element.__pageNumberPlaceholder) {
    return element.__pageNumberPlaceholder;
  }
  const doc = element.ownerDocument || (typeof document !== "undefined" ? document : null);
  if (!doc) return null;
  let container = element.querySelector("[data-page-number-container]");
  if (!container) {
    container = element.querySelector("td:last-child") || element.querySelector("td") || element;
  }
  const placeholder = doc.createElement("span");
  placeholder.className = "printform_page_number_placeholder";
  container.appendChild(placeholder);
  element.__pageNumberPlaceholder = placeholder;
  return placeholder;
}

function updatePageNumberContent(element, pageNumber, totalPages) {
  if (!element) return;
  const numberTargets = element.querySelectorAll("[data-page-number]");
  if (numberTargets.length > 0) {
    numberTargets.forEach(function(target) {
      target.textContent = pageNumber;
    });
  }
  const totalTargets = element.querySelectorAll("[data-page-total]");
  const totalValue = totalPages !== undefined && totalPages !== null ? totalPages : "";
  if (totalTargets.length > 0) {
    totalTargets.forEach(function(target) {
      target.textContent = totalValue;
    });
  }
  if (numberTargets.length === 0 && totalTargets.length === 0) {
    const fallback = ensurePageNumberPlaceholder(element);
    if (fallback) {
      fallback.textContent = totalPages !== undefined && totalPages !== null
        ? "Page " + pageNumber + " of " + totalPages
        : "Page " + pageNumber;
    }
  }
}

/**
 * @typedef {Object} ConfigDescriptor
 * @property {string} key Canonical configuration key used within the formatter.
 * @property {string} datasetKey Matching `data-*` attribute converted to camelCase.
 * @property {string} legacyKey Historical global variable name supported for backwards compatibility.
 * @property {*} defaultValue Fallback value when no overrides are supplied.
 * @property {Function} parser Normalizer that validates incoming values.
 */

// Every config option lives here to unify defaults, legacy globals, and dataset parsing.
const CONFIG_DESCRIPTORS = [
  { key: "papersizeWidth", datasetKey: "papersizeWidth", legacyKey: "papersize_width", defaultValue: 750, parser: parseNumber },
  { key: "papersizeHeight", datasetKey: "papersizeHeight", legacyKey: "papersize_height", defaultValue: 1050, parser: parseNumber },
  {
    key: "heightOfDummyRowItem",
    datasetKey: "heightOfDummyRowItem",
    legacyKey: "height_of_dummy_row_item",
    defaultValue: 18,
    parser: parseNumber
  },
  { key: "repeatHeader", datasetKey: "repeatHeader", legacyKey: "repeat_header", defaultValue: true, parser: parseBooleanFlag },
  { key: "repeatDocinfo", datasetKey: "repeatDocinfo", legacyKey: "repeat_docinfo", defaultValue: true, parser: parseBooleanFlag },
  { key: "repeatDocinfo002", datasetKey: "repeatDocinfo002", legacyKey: "repeat_docinfo002", defaultValue: true, parser: parseBooleanFlag },
  { key: "repeatDocinfo003", datasetKey: "repeatDocinfo003", legacyKey: "repeat_docinfo003", defaultValue: true, parser: parseBooleanFlag },
  { key: "repeatDocinfo004", datasetKey: "repeatDocinfo004", legacyKey: "repeat_docinfo004", defaultValue: true, parser: parseBooleanFlag },
  { key: "repeatDocinfo005", datasetKey: "repeatDocinfo005", legacyKey: "repeat_docinfo005", defaultValue: true, parser: parseBooleanFlag },
  { key: "repeatRowheader", datasetKey: "repeatRowheader", legacyKey: "repeat_rowheader", defaultValue: true, parser: parseBooleanFlag },
  { key: "repeatFooter", datasetKey: "repeatFooter", legacyKey: "repeat_footer", defaultValue: false, parser: parseBooleanFlag },
  { key: "repeatFooter002", datasetKey: "repeatFooter002", legacyKey: "repeat_footer002", defaultValue: false, parser: parseBooleanFlag },
  { key: "repeatFooter003", datasetKey: "repeatFooter003", legacyKey: "repeat_footer003", defaultValue: false, parser: parseBooleanFlag },
  { key: "repeatFooter004", datasetKey: "repeatFooter004", legacyKey: "repeat_footer004", defaultValue: false, parser: parseBooleanFlag },
  { key: "repeatFooter005", datasetKey: "repeatFooter005", legacyKey: "repeat_footer005", defaultValue: false, parser: parseBooleanFlag },
  { key: "repeatFooterLogo", datasetKey: "repeatFooterLogo", legacyKey: "repeat_footer_logo", defaultValue: false, parser: parseBooleanFlag },
  { key: "repeatFooterPagenum", datasetKey: "repeatFooterPagenum", legacyKey: "repeat_footer_pagenum", defaultValue: false, parser: parseBooleanFlag },
  {
    key: "insertDummyRowItemWhileFormatTable",
    datasetKey: "insertDummyRowItemWhileFormatTable",
    legacyKey: "insert_dummy_row_item_while_format_table",
    defaultValue: true,
    parser: parseBooleanFlag
  },
  {
    key: "insertDummyRowWhileFormatTable",
    datasetKey: "insertDummyRowWhileFormatTable",
    legacyKey: "insert_dummy_row_while_format_table",
    defaultValue: false,
    parser: parseBooleanFlag
  },
  {
    key: "insertFooterSpacerWhileFormatTable",
    datasetKey: "insertFooterSpacerWhileFormatTable",
    legacyKey: "insert_footer_spacer_while_format_table",
    defaultValue: true,
    parser: parseBooleanFlag
  },
  {
    key: "insertFooterSpacerWithDummyRowItemWhileFormatTable",
    datasetKey: "insertFooterSpacerWithDummyRowItemWhileFormatTable",
    legacyKey: "insert_footer_spacer_with_dummy_row_item_while_format_table",
    defaultValue: true,
    parser: parseBooleanFlag
  },
  {
    key: "customDummyRowItemContent",
    datasetKey: "customDummyRowItemContent",
    legacyKey: "custom_dummy_row_item_content",
    defaultValue: "",
    parser: parseString
  },
  { key: "debug", datasetKey: "debug", legacyKey: "debug_printform", defaultValue: false, parser: parseBooleanFlag }
];

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
const FOOTER_PAGENUM_VARIANT = { key: "footerPagenum", className: "pfooter_pagenum", repeatFlag: "repeatFooterPagenum" };

const DEFAULT_CONFIG = CONFIG_DESCRIPTORS.reduce((accumulator, descriptor) => {
  accumulator[descriptor.key] = descriptor.defaultValue;
  return accumulator;
}, {});

function readConfigFromLegacy(descriptors) {
  const source = typeof window === "undefined" ? {} : window;
  return descriptors.reduce((config, descriptor) => {
    if (!descriptor.legacyKey) return config;
    const value = source[descriptor.legacyKey];
    if (value === undefined || value === null || value === "") return config;
    config[descriptor.key] = descriptor.parser(value, descriptor.defaultValue);
    return config;
  }, {});
}

function readConfigFromDataset(descriptors, dataset) {
  const source = dataset || {};
  return descriptors.reduce((config, descriptor) => {
    if (!descriptor.datasetKey) return config;
    if (!Object.prototype.hasOwnProperty.call(source, descriptor.datasetKey)) return config;
    const value = source[descriptor.datasetKey];
    if (value === undefined || value === null || value === "") return config;
    config[descriptor.key] = descriptor.parser(value, descriptor.defaultValue);
    return config;
  }, {});
}

function getLegacyConfig() {
  return readConfigFromLegacy(CONFIG_DESCRIPTORS);
}

function getDatasetConfig(dataset) {
  return readConfigFromDataset(CONFIG_DESCRIPTORS, dataset);
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

const DomHelpers = {
  markAsProcessed,
  measureHeight,
  createPageBreakDivider,
  appendClone,
  appendRowItem
};
class PrintFormFormatter {
  constructor(formEl, config) {
    this.formEl = formEl;
    this.config = config;
    this.debug = Boolean(config.debug);
    this.currentPage = 1;
    this.pageNumberClones = [];
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
      footerPagenum: this.formEl.querySelector(`.${FOOTER_PAGENUM_VARIANT.className}`),
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
      DomHelpers.appendClone(container, sections.header, logFn, "pheader");
      if (!this.config.repeatHeader) {
        consumedHeight += heights.header;
      }
    }
    sections.docInfos.forEach((docInfo) => {
      DomHelpers.appendClone(container, docInfo.element, logFn, docInfo.className);
      if (!this.config[docInfo.repeatFlag]) {
        consumedHeight += heights.docInfos[docInfo.key] || 0;
      }
    });
    if (sections.rowHeader) {
      DomHelpers.appendClone(container, sections.rowHeader, logFn, "prowheader");
      if (!this.config.repeatRowheader) {
        consumedHeight += heights.rowHeader;
      }
    }
    return consumedHeight;
  }

  appendRepeatingSections(container, sections, logFn) {
    if (this.config.repeatHeader) {
      DomHelpers.appendClone(container, sections.header, logFn, "pheader");
    }
    sections.docInfos.forEach((docInfo) => {
      if (this.config[docInfo.repeatFlag]) {
        DomHelpers.appendClone(container, docInfo.element, logFn, docInfo.className);
      }
    });
    if (this.config.repeatRowheader) {
      DomHelpers.appendClone(container, sections.rowHeader, logFn, "prowheader");
    }
  }

  appendRepeatingFooters(container, sections, logFn) {
    sections.footerVariants.forEach((footer) => {
      if (this.config[footer.repeatFlag]) {
        DomHelpers.appendClone(container, footer.element, logFn, footer.className);
      }
    });
    if (this.config.repeatFooterLogo) {
      DomHelpers.appendClone(container, sections.footerLogo, logFn, FOOTER_LOGO_VARIANT.className);
    }
    if (this.config.repeatFooterPagenum) {
      this.appendFooterPageNumber(container, sections, logFn);
    }
  }

  appendFinalFooters(container, sections, logFn) {
    sections.footerVariants.forEach((footer) => {
      DomHelpers.appendClone(container, footer.element, logFn, footer.className);
    });
    DomHelpers.appendClone(container, sections.footerLogo, logFn, FOOTER_LOGO_VARIANT.className);
    this.appendFooterPageNumber(container, sections, logFn);
  }

  appendFooterPageNumber(container, sections, logFn) {
    if (!sections.footerPagenum) {
      return;
    }
    const clone = sections.footerPagenum.cloneNode(true);
    updatePageNumberContent(clone, this.currentPage, null);
    container.appendChild(clone);
    if (logFn) {
      logFn(`append ${FOOTER_PAGENUM_VARIANT.className} page ${this.currentPage}`);
    }
    this.pageNumberClones.push({ node: clone, pageNumber: this.currentPage });
  }

  updatePageNumberTotals() {
    if (!this.pageNumberClones.length) {
      return;
    }
    const totalPages = this.currentPage;
    this.pageNumberClones.forEach((entry) => {
      updatePageNumberContent(entry.node, entry.pageNumber, totalPages);
    });
  }

  measureSections(sections) {
    const heights = {
      header: DomHelpers.measureHeight(sections.header),
      docInfos: {},
      rowHeader: DomHelpers.measureHeight(sections.rowHeader),
      footerVariants: {},
      footerLogo: DomHelpers.measureHeight(sections.footerLogo),
      footerPagenum: DomHelpers.measureHeight(sections.footerPagenum)
    };
    sections.docInfos.forEach((docInfo) => {
      heights.docInfos[docInfo.key] = DomHelpers.measureHeight(docInfo.element);
    });
    sections.footerVariants.forEach((footer) => {
      heights.footerVariants[footer.key] = DomHelpers.measureHeight(footer.element);
    });
    return heights;
  }

  markSectionsProcessed(sections) {
    DomHelpers.markAsProcessed(sections.header, "pheader");
    sections.docInfos.forEach((docInfo) => {
      DomHelpers.markAsProcessed(docInfo.element, docInfo.className);
    });
    DomHelpers.markAsProcessed(sections.rowHeader, "prowheader");
    sections.footerVariants.forEach((footer) => {
      DomHelpers.markAsProcessed(footer.element, footer.className);
    });
    DomHelpers.markAsProcessed(sections.footerLogo, FOOTER_LOGO_VARIANT.className);
    DomHelpers.markAsProcessed(sections.footerPagenum, FOOTER_PAGENUM_VARIANT.className);
  }

  renderRows(container, sections, heights, footerState, heightPerPage, footerSpacerTemplate, logFn) {
    let currentHeight = 0;
    sections.rows.forEach((row, index) => {
      const rowHeight = DomHelpers.measureHeight(row);
      if (!rowHeight) {
        DomHelpers.markAsProcessed(row, "prowitem");
        return;
      }

      if (currentHeight === 0) {
        currentHeight += this.ensureFirstPageSections(container, sections, heights, logFn);
      }

      currentHeight += rowHeight;
      DomHelpers.markAsProcessed(row, "prowitem");

      if (row.classList.contains("tb_page_break_before")) {
        currentHeight -= rowHeight;
        currentHeight = this.prepareNextPage(
          container,
          sections,
          logFn,
          heightPerPage,
          currentHeight,
          footerState,
          footerSpacerTemplate
        );
        DomHelpers.appendRowItem(container, row, logFn, index);
        currentHeight = rowHeight;
      } else if (currentHeight <= heightPerPage) {
        DomHelpers.appendRowItem(container, row, logFn, index);
      } else {
        currentHeight -= rowHeight;
        currentHeight = this.prepareNextPage(
          container,
          sections,
          logFn,
          heightPerPage,
          currentHeight,
          footerState,
          footerSpacerTemplate
        );
        DomHelpers.appendRowItem(container, row, logFn, index);
        currentHeight = rowHeight;
      }
    });
    return currentHeight;
  }

  prepareNextPage(container, sections, logFn, heightPerPage, currentHeight, footerState, spacerTemplate) {
    const filledHeight = this.applyRemainderSpacing(
      container,
      heightPerPage,
      currentHeight,
      footerState,
      spacerTemplate
    );
    this.appendRepeatingFooters(container, sections, logFn);
    container.appendChild(DomHelpers.createPageBreakDivider());
    this.currentPage += 1;
    this.appendRepeatingSections(container, sections, logFn);
    return filledHeight;
  }

  applyRemainderSpacing(container, heightPerPage, currentHeight, footerState, spacerTemplate) {
    let workingHeight = normalizeHeight(currentHeight);
    workingHeight = applyDummyRowItemsStep(this.config, container, heightPerPage, workingHeight);
    workingHeight = applyDummyRowStep(this.config, container, heightPerPage, workingHeight);
    const spacerState = applyFooterSpacerWithDummyStep(
      this.config,
      container,
      heightPerPage,
      workingHeight
    );
    workingHeight = spacerState.currentHeight;
    if (!spacerState.skipFooterSpacer) {
      applyFooterSpacerStep(
        this.config,
        container,
        heightPerPage,
        workingHeight,
        footerState,
        spacerTemplate
      );
    }
    return normalizeHeight(workingHeight);
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
    if (this.config.repeatFooterPagenum) {
      available -= heights.footerPagenum || 0;
    }
    return Math.max(0, available);
  }

  computeFooterState(sections, heights) {
    const footerLogoHeight = heights.footerLogo || 0;
    const footerPagenumHeight = heights.footerPagenum || 0;
    const totalFooterHeight = sections.footerVariants.reduce((sum, footer) => {
      const height = heights.footerVariants[footer.key] || 0;
      return sum + height;
    }, 0);
    const totalFinal = totalFooterHeight + footerLogoHeight + footerPagenumHeight;
    const repeatingFooterHeight = sections.footerVariants.reduce((sum, footer) => {
      const height = heights.footerVariants[footer.key] || 0;
      return this.config[footer.repeatFlag] ? sum + height : sum;
    }, 0);
    let repeating = repeatingFooterHeight;
    if (this.config.repeatFooterLogo) {
      repeating += footerLogoHeight;
    }
    if (this.config.repeatFooterPagenum) {
      repeating += footerPagenumHeight;
    }
    const nonRepeating = Math.max(0, totalFinal - repeating);
    return {
      totalFinal,
      repeating,
      nonRepeating
    };
  }

  finalizeDocument(container, sections, footerState, heightPerPage, baseHeight, spacerTemplate, logFn) {
    const allowance = footerState.totalFinal - footerState.repeating;
    const heightWithFinalFooters = baseHeight + allowance;
    if (heightWithFinalFooters <= heightPerPage) {
      this.applyRemainderSpacing(
        container,
        heightPerPage,
        heightWithFinalFooters,
        footerState,
        spacerTemplate
      );
      this.appendFinalFooters(container, sections, logFn);
      return;
    }

    this.prepareNextPage(
      container,
      sections,
      logFn,
      heightPerPage,
      baseHeight,
      footerState,
      spacerTemplate
    );

    const finalPageStartHeight = allowance;
    this.applyRemainderSpacing(
      container,
      heightPerPage,
      finalPageStartHeight,
      footerState,
      spacerTemplate
    );
    this.appendFinalFooters(container, sections, logFn);
  }

  format() {
    const logFn = this.debug ? this.log.bind(this) : null;
    const container = this.initializeOutputContainer();
    const sections = this.collectSections();
    const heights = this.measureSections(sections);
    const footerSpacerTemplate = this.createFooterSpacerTemplate();
    this.markSectionsProcessed(sections);
    const footerState = this.computeFooterState(sections, heights);
    const heightPerPage = this.computeHeightPerPage(sections, heights);
    const currentHeight = this.renderRows(
      container,
      sections,
      heights,
      footerState,
      heightPerPage,
      footerSpacerTemplate,
      logFn
    );

    this.finalizeDocument(
      container,
      sections,
      footerState,
      heightPerPage,
      currentHeight,
      footerSpacerTemplate,
      logFn
    );
    this.updatePageNumberTotals();

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
        formatted.parentNode.insertBefore(DomHelpers.createPageBreakDivider(), formatted);
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
