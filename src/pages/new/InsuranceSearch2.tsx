import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import debounce from "debounce";
import axios from "axios";
import PageMeta from "../../components/PageMeta";
import AutoBreadcrumb from "../../components/breadcrumb/AutoBreadcrumb";
import BaseUrlLoader, { loadConfig } from "../../BaseUrlLoader";

/* ===================== Types ===================== */
interface BinModel {
  id: number;
  name?: string;
  bin: string;
  helpDeskNumber?: string;
}
interface PcnModel {
  id: number;
  pcn: string;
  insuranceId: number;
}
interface RxGroupModel {
  id: number;
  rxGroup: string;
  insurancePCNId: number;
}
interface ClassInfo {
  id: number;        // internal id
  classId: number;   // business id
  className: string;
  classType: string; // e.g., ClassV1
}
interface DrugModel {
  id: number;
  name: string;
  ndc: string;
  form: string;
  strength: string;
  classId: number;
  classType: string;
  className: string;
  acq: number;
  awp: number;
  rxcui: number;
  route: string;
  teCode: string;
  ingrdient: string;
  applicationNumber: string;
  applicationType: string;
  strengthUnit: string;
  type: string;
}
interface Prescription {
  net?: number;
  ndc?: string;
  drugName?: string;
  drugClassId?: number;
  insuranceId?: number;
}

/* ===================== Public API client ===================== */
const makePublicApi = () => {
  const api = axios.create({
    baseURL: BaseUrlLoader.API_BASE_URL,
    withCredentials: false,
  });
  // Strip any leaked auth header so requests stay truly "public"
  api.interceptors.request.use((config) => {
    if (config.headers) {
      delete (config.headers as any).Authorization;
      (config.headers as any)["Authorization"] = undefined;
    }
    return config;
  });
  return api;
};

/* ===================== Component ===================== */
const InsuranceSearch2: React.FC = () => {
  const navigate = useNavigate();
  const classType =
    (typeof window !== "undefined" && localStorage.getItem("classType")) ||
    "ClassV1";

  // boot public client
  const [ready, setReady] = useState(false);
  const publicApiRef = useRef<ReturnType<typeof makePublicApi> | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await loadConfig();
      } catch {
        /* ignore if already loaded */
      } finally {
        publicApiRef.current = makePublicApi();
        setReady(true);
      }
    })();
  }, []);

  // toggle / filters
  const [limitSearch, setLimitSearch] = useState(true);

  // BIN → PCN → RxGroup
  const [binQuery, setBinQuery] = useState("");
  const [binSuggestions, setBinSuggestions] = useState<BinModel[]>([]);
  const [showBinSuggestions, setShowBinSuggestions] = useState(false);
  const [selectedBin, setSelectedBin] = useState<BinModel | null>(null);

  const [pcnList, setPcnList] = useState<PcnModel[]>([]);
  const [pcnSearchQuery, setPcnSearchQuery] = useState("");
  const [showPcnSuggestions, setShowPcnSuggestions] = useState(false);
  const filteredPcnList = useMemo(() => {
    const q = pcnSearchQuery.toLowerCase();
    return q ? pcnList.filter((p) => p.pcn.toLowerCase().includes(q)) : pcnList;
  }, [pcnList, pcnSearchQuery]);
  const [selectedPcn, setSelectedPcn] = useState<PcnModel | null>(null);

  const [rxGroups, setRxGroups] = useState<RxGroupModel[]>([]);
  const [rxGroupSearchQuery, setRxGroupSearchQuery] = useState("");
  const [showRxGroupSuggestions, setShowRxGroupSuggestions] = useState(false);
  const filteredRxGroupList = useMemo(() => {
    const q = rxGroupSearchQuery.toLowerCase();
    return q ? rxGroups.filter((r) => r.rxGroup.toLowerCase().includes(q)) : rxGroups;
  }, [rxGroups, rxGroupSearchQuery]);
  const [selectedRxGroup, setSelectedRxGroup] = useState<RxGroupModel | null>(null);

  // Drug Class search (paginated)
  const [drugSearchQuery, setDrugSearchQuery] = useState("");
  const [classInfos, setClassInfos] = useState<ClassInfo[]>([]);
  const [showDrugSuggestions, setShowDrugSuggestions] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const classListRef = useRef<HTMLDivElement | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // drugs & ndc
  const [drugs, setDrugs] = useState<DrugModel[]>([]);
  const [selectedDrug, setSelectedDrug] = useState<DrugModel | null>(null);
  const [ndcList, setNdcList] = useState<string[]>([]);
  const [selectedNdc, setSelectedNdc] = useState("");

  // details preview
  const [netDetails, setNetDetails] = useState<Prescription | null>(null);

  const hideAllSuggestions = () => {
    setShowBinSuggestions(false);
    setShowPcnSuggestions(false);
    setShowRxGroupSuggestions(false);
    setShowDrugSuggestions(false);
  };

  /* ========== BIN suggestions (public) ========== */
  const debouncedBinSearch = useCallback(
    debounce(async (text: string) => {
      if (!publicApiRef.current) return;
      if (!text.trim()) {
        setBinSuggestions([]);
        setShowBinSuggestions(false);
        return;
      }
      try {
        setApiError(null);
        const { data } = await publicApiRef.current.get<BinModel[]>(
          `/drug/GetInsurancesBinsByName?bin=${encodeURIComponent(text)}`
        );
        setBinSuggestions(Array.isArray(data) ? data : []);
        setShowBinSuggestions(true);
      } catch (e: any) {
        if (e?.response?.status === 401 || e?.response?.status === 403) {
          setShowBinSuggestions(false);
          setApiError("BIN endpoint returned 401/403 (public access blocked).");
        } else {
          setApiError("Failed to load BIN suggestions.");
        }
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (!ready) return;
    debouncedBinSearch(binQuery);
  }, [binQuery, ready, debouncedBinSearch]);

  const onSelectBin = async (bin: BinModel) => {
    setSelectedBin(bin);
    setBinQuery(`${bin.name ?? ""}${bin.name ? " - " : ""}${bin.bin}`);
    setShowBinSuggestions(false);

    // reset downstream
    setPcnList([]);
    setSelectedPcn(null);
    setRxGroups([]);
    setSelectedRxGroup(null);
    setDrugSearchQuery("");
    setClassInfos([]);
    setPage(1);
    setDrugs([]);
    setSelectedDrug(null);
    setNdcList([]);
    setSelectedNdc("");
    setNetDetails(null);

    if (!publicApiRef.current) return;
    try {
      setApiError(null);
      const { data } = await publicApiRef.current.get<PcnModel[]>(
        `/drug/GetInsurancesPcnByBinId?binId=${bin.id}`
      );
      setPcnList(Array.isArray(data) ? data : []);
      // mimic your behavior: autoselect Medi-Cal first PCN
      if (bin.name === "Medi-Cal" && data?.[0]) {
        setSelectedPcn(data[0]);
        setPcnSearchQuery(data[0].pcn);
        await onSelectPcn(data[0]);
      }
    } catch (e: any) {
      if (e?.response?.status === 401 || e?.response?.status === 403) {
        setApiError("PCN endpoint returned 401/403 (public access blocked).");
      } else {
        setApiError("Failed to load PCNs.");
      }
    }
  };

  /* ========== PCN → RxGroups (public) ========== */
  const onSelectPcn = async (pcn: PcnModel) => {
    setSelectedPcn(pcn);
    setPcnSearchQuery(pcn.pcn);
    setShowPcnSuggestions(false);

    // reset downstream
    setRxGroups([]);
    setSelectedRxGroup(null);
    setDrugSearchQuery("");
    setClassInfos([]);
    setPage(1);
    setDrugs([]);
    setSelectedDrug(null);
    setNdcList([]);
    setSelectedNdc("");
    setNetDetails(null);

    if (!publicApiRef.current) return;
    try {
      setApiError(null);
      const { data } = await publicApiRef.current.get<RxGroupModel[]>(
        `/drug/GetInsurancesRxByPcnId?pcnId=${pcn.id}`
      );
      setRxGroups(Array.isArray(data) ? data : []);
      // optional auto-select for Medi-Cal
      if (pcn.pcn === "Medi-Cal" && data?.[0]) {
        setSelectedRxGroup(data[0]);
        setRxGroupSearchQuery(data[0].rxGroup);
      }
    } catch (e: any) {
      if (e?.response?.status === 401 || e?.response?.status === 403) {
        setApiError("RxGroup endpoint returned 401/403 (public access blocked).");
      } else {
        setApiError("Failed to load Rx Groups.");
      }
    }
  };

  /* ========== RxGroup select ========== */
  const onSelectRxGroup = (rg: RxGroupModel) => {
    setSelectedRxGroup(rg);
    setRxGroupSearchQuery(rg.rxGroup);
    setShowRxGroupSuggestions(false);

    // reset class/drug
    setDrugSearchQuery("");
    setClassInfos([]);
    setPage(1);
    setDrugs([]);
    setSelectedDrug(null);
    setNdcList([]);
    setSelectedNdc("");
    setNetDetails(null);
  };

  /* ========== Class search (public, paginated) ========== */
  const fetchClasses = useCallback(
    async (pageNumber: number, append = false) => {
      if (!publicApiRef.current) return;
      const q = drugSearchQuery.trim();
      if (!q) {
        setClassInfos([]);
        setPage(1);
        return;
      }

      let url = "";
      if (limitSearch) {
        if (selectedRxGroup) {
          url = `/drug/GetDrugClassesByInsuranceNamePagintated?insurance=${encodeURIComponent(
            selectedRxGroup.rxGroup
          )}&drugClassName=${encodeURIComponent(q)}&pageNumber=${pageNumber}&pageSize=${PAGE_SIZE}&classVersion=${encodeURIComponent(
            classType
          )}`;
        } else if (selectedPcn) {
          url = `/drug/GetDrugClassesByPCNPagintated?insurance=${encodeURIComponent(
            selectedPcn.pcn
          )}&drugClassName=${encodeURIComponent(q)}&pageNumber=${pageNumber}&pageSize=${PAGE_SIZE}&classVersion=${encodeURIComponent(
            classType
          )}`;
        } else if (selectedBin) {
          url = `/drug/GetDrugClassesByBINPagintated?insurance=${encodeURIComponent(
            selectedBin.bin
          )}&drugClassName=${encodeURIComponent(q)}&pageNumber=${pageNumber}&pageSize=${PAGE_SIZE}&classVersion=${encodeURIComponent(
            classType
          )}`;
        } else {
          // user toggled limit but hasn't selected an insurance dimension yet
          setClassInfos([]);
          return;
        }
      } else {
        url = `/drug/GetClassesByName?name=${encodeURIComponent(
          q
        )}&pageNumber=${pageNumber}&pageSize=${PAGE_SIZE}&classVersion=${encodeURIComponent(
          classType
        )}`;
      }

      try {
        setApiError(null);
        const { data } = await publicApiRef.current.get<ClassInfo[]>(url);
        const payload = Array.isArray(data) ? data : [];
        setClassInfos((prev) => (append ? [...prev, ...payload] : payload));
        setPage(pageNumber);
      } catch (e: any) {
        if (e?.response?.status === 401 || e?.response?.status === 403) {
          setApiError("Class search endpoint returned 401/403 (public access blocked).");
        } else {
          setApiError("Failed to load classes.");
        }
      }
    },
    [drugSearchQuery, limitSearch, selectedRxGroup, selectedPcn, selectedBin, classType]
  );

  const debouncedClassSearch = useCallback(
    debounce(() => {
      if (!drugSearchQuery.trim()) {
        setClassInfos([]);
        setPage(1);
        return;
      }
      fetchClasses(1, false);
      setShowDrugSuggestions(true);
    }, 300),
    [fetchClasses, drugSearchQuery]
  );

  useEffect(() => {
    if (!ready) return;
    debouncedClassSearch();
  }, [ready, drugSearchQuery, limitSearch, selectedRxGroup, selectedPcn, selectedBin, debouncedClassSearch]);

  // infinite scroll for class list
  useEffect(() => {
    const el = classListRef.current;
    if (!el) return;
    const onScroll = async () => {
      if (isLoadingMore) return;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
      if (!atBottom) return;

      // naive heuristic: if we got PAGE_SIZE last time, try next page
      if (classInfos.length >= page * PAGE_SIZE) {
        setIsLoadingMore(true);
        try {
          await fetchClasses(page + 1, true);
        } finally {
          setIsLoadingMore(false);
        }
      }
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [classInfos.length, page, isLoadingMore, fetchClasses]);

  /* ========== On class click → fetch drugs (public) ========== */
  const onSelectClass = async (ci: ClassInfo) => {
    if (!publicApiRef.current) return;

    // reset downstream
    setDrugs([]);
    setSelectedDrug(null);
    setNdcList([]);
    setSelectedNdc("");
    setNetDetails(null);
    setShowDrugSuggestions(false);

    try {
      setApiError(null);
      const { data } = await publicApiRef.current.get<DrugModel[]>(
        `/drug/GetDrugsByClassId?classId=${encodeURIComponent(ci.classId)}&classType=${encodeURIComponent(ci.classType)}`
      );
      const arr = Array.isArray(data) ? data : [];
      setDrugs(arr);

      const first = arr[0] || null;
      setSelectedDrug(first);
      const ndcs = Array.from(new Set(arr.map((d) => d.ndc)));
      setNdcList(ndcs);
      setSelectedNdc(ndcs[0] ?? "");
    } catch (e: any) {
      if (e?.response?.status === 401 || e?.response?.status === 403) {
        setApiError("GetDrugsByClassId returned 401/403 (public access blocked).");
      } else {
        setApiError("Failed to load drugs for class.");
      }
    }
  };

  /* ========== Fetch details when NDC + RxGroup are ready (public) ========== */
  useEffect(() => {
    (async () => {
      if (!publicApiRef.current) return;
      if (!selectedNdc || !selectedRxGroup) {
        setNetDetails(null);
        return;
      }
      try {
        setApiError(null);
        const { data } = await publicApiRef.current.get<Prescription>(
          `/drug/GetDetails?ndc=${encodeURIComponent(selectedNdc)}&insuranceId=${encodeURIComponent(
            String(selectedRxGroup.id)
          )}`
        );
        setNetDetails(data ?? null);
      } catch (e: any) {
        if (e?.response?.status === 401 || e?.response?.status === 403) {
          setNetDetails(null);
          setApiError("GetDetails returned 401/403 (public access blocked).");
        } else {
          setNetDetails(null);
          setApiError("Failed to load drug details.");
        }
      }
    })();
  }, [selectedNdc, selectedRxGroup]);

  /* ========== Clear all ========== */
  const clearAll = () => {
    setBinQuery("");
    setBinSuggestions([]);
    setShowBinSuggestions(false);
    setSelectedBin(null);

    setPcnList([]);
    setPcnSearchQuery("");
    setShowPcnSuggestions(false);
    setSelectedPcn(null);

    setRxGroups([]);
    setRxGroupSearchQuery("");
    setShowRxGroupSuggestions(false);
    setSelectedRxGroup(null);

    setDrugSearchQuery("");
    setClassInfos([]);
    setShowDrugSuggestions(false);
    setPage(1);

    setDrugs([]);
    setSelectedDrug(null);
    setNdcList([]);
    setSelectedNdc("");
    setNetDetails(null);

    setApiError(null);
  };

  if (!ready) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status" />
      </div>
    );
  }

  return (
    <div className="container mid py-4">
      <PageMeta
        title="Insurance Search (Drug Class)"
        description="Search by BIN → PCN → Rx Group, then by Drug Class — using public endpoints only."
        canonical={window.location.origin + "/insurance-search-2"}
      />

      <div className="d-flex flex-column align-items-center text-center mb-4">
        <AutoBreadcrumb title="Insurance Search (Drug Class)" />
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="card-header bg- text-white py-4 px-5">
              <h4 className="mb-0 fw-semibold">
                <i className="ti ti-building-bank me-2"></i>
                Insurance Search (Drug Class)
              </h4>
              <p className="mb-0 opacity-75 mt-2">
                Type BIN/PCN/Rx Group, then search Drug Class.{" "}
                {apiError && <span className="ms-2 text-warning">{apiError}</span>}
              </p>
            </div>

            <div className="card-body p-5">
              {/* Toggle */}
              <div className="d-flex align-items-center justify-content-between bg-light rounded-3 p-3 mb-4">
                <label htmlFor="limitSearch" className="form-label m-0 fw-medium">
                  <i className="ti ti-filter me-1"></i>
                  Limit search to selected insurance data
                </label>
                <div className="form-check form-switch m-0">
                  <input
                    id="limitSearch"
                    className="form-check-input"
                    type="checkbox"
                    checked={limitSearch}
                    onChange={() => {
                      clearAll();
                      setLimitSearch(!limitSearch);
                    }}
                    style={{ width: "2.5em" }}
                  />
                </div>
              </div>

              {/* Insurance Information */}
              <div className="mb-4">
                <h6 className="mb-3 fw-semibold text-primary border-bottom pb-2">
                  <i className="ti ti-id me-2"></i>
                  Insurance Information
                </h6>

                <div className="row g-3">
                  {/* BIN */}
                  <div className="col-md-6 position-relative">
                    <label className="form-label fw-medium text-dark mb-2">BIN or Insurance Name</label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="ti ti-search text-primary" />
                      </span>
                      <input
                        type="text"
                        value={binQuery}
                        onChange={(e) => setBinQuery(e.target.value)}
                        onFocus={() => {
                          hideAllSuggestions();
                          setShowBinSuggestions(true);
                        }}
                        placeholder="e.g., 610591 or Caremark"
                        className="form-control border-start-0 ps-2"
                        style={{ height: "52px" }}
                      />
                      {binQuery && (
                        <button
                          className="btn btn-outline-secondary d-flex align-items-center"
                          onClick={clearAll}
                          style={{ height: "52px" }}
                        >
                          <i className="ti ti-x" />
                        </button>
                      )}
                    </div>
                    {showBinSuggestions && binSuggestions.length > 0 && (
                      <div
                        className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-lg"
                        style={{ maxHeight: 240, overflowY: "auto", zIndex: 1050 }}
                        role="listbox"
                      >
                        {binSuggestions.map((b) => (
                          <button
                            key={b.id}
                            className="list-group-item list-group-item-action border-0 py-3 px-4 text-start"
                            onClick={() => onSelectBin(b)}
                          >
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="fw-medium">{b.bin}</span>
                              <span className="text-muted small">{b.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* PCN */}
                  {!!selectedBin && (
                    <div className="col-md-6 position-relative">
                      <label className="form-label fw-medium text-dark mb-2">Search for PCN</label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="ti ti-search text-primary" />
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-2"
                          value={pcnSearchQuery}
                          onChange={(e) => setPcnSearchQuery(e.target.value)}
                          onFocus={() => {
                            hideAllSuggestions();
                            setShowPcnSuggestions(true);
                          }}
                          placeholder="e.g., MEDICAL / OPTUM ..."
                          style={{ height: "52px" }}
                        />
                      </div>
                      {showPcnSuggestions && filteredPcnList.length > 0 && (
                        <div
                          className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-lg"
                          style={{ maxHeight: 240, overflowY: "auto", zIndex: 1050 }}
                          role="listbox"
                        >
                          {filteredPcnList.map((p) => (
                            <button
                              key={p.id}
                              className="list-group-item list-group-item-action border-0 py-3 px-4 text-start"
                              onClick={() => onSelectPcn(p)}
                            >
                              {p.pcn}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rx Group */}
                  {rxGroups.length > 0 && (
                    <div className="col-md-6 position-relative">
                      <label className="form-label fw-medium text-dark mb-2">Search for Rx Group</label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="ti ti-search text-primary" />
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-2"
                          value={rxGroupSearchQuery}
                          onChange={(e) => setRxGroupSearchQuery(e.target.value)}
                          onFocus={() => {
                            hideAllSuggestions();
                            setShowRxGroupSuggestions(true);
                          }}
                          placeholder="e.g., Medi-Cal / OPT-RX ..."
                          style={{ height: "52px" }}
                        />
                      </div>
                      {showRxGroupSuggestions && filteredRxGroupList.length > 0 && (
                        <div
                          className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-lg"
                          style={{ maxHeight: 240, overflowY: "auto", zIndex: 1050 }}
                          role="listbox"
                        >
                          {filteredRxGroupList.map((rx) => (
                            <button
                              key={rx.id}
                              className="list-group-item list-group-item-action border-0 py-3 px-4 text-start"
                              onClick={() => onSelectRxGroup(rx)}
                            >
                              {rx.rxGroup}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Drug Class */}
              {!!selectedRxGroup && (
                <div className="mb-4">
                  <h6 className="mb-3 fw-semibold text-primary border-bottom pb-2">
                    <i className="ti ti-pill me-2"></i>
                    Drug Class Information
                  </h6>

                  <div className="position-relative">
                    <label className="form-label fw-medium text-dark mb-2">Search for Drug Class</label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="ti ti-search text-primary" />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-2"
                        value={drugSearchQuery}
                        onChange={(e) => setDrugSearchQuery(e.target.value)}
                        onFocus={() => {
                          hideAllSuggestions();
                          setShowDrugSuggestions(true);
                        }}
                        placeholder="e.g., Statins"
                        style={{ height: "52px" }}
                      />
                    </div>
                    {showDrugSuggestions && drugSearchQuery && (
                      <div
                        ref={classListRef}
                        className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-lg"
                        style={{ maxHeight: 260, overflowY: "auto", zIndex: 1050 }}
                        role="listbox"
                      >
                        {classInfos.map((ci) => (
                          <button
                            key={`${ci.classType}-${ci.classId}-${ci.id}`}
                            className="list-group-item list-group-item-action border-0 py-3 px-4 text-start"
                            onClick={() => onSelectClass(ci)}
                          >
                            <div className="d-flex justify-content-between align-items-center">
                              <span>{ci.className}</span>
                              <span className="text-muted small">{ci.classType}</span>
                            </div>
                          </button>
                        ))}
                        {isLoadingMore && (
                          <div className="text-center small text-muted py-3 border-top">
                            <i className="ti ti-loader me-1"></i>
                            Loading more…
                          </div>
                        )}
                        {classInfos.length === 0 && (
                          <div className="text-center small text-muted py-3">No classes found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* NDC */}
              {ndcList.length > 0 && (
                <div className="mb-4">
                  <h6 className="mb-3 fw-semibold text-primary border-bottom pb-2">
                    <i className="ti ti-barcode me-2"></i>
                    NDC Information
                  </h6>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-medium text-dark mb-2">NDC</label>
                      {ndcList.length === 1 ? (
                        <input className="form-control form-control-lg" value={selectedNdc} readOnly />
                      ) : (
                        <select
                          className="form-select form-select-lg"
                          value={selectedNdc}
                          onChange={(e) => setSelectedNdc(e.target.value)}
                        >
                          {ndcList.map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Drug preview */}
                    {selectedDrug && (
                      <div className="col-md-6">
                        <label className="form-label fw-medium text-dark mb-2">Drug Details</label>
                        <div className="bg-light rounded-3 p-3">
                          <div className="fw-semibold">{selectedDrug.name}</div>
                          <div className="small text-muted">{selectedDrug.className}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Net preview */}
              {selectedDrug && selectedNdc && (
                <div className="alert alert-primary d-flex align-items-center gap-3 p-3 rounded-3 mb-4">
                  <div className="bg-white p-3 rounded-3">
                    <i className="ti ti-currency-dollar text-primary fs-4" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="fw-semibold">Net Price</div>
                    <div className="fs-5 fw-bold">
                      {netDetails?.net != null ? `$${netDetails.net}` : apiError ? "—" : "…"}
                    </div>
                  </div>
                </div>
              )}

              {/* Action */}
              {selectedDrug && selectedNdc && (
                <button
                  className="btn btn-primary btn-lg w-100 py-3 fw-semibold"
                  onClick={() => {
                    // Store the last chosen Rx group label (optional)
                    if (selectedRxGroup?.rxGroup) {
                      localStorage.setItem("selectedRx", selectedRxGroup.rxGroup);
                    }
                    navigate(
                      `/drug/${selectedDrug.id}?ndc=${encodeURIComponent(
                        selectedNdc
                      )}&insuranceId=${selectedRxGroup?.id ?? ""}`
                    );
                  }}
                >
                  <i className="ti ti-file-text me-2"></i>
                  View Drug Details
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
        
    <style>{`
    .mid {
      margin-left: 220px; /* match your sidebar width */
     
    }
  `}
</style>
    </div>
  );
};

export default InsuranceSearch2;
