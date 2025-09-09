// src/pages/new/InsuranceSearch2.tsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import debounce from "debounce";
import axios from "axios";
import PageMeta from "../../components/PageMeta";
import AutoBreadcrumb from "../../components/breadcrumb/AutoBreadcrumb";
import BaseUrlLoader, { loadConfig } from "../../BaseUrlLoader";
import axiosInstance from "../../api/axiosInstance";
import type { SearchLog } from "../../types";

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
  id: number;
  classId: number;
  className: string;
  classType: string;
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
  api.interceptors.request.use((config) => {
    if (config.headers) {
      delete (config.headers as any).Authorization;
      (config.headers as any).Authorization = undefined;
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
    return q
      ? rxGroups.filter((r) => r.rxGroup.toLowerCase().includes(q))
      : rxGroups;
  }, [rxGroups, rxGroupSearchQuery]);
  const [selectedRxGroup, setSelectedRxGroup] = useState<RxGroupModel | null>(
    null
  );

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
  const [searchLog, setSearchLog] = useState<SearchLog | null>(null);

  const hideAllSuggestions = () => {
    setShowBinSuggestions(false);
    setShowPcnSuggestions(false);
    setShowRxGroupSuggestions(false);
    setShowDrugSuggestions(false);
  };

  // Close popovers on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest(".js-suggest")) hideAllSuggestions();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);
  useEffect(() => {
    if (searchLog) {
      localStorage.setItem("searchLogDetails", JSON.stringify(searchLog));
    }
  }, [searchLog]);

  /* =====  ===== BIN suggestions (public) ========== */
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
        const { data } = await axiosInstance.get<BinModel>(
          `/drug/GetInsurancesBinsByName?bin=${encodeURIComponent(text)}`
        );
        const arr = Array.isArray(data) ? data : data ? [data as any] : [];
        setBinSuggestions(arr as BinModel[]);
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
      const { data } = await axiosInstance.get<PcnModel[]>(
        `/drug/GetInsurancesPcnByBinId?binId=${bin.id}`
      );
      setPcnList(Array.isArray(data) ? data : []);
      if (bin.name === "Medi-Cal" && data?.[0]) {
        setSelectedPcn(data[0]);
        setPcnSearchQuery(data[0].pcn);
        await onSelectPcn(data[0]);
      }
    } catch (e: any) {
      if (e?.response?.status === 401 || e?.response?.status === 403)
        setApiError("PCN endpoint returned 401/403 (public access blocked).");
      else setApiError("Failed to load PCNs.");
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
    try {
      setApiError(null);
      const { data } = await axiosInstance.get<RxGroupModel[]>(
        `/drug/GetInsurancesRxByPcnId?pcnId=${pcn.id}`
      );
      setRxGroups(Array.isArray(data) ? data : []);
      if (pcn.pcn === "Medi-Cal" && data?.[0]) {
        setSelectedRxGroup(data[0]);
        setRxGroupSearchQuery(data[0].rxGroup);
      }
    } catch (e: any) {
      if (e?.response?.status === 401 || e?.response?.status === 403)
        setApiError(
          "RxGroup endpoint returned 401/403 (public access blocked)."
        );
      else setApiError("Failed to load Rx Groups.");
    }
  };

  /* ========== Rx Group select ========== */
  const onSelectRxGroup = (rg: RxGroupModel) => {
    setSelectedRxGroup(rg);
    setRxGroupSearchQuery(rg.rxGroup);
    setShowRxGroupSuggestions(false);
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
          )}&drugClassName=${encodeURIComponent(
            q
          )}&pageNumber=${pageNumber}&pageSize=${PAGE_SIZE}&classVersion=${encodeURIComponent(
            classType
          )}`;
        } else if (selectedPcn) {
          url = `/drug/GetDrugClassesByPCNPagintated?insurance=${encodeURIComponent(
            selectedPcn.pcn
          )}&drugClassName=${encodeURIComponent(
            q
          )}&pageNumber=${pageNumber}&pageSize=${PAGE_SIZE}&classVersion=${encodeURIComponent(
            classType
          )}`;
        } else if (selectedBin) {
          url = `/drug/GetDrugClassesByBINPagintated?insurance=${encodeURIComponent(
            selectedBin.bin
          )}&drugClassName=${encodeURIComponent(
            q
          )}&pageNumber=${pageNumber}&pageSize=${PAGE_SIZE}&classVersion=${encodeURIComponent(
            classType
          )}`;
        } else {
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
        const { data } = await axiosInstance.get<ClassInfo[]>(url);
        const payload = Array.isArray(data) ? data : [];
        setClassInfos((prev) => (append ? [...prev, ...payload] : payload));
        setPage(pageNumber);
      } catch (e: any) {
        if (e?.response?.status === 401 || e?.response?.status === 403)
          setApiError(
            "Class search endpoint returned 401/403 (public access blocked)."
          );
        else setApiError("Failed to load classes.");
      }
    },
    [
      drugSearchQuery,
      limitSearch,
      selectedRxGroup,
      selectedPcn,
      selectedBin,
      classType,
    ]
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
  }, [
    ready,
    drugSearchQuery,
    limitSearch,
    selectedRxGroup,
    selectedPcn,
    selectedBin,
    debouncedClassSearch,
  ]);

  // infinite scroll for class list
  useEffect(() => {
    const el = classListRef.current;
    if (!el) return;
    const onScroll = async () => {
      if (isLoadingMore) return;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
      if (!atBottom) return;
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
    setDrugs([]);
    setSelectedDrug(null);
    setNdcList([]);
    setSelectedNdc("");
    setNetDetails(null);
    setShowDrugSuggestions(false);
    try {
      setApiError(null);
      const { data } = await axiosInstance.get<DrugModel[]>(
        `/drug/GetDrugsByClassId?classId=${encodeURIComponent(
          ci.classId
        )}&classType=${encodeURIComponent(ci.classType)}`
      );
      const arr = Array.isArray(data) ? data : [];
      setDrugs(arr);
      const first = arr[0] || null;
      setSelectedDrug(first);
      const ndcs = Array.from(new Set(arr.map((d) => d.ndc)));
      setNdcList(ndcs);
      setSelectedNdc(ndcs[0] ?? "");
    } catch (e: any) {
      if (e?.response?.status === 401 || e?.response?.status === 403)
        setApiError(
          "GetDrugsByClassId returned 401/403 (public access blocked)."
        );
      else setApiError("Failed to load drugs for class.");
    }
  };

  /* ========== Fetch details when NDC + RxGroup are ready (public) ========== */
  useEffect(() => {
    (async () => {
      if (!selectedNdc || !selectedRxGroup) {
        setNetDetails(null);
        return;
      }
      try {
        setApiError(null);
        const { data } = await axiosInstance.get<Prescription>(
          `/drug/GetDetails?ndc=${encodeURIComponent(
            selectedNdc
          )}&insuranceId=${encodeURIComponent(String(selectedRxGroup.id))}`
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

  const drugClassDisabled =
    limitSearch && !selectedRxGroup && !selectedPcn && !selectedBin;

  return (
    <div className="content-area py-3 insurance2-page">
      <PageMeta
        title="Insurance Search (Drug Class)"
        description="Search by BIN → PCN → Rx Group, then by Drug Class — using public endpoints only."
        canonical={window.location.origin + "/insurance-search-2"}
      />

      {/* Centered title & breadcrumb */}
      <div className="d-flex flex-column align-items-center text-center mb-4 mt-4 breadcrumb-xl">
        <div style={{ fontSize: "2.25rem", fontWeight: 700 }}>
          <AutoBreadcrumb title="Insurance Search (Drug Class)" />
        </div>
      </div>

      {/* Same centered lane pattern as DrugSearch */}
      <div className="container-xxl gw-wide">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            {/* let dropdowns escape clipping */}
            <div
              className="card shadow-lg border-0 rounded-4"
              style={{ overflow: "visible" }}
            >
              <div className="card-header text-center py-4 px-5">
                <h4 className="mb-1 fw-semibold">
                  <i className="ti ti-building-bank me-2"></i>
                  Insurance Search (Drug Class)
                </h4>
                <p className="mb-0 text-muted">
                  Type BIN/PCN/Rx Group, then search Drug Class.
                  {apiError && (
                    <span className="ms-2 text-warning">{apiError}</span>
                  )}
                </p>
              </div>

              <div className="card-body p-5">
                {/* Toggle */}
                <div className="d-flex align-items-center justify-content-between bg-light rounded-3 p-3 mb-4">
                  <label
                    htmlFor="limitSearch"
                    className="form-label m-0 fw-medium"
                  >
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

                {/* Inputs grid — ALL visible by default */}
                <div className="row g-4">
                  {/* BIN */}
                  <div className="col-12 col-lg-6 position-relative js-suggest">
                    <label className="form-label fw-medium text-dark mb-2">
                      BIN or Insurance Name
                    </label>
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
                        aria-expanded={showBinSuggestions}
                        aria-controls="bin-suggestions"
                        role="combobox"
                        aria-autocomplete="list"
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
                        id="bin-suggestions"
                        className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-lg"
                        style={{
                          maxHeight: 240,
                          overflowY: "auto",
                          zIndex: 1050,
                        }}
                        role="listbox"
                      >
                        {binSuggestions.map((b) => (
                          <button
                            key={b.id}
                            className="list-group-item list-group-item-action border-0 py-3 px-4 text-start"
                            onClick={() => onSelectBin(b)}
                            role="option"
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
                  <div className="col-12 col-lg-6 position-relative js-suggest">
                    <label className="form-label fw-medium text-dark mb-2">
                      Search for PCN
                    </label>
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
                          if (selectedBin) {
                            hideAllSuggestions();
                            setShowPcnSuggestions(true);
                          }
                        }}
                        placeholder={
                          selectedBin
                            ? "e.g., MEDICAL / OPTUM ..."
                            : "Pick BIN first…"
                        }
                        style={{ height: "52px" }}
                        disabled={!selectedBin || pcnList.length === 0}
                        aria-disabled={!selectedBin || pcnList.length === 0}
                        aria-expanded={showPcnSuggestions}
                        aria-controls="pcn-suggestions"
                        role="combobox"
                        aria-autocomplete="list"
                      />
                    </div>
                    {showPcnSuggestions && filteredPcnList.length > 0 && (
                      <div
                        id="pcn-suggestions"
                        className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-lg"
                        style={{
                          maxHeight: 240,
                          overflowY: "auto",
                          zIndex: 1050,
                        }}
                        role="listbox"
                      >
                        {filteredPcnList.map((p) => (
                          <button
                            key={p.id}
                            className="list-group-item list-group-item-action border-0 py-3 px-4 text-start"
                            onClick={() => onSelectPcn(p)}
                            role="option"
                          >
                            {p.pcn}
                          </button>
                        ))}
                      </div>
                    )}
                    {!selectedBin && (
                      <small className="text-muted">
                        Pick BIN to enable this field.
                      </small>
                    )}
                  </div>

                  {/* Rx Group */}
                  <div className="col-12 col-lg-6 position-relative js-suggest">
                    <label className="form-label fw-medium text-dark mb-2">
                      Search for Rx Group
                    </label>
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
                          if (selectedPcn) {
                            hideAllSuggestions();
                            setShowRxGroupSuggestions(true);
                          }
                        }}
                        placeholder={
                          selectedPcn
                            ? "e.g., Medi-Cal / OPT-RX ..."
                            : "Pick PCN first…"
                        }
                        style={{ height: "52px" }}
                        disabled={!selectedPcn || rxGroups.length === 0}
                        aria-disabled={!selectedPcn || rxGroups.length === 0}
                        aria-expanded={showRxGroupSuggestions}
                        aria-controls="rxgroup-suggestions"
                        role="combobox"
                        aria-autocomplete="list"
                      />
                    </div>
                    {showRxGroupSuggestions && filteredRxGroupList.length > 0 && (
                      <div
                        id="rxgroup-suggestions"
                        className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-lg"
                        style={{
                          maxHeight: 240,
                          overflowY: "auto",
                          zIndex: 1050,
                        }}
                        role="listbox"
                      >
                        {filteredRxGroupList.map((rx) => (
                          <button
                            key={rx.id}
                            className="list-group-item list-group-item-action border-0 py-3 px-4 text-start"
                            onClick={() => onSelectRxGroup(rx)}
                            role="option"
                          >
                            {rx.rxGroup}
                          </button>
                        ))}
                      </div>
                    )}
                    {!selectedPcn && (
                      <small className="text-muted">
                        Choose PCN to enable Rx Groups.
                      </small>
                    )}
                  </div>

                  {/* Drug Class */}
                  <div className="col-12 position-relative js-suggest">
                    <label className="form-label fw-medium text-dark mb-2">
                      Search for Drug Class
                    </label>
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
                          if (!drugClassDisabled) {
                            hideAllSuggestions();
                            setShowDrugSuggestions(true);
                          }
                        }}
                        placeholder={
                          drugClassDisabled
                            ? "Pick BIN → PCN → Rx Group (or disable toggle)..."
                            : "e.g., Statins"
                        }
                        style={{ height: "52px" }}
                        disabled={drugClassDisabled}
                        aria-disabled={drugClassDisabled}
                      />
                    </div>
                    {showDrugSuggestions && !!drugSearchQuery && (
                      <div
                        ref={classListRef}
                        className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-lg"
                        style={{
                          maxHeight: 260,
                          overflowY: "auto",
                          zIndex: 1050,
                        }}
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
                              <span className="text-muted small">
                                {ci.classType}
                              </span>
                            </div>
                          </button>
                        ))}
                        {isLoadingMore && (
                          <div className="text-center small text-muted py-3 border-top">
                            <i className="ti ti-loader me-1"></i> Loading more…
                          </div>
                        )}
                        {classInfos.length === 0 && (
                          <div className="text-center small text-muted py-3">
                            No classes found
                          </div>
                        )}
                      </div>
                    )}
                    {drugClassDisabled && (
                      <small className="text-muted">
                        Choose insurance filters or turn off the toggle to
                        search globally.
                      </small>
                    )}
                  </div>

                  {/* NDC + Drug details */}
                  <div className="col-12 col-lg-6">
                    <label className="form-label fw-medium text-dark mb-2">
                      NDC
                    </label>
                    {ndcList.length <= 1 ? (
                      <input
                        className="form-control form-control-lg"
                        value={selectedNdc}
                        placeholder="—"
                        readOnly
                        disabled={ndcList.length === 0}
                      />
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
                    {ndcList.length === 0 && (
                      <small className="text-muted">
                        Pick a drug class to load NDCs.
                      </small>
                    )}
                  </div>

                  <div className="col-12 col-lg-6">
                    <label className="form-label fw-medium text-dark mb-2">
                      Drug Details
                    </label>
                    <div className="bg-light rounded-3 p-3 h-100">
                      {selectedDrug ? (
                        <>
                          <div className="fw-semibold">{selectedDrug.name}</div>
                          <div className="small text-muted">
                            {selectedDrug.className}
                          </div>
                        </>
                      ) : (
                        <div className="small text-muted">
                          Select a class to preview first drug.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Net preview */}
                  <div className="col-12">
                    <div
                      className={`alert ${
                        selectedDrug && selectedNdc
                          ? "alert-primary"
                          : "alert-light border"
                      } d-flex align-items-center gap-3 p-3 rounded-3`}
                    >
                      <div
                        className={`p-3 rounded-3 ${
                          selectedDrug && selectedNdc ? "bg-white" : "bg-light"
                        }`}
                      >
                        <i
                          className={`ti ti-currency-dollar ${
                            selectedDrug && selectedNdc
                              ? "text-primary"
                              : "text-muted"
                          } fs-4`}
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <div className="fw-semibold">Net Price</div>
                        <div className="fs-5 fw-bold">
                          {selectedDrug && selectedNdc
                            ? netDetails?.net != null
                              ? `$${netDetails.net}`
                              : apiError
                              ? "—"
                              : "…"
                            : "Select NDC to preview"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="mt-2">
                  <button
                    className="btn btn-primary btn-lg w-100 py-3 fw-semibold"
                    onClick={async () => {
                      setSearchLog({
                        rxgroupId: selectedRxGroup?.id || 0,
                        binId: selectedBin?.id || 0,
                        pcnId: selectedPcn?.id || 0,
                        drugNDC: selectedDrug?.ndc || "",
                        date: new Date().toISOString(),
                        searchType:
                          "Search for Drug Class By Full Insurance Data",
                      });
                      const action = `User Search for that NDC: ${
                        selectedDrug?.ndc || ""
                      } 
                    using search Type: Search By Full Insurance 
                    with the following insurance Data: 
                    BinId: ${selectedBin?.id || 0}, 
                    PCN: ${selectedPcn?.id || 0}, 
                    RxGroup: ${selectedRxGroup?.id || 0}`;
                      await axiosInstance.post(
                        "/order/ViewDrugDetailsLog",
                        JSON.stringify(action),
                        { headers: { "Content-Type": "application/json" } }
                      );
                      if (selectedRxGroup?.rxGroup)
                        localStorage.setItem(
                          "selectedRx",
                          selectedRxGroup.rxGroup
                        );
                      localStorage.setItem(
                        "InsuranceId",
                        selectedRxGroup?.id.toString() ?? ""
                      );
                      localStorage.setItem(
                        "DrugId",
                        selectedDrug?.id.toString() ?? ""
                      );
                      localStorage.setItem(
                        "NDCCode",
                        selectedNdc.toString() ?? ""
                      );
                      if (!selectedDrug || !selectedNdc) return;
                      navigate(`/drug-page`);
                    }}
                    disabled={!selectedDrug || !selectedNdc || !selectedRxGroup}
                    title={
                      !selectedDrug || !selectedNdc || !selectedRxGroup
                        ? "Pick BIN → PCN → Rx Group → Class → NDC"
                        : ""
                    }
                  >
                    <i className="ti ti-file-text me-2"></i> View Drug Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Local, page-scoped styles to match the other pages */}
      <style>{`
        /* match DrugSearch layout: centered lane, no sidebar push */
        .content-area{ padding-left: 1rem; padding-right: 1rem; }
        .gw-wide{ max-width: clamp(1100px, 78vw, 1320px); margin-inline: auto; }

        /* Center breadcrumb for this page only */
        .insurance2-page .breadcrumb{ justify-content: center !important; }
        .insurance2-page .breadcrumb .breadcrumb-item{ white-space: nowrap; }

        /* Neutralize any legacy .mid rules that could push content right */
        .mid{ margin-left: 0 !important; }

        /* Keep the larger breadcrumb sizing you had */
        .breadcrumb-xl :where(h1, h2, h3, .breadcrumb-title) { font-size: 2.25rem !important; }
        @media (min-width: 992px) {
          .breadcrumb-xl :where(h1, h2, h3, .breadcrumb-title) { font-size: 3rem !important; }
        }
      `}</style>
    </div>
  );
};

export default InsuranceSearch2;
