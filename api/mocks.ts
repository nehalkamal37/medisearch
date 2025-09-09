// src/api/mockApi.ts
type Api = { get: (url: string) => Promise<{ data: any }> };

export function createMockApi(): Api {
  // ===== helpers =====
  const seeded = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  const pick = <T,>(arr: T[], seed: number) => arr[Math.floor(seeded(seed) * arr.length)];
  const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
  const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
  const ndc11 = (seed: number) => {
    // 11 digits
    const base = Math.floor(1e10 + seeded(seed) * 9e10);
    return String(base).slice(0, 11);
  };

  const DRUGS = [
    { name: "Atorvastatin", className: "Statins", form: "TAB", strength: "20", strengthUnit: "MG", ingrdient: "ATORVASTATIN", route: "ORAL", te: "AB", type: "RX" },
    { name: "Lisinopril", className: "ACE Inhibitors", form: "TAB", strength: "10", strengthUnit: "MG", ingrdient: "LISINOPRIL", route: "ORAL", te: "AB", type: "RX" },
    { name: "Amlodipine", className: "CCB", form: "TAB", strength: "5", strengthUnit: "MG", ingrdient: "AMLODIPINE", route: "ORAL", te: "AB", type: "RX" },
    { name: "Losartan", className: "ARBs", form: "TAB", strength: "50", strengthUnit: "MG", ingrdient: "LOSARTAN", route: "ORAL", te: "AB", type: "RX" },
    { name: "Metformin", className: "Biguanides", form: "TAB", strength: "500", strengthUnit: "MG", ingrdient: "METFORMIN", route: "ORAL", te: "AB", type: "RX" },
  ];
  const BRANCHES = ["LA-01", "LA-02", "SF-01", "OC-01", "SD-01"];
  const RX_GROUPS = [
    { id: 1, name: "Medi-Cal" },
    { id: 2, name: "Medi-Cal Plus" },
    { id: 3, name: "OPT-RX" },
    { id: 4, name: "OPTUM GOLD" },
    { id: 5, name: "Caremark" },
    { id: 6, name: "UHC" },
  ];
  const BINS = [
    { id: 10, name: "Medi-Cal", code: "012345" },
    { id: 11, name: "Caremark", code: "610591" },
    { id: 12, name: "OptumRx", code: "987654" },
    { id: 13, name: "ExpressScripts", code: "004336" },
  ];
  const PCNS = [
    { id: 20, name: "MEDICAL" },
    { id: 21, name: "OPTUM" },
    { id: 22, name: "CMK" },
    { id: 23, name: "MCAL-ALT" },
  ];

  const makeDrug = (seed: number, ov: any = {}) => {
    const d = pick(DRUGS, seed);
    return {
      id: ov.id ?? (seed % 1000) + 1,
      name: ov.name ?? d.name,
      ndc: ov.ndc ?? ndc11(seed),
      rxcui: String(100000 + (seed % 900000)),
      ingrdient: d.ingrdient,
      teCode: d.te,
      type: d.type,
      strength: d.strength,
      strengthUnit: d.strengthUnit,
      form: d.form,
      route: d.route,
      acq: +(10 + seeded(seed) * 60).toFixed(2),
      awp: +(50 + seeded(seed + 1) * 200).toFixed(2),
    };
  };

  const makeRx = (seed: number, ov: any = {}) => {
    const d = pick(DRUGS, seed);
    const rx = pick(RX_GROUPS, seed + 2);
    const bin = pick(BINS, seed + 3);
    const pcn = pick(PCNS, seed + 4);
    const qty = [30, 60, 90][seed % 3];
    const netPer = +(6 + seeded(seed + 5) * 20).toFixed(3);
    const net = +(netPer * qty).toFixed(3);
    const acq = +(10 + seeded(seed + 6) * 60).toFixed(3);
    const ins = +(net + seeded(seed + 7) * 10).toFixed(3);
    const pat = +(seeded(seed + 8) * 15).toFixed(3);
    const ndc = ov.ndcCode ?? ndc11(seed);

    // 1 من كل 5 بدون Insurance (binId = 0)
    const noIns = seed % 5 === 0;

    return {
      drugId: (seed % 1000) + 1,
      drugName: d.name,
      drugClass: d.className,
      form: d.form,
      strength: d.strength,
      strengthUnit: d.strengthUnit,
      ingrdient: d.ingrdient,
      route: d.route,
      teCode: d.te,
      type: d.type,

      ndcCode: ndc,
      quantity: ov.quantity ?? qty,
      net: ov.net ?? net,
      acquisitionCost: ov.acquisitionCost ?? acq,
      insurancePayment: ov.insurancePayment ?? (noIns ? 0 : ins),
      patientPayment: ov.patientPayment ?? pat,
      scriptCode: `RX-${10000 + seed}`,
      branchName: ov.branchName ?? pick(BRANCHES, seed + 9),

      rxgroupId: ov.rxgroupId ?? (noIns ? 0 : rx.id),
      insuranceId: ov.insuranceId ?? (noIns ? 0 : rx.id),
      insuranceName: ov.insuranceName ?? (noIns ? "" : rx.name),
      rxgroup: ov.rxgroup ?? (noIns ? "" : rx.name),

      bin: ov.bin ?? (noIns ? "" : bin.code),
      binFullName: ov.binFullName ?? (noIns ? "" : bin.name),
      binId: ov.binId ?? (noIns ? 0 : bin.id),

      pcn: ov.pcn ?? (noIns ? "" : pcn.name),
      pcnId: ov.pcnId ?? (noIns ? 0 : pcn.id),

      date: daysAgo(seed % 30),
      ...ov,
    };
  };

  const makeMedi = (seed: number) => ({
    drugNDC: ndc11(seed),
    drugName: pick(DRUGS, seed).name,
    priorAuthorization: seed % 3 === 0 ? "Required" : "Not Required",
    extendedDuration: seed % 2 === 0 ? "Yes" : "No",
    costCeilingTier: String((seed % 3) + 1),
    nonCapitatedDrugIndicator: seed % 4 === 0 ? "Yes" : "No",
    ccsPanelAuthority: ["Allowed", "Limited", "Not Approved"][seed % 3],
  });

  function parse(url: string) {
    const u = new URL(url, window.location.origin);
    const p = u.searchParams;
    return {
      path: u.pathname.toLowerCase(),
      id: +(p.get("id") || p.get("drugId") || 1),
      ndc: p.get("ndc") || "",
      insuranceId: +(p.get("insuranceId") || "0"),
      classId: +(p.get("classId") || "1"),
      q: p.get("q") || "",         // optional drug name
      bin: p.get("bin") || "",
      pcn: p.get("pcn") || "",
      branch: p.get("branch") || "",
    };
  }

  return {
    async get(url: string) {
      const q = parse(url);

      // /drug/GetDrugById?id=...
      if (q.path.includes("/drug/getdrugbyid")) {
        const name = q.q ? q.q : undefined;
        return { data: makeDrug(q.id, { name, ndc: q.ndc || ndc11(q.id) }) };
      }

      // /drug/GetClassesByDrugId?drugId=...
      if (q.path.includes("/drug/getclassesbydrugid")) {
        const baseName = pick(DRUGS, q.id).className;
        return {
          data: [
            { id: 100 + q.id, name: baseName, classTypeName: "ClassV1" },
            { id: 200 + q.id, name: baseName, classTypeName: "ClassV2" },
            { id: 300 + q.id, name: baseName, classTypeName: "FormV1" },
          ],
        };
      }

      // /drug/GetDetails?ndc=...&insuranceId=...
      if (q.path.includes("/drug/getdetails")) {
        const seed = q.id * 7 + q.insuranceId * 13;
        const rx = makeRx(seed, {
          ndcCode: q.ndc || ndc11(seed),
          rxgroupId: q.insuranceId || 1,
          insuranceId: q.insuranceId || 1,
        });
        return { data: rx };
      }

      // /drug/GetAllDrugs?classId=...
      if (q.path.includes("/drug/getalldrugs")) {
        const base = q.classId * 17 + q.id;
        const list = Array.from({ length: 50 }, (_, i) => makeRx(base + i));

        // لو جاي بن/بي سي إن من السيرش نزود احتمالية ظهورهم
        const boosted = list.map((r, i) => {
          const factor = 1 + (q.bin ? 0.1 : 0) + (q.pcn ? 0.1 : 0);
          const qty = r.quantity;
          const per = r.net / qty;
          return {
            ...r,
            net: +(per * qty * factor).toFixed(3),
            bin: q.bin || r.bin,
            pcn: q.pcn || r.pcn,
            rxgroupId: q.insuranceId || r.rxgroupId,
            insuranceId: q.insuranceId || r.insuranceId,
            insuranceName:
              q.insuranceId > 0
                ? (RX_GROUPS.find((g) => g.id === q.insuranceId)?.name ?? r.insuranceName)
                : r.insuranceName,
          };
        });

        // sort desc by net per item (زي ما بتعمل في صفحتك)
        boosted.sort(
          (a, b) => b.net / b.quantity - a.net / a.quantity || b.insurancePayment / b.quantity - a.insurancePayment / a.quantity
        );
        return { data: boosted };
      }

      // /drug/GetAllMediDrugs?classId=...
      if (q.path.includes("/drug/getallmedidrugs")) {
        const arr = Array.from({ length: 18 }, (_, i) => makeMedi(q.classId * 4 + i));
        return { data: arr };
      }

      // fallback
      return { data: {} };
    },
  };
}
