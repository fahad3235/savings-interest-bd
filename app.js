/* Savings Interest BD — UI logic: tabs, i18n, storage, forms. */
(function () {
"use strict";
var C = window.SavingsCalc;
function $(id) { return document.getElementById(id); }

var I18N = {
en: {
  appTitle: "Savings Interest BD", appSub: "DPS & FDR maturity calculator",
  tabDps: "DPS", tabFdr: "FDR", tabCompare: "Compare", tabHistory: "History",
  dpsTitle: "DPS — monthly deposit growth",
  dpsDesc: "See what regular monthly deposits grow into. Deposits are assumed at the start of each month, compounded monthly.",
  monthly: "Monthly installment (৳)", tenure: "Tenure", months: "months", years: "years",
  rate: "Annual interest rate (%)",
  rateHint: "Enter your bank\u2019s actual rate \u2014 the default value is only an example.",
  calculate: "Calculate", maturity: "Maturity value", invested: "Total deposited",
  interest: "Interest earned", growthTitle: "Year-by-year growth", colYear: "Year",
  scheduleNote: "Annuity-due: each deposit is assumed at the start of its month, compounded monthly.",
  saveCompare: "Save to compare",
  compareFull: "Compare list is full (max 3). Remove one to add another.",
  fdrTitle: "FDR — fixed deposit maturity",
  fdrDesc: "One-time deposit growth. Choose the interest method your bank uses.",
  principal: "Deposit amount (৳)", compounding: "Interest method",
  simple: "Simple interest", quarterly: "Quarterly compounding",
  compareTitle: "Compare schemes", compareDesc: "Up to 3 saved schemes, side by side.",
  compareEmpty: "Nothing to compare yet. Run a DPS or FDR calculation, then press \u201cSave to compare\u201d.",
  scheme: "Scheme", type: "Type", yield: "Yield", remove: "Remove", clearAll: "Clear all",
  best: "best",
  historyTitle: "Calculation history",
  historyEmpty: "No calculations yet. Your recent calculations will appear here, newest first.",
  delete: "Delete",
  err_required: "This field is required.", err_number: "Enter a valid number.",
  err_positive: "Must be greater than zero.", err_range: "Must be between {min} and {max}.",
  err_rate_range: "Rate must be between 0 and 25%.", err_integer: "Enter a whole number.",
  err_tenure_years: "Years must be between 1 and 10.", err_tenure_months: "Months must be between 1 and 120.",
  dpsSchemeLabel: "DPS \u00b7 {m}/mo \u00d7 {n} mo @ {r}%",
  fdrSchemeLabel: "FDR \u00b7 {p} \u00d7 {n} mo @ {r}%",
  yearLabel: "Year {y}", partialYearLabel: "{y}y {m}m",
  dpsType: "DPS", fdrType: "FDR",
  disclaimer: "Educational tool \u2014 not financial advice. Rates, compounding methods and tax rules vary by bank; confirm with your bank before deciding."
},
bn: {
  appTitle: "\u09b8\u099e\u09cd\u099a\u09af\u09bc \u09b8\u09c1\u09a6 \u09ac\u09bf\u09a1\u09bf", appSub: "\u09a1\u09bf\u09aa\u09bf\u098f\u09b8 \u0993 \u098f\u09ab\u09a1\u09bf\u0986\u09b0 \u09ae\u09c7\u09af\u09bc\u09be\u09a6\u09aa\u09c2\u09b0\u09cd\u09a4\u09bf \u0995\u09cd\u09af\u09be\u09b2\u0995\u09c1\u09b2\u09c7\u099f\u09b0",
  tabDps: "\u09a1\u09bf\u09aa\u09bf\u098f\u09b8", tabFdr: "\u098f\u09ab\u09a1\u09bf\u0986\u09b0", tabCompare: "\u09a4\u09c1\u09b2\u09a8\u09be", tabHistory: "\u0987\u09a4\u09bf\u09b9\u09be\u09b8",
  dpsTitle: "\u09a1\u09bf\u09aa\u09bf\u098f\u09b8 \u2014 \u09ae\u09be\u09b8\u09bf\u0995 \u09b8\u099e\u09cd\u099a\u09af\u09bc \u09ac\u09c3\u09a6\u09cd\u09a7\u09bf",
  dpsDesc: "\u09a8\u09bf\u09af\u09bc\u09ae\u09bf\u09a4 \u09ae\u09be\u09b8\u09bf\u0995 \u099c\u09ae\u09be \u0995\u09a4 \u09b9\u09ac\u09c7 \u09a6\u09c7\u0996\u09c1\u09a8\u0964 \u09aa\u09cd\u09b0\u09a4\u09bf \u09ae\u09be\u09b8\u09c7\u09b0 \u09b6\u09c1\u09b0\u09c1\u09a4\u09c7 \u099c\u09ae\u09be \u09a7\u09b0\u09be \u09b9\u09af\u09bc, \u09ae\u09be\u09b8\u09bf\u0995 \u099a\u0995\u09cd\u09b0\u09ac\u09c3\u09a6\u09cd\u09a7\u09bf\u09a4\u09c7\u0964",
  monthly: "\u09ae\u09be\u09b8\u09bf\u0995 \u0995\u09bf\u09b8\u09cd\u09a4\u09bf (\u09f3)", tenure: "\u09ae\u09c7\u09af\u09bc\u09be\u09a6", months: "\u09ae\u09be\u09b8", years: "\u09ac\u099b\u09b0",
  rate: "\u09ac\u09be\u09b0\u09cd\u09b7\u09bf\u0995 \u09b8\u09c1\u09a6\u09c7\u09b0 \u09b9\u09be\u09b0 (%)",
  rateHint: "\u0986\u09aa\u09a8\u09be\u09b0 \u09ac\u09cd\u09af\u09be\u0902\u0995\u09c7\u09b0 \u09aa\u09cd\u09b0\u0995\u09c3\u09a4 \u09b9\u09be\u09b0 \u09b2\u09bf\u0996\u09c1\u09a8 \u2014 \u09a1\u09bf\u09ab\u09b2\u09cd\u099f \u09ae\u09be\u09a8 \u09b6\u09c1\u09a7\u09c1 \u0989\u09a6\u09be\u09b9\u09b0\u09a3\u0964",
  calculate: "\u09b9\u09bf\u09b8\u09be\u09ac \u0995\u09b0\u09c1\u09a8", maturity: "\u09ae\u09c7\u09af\u09bc\u09be\u09a6\u09aa\u09c2\u09b0\u09cd\u09a4\u09bf \u09ae\u09c2\u09b2\u09cd\u09af", invested: "\u09ae\u09cb\u099f \u099c\u09ae\u09be",
  interest: "\u0985\u09b0\u09cd\u099c\u09bf\u09a4 \u09b8\u09c1\u09a6", growthTitle: "\u09ac\u099b\u09b0\u09ad\u09bf\u09a4\u09cd\u09a4\u09bf\u0995 \u09ac\u09c3\u09a6\u09cd\u09a7\u09bf", colYear: "\u09ac\u099b\u09b0",
  scheduleNote: "\u09aa\u09cd\u09b0\u09a4\u09bf \u09ae\u09be\u09b8\u09c7\u09b0 \u09b6\u09c1\u09b0\u09c1\u09a4\u09c7 \u099c\u09ae\u09be \u09a7\u09b0\u09be \u09b9\u09af\u09bc, \u09ae\u09be\u09b8\u09bf\u0995 \u099a\u0995\u09cd\u09b0\u09ac\u09c3\u09a6\u09cd\u09a7\u09bf\u09a4\u09c7\u0964",
  saveCompare: "\u09a4\u09c1\u09b2\u09a8\u09be\u09af\u09bc \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8",
  compareFull: "\u09a4\u09c1\u09b2\u09a8\u09be \u09a4\u09be\u09b2\u09bf\u0995\u09be \u09aa\u09c2\u09b0\u09cd\u09a3 (\u09b8\u09b0\u09cd\u09ac\u09cb\u099a\u09cd\u099a \u09e9)\u0964 \u0986\u09b0\u09c7\u0995\u099f\u09bf \u09af\u09cb\u0997 \u0995\u09b0\u09a4\u09c7 \u098f\u0995\u099f\u09bf \u09ae\u09c1\u099b\u09c1\u09a8\u0964",
  fdrTitle: "\u098f\u09ab\u09a1\u09bf\u0986\u09b0 \u2014 \u09ae\u09c7\u09af\u09bc\u09be\u09a6\u09bf \u0986\u09ae\u09be\u09a8\u09a4",
  fdrDesc: "\u098f\u0995\u0995\u09be\u09b2\u09c0\u09a8 \u0986\u09ae\u09be\u09a8\u09a4\u09c7\u09b0 \u09ac\u09c3\u09a6\u09cd\u09a7\u09bf\u0964 \u0986\u09aa\u09a8\u09be\u09b0 \u09ac\u09cd\u09af\u09be\u0902\u0995 \u09af\u09c7 \u09aa\u09a6\u09cd\u09a7\u09a4\u09bf \u09ac\u09cd\u09af\u09ac\u09b9\u09be\u09b0 \u0995\u09b0\u09c7 \u09a4\u09be \u09ac\u09c7\u099b\u09c7 \u09a8\u09bf\u09a8\u0964",
  principal: "\u099c\u09ae\u09be\u09b0 \u09aa\u09b0\u09bf\u09ae\u09be\u09a3 (\u09f3)", compounding: "\u09b8\u09c1\u09a6\u09c7\u09b0 \u09aa\u09a6\u09cd\u09a7\u09a4\u09bf",
  simple: "\u09b8\u09b0\u09b2 \u09b8\u09c1\u09a6", quarterly: "\u09a4\u09cd\u09b0\u09c8\u09ae\u09be\u09b8\u09bf\u0995 \u099a\u0995\u09cd\u09b0\u09ac\u09c3\u09a6\u09cd\u09a7\u09bf",
  compareTitle: "\u09b8\u09cd\u0995\u09bf\u09ae \u09a4\u09c1\u09b2\u09a8\u09be", compareDesc: "\u09b8\u09b0\u09cd\u09ac\u09cb\u099a\u09cd\u099a \u09e9\u099f\u09bf \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09b8\u09cd\u0995\u09bf\u09ae, \u09aa\u09be\u09b6\u09be\u09aa\u09be\u09b6\u09bf\u0964",
  compareEmpty: "\u098f\u0996\u09a8\u09cb \u09a4\u09c1\u09b2\u09a8\u09be\u09b0 \u0995\u09bf\u099b\u09c1 \u09a8\u09c7\u0987\u0964 \u09a1\u09bf\u09aa\u09bf\u098f\u09b8 \u09ac\u09be \u098f\u09ab\u09a1\u09bf\u0986\u09b0 \u09b9\u09bf\u09b8\u09be\u09ac \u0995\u09b0\u09c7 \u201c\u09a4\u09c1\u09b2\u09a8\u09be\u09af\u09bc \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8\u201d \u099a\u09be\u09aa\u09c1\u09a8\u0964",
  scheme: "\u09b8\u09cd\u0995\u09bf\u09ae", type: "\u09a7\u09b0\u09a8", yield: "\u09ab\u09b2\u09a8", remove: "\u09ae\u09c1\u099b\u09c1\u09a8", clearAll: "\u09b8\u09ac \u09ae\u09c1\u099b\u09c1\u09a8",
  best: "\u09b8\u09c7\u09b0\u09be",
  historyTitle: "\u09b9\u09bf\u09b8\u09be\u09ac\u09c7\u09b0 \u0987\u09a4\u09bf\u09b9\u09be\u09b8",
  historyEmpty: "\u098f\u0996\u09a8\u09cb \u0995\u09cb\u09a8\u09cb \u09b9\u09bf\u09b8\u09be\u09ac \u09a8\u09c7\u0987\u0964 \u0986\u09aa\u09a8\u09be\u09b0 \u09b8\u09be\u09ae\u09cd\u09aa\u09cd\u09b0\u09a4\u09bf\u0995 \u09b9\u09bf\u09b8\u09be\u09ac\u0997\u09c1\u09b2\u09cb \u098f\u0996\u09be\u09a8\u09c7 \u09a6\u09c7\u0996\u09be \u09af\u09be\u09ac\u09c7\u0964",
  delete: "\u09ae\u09c1\u099b\u09c1\u09a8",
  err_required: "\u098f\u0987 \u0998\u09b0\u099f\u09bf \u09aa\u09c2\u09b0\u09a3 \u0995\u09b0\u09c1\u09a8\u0964", err_number: "\u09b8\u09a0\u09bf\u0995 \u09b8\u0982\u0996\u09cd\u09af\u09be \u09b2\u09bf\u0996\u09c1\u09a8\u0964",
  err_positive: "\u09b6\u09c2\u09a8\u09cd\u09af\u09c7\u09b0 \u09ac\u09c7\u09b6\u09bf \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964", err_range: "{min} \u09a5\u09c7\u0995\u09c7 {max}-\u098f\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964",
  err_rate_range: "\u09b9\u09be\u09b0 \u09e6 \u09a5\u09c7\u0995\u09c7 \u09e8\u09eb%-\u098f\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964", err_integer: "\u09aa\u09c2\u09b0\u09cd\u09a3 \u09b8\u0982\u0996\u09cd\u09af\u09be \u09b2\u09bf\u0996\u09c1\u09a8\u0964",
  err_tenure_years: "\u09ac\u099b\u09b0 \u09e7 \u09a5\u09c7\u0995\u09c7 \u09e7\u09e6-\u098f\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964", err_tenure_months: "\u09ae\u09be\u09b8 \u09e7 \u09a5\u09c7\u0995\u09c7 \u09e7\u09e8\u09e6-\u098f\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964",
  dpsSchemeLabel: "\u09a1\u09bf\u09aa\u09bf\u098f\u09b8 \u00b7 {m}/\u09ae\u09be\u09b8 \u00d7 {n} \u09ae\u09be\u09b8 @ {r}%",
  fdrSchemeLabel: "\u098f\u09ab\u09a1\u09bf\u0986\u09b0 \u00b7 {p} \u00d7 {n} \u09ae\u09be\u09b8 @ {r}%",
  yearLabel: "{y}\u09a4\u09ae \u09ac\u099b\u09b0", partialYearLabel: "{y}\u09ac {m}\u09ae",
  dpsType: "\u09a1\u09bf\u09aa\u09bf\u098f\u09b8", fdrType: "\u098f\u09ab\u09a1\u09bf\u0986\u09b0",
  disclaimer: "\u09b6\u09bf\u0995\u09cd\u09b7\u09be\u09ae\u09c2\u09b2\u0995 \u099f\u09c1\u09b2 \u2014 \u0986\u09b0\u09cd\u09a5\u09bf\u0995 \u09aa\u09b0\u09be\u09ae\u09b0\u09cd\u09b6 \u09a8\u09af\u09bc\u0964 \u09ac\u09cd\u09af\u09be\u0902\u0995\u09ad\u09c7\u09a6\u09c7 \u09b9\u09be\u09b0, \u099a\u0995\u09cd\u09b0\u09ac\u09c3\u09a6\u09cd\u09a7\u09bf \u09aa\u09a6\u09cd\u09a7\u09a4\u09bf \u0993 \u0995\u09b0 \u09ad\u09bf\u09a8\u09cd\u09a8; \u09b8\u09bf\u09a6\u09cd\u09a7\u09be\u09a8\u09cd\u09a4\u09c7\u09b0 \u0986\u0997\u09c7 \u09ac\u09cd\u09af\u09be\u0902\u0995\u09c7\u09b0 \u09b8\u09be\u09a5\u09c7 \u09a8\u09bf\u09b6\u09cd\u099a\u09bf\u09a4 \u0995\u09b0\u09c1\u09a8\u0964"
}};

var lang = "en";
try { lang = localStorage.getItem("sib-lang") || "en"; } catch (e) { lang = "en"; }
if (lang !== "bn") lang = "en";

var compareList = loadJSON("sib-compare", []);
var historyList = loadJSON("sib-history", []);
var lastDps = null, lastFdr = null;

function loadJSON(key, fallback) {
  try {
    var v = JSON.parse(localStorage.getItem(key));
    return Array.isArray(v) ? v : fallback;
  } catch (e) { return fallback; }
}
function saveJSON(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }

function t(key, params) {
  var s = (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
  if (params) for (var k in params) s = s.split("{" + k + "}").join(String(params[k]));
  return s;
}
function localeTag() { return lang === "bn" ? "bn-BD" : "en-IN"; }
function fmtMoney(n) {
  var v = C.round2(n);
  return "\u09f3" + v.toLocaleString(localeTag(), { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtInt(n) {
  return Math.round(n).toLocaleString(localeTag());
}
function fmtPct(n) {
  return C.round2(n).toLocaleString(localeTag(), { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%";
}
function fmtDate(ts) {
  try { return new Date(ts).toLocaleString(localeTag(), { dateStyle: "medium", timeStyle: "short" }); }
  catch (e) { return new Date(ts).toString(); }
}

/* ---------- language + static text ---------- */
function renderStatic() {
  document.documentElement.lang = lang === "bn" ? "bn" : "en";
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  $("lang-toggle").textContent = lang === "bn" ? "English" : "\u09ac\u09be\u0982\u09b2\u09be";
}

/* ---------- errors ---------- */
function showErr(inputId, res) {
  var el = $("err-" + inputId);
  if (!el) return;
  el.textContent = t(res.key, { min: fmtInt(res.min || 0), max: fmtInt(res.max || 0) });
  el.classList.add("show");
}
function clearErrs(ids) {
  ids.forEach(function (id) {
    var el = $("err-" + id);
    if (el) { el.textContent = ""; el.classList.remove("show"); }
  });
}

/* ---------- tabs ---------- */
function switchTab(name) {
  document.querySelectorAll(".tab").forEach(function (b) {
    b.classList.toggle("active", b.dataset.tab === name);
  });
  document.querySelectorAll(".panel").forEach(function (p) {
    p.classList.toggle("active", p.id === "panel-" + name);
  });
}

/* ---------- DPS ---------- */
function yearLabel(row) {
  if (row.partMonths === 0) return t("yearLabel", { y: fmtInt(row.years) });
  return t("partialYearLabel", { y: fmtInt(row.years), m: fmtInt(row.partMonths) });
}
function renderDpsResults() {
  var d = lastDps; if (!d) return;
  $("dps-maturity").textContent = fmtMoney(d.maturity);
  $("dps-invested").textContent = fmtMoney(d.invested);
  $("dps-interest").textContent = fmtMoney(d.interest);
  var tb = $("dps-schedule"); tb.innerHTML = "";
  C.dpsSchedule(d.monthly, d.months, d.rate).forEach(function (row) {
    var tr = document.createElement("tr");
    tr.innerHTML = "<td></td><td></td><td></td><td></td>";
    tr.children[0].textContent = yearLabel(row);
    tr.children[1].textContent = fmtMoney(row.invested);
    tr.children[2].textContent = fmtMoney(row.maturity);
    tr.children[3].textContent = fmtMoney(row.interest);
    tb.appendChild(tr);
  });
  $("dps-results").hidden = false;
}
function dpsLabel(d) {
  return t("dpsSchemeLabel", { m: fmtInt(d.monthly), n: fmtInt(d.months), r: d.rate });
}
$("dps-form").addEventListener("submit", function (e) {
  e.preventDefault();
  clearErrs(["dps-monthly", "dps-tenure", "dps-rate", "dps-save"]);
  var m = C.validateAmount($("dps-monthly").value, 100, 1000000);
  var tn = C.validateTenure($("dps-tenure").value, $("dps-unit").value);
  var r = C.validateRate($("dps-rate").value);
  var ok = true;
  if (!m.ok) { showErr("dps-monthly", m); ok = false; }
  if (!tn.ok) { showErr("dps-tenure", tn); ok = false; }
  if (!r.ok) { showErr("dps-rate", r); ok = false; }
  if (!ok) { $("dps-results").hidden = true; lastDps = null; return; }
  var mat = C.dpsMaturity(m.value, tn.value, r.value);
  lastDps = { kind: "DPS", monthly: m.value, months: tn.value, rate: r.value,
    invested: m.value * tn.value, maturity: mat, interest: mat - m.value * tn.value };
  renderDpsResults();
  pushHistory(lastDps);
});

/* ---------- FDR ---------- */
function renderFdrResults() {
  var d = lastFdr; if (!d) return;
  $("fdr-maturity").textContent = fmtMoney(d.maturity);
  $("fdr-invested").textContent = fmtMoney(d.invested);
  $("fdr-interest").textContent = fmtMoney(d.interest);
  $("fdr-results").hidden = false;
}
function fdrLabel(d) {
  return t("fdrSchemeLabel", { p: fmtInt(d.invested), n: fmtInt(d.months), r: d.rate });
}
$("fdr-form").addEventListener("submit", function (e) {
  e.preventDefault();
  clearErrs(["fdr-principal", "fdr-tenure", "fdr-rate", "fdr-save"]);
  var p = C.validateAmount($("fdr-principal").value, 1000, 100000000);
  var tn = C.validateTenure($("fdr-tenure").value, $("fdr-unit").value);
  var r = C.validateRate($("fdr-rate").value);
  var ok = true;
  if (!p.ok) { showErr("fdr-principal", p); ok = false; }
  if (!tn.ok) { showErr("fdr-tenure", tn); ok = false; }
  if (!r.ok) { showErr("fdr-rate", r); ok = false; }
  if (!ok) { $("fdr-results").hidden = true; lastFdr = null; return; }
  var mode = document.querySelector('input[name="fdr-mode"]:checked').value;
  var mat = C.fdrMaturity(p.value, tn.value, r.value, mode);
  lastFdr = { kind: "FDR", months: tn.value, rate: r.value, mode: mode,
    invested: p.value, maturity: mat, interest: mat - p.value };
  renderFdrResults();
  pushHistory(lastFdr);
});

/* ---------- compare ---------- */
function addToCompare(item, label) {
  if (compareList.length >= 3) {
    return { ok: false, key: "compareFull" };
  }
  compareList.push({
    id: Date.now() + "-" + Math.floor(Math.random() * 1e6),
    kind: item.kind, label: label,
    invested: C.round2(item.invested), maturity: C.round2(item.maturity),
    interest: C.round2(item.interest)
  });
  saveJSON("sib-compare", compareList);
  return { ok: true };
}
function renderCompare() {
  var wrap = $("compare-wrap"), empty = $("compare-empty"), tb = $("compare-body");
  tb.innerHTML = "";
  $("compare-badge").textContent = fmtInt(compareList.length);
  if (compareList.length === 0) { wrap.hidden = true; empty.hidden = false; return; }
  wrap.hidden = false; empty.hidden = true;
  var bestId = null, bestMat = -Infinity;
  compareList.forEach(function (c) { if (c.maturity > bestMat) { bestMat = c.maturity; bestId = c.id; } });
  compareList.forEach(function (c) {
    var tr = document.createElement("tr");
    if (c.id === bestId && compareList.length > 1) tr.className = "best-row";
    var typeCell = document.createElement("td"); typeCell.textContent = t(c.kind === "DPS" ? "dpsType" : "fdrType");
    var schemeCell = document.createElement("td"); schemeCell.textContent = c.label;
    if (c.id === bestId && compareList.length > 1) {
      var tag = document.createElement("span");
      tag.className = "best-tag"; tag.textContent = t("best");
      schemeCell.appendChild(document.createTextNode(" "));
      schemeCell.appendChild(tag);
    }
    var inv = document.createElement("td"); inv.textContent = fmtMoney(c.invested);
    var mat = document.createElement("td"); mat.textContent = fmtMoney(c.maturity);
    var intr = document.createElement("td"); intr.textContent = fmtMoney(c.interest);
    var yld = document.createElement("td"); yld.textContent = fmtPct(C.effectiveYield(c.interest, c.invested));
    var act = document.createElement("td");
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "mini-btn"; btn.textContent = t("remove");
    btn.setAttribute("data-remove-id", c.id);
    act.appendChild(btn);
    [schemeCell, typeCell, inv, mat, intr, yld, act].forEach(function (td) { tr.appendChild(td); });
    tb.appendChild(tr);
  });
}
$("compare-body").addEventListener("click", function (e) {
  var id = e.target.getAttribute && e.target.getAttribute("data-remove-id");
  if (!id) return;
  compareList = compareList.filter(function (c) { return c.id !== id; });
  saveJSON("sib-compare", compareList);
  renderCompare();
});
$("compare-clear").addEventListener("click", function () {
  compareList = []; saveJSON("sib-compare", compareList); renderCompare();
});
$("dps-save").addEventListener("click", function () {
  clearErrs(["dps-save"]);
  if (!lastDps) return;
  var res = addToCompare(lastDps, dpsLabel(lastDps));
  if (!res.ok) { var el = $("err-dps-save"); el.textContent = t(res.key); el.classList.add("show"); return; }
  renderCompare();
});
$("fdr-save").addEventListener("click", function () {
  clearErrs(["fdr-save"]);
  if (!lastFdr) return;
  var res = addToCompare(lastFdr, fdrLabel(lastFdr));
  if (!res.ok) { var el = $("err-fdr-save"); el.textContent = t(res.key); el.classList.add("show"); return; }
  renderCompare();
});

/* ---------- history ---------- */
function pushHistory(d) {
  var label = d.kind === "DPS" ? dpsLabel(d) : fdrLabel(d);
  historyList.unshift({
    id: Date.now() + "-" + Math.floor(Math.random() * 1e6),
    ts: Date.now(), kind: d.kind, label: label,
    invested: C.round2(d.invested), maturity: C.round2(d.maturity), interest: C.round2(d.interest)
  });
  if (historyList.length > 40) historyList.length = 40;
  saveJSON("sib-history", historyList);
  renderHistory();
}
function renderHistory() {
  var ul = $("history-list"), empty = $("history-empty");
  ul.innerHTML = "";
  $("history-badge").textContent = fmtInt(historyList.length);
  var has = historyList.length > 0;
  empty.hidden = has; ul.hidden = !has; $("history-clear-row").hidden = !has;
  historyList.forEach(function (h) {
    var li = document.createElement("li");
    var left = document.createElement("div");
    var lab = document.createElement("div"); lab.className = "h-label"; lab.textContent = h.label;
    var meta = document.createElement("div"); meta.className = "h-meta"; meta.textContent = fmtDate(h.ts);
    left.appendChild(lab); left.appendChild(meta);
    var mat = document.createElement("div"); mat.className = "h-mat"; mat.textContent = fmtMoney(h.maturity);
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "mini-btn"; btn.textContent = t("delete");
    btn.setAttribute("data-history-id", h.id);
    li.appendChild(left); li.appendChild(mat); li.appendChild(btn);
    ul.appendChild(li);
  });
}
$("history-list").addEventListener("click", function (e) {
  var id = e.target.getAttribute && e.target.getAttribute("data-history-id");
  if (!id) return;
  historyList = historyList.filter(function (h) { return h.id !== id; });
  saveJSON("sib-history", historyList);
  renderHistory();
});
$("history-clear").addEventListener("click", function () {
  historyList = []; saveJSON("sib-history", historyList); renderHistory();
});

/* ---------- wiring ---------- */
document.querySelectorAll(".tab").forEach(function (b) {
  b.addEventListener("click", function () { switchTab(b.dataset.tab); });
});
$("lang-toggle").addEventListener("click", function () {
  lang = lang === "bn" ? "en" : "bn";
  try { localStorage.setItem("sib-lang", lang); } catch (e) {}
  renderStatic();
  renderDpsResults();
  renderFdrResults();
  renderCompare();
  renderHistory();
});

renderStatic();
renderCompare();
renderHistory();
})();
