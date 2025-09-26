/* eslint-disable no-console */

(function(global) {
  if (global && global.__printFormScriptLoaded__) {
    return;
  }
  if (global) {
    global.__printFormScriptLoaded__ = true;
  }

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
  {
    key: "repeatPtacRowheader",
    datasetKey: "repeatPtacRowheader",
    legacyKey: "repeat_ptac_rowheader",
    defaultValue: true,
    parser: parseBooleanFlag
  },
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
    key: "insertPtacDummyRowItems",
    datasetKey: "insertPtacDummyRowItems",
    legacyKey: "insert_ptac_dummy_row_items",
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

// ===== PADDT configuration (独立配置) =====
const PADDT_CONFIG_DESCRIPTORS = [
  { key: "repeatPaddt", datasetKey: "repeatPaddt", legacyKey: "repeat_paddt", defaultValue: true, parser: parseBooleanFlag },
  { key: "insertPaddtDummyRowItems", datasetKey: "insertPaddtDummyRowItems", legacyKey: "insert_paddt_dummy_row_items", defaultValue: true, parser: parseBooleanFlag },
  { key: "paddtMaxWordsPerSegment", datasetKey: "paddtMaxWordsPerSegment", legacyKey: "paddt_max_words_per_segment", defaultValue: 200, parser: parseNumber },
  { key: "repeatPaddtRowheader", datasetKey: "repeatPaddtRowheader", legacyKey: "repeat_paddt_rowheader", defaultValue: true, parser: parseBooleanFlag },
  { key: "paddtDebug", datasetKey: "paddtDebug", legacyKey: "paddt_debug", defaultValue: false, parser: parseBooleanFlag },

  // PADDT-specific docinfo toggles (show/hide on PADDT pages only)
  { key: "repeatPaddtDocinfo", datasetKey: "repeatPaddtDocinfo", legacyKey: "repeat_paddt_docinfo", defaultValue: true, parser: parseBooleanFlag },
  { key: "repeatPaddtDocinfo002", datasetKey: "repeatPaddtDocinfo002", legacyKey: "repeat_paddt_docinfo002", defaultValue: true, parser: parseBooleanFlag },
  { key: "repeatPaddtDocinfo003", datasetKey: "repeatPaddtDocinfo003", legacyKey: "repeat_paddt_docinfo003", defaultValue: true, parser: parseBooleanFlag },
  { key: "repeatPaddtDocinfo004", datasetKey: "repeatPaddtDocinfo004", legacyKey: "repeat_paddt_docinfo004", defaultValue: true, parser: parseBooleanFlag },
  { key: "repeatPaddtDocinfo005", datasetKey: "repeatPaddtDocinfo005", legacyKey: "repeat_paddt_docinfo005", defaultValue: true, parser: parseBooleanFlag }
];

const DEFAULT_PADDT_CONFIG = PADDT_CONFIG_DESCRIPTORS.reduce(function(acc, d) {
  acc[d.key] = d.defaultValue;
  return acc;
}, {});

function getPaddtLegacyConfig() {
  return readConfigFromLegacy(PADDT_CONFIG_DESCRIPTORS);
}

function getPaddtDatasetConfig(dataset) {
  return readConfigFromDataset(PADDT_CONFIG_DESCRIPTORS, dataset);
}

/**
 * 获取 paddt 配置（与主配置独立）(中文解释: paddt 独立配置读取)
 */
function getPaddtConfig(formEl, overrides) {
  overrides = overrides || {};
  var legacy = getPaddtLegacyConfig();
  var datasetConfig = getPaddtDatasetConfig((formEl && formEl.dataset) || {});
  var merged = {};
  for (var k in DEFAULT_PADDT_CONFIG) { if (Object.prototype.hasOwnProperty.call(DEFAULT_PADDT_CONFIG, k)) merged[k] = DEFAULT_PADDT_CONFIG[k]; }
  for (var k1 in legacy) { if (Object.prototype.hasOwnProperty.call(legacy, k1)) merged[k1] = legacy[k1]; }
  for (var k2 in datasetConfig) { if (Object.prototype.hasOwnProperty.call(datasetConfig, k2)) merged[k2] = datasetConfig[k2]; }
  for (var k3 in overrides) { if (Object.prototype.hasOwnProperty.call(overrides, k3)) merged[k3] = overrides[k3]; }
  merged.paddtDebug = parseBooleanFlag(merged.paddtDebug, DEFAULT_PADDT_CONFIG.paddtDebug);
  merged.paddtMaxWordsPerSegment = parseNumber(merged.paddtMaxWordsPerSegment, DEFAULT_PADDT_CONFIG.paddtMaxWordsPerSegment);
  if (!Number.isFinite(merged.paddtMaxWordsPerSegment) || merged.paddtMaxWordsPerSegment <= 0) {
    merged.paddtMaxWordsPerSegment = DEFAULT_PADDT_CONFIG.paddtMaxWordsPerSegment;
  }
  return merged;
}

// fallback 常量 (中文解释: 兜底常量)
var PADDT_MAX_WORDS_PER_SEGMENT = 200;

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

function applyFooterSpacerWithDummyStep(config, container, heightPerPage, currentHeight, skipDummyRowItems) {
  if (!config.insertFooterSpacerWithDummyRowItemWhileFormatTable || skipDummyRowItems) {
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
  if (!element) return null;
  const clone = element.cloneNode(true);
  target.appendChild(clone);
  if (logFn) logFn(`append ${label}`);
  return clone;
}

function appendRowItem(target, element, logFn, index, label) {
  if (!element) return;
  const clone = element.cloneNode(true);
  target.appendChild(clone);
  if (logFn) {
    const resolvedLabel = label || "prowitem";
    logFn(`append ${resolvedLabel} ${index}`);
  }
}

const DomHelpers = {
  markAsProcessed,
  measureHeight,
  createPageBreakDivider,
  appendClone,
  appendRowItem
};

const ROW_SELECTOR = ".prowitem, .ptac-rowitem, .paddt-rowitem";

var PTAC_MAX_WORDS_PER_SEGMENT = 200;

function convertWordsToHtml(node, words) {
  var clone = node.cloneNode(false);
  clone.textContent = words.join(" ");
  return clone.outerHTML || "";
}

function splitParagraphIntoHtmlChunks(node, maxWords) {
  if (!node) {
    return [];
  }
  var text = (node.textContent || "").trim();
  if (!text) {
    return [node.outerHTML || ""];
  }
  var words = text.split(/\s+/).filter(function(word) {
    return word && word.length > 0;
  });
  if (words.length <= maxWords) {
    return [node.outerHTML || ""];
  }
  var chunks = [];
  var buffer = [];
  for (var index = 0; index < words.length; index += 1) {
    buffer.push(words[index]);
    if (buffer.length >= maxWords) {
      chunks.push(convertWordsToHtml(node, buffer));
      buffer = [];
    }
  }
  if (buffer.length > 0) {
    chunks.push(convertWordsToHtml(node, buffer));
  }
  return chunks;
}

// ===== paddt 文本分割/转换封装 (中文解释: paddt 文本处理包装) =====
function convertPaddtWordsToHtml(node, words) {
  return convertWordsToHtml(node, words);
}

function splitPaddtParagraphIntoHtmlChunks(node, maxWords) {
  return splitParagraphIntoHtmlChunks(node, maxWords);
}

class PrintFormFormatter {
  constructor(formEl, config) {
    this.formEl = formEl;
    this.config = config;
    this.debug = Boolean(config.debug);
    // paddt 独立配置 (中文解释: paddt 专用配置)
    this.paddtConfig = getPaddtConfig(formEl, {});
    this.paddtDebug = Boolean(this.paddtConfig.paddtDebug);
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
    // paddt 段落扩展先执行，确保 .paddt 转换为 .paddt-rowitem (中文解释: 先展开 paddt)
    this.expandPaddtSegments();
    this.expandPtacSegments();
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

    // 分离 paddt 行，主流程不渲染 paddt（paddt 将在页脚之后另起分页渲染）
    const allRows = Array.from(this.formEl.querySelectorAll(ROW_SELECTOR));
    const paddtRows = allRows.filter((row) => this.isPaddtRow(row));
    const mainRows = allRows.filter((row) => !this.isPaddtRow(row));
    this.paddtRows = paddtRows;

    return {
      header: this.formEl.querySelector(".pheader"),
      docInfos,
      rowHeader: this.formEl.querySelector(".prowheader"),
      footerVariants,
      footerLogo: this.formEl.querySelector(`.${FOOTER_LOGO_VARIANT.className}`),
      footerPagenum: this.formEl.querySelector(`.${FOOTER_PAGENUM_VARIANT.className}`),
      rows: mainRows
    };
  }

  // paddt 行识别 (中文解释: paddt 行判断)
  isPaddtRow(row) {
    if (!row) {
      return false;
    }
    return (
      row.classList.contains("paddt_segment") ||
      row.classList.contains("paddt") ||
      row.classList.contains("paddt-rowitem") ||
      row.classList.contains("paddt-rowitem_processed")
    );
  }

  isPtacRow(row) {
    if (!row) {
      return false;
    }
    return (
      row.classList.contains("ptac_segment") ||
      row.classList.contains("ptac") ||
      row.classList.contains("ptac-rowitem") ||
      row.classList.contains("ptac-rowitem_processed")
    );
  }

  getRowBaseClass(row) {
    if (!row) {
      return "prowitem";
    }
    if (this.isPaddtRow(row)) return "paddt-rowitem";
    return this.isPtacRow(row) ? "ptac-rowitem" : "prowitem";
  }

  shouldSkipRowHeaderForRow(row) {
    if (!row) {
      return false;
    }
    if (!this.config.repeatRowheader) {
      return false;
    }
    // PTAC
    if (this.isPtacRow(row)) {
      if (this.config.repeatPtacRowheader) return false;
      return true;
    }
    // PADDT
    if (this.isPaddtRow(row)) {
      if (this.paddtConfig && this.paddtConfig.repeatPaddtRowheader) return false;
      return true;
    }
    return false;
  }

  initializePageContext(heightPerPage) {
    return {
      baseLimit: heightPerPage,
      limit: heightPerPage,
      skipRowHeader: false,
      isPtacPage: false,
      isPaddtPage: false
    };
  }

  refreshPageContextForRow(pageContext, row, heights) {
    if (!pageContext) {
      return pageContext;
    }
    const skipRowHeader = this.shouldSkipRowHeaderForRow(row);
    const rowHeaderHeight = heights.rowHeader || 0;
    pageContext.skipRowHeader = skipRowHeader;
    pageContext.isPtacPage = this.isPtacRow(row);
    pageContext.isPaddtPage = this.isPaddtRow(row);
    pageContext.limit = pageContext.baseLimit + (skipRowHeader ? rowHeaderHeight : 0);
    return pageContext;
  }

  shouldSkipDummyRowItemsForContext(pageContext) {
    return Boolean(
      pageContext &&
      (
        (pageContext.isPtacPage && !this.config.insertPtacDummyRowItems) ||
        (pageContext.isPaddtPage && !(this.paddtConfig && this.paddtConfig.insertPaddtDummyRowItems))
      )
    );
  }

  // ===== paddt 段落扩展 (独立管道) =====
  expandPaddtSegments() {
    if (this.formEl.dataset.paddtExpanded === "true") {
      return;
    }
    const paddtTables = Array.from(this.formEl.querySelectorAll(".paddt"));
    if (paddtTables.length === 0) {
      this.formEl.dataset.paddtExpanded = "true";
      return;
    }

    var maxWords = (this.paddtConfig && this.paddtConfig.paddtMaxWordsPerSegment) || PADDT_MAX_WORDS_PER_SEGMENT;

    paddtTables.forEach((paddtRoot) => {
      if (!paddtRoot || paddtRoot.dataset.paddtSegment === "true") {
        return;
      }

      const contentWrapper = paddtRoot.querySelector("td > div") || paddtRoot.querySelector("td");
      if (!contentWrapper) {
        paddtRoot.classList.add("paddt-rowitem", "paddt_segment");
        paddtRoot.dataset.paddtSegment = "true";
        return;
      }

      const allParagraphs = Array.from(contentWrapper.querySelectorAll("p"));
      var headingNode = null;
      if (allParagraphs.length > 1) {
        headingNode = allParagraphs.shift();
      }
      const paragraphs = allParagraphs;

      if (paragraphs.length === 0) {
        paddtRoot.classList.add("paddt-rowitem", "paddt_segment");
        paddtRoot.dataset.paddtSegment = "true";
        return;
      }

      const headingHTML = headingNode ? headingNode.outerHTML : "";
      const paragraphHTML = paragraphs.reduce(function(accumulator, node) {
        const chunks = splitPaddtParagraphIntoHtmlChunks(node, maxWords);
        return accumulator.concat(chunks);
      }, []);

      if (paragraphHTML.length === 0) {
        contentWrapper.innerHTML = headingHTML;
        paddtRoot.classList.add("paddt-rowitem", "paddt_segment");
        paddtRoot.dataset.paddtSegment = "true";
        return;
      }

      const segments = [];
      if (headingHTML) {
        segments.push(headingHTML + paragraphHTML[0]);
        for (var segIndex = 1; segIndex < paragraphHTML.length; segIndex += 1) {
          segments.push(paragraphHTML[segIndex]);
        }
      } else {
        for (var segIndexAlt = 0; segIndexAlt < paragraphHTML.length; segIndexAlt += 1) {
          segments.push(paragraphHTML[segIndexAlt]);
        }
      }

      if (segments.length === 0) {
        contentWrapper.innerHTML = headingHTML;
        paddtRoot.classList.add("paddt-rowitem", "paddt_segment");
        paddtRoot.dataset.paddtSegment = "true";
        return;
      }

      contentWrapper.innerHTML = segments[0];
      paddtRoot.classList.add("paddt-rowitem", "paddt_segment");
      paddtRoot.dataset.paddtSegment = "true";

      var lastNode = paddtRoot;
      for (var index = 1; index < segments.length; index += 1) {
        const clone = paddtRoot.cloneNode(true);
        clone.dataset.paddtSegment = "true";
        const cloneWrapper = clone.querySelector("td > div") || clone.querySelector("td");
        if (cloneWrapper) {
          cloneWrapper.innerHTML = segments[index];
        }
        lastNode.parentNode.insertBefore(clone, lastNode.nextSibling);
        lastNode = clone;
      }
    });

    this.formEl.dataset.paddtExpanded = "true";
  }

  // ===== 既有 PTAC 段落扩展 =====
  expandPtacSegments() {
    if (this.formEl.dataset.ptacExpanded === "true") {
      return;
    }
    const ptacTables = Array.from(this.formEl.querySelectorAll(".ptac"));
    if (ptacTables.length === 0) {
      this.formEl.dataset.ptacExpanded = "true";
      return;
    }

    ptacTables.forEach((ptacRoot) => {
      if (!ptacRoot || ptacRoot.dataset.ptacSegment === "true") {
        return;
      }

      const contentWrapper = ptacRoot.querySelector("td > div") || ptacRoot.querySelector("td");
      if (!contentWrapper) {
        ptacRoot.classList.add("ptac-rowitem", "ptac_segment");
        ptacRoot.dataset.ptacSegment = "true";
        return;
      }

      const allParagraphs = Array.from(contentWrapper.querySelectorAll("p"));
      var headingNode = null;
      if (allParagraphs.length > 1) {
        headingNode = allParagraphs.shift();
      }
      const paragraphs = allParagraphs;

      if (paragraphs.length === 0) {
        ptacRoot.classList.add("ptac-rowitem", "ptac_segment");
        ptacRoot.dataset.ptacSegment = "true";
        return;
      }

      const headingHTML = headingNode ? headingNode.outerHTML : "";
      const paragraphHTML = paragraphs.reduce(function(accumulator, node) {
        const chunks = splitParagraphIntoHtmlChunks(node, PTAC_MAX_WORDS_PER_SEGMENT);
        return accumulator.concat(chunks);
      }, []);

      if (paragraphHTML.length === 0) {
        contentWrapper.innerHTML = headingHTML;
        ptacRoot.classList.add("ptac-rowitem", "ptac_segment");
        ptacRoot.dataset.ptacSegment = "true";
        return;
      }

      const segments = [];
      if (headingHTML) {
        segments.push(headingHTML + paragraphHTML[0]);
        for (var segIndex = 1; segIndex < paragraphHTML.length; segIndex += 1) {
          segments.push(paragraphHTML[segIndex]);
        }
      } else {
        for (var segIndexAlt = 0; segIndexAlt < paragraphHTML.length; segIndexAlt += 1) {
          segments.push(paragraphHTML[segIndexAlt]);
        }
      }

      if (segments.length === 0) {
        contentWrapper.innerHTML = headingHTML;
        ptacRoot.classList.add("ptac-rowitem", "ptac_segment");
        ptacRoot.dataset.ptacSegment = "true";
        return;
      }

      contentWrapper.innerHTML = segments[0];
      ptacRoot.classList.add("ptac-rowitem", "ptac_segment");
      ptacRoot.dataset.ptacSegment = "true";

      var lastNode = ptacRoot;
      for (var index = 1; index < segments.length; index += 1) {
        const clone = ptacRoot.cloneNode(true);
        clone.dataset.ptacSegment = "true";
        const cloneWrapper = clone.querySelector("td > div") || clone.querySelector("td");
        if (cloneWrapper) {
          cloneWrapper.innerHTML = segments[index];
        }
        lastNode.parentNode.insertBefore(clone, lastNode.nextSibling);
        lastNode = clone;
      }
    });

    this.formEl.dataset.ptacExpanded = "true";
  }

  createFooterSpacerTemplate() {
    const spacer = document.createElement("div");
    spacer.classList.add("pfooter_spacer", "paper_width");
    spacer.style.height = "0px";
    return spacer;
  }

  ensureFirstPageSections(container, sections, heights, logFn, skipRowHeader) {
    let consumedHeight = 0;
    if (sections.header) {
      DomHelpers.appendClone(container, sections.header, logFn, "pheader");
      if (!this.config.repeatHeader) {
        consumedHeight += heights.header;
      }
    }
    sections.docInfos.forEach((docInfo) => {
      const clone = DomHelpers.appendClone(container, docInfo.element, logFn, docInfo.className);
      this.registerPageNumberClone(clone);
      if (!this.config[docInfo.repeatFlag]) {
        consumedHeight += heights.docInfos[docInfo.key] || 0;
      }
    });
    if (sections.rowHeader && !skipRowHeader) {
      DomHelpers.appendClone(container, sections.rowHeader, logFn, "prowheader");
      if (!this.config.repeatRowheader) {
        consumedHeight += heights.rowHeader;
      }
    }
    return consumedHeight;
  }

  appendRepeatingSections(container, sections, logFn, skipRowHeader) {
    if (this.config.repeatHeader) {
      DomHelpers.appendClone(container, sections.header, logFn, "pheader");
    }
    sections.docInfos.forEach((docInfo) => {
      if (this.config[docInfo.repeatFlag]) {
        const clone = DomHelpers.appendClone(container, docInfo.element, logFn, docInfo.className);
        this.registerPageNumberClone(clone);
      }
    });
    if (this.config.repeatRowheader && !skipRowHeader) {
      DomHelpers.appendClone(container, sections.rowHeader, logFn, "prowheader");
    }
  }

  registerPageNumberClone(node) {
    if (!node) {
      return false;
    }
    if (!node.querySelector("[data-page-number], [data-page-total], [data-page-number-container]")) {
      return false;
    }
    updatePageNumberContent(node, this.currentPage, null);
    this.pageNumberClones.push({ node, pageNumber: this.currentPage });
    return true;
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
    container.appendChild(clone);
    this.registerPageNumberClone(clone);
    if (logFn) {
      logFn(`append ${FOOTER_PAGENUM_VARIANT.className} page ${this.currentPage}`);
    }
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
    const pageContext = this.initializePageContext(heightPerPage);
    sections.rows.forEach((row, index) => {
      const rowHeight = DomHelpers.measureHeight(row);
      const baseClass = this.getRowBaseClass(row);
      const isPtacRow = this.isPtacRow(row);
      const isPaddtRow = this.isPaddtRow(row);
      if (!rowHeight) {
        DomHelpers.markAsProcessed(row, baseClass);
        return;
      }

      if (currentHeight === 0) {
        this.refreshPageContextForRow(pageContext, row, heights);
        currentHeight += this.ensureFirstPageSections(
          container,
          sections,
          heights,
          logFn,
          pageContext.skipRowHeader
        );
      }

      currentHeight += rowHeight;
      DomHelpers.markAsProcessed(row, baseClass);

      if (row.classList.contains("tb_page_break_before")) {
        currentHeight -= rowHeight;
        const skipDummyRowItems = this.shouldSkipDummyRowItemsForContext(pageContext);
        const nextSkipRowHeader = this.shouldSkipRowHeaderForRow(row);
        currentHeight = this.prepareNextPage(
          container,
          sections,
          logFn,
          pageContext.limit,
          currentHeight,
          footerState,
          footerSpacerTemplate,
          nextSkipRowHeader,
          skipDummyRowItems
        );
        this.refreshPageContextForRow(pageContext, row, heights);
        DomHelpers.appendRowItem(container, row, logFn, index, baseClass);
        currentHeight = rowHeight;
        if (!isPtacRow) {
          pageContext.isPtacPage = false;
        }
        if (!isPaddtRow) {
          pageContext.isPaddtPage = false;
        }
      } else if (currentHeight <= pageContext.limit) {
        DomHelpers.appendRowItem(container, row, logFn, index, baseClass);
        if (!isPtacRow) {
          pageContext.isPtacPage = false;
        }
        if (!isPaddtRow) {
          pageContext.isPaddtPage = false;
        }
      } else {
        currentHeight -= rowHeight;
        const skipDummyRowItems = this.shouldSkipDummyRowItemsForContext(pageContext);
        const nextSkipRowHeader = this.shouldSkipRowHeaderForRow(row);
        currentHeight = this.prepareNextPage(
          container,
          sections,
          logFn,
          pageContext.limit,
          currentHeight,
          footerState,
          footerSpacerTemplate,
          nextSkipRowHeader,
          skipDummyRowItems
        );
        this.refreshPageContextForRow(pageContext, row, heights);
        DomHelpers.appendRowItem(container, row, logFn, index, baseClass);
        currentHeight = rowHeight;
        if (!isPtacRow) {
          pageContext.isPtacPage = false;
        }
        if (!isPaddtRow) {
          pageContext.isPaddtPage = false;
        }
      }
    });
    return {
      currentHeight,
      pageLimit: pageContext.limit,
      isPtacPage: pageContext.isPtacPage,
      isPaddtPage: pageContext.isPaddtPage
    };
  }

  prepareNextPage(
    container,
    sections,
    logFn,
    pageLimit,
    currentHeight,
    footerState,
    spacerTemplate,
    skipRowHeader,
    skipDummyRowItems
  ) {
    const filledHeight = this.applyRemainderSpacing(
      container,
      pageLimit,
      currentHeight,
      footerState,
      spacerTemplate,
      {
        skipDummyRowItems
      }
    );
    this.appendRepeatingFooters(container, sections, logFn);
    container.appendChild(DomHelpers.createPageBreakDivider());
    this.currentPage += 1;
    this.appendRepeatingSections(container, sections, logFn, skipRowHeader);
    return filledHeight;
  }

  applyRemainderSpacing(container, heightPerPage, currentHeight, footerState, spacerTemplate, options) {
    const skipDummyRowItems = options && options.skipDummyRowItems;
    let workingHeight = normalizeHeight(currentHeight);
    if (!skipDummyRowItems) {
      workingHeight = applyDummyRowItemsStep(this.config, container, heightPerPage, workingHeight);
    }
    workingHeight = applyDummyRowStep(this.config, container, heightPerPage, workingHeight);
    const spacerState = applyFooterSpacerWithDummyStep(
      this.config,
      container,
      heightPerPage,
      workingHeight,
      skipDummyRowItems
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
    if (this.config.repeatHeader && sections.header) {
      available -= heights.header;
    }
    sections.docInfos.forEach((docInfo) => {
      if (this.config[docInfo.repeatFlag]) {
        available -= heights.docInfos[docInfo.key] || 0;
      }
    });
    if (this.config.repeatRowheader && sections.rowHeader) {
      available -= heights.rowHeader;
    }
    sections.footerVariants.forEach((footer) => {
      if (this.config[footer.repeatFlag]) {
        available -= heights.footerVariants[footer.key] || 0;
      }
    });
    if (this.config.repeatFooterLogo && sections.footerLogo) {
      available -= heights.footerLogo;
    }
    if (this.config.repeatFooterPagenum && sections.footerPagenum) {
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

  finalizeDocument(
    container,
    sections,
    footerState,
    defaultHeightPerPage,
    renderState,
    spacerTemplate,
    logFn
  ) {
    const baseHeight = renderState ? renderState.currentHeight : 0;
    const lastPageLimit = renderState && renderState.pageLimit
      ? renderState.pageLimit
      : defaultHeightPerPage;
    const skipDummyRowItems = Boolean(
      renderState &&
      (
        (renderState.isPtacPage && !this.config.insertPtacDummyRowItems) ||
        (renderState.isPaddtPage && !(this.paddtConfig && this.paddtConfig.insertPaddtDummyRowItems))
      )
    );
    const allowance = footerState.totalFinal - footerState.repeating;
    const heightWithFinalFooters = baseHeight + allowance;
    if (heightWithFinalFooters <= lastPageLimit) {
      this.applyRemainderSpacing(
        container,
        lastPageLimit,
        heightWithFinalFooters,
        footerState,
        spacerTemplate,
        {
          skipDummyRowItems
        }
      );
      this.appendFinalFooters(container, sections, logFn);
      return;
    }

    this.prepareNextPage(
      container,
      sections,
      logFn,
      lastPageLimit,
      baseHeight,
      footerState,
      spacerTemplate,
      false,
      skipDummyRowItems
    );

    const finalPageStartHeight = allowance;
    this.applyRemainderSpacing(
      container,
      defaultHeightPerPage,
      finalPageStartHeight,
      footerState,
      spacerTemplate,
      null
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
    const renderState = this.renderRows(
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
      renderState,
      footerSpacerTemplate,
      logFn
    );

    // paddt after footer005: paddt 页面要有 footer logo 与页码（仅此两类），并在所有常规页脚之后开始
    if (this.paddtRows && this.paddtRows.length) {
      // 先强制换页并推进页码（确保 paddt 出现在 footer005 之后）
      container.appendChild(DomHelpers.createPageBreakDivider());
      this.currentPage += 1;

      // PADDT: filter docInfos per PADDT-specific toggles (defaults to true for backward compatibility)
      var paddtDocinfoFlags = {
        docInfo: this.paddtConfig.repeatPaddtDocinfo,
        docInfo002: this.paddtConfig.repeatPaddtDocinfo002,
        docInfo003: this.paddtConfig.repeatPaddtDocinfo003,
        docInfo004: this.paddtConfig.repeatPaddtDocinfo004,
        docInfo005: this.paddtConfig.repeatPaddtDocinfo005
      };
      var paddtDocInfos = sections.docInfos.filter(function(di) {
        var flag = paddtDocinfoFlags[di.key];
        return flag === undefined ? true : !!flag;
      });

      const paddtSections = {
        header: sections.header,
        docInfos: paddtDocInfos,
        rowHeader: sections.rowHeader,
        // 不包含业务 footer（如 pfooter/pfooter002...），仅保留 logo 与页码
        footerVariants: [],
        footerLogo: sections.footerLogo,
        footerPagenum: sections.footerPagenum,
        rows: this.paddtRows
      };

      // 计算 paddt 页脚状态与可用高度（考虑 repeatFooterLogo/repeatFooterPagenum）
      const paddtFooterState = this.computeFooterState(paddtSections, heights);
      const paddtHeightPerPage = this.computeHeightPerPage(paddtSections, heights);

      const paddtRenderState = this.renderRows(
        container,
        paddtSections,
        heights,
        paddtFooterState,
        paddtHeightPerPage,
        footerSpacerTemplate,
        logFn
      );

      this.finalizeDocument(
        container,
        paddtSections,
        paddtFooterState,
        paddtHeightPerPage,
        paddtRenderState,
        footerSpacerTemplate,
        logFn
      );
    }

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
})(typeof window !== "undefined" ? window : this);
