// src/pages/Search3.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AutoBreadcrumb from "../../components/breadcrumb/AutoBreadcrumb";
import PageMeta from "../../components/PageMeta";
import debounce from "debounce";
import axiosInstance from "../../api/axiosInstance";
import BaseUrlLoader, { loadConfig } from "../../BaseUrlLoader";

/** ===== Types ===== */
interface RxGroupModel {
  id: number;
  rxGroup: string;
  insurancePCNId: number;
}
interface DrugModel {
  id: number;
  name: string;
  ndc: string;
  form: string;
  strength: string;
  drugClassId: number;
  drugClass?: string;
  acq: number;
  awp: number;
  rxcui: number;
}
interface Prescription {
  net?: number;
  ndc?: string;
  drugName?: string;
  drugClassId?: number;
  insuranceId?: number;
  pcn?: string;
  bin?: string;
  binFullName?: string;
}
interface SearchLog {
  rxgroupId: number;
  binId: number;
  pcnId: number;
  drugNDC: string;
  date: string;
  searchType: string;
}

const PAGE_SIZE = 20;

const Search3: React.FC = () => {
  /** Bootstrap config */
  const [ready, setReady] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await loadConfig(); // يضمن ضبط BaseUrlLoader.API_BASE_URL لو محتاجينه في أماكن تانية
      } catch {
        /* غالبًا متحمّل قبل كده */
      } finally {
        setReady(true);
      }
    })();
  }, []);

  /** UI state */
  const [limitSearch, setLimitSearch] = useState(true);

  // RxGroup state
  const [rxGroups, setRxGroups] = useState<RxGroupModel[]>([]);
  const [rxGroupSearchQuery, setRxGroupSearchQuery] = useState("");
  const [showRxGroupSuggestions, setShowRxGroupSuggestions] = useState(false);
  const [selectedRxGroup, setSelectedRxGroup] = useState<RxGroupModel | null>(null);

  // Drug state (with pagination)
  const [drugSearchQuery, setDrugSearchQuery] = useState("");
  const [showDrugSuggestions, setShowDrugSuggestions] = useState(false);
  const [drugs, setDrugs] = useState<DrugModel[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingDrugs, setIsLoadingDrugs] = useState(false);
  const drugDropdownRef = useRef<HTMLUListElement | null>(null);

  // NDC state
  const [selectedDrug, setSelectedDrug] = useState<DrugModel | null>(null);
  const [ndcList, setNdcList] = useState<string[]>([]);
  const [ndcSearchQuery, setNdcSearchQuery] = useState("");
  const [showNdcSuggestions, setShowNdcSuggestions] = useState(false);
  const [selectedNdc, setSelectedNdc] = useState("");

  // Details (GET /drug/GetDetails عبر axiosInstance)
  const [netDetails, setNetDetails] = useState<Prescription | null>(null);

  const hideAllSuggestions = () => {
    setShowRxGroupSuggestions(false);
    setShowDrugSuggestions(false);
    setShowNdcSuggestions(false);
  };

  /** Fetch RxGroups (AUTH via axiosInstance) */
  useEffect(() => {
    if (!ready) return;
    (async () => {
      try {
        setApiError(null);
        const { data } = await axiosInstance.get<RxGroupModel[]>("/Insurance/GetAllRxGroups");
        setRxGroups(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (e?.response?.status === 401 || e?.response?.status === 403) {
          setApiError("Rx Groups are restricted by the API (401/403).");
        } else {
          setApiError("Failed to load Rx Groups.");
        }
      }
    })();
  }, [ready]);

  /** Derived lists */
  const filteredRxGroups = useMemo(() => {
    const q = rxGroupSearchQuery.toLowerCase();
    return q ? rxGroups.filter(r => r.rxGroup.toLowerCase().includes(q)) : rxGroups;
  }, [rxGroups, rxGroupSearchQuery]);

  const uniqueDrugNames = useMemo(
    () => Array.from(new Map(drugs.map(d => [d.name, d])).values()),
    [drugs]
  );

  const filteredNdcList = useMemo(() => {
    const q = ndcSearchQuery.toLowerCase();
    return q ? ndcList.filter(n => n.toLowerCase().includes(q)) : ndcList;
  }, [ndcList, ndcSearchQuery]);

  /** Drug search (AUTH via axiosInstance) */
  const fetchDrugsPage = useCallback(
    async (page: number, append = false) => {
      if (!drugSearchQuery.trim()) {
        setDrugs([]);
        setCurrentPage(1);
        return;
      }

      let url = "";
      if (limitSearch && selectedRxGroup) {
        // نفس endpoint بتاعك بالاسم الصحيح (لاحظ Pagintated)
        url = `/drug/GetDrugsByInsuranceNamePagintated?insurance=${encodeURIComponent(
          selectedRxGroup.rxGroup
        )}&drugName=${encodeURIComponent(drugSearchQuery)}&pageNumber=${page}&pageSize=${PAGE_SIZE}`;
      } else {
        url = `/drug/searchByName?name=${encodeURIComponent(
          drugSearchQuery
        )}&pageNumber=${page}&pageSize=${PAGE_SIZE}`;
      }

      try {
        setApiError(null);
        setIsLoadingDrugs(true);
        const { data } = await axiosInstance.get<DrugModel[]>(url);
        const payload = Array.isArray(data) ? data : [];
        setDrugs(prev => (append ? [...prev, ...payload] : payload));
        setCurrentPage(page);
      } catch (e: any) {
        if (e?.response?.status === 401 || e?.response?.status === 403) {
          setApiError("Drug search is restricted by the API (401/403).");
        } else {
          setApiError("Failed to load drugs.");
        }
      } finally {
        setIsLoadingDrugs(false);
      }
    },
    [drugSearchQuery, limitSearch, selectedRxGroup]
  );

  const debouncedDrugSearch = useCallback(
    debounce(() => {
      if (!drugSearchQuery.trim()) {
        setDrugs([]);
        setCurrentPage(1);
        return;
      }
      fetchDrugsPage(1, false);
      setShowDrugSuggestions(true);
    }, 300),
    [fetchDrugsPage, drugSearchQuery]
  );

  useEffect(() => {
    if (!ready) return;
    debouncedDrugSearch();
  }, [ready, drugSearchQuery, limitSearch, selectedRxGroup, debouncedDrugSearch]);

  /** Infinite scroll in drug dropdown */
  useEffect(() => {
    const el = drugDropdownRef.current;
    if (!el) return;
    const onScroll = (e: Event) => {
      const t = e.currentTarget as HTMLElement;
      const atBottom = t.scrollHeight - t.scrollTop <= t.clientHeight + 4;
      if (atBottom && !isLoadingDrugs && uniqueDrugNames.length >= PAGE_SIZE * currentPage) {
        fetchDrugsPage(currentPage + 1, true);
      }
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [uniqueDrugNames, currentPage, isLoadingDrugs, fetchDrugsPage]);

  /** Handlers */
  const onSelectRxGroup = (rg: RxGroupModel) => {
    setSelectedRxGroup(rg);
    setRxGroupSearchQuery(rg.rxGroup);
    setShowRxGroupSuggestions(false);

    // reset downstream
    setDrugSearchQuery("");
    setDrugs([]);
    setCurrentPage(1);

    setSelectedDrug(null);
    setNdcList([]);
    setSelectedNdc("");
    setNdcSearchQuery("");
    setNetDetails(null);
  };

  const onSelectDrug = (drug: DrugModel) => {
    setSelectedDrug(drug);
    setDrugSearchQuery(drug.name);
    setShowDrugSuggestions(false);

    // اجمع الـ NDCs لنفس الاسم من النتائج الحالية
    const ndcs = Array.from(new Set(drugs.filter(d => d.name === drug.name).map(d => d.ndc)));
    setNdcList(ndcs);
    setSelectedNdc(ndcs[0] ?? "");
    setNdcSearchQuery(ndcs[0] ?? "");
  };

  const onSelectNdc = (ndc: string) => {
    setSelectedNdc(ndc);
    setNdcSearchQuery(ndc);
    setShowNdcSuggestions(false);
  };

  /** Fetch Details (AUTH) when NDC + RxGroup are ready */
  useEffect(() => {
    (async () => {
      if (!selectedNdc || !selectedRxGroup) {
        setNetDetails(null);
        return;
      }
      try {
        setApiError(null);
        const { data } = await axiosInstance.get<Prescription>(
          `/drug/GetDetails?ndc=${encodeURIComponent(selectedNdc)}&insuranceId=${selectedRxGroup.id}`
        );
        setNetDetails(data ?? null);

        // إحفظ شوية حاجات زي ما كنت عامل
        if (data) {
          localStorage.setItem("selectedPcn", data.pcn || "");
          localStorage.setItem("selectedBin", `${data?.binFullName || ""} - ${data?.bin || ""}`);
        }
      } catch (e: any) {
        setNetDetails(null);
        if (e?.response?.status === 401 || e?.response?.status === 403) {
          setApiError("Net price is restricted by the API (401/403).");
        } else {
          setApiError("Failed to load drug details.");
        }
      }
    })();
  }, [selectedNdc, selectedRxGroup]);

  /** Clear all */
  const clearAll = () => {
    setSelectedRxGroup(null);
    setRxGroupSearchQuery("");
    setDrugSearchQuery("");
    setDrugs([]);
    setShowDrugSuggestions(false);
    setCurrentPage(1);
    setSelectedDrug(null);
    setNdcList([]);
    setSelectedNdc("");
    setNdcSearchQuery("");
    setNetDetails(null);
    setApiError(null);
  };

  /** Click outside to close suggestion popovers */
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest(".js-suggest")) hideAllSuggestions();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  /** Log before navigate */
  const logAndGo = useCallback(async () => {
    try {
      const details: SearchLog = {
        rxgroupId: selectedRxGroup?.id || 0,
        binId: 0,
        pcnId: 0,
        drugNDC: selectedDrug?.ndc || selectedNdc || "",
        date: new Date().toISOString(),
        searchType: "Search By RXGroup",
      };
      localStorage.setItem("searchLogDetails", JSON.stringify(details));

      const action = `User Search for that NDC: ${details.drugNDC}
using search Type: ${details.searchType}
with the following insurance Data:
BinId: ${details.binId},
PCN: ${details.pcnId},
RxGroup: ${details.rxgroupId}`;

      await axiosInstance.post("/order/ViewDrugDetailsLog", JSON.stringify(action), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      // لو حصل خطأ في اللوج هنكمّل برضه للديتيلز
      console.warn("log error:", e);
    }

    if (selectedRxGroup) {
      localStorage.setItem("selectedRx", selectedRxGroup.rxGroup);
    }

    // روح لصفحة تفاصيل الدوا
    window.location.href = `/drug/${selectedDrug?.id}?ndc=${encodeURIComponent(
      selectedNdc
    )}&insuranceId=${selectedRxGroup?.id}`;
  }, [selectedDrug, selectedNdc, selectedRxGroup]);

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
        title="Rx Group → Drug → NDC (Authorized API)"
        description="Search by Rx Group, then drug and NDC — using authorized API calls (axiosInstance)."
      />

      <div className="d-flex flex-column align-items-center text-center mb-4">
        <AutoBreadcrumb title="RxGroup, Drugs & NDC" />
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="card-header bg- text-white py-4 px-5">
              <h4 className="mb-0 fw-semibold">
                <i className="ti ti-users me-2"></i>
                RxGroup, Drugs & NDC (Authorized API)
              </h4>
              <p className="mb-0 opacity-75 mt-2">
                All reads use your auth Axios client.{" "}
                {apiError && <span className="ms-2 text-warning">{apiError}</span>}
              </p>
            </div>

            <div className="card-body p-5">
              {/* Toggle */}
              <div className="d-flex align-items-center justify-content-between bg-light rounded-3 p-3 mb-4">
                <label htmlFor="limitSearch" className="form-label m-0 fw-medium">
                  <i className="ti ti-filter me-1"></i>
                  Limit search to selected Rx Group
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

              {/* Rx Group */}
              <div className="mb-4 position-relative js-suggest">
                <label className="form-label fw-medium text-dark mb-2">
                  <i className="ti ti-id-badge me-1"></i>
                  Search for Rx Group
                </label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="ti ti-search text-primary" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-2"
                    placeholder="e.g., Medi-Cal…"
                    value={rxGroupSearchQuery}
                    onChange={(e) => setRxGroupSearchQuery(e.target.value)}
                    onFocus={() => {
                      hideAllSuggestions();
                      setShowRxGroupSuggestions(true);
                    }}
                    style={{ height: "52px" }}
                  />
                  {(rxGroupSearchQuery || selectedRxGroup) && (
                    <button
                      className="btn btn-outline-secondary d-flex align-items-center"
                      onClick={clearAll}
                      style={{ height: "52px" }}
                    >
                      <i className="ti ti-x" />
                    </button>
                  )}
                </div>
                {showRxGroupSuggestions && filteredRxGroups.length > 0 && (
                  <ul
                    role="listbox"
                    className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-lg"
                    style={{ maxHeight: 240, overflowY: "auto", zIndex: 1050 }}
                  >
                    {filteredRxGroups.map((rg) => (
                      <li
                        key={rg.id}
                        role="option"
                        tabIndex={0}
                        onClick={() => onSelectRxGroup(rg)}
                        onKeyDown={(e) => e.key === "Enter" && onSelectRxGroup(rg)}
                        className="list-group-item list-group-item-action border-0 py-3 px-4"
                      >
                        {rg.rxGroup}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Drug + NDC */}
              {!!selectedRxGroup && (
                <>
                  {/* Drug */}
                  <div className="mb-4 position-relative js-suggest">
                    <label className="form-label fw-medium text-dark mb-2">
                      <i className="ti ti-pill me-1"></i>
                      Search for Drug
                    </label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="ti ti-search text-primary" />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-2"
                        placeholder="e.g., Metformin"
                        value={drugSearchQuery}
                        onChange={(e) => setDrugSearchQuery(e.target.value)}
                        onFocus={() => {
                          hideAllSuggestions();
                          setShowDrugSuggestions(true);
                        }}
                        style={{ height: "52px" }}
                      />
                    </div>
                    {showDrugSuggestions && uniqueDrugNames.length > 0 && (
                      <ul
                        ref={drugDropdownRef}
                        role="listbox"
                        className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-lg"
                        style={{ maxHeight: 260, overflowY: "auto", zIndex: 1050 }}
                      >
                        {uniqueDrugNames.map((d) => (
                          <li
                            key={d.id}
                            role="option"
                            tabIndex={0}
                            onClick={() => onSelectDrug(d)}
                            onKeyDown={(e) => e.key === "Enter" && onSelectDrug(d)}
                            className="list-group-item list-group-item-action border-0 py-3 px-4"
                          >
                            <div className="d-flex align-items-center">
                              <i className="ti ti-pill text-primary me-2"></i>
                              {d.name}
                            </div>
                          </li>
                        ))}
                        {(isLoadingDrugs || uniqueDrugNames.length >= PAGE_SIZE * currentPage) && (
                          <li className="text-center small text-muted py-3 border-top">
                            <i className="ti ti-loader me-1"></i>
                            Loading more…
                          </li>
                        )}
                      </ul>
                    )}
                  </div>

                  {/* NDC */}
                  {ndcList.length > 0 && (
                    <div className="mb-4 position-relative js-suggest">
                      <label className="form-label fw-medium text-dark mb-2">
                        <i className="ti ti-barcode me-1"></i>
                        Search for NDC
                      </label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="ti ti-search text-primary" />
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-2"
                          placeholder="Type to filter NDCs…"
                          value={ndcSearchQuery}
                          onChange={(e) => setNdcSearchQuery(e.target.value)}
                          onFocus={() => {
                            hideAllSuggestions();
                            setShowNdcSuggestions(true);
                          }}
                          style={{ height: "52px" }}
                        />
                      </div>
                      {showNdcSuggestions && filteredNdcList.length > 0 && (
                        <ul
                          role="listbox"
                          className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-lg"
                          style={{ maxHeight: 240, overflowY: "auto", zIndex: 1050 }}
                        >
                          {filteredNdcList.map((ndc, i) => (
                            <li
                              key={`${ndc}-${i}`}
                              role="option"
                              tabIndex={0}
                              onClick={() => onSelectNdc(ndc)}
                              onKeyDown={(e) => e.key === "Enter" && onSelectNdc(ndc)}
                              className="list-group-item list-group-item-action border-0 py-3 px-4"
                            >
                              <div className="d-flex align-items-center">
                                <i className="ti ti-barcode text-primary me-2"></i>
                                {ndc}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Net preview (/drug/GetDetails) */}
              {selectedDrug && selectedNdc && (
                <div className="alert alert-primary d-flex align-items-center gap-3 p-3 rounded-3 mb-4">
                  <div className="bg-white p-3 rounded-3">
                    <i className="ti ti-currency-dollar text-primary fs-4" />
                  </div>
                  <div>
                    <div className="fw-semibold">Net Price</div>
                    <div className="fs-5 fw-bold">
                      {netDetails?.net != null ? `$${netDetails.net}` : (apiError ? "—" : "…")}
                    </div>
                  </div>
                </div>
              )}

              {/* Action + Log */}
              {selectedDrug && selectedNdc && selectedRxGroup && (
                <button
                  type="button"
                  className="btn btn-primary btn-lg w-100 py-3 fw-semibold"
                  onClick={logAndGo}
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

export default Search3;
