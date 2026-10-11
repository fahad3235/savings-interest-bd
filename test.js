/* Node unit tests for Savings Interest BD (calc.js core).
 * Anchors hand-verified:
 *  - FDR simple(100000,12,9)   = 100000*(1+0.09)        = 109000        (exact by hand)
 *  - FDR quarterly(100000,12,9)= 100000*1.0225^4        = 109308.33     (exact by hand)
 *  - FDR simple(50000,6,7.5)   = 50000*(1+0.075*0.5)    = 51875         (exact by hand)
 *  - DPS(5000,36,8): annuity-due FV cross-checked as
 *    annuity-immediate * (1+i) = 202677.79 * 1.0066667 = 204028.97
 */
"use strict";
const C = require("./calc.js");
let pass = 0, fail = 0;
function eq(actual, expected, label) {
  if (actual === expected) { pass++; console.log("  ok:", label); }
  else { fail++; console.error("FAIL:", label, "\n  expected:", JSON.stringify(expected), "\n  actual:  ", JSON.stringify(actual)); }
}
function close(actual, expected, label) { // 2-decimal money equality
  eq(C.round2(actual), C.round2(expected), label);
}

// ---- DPS maturity ----
close(C.dpsMaturity(5000, 36, 8), 204028.97, "DPS(5000,36,8) maturity");
close(C.dpsMaturity(5000, 36, 0), 180000.00, "DPS zero rate -> invested only");
close(C.dpsMaturity(1000, 12, 12), 12809.33, "DPS(1000,12,12) maturity");
close(C.dpsMaturity(5000, 36, 8) / (1 + 0.08 / 12), 202677.79, "annuity-due/(1+i) = annuity-immediate");
eq(C.dpsMaturity(0, 36, 8), 0, "DPS zero monthly -> 0");
eq(C.dpsMaturity(5000, 0, 8), 0, "DPS zero months -> 0");

// ---- DPS schedule ----
const s36 = C.dpsSchedule(5000, 36, 8);
eq(s36.length, 3, "36mo schedule has 3 rows");
close(s36[0].invested, 60000, "y1 invested");
close(s36[0].maturity, 62664.63, "y1 maturity");
close(s36[0].interest, 2664.63, "y1 interest");
eq(s36[2].years === 3 && s36[2].partMonths === 0, true, "y3 row marker");
close(s36[2].maturity, C.dpsMaturity(5000, 36, 8), "last row maturity == full FV");
const s40 = C.dpsSchedule(5000, 40, 8);
eq(s40.length, 4, "40mo schedule has 3y + partial row");
eq(s40[3].years === 3 && s40[3].partMonths === 4, true, "partial row is 3y 4m");
close(s40[3].maturity, C.dpsMaturity(5000, 40, 8), "partial row maturity == full FV");
const s5 = C.dpsSchedule(5000, 5, 8);
eq(s5.length, 1, "5mo schedule has 1 partial row");
eq(s5[0].years === 0 && s5[0].partMonths === 5, true, "partial row is 0y 5m");

// ---- FDR maturity ----
close(C.fdrMaturity(100000, 12, 9, "simple"), 109000.00, "FDR simple(100000,12,9)");
close(C.fdrMaturity(100000, 12, 9, "quarterly"), 109308.33, "FDR quarterly(100000,12,9)");
close(C.fdrMaturity(50000, 6, 7.5, "simple"), 51875.00, "FDR simple(50000,6,7.5)");
close(C.fdrMaturity(100000, 12, 0, "simple"), 100000.00, "FDR zero rate");
close(C.fdrMaturity(100000, 12, 0, "quarterly"), 100000.00, "FDR zero rate quarterly");
eq(C.fdrMaturity(100000, 12, 9, "bogus"), C.fdrMaturity(100000, 12, 9, "simple"), "unknown mode falls back to simple");

// ---- effective yield ----
close(C.effectiveYield(24028.97, 180000), 13.35, "yield 24028.97/180000 = 13.35%");
eq(C.effectiveYield(100, 0), 0, "yield with 0 invested -> 0");

// ---- validation ----
let r = C.validateAmount("", 100, 1000000);
eq(r.ok === false && r.key === "err_required", true, "amount empty -> required");
r = C.validateAmount("abc", 100, 1000000);
eq(r.ok === false && r.key === "err_number", true, "amount abc -> number");
r = C.validateAmount("-5", 100, 1000000);
eq(r.ok === false && r.key === "err_positive", true, "amount -5 -> positive");
r = C.validateAmount("0", 100, 1000000);
eq(r.ok === false && r.key === "err_positive", true, "amount 0 -> positive");
r = C.validateAmount("50", 100, 1000000);
eq(r.ok === false && r.key === "err_range", true, "amount 50 < min -> range");
r = C.validateAmount("2000000", 100, 1000000);
eq(r.ok === false && r.key === "err_range", true, "amount > max -> range");
r = C.validateAmount("5,000", 100, 1000000);
eq(r.ok === true && r.value === 5000, true, "amount '5,000' strips commas");
r = C.validateAmount("5000", 100, 1000000);
eq(r.ok === true && r.value === 5000, true, "amount valid");

r = C.validateRate("");
eq(r.key === "err_required", true, "rate empty -> required");
r = C.validateRate("30");
eq(r.key === "err_rate_range", true, "rate 30 -> rate_range");
r = C.validateRate("-1");
eq(r.key === "err_rate_range", true, "rate -1 -> rate_range");
r = C.validateRate("0");
eq(r.ok === true && r.value === 0, true, "rate 0 allowed");
r = C.validateRate("7.5");
eq(r.ok === true && r.value === 7.5, true, "rate 7.5 valid");

r = C.validateTenure("", "months");
eq(r.key === "err_required", true, "tenure empty -> required");
r = C.validateTenure("2.5", "months");
eq(r.key === "err_integer", true, "tenure 2.5 -> integer");
r = C.validateTenure("200", "months");
eq(r.key === "err_tenure_months", true, "tenure 200mo -> tenure_months");
r = C.validateTenure("36", "months");
eq(r.ok === true && r.value === 36, true, "tenure 36mo valid");
r = C.validateTenure("3", "years");
eq(r.ok === true && r.value === 36, true, "tenure 3y -> 36 months");
r = C.validateTenure("11", "years");
eq(r.key === "err_tenure_years", true, "tenure 11y -> tenure_years");

// ---- round2 ----
eq(C.round2(2.005), 2.01, "round2(2.005)=2.01");
eq(C.round2(109308.3333), 109308.33, "round2 banker's-ish");

console.log("\nunit tests: " + pass + " passed, " + fail + " failed (" + (pass + fail) + " total)");
process.exit(fail ? 1 : 0);
