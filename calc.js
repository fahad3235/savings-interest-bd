/* Savings Interest BD — pure calculation + validation core.
 * Works in the browser (window.SavingsCalc) and in Node (module.exports).
 * DPS formula: deposits are made at the START of each month (annuity-due)
 * with monthly compounding: FV = P * (((1+i)^n - 1) / i) * (1+i),
 * where i = annualRate/100/12 and n = months.
 * FDR: simple interest (FV = P*(1 + r*t)) or quarterly compounding,
 * the two conventions most commonly used by Bangladeshi banks.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.SavingsCalc = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function round2(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  /** DPS maturity value. monthly: ৳ per month, months: tenure in months, annualRate: % p.a. */
  function dpsMaturity(monthly, months, annualRate) {
    if (!(monthly > 0) || !(months > 0)) return 0;
    var i = annualRate / 100 / 12;
    if (i === 0) return monthly * months;
    var growth = Math.pow(1 + i, months);
    return monthly * ((growth - 1) / i) * (1 + i);
  }

  /** Year-by-year DPS growth rows: [{label, invested, maturity, interest}].
   *  The last row covers any trailing partial year (e.g. 40 months -> "3y 4m"). */
  function dpsSchedule(monthly, months, annualRate) {
    var rows = [];
    var i = annualRate / 100 / 12;
    function fvAt(k) {
      if (i === 0) return monthly * k;
      return monthly * ((Math.pow(1 + i, k) - 1) / i) * (1 + i);
    }
    var fullYears = Math.floor(months / 12);
    for (var y = 1; y <= fullYears; y++) {
      var k = y * 12, invested = monthly * k, m = fvAt(k);
      rows.push({ years: y, partMonths: 0, invested: invested, maturity: m, interest: m - invested });
    }
    var rem = months % 12;
    if (rem !== 0) {
      var k2 = months, inv2 = monthly * k2, m2 = fvAt(k2);
      rows.push({ years: fullYears, partMonths: rem, invested: inv2, maturity: m2, interest: m2 - inv2 });
    }
    return rows;
  }

  /** FDR maturity value. mode: "simple" | "quarterly". */
  function fdrMaturity(principal, months, annualRate, mode) {
    if (!(principal > 0) || !(months > 0)) return 0;
    var r = annualRate / 100, t = months / 12;
    if (mode === "quarterly") return principal * Math.pow(1 + r / 4, 4 * t);
    return principal * (1 + r * t);
  }

  /** Effective yield as a percentage of the amount invested. */
  function effectiveYield(interest, invested) {
    if (!(invested > 0)) return 0;
    return (interest / invested) * 100;
  }

  // ---------- validation (returns {ok, value} or {ok:false, key, min, max}) ----------
  function validateAmount(str, min, max) {
    if (str === null || str === undefined || String(str).trim() === "")
      return { ok: false, key: "err_required" };
    var v = Number(String(str).replace(/[,\s৳]/g, ""));
    if (!isFinite(v)) return { ok: false, key: "err_number" };
    if (v <= 0) return { ok: false, key: "err_positive" };
    if (v < min || v > max) return { ok: false, key: "err_range", min: min, max: max };
    return { ok: true, value: v };
  }

  function validateRate(str) {
    if (str === null || str === undefined || String(str).trim() === "")
      return { ok: false, key: "err_required" };
    var v = Number(String(str).trim());
    if (!isFinite(v)) return { ok: false, key: "err_number" };
    if (v < 0 || v > 25) return { ok: false, key: "err_rate_range" };
    return { ok: true, value: v };
  }

  function validateTenure(str, unit) {
    if (str === null || str === undefined || String(str).trim() === "")
      return { ok: false, key: "err_required" };
    var raw = Number(String(str).trim());
    if (!isFinite(raw) || Math.floor(raw) !== raw || raw <= 0)
      return { ok: false, key: "err_integer" };
    var months = unit === "years" ? raw * 12 : raw;
    if (unit === "years" && (raw < 1 || raw > 10)) return { ok: false, key: "err_tenure_years" };
    if (unit === "months" && (raw < 1 || raw > 120)) return { ok: false, key: "err_tenure_months" };
    return { ok: true, value: months };
  }

  return {
    round2: round2,
    dpsMaturity: dpsMaturity,
    dpsSchedule: dpsSchedule,
    fdrMaturity: fdrMaturity,
    effectiveYield: effectiveYield,
    validateAmount: validateAmount,
    validateRate: validateRate,
    validateTenure: validateTenure
  };
});
