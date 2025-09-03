// src/pages/new/InsuranceSearch.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AutoBreadcrumb from "../../components/breadcrumb/AutoBreadcrumb";
import PageMeta from "../../components/PageMeta";
import debounce from "debounce";
import api from "../../api/publicApi";

/** ===== Types ===== */
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
}

const PAGE_SIZE = 20;

const InsuranceSearch: React.FC = () => {
  /** ======== BIN → PCN → Rx Group ======== */
  const [binQuery, setBinQuery] = useState("");
  const [binSuggestions, setBinSuggestions] = useState<BinModel[]>([]);
  const [showBinSuggestions, setShowBinSuggestions] = useState(false);
  const [selectedBin, setSelectedBin] = useState<BinModel | null>(null);

  const [pcnList, setPcnList] = useState<PcnModel[]>([]);
  const [pcnSearchQuery, setPcnSearchQuery] = useState("");
  const [showPcnSuggestions, setShowPcnSuggestions] = useState(false);
  const filteredPcnList = useMemo(() => {
    const q = pcnSearchQuery.toLowerCase();
    return q ? pcnList.filter(p => p.pcn.toLowerCase().includes(q)) : pcnList;
  }, [pcnList, pcnSearchQuery]);
  const [selectedPcn, setSelectedPcn] = useState<PcnModel | null>(null);

  const [rxGroups, setRxGroups] = useState<RxGroupModel[]>([]);
  const [rxGroupSearchQuery, setRxGroupSearchQuery] = useState("");
  const [showRxGroupSuggestions, setShowRxGroupSuggestions] = useState(false);
  const filteredRxGroupList = useMemo(() => {
    const q = rxGroupSearchQuery.toLowerCase();
    return q ? rxGroups.filter(r => r.rxGroup.toLowerCase().includes(q)) : rxGroups;
  }, [rxGroups, rxGroupSearchQuery]);
  const [selectedRxGroup, setSelectedRxGroup] = useState<RxGroupModel | null>(null);

  /** ======== Drug & NDC (API) ======== */
  const [limitSearch, setLimitSearch] = useState(true);
  const [drugSearchQuery, setDrugSearchQuery] = useState("");
  const [showDrugSuggestions, setShowDrugSuggestions] = useState(false);
  const [drugs, setDrugs] = useState<DrugModel[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const drugDropdownRef = useRef<HTMLDivElement | null>(null);
  const [isLoadingDrugs, setIsLoadingDrugs] = useState(false);

  const [selectedDrug, setSelectedDrug] = useState<DrugModel | null>(null);
  const [ndcList, setNdcList] = useState<string[]>([]);
  const [ndcSearchQuery, setNdcSearchQuery] = useState("");
  const [showNdcSuggestions, setShowNdcSuggestions] = useState(false);
  const [selectedNdc, setSelectedNdc] = useState("");

  /** ======== Details (GET /drug/GetDetails) ======== */
  const [netDetails, setNetDetails] = useState<Prescription | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const hideAllSuggestions = () => {
    setShowBinSuggestions(false);
    setShowPcnSuggestions(false);
    setShowRxGroupSuggestions(false);
    setShowDrugSuggestions(false);
    setShowNdcSuggestions(false);
  };

  /** ======== BIN search (API via Option A client) ======== */
  const debouncedBinSearch = useCallback(
    debounce(async (text: string) => {
      if (!text.trim()) {
        setBinSuggestions([]);
        setShowBinSuggestions(false);
        return;
      }
      try {
        setApiError(null);
        const { data } = await api.get<BinModel[]>(
          `/drug/GetInsurancesBinsByName?bin=${encodeURIComponent(text)}`
        );
        setBinSuggestions(Array.isArray(data) ? data : []);
        setShowBinSuggestions(true);
      } catch (e: any) {
        if (e?.response?.status === 401 || e?.response?.status === 403) {
          setShowBinSuggestions(false);
          setApiError("You need to log in to see insurance data.");
        } else {
          setApiError("Failed to load BIN suggestions.");
        }
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedBinSearch(binQuery);
  }, [binQuery, debouncedBinSearch]);

  const onPickBin = async (bin: BinModel) => {
    setSelectedBin(bin);
    setBinQuery(`${bin.name ?? ""}${bin.name ? " - " : ""}${bin.bin}`);
    setShowBinSuggestions(false);

    // reset downstream
    setPcnList([]);
    setSelectedPcn(null);
    setRxGroups([]);
    setSelectedRxGroup(null);
    setDrugs([]);
    setSelectedDrug(null);
    setDrugSearchQuery("");
    setNdcList([]);
    setSelectedNdc("");
    setNdcSearchQuery("");

    try {
      setApiError(null);
      const { data } = await api.get<PcnModel[]>(
        `/drug/GetInsurancesPcnByBinId?binId=${bin.id}`
      );
      setPcnList(Array.isArray(data) ? data : []);
      // auto-pick Medi-Cal first PCN if present (your previous behavior)
      if (bin.name === "Medi-Cal" && data?.[0]) {
        setSelectedPcn(data[0]);
        setPcnSearchQuery(data[0].pcn);
        await onPickPcn(data[0]);
      }
    } catch (e: any) {
      if (e?.response?.status === 401 || e?.response?.status === 403) {
        setApiError("You need to log in to see PCNs for this BIN.");
      } else {
        setApiError("Failed to load PCNs.");
      }
    }
  };

  /** ======== PCN ======== */
  const onPickPcn = async (pcn: PcnModel) => {
    setSelectedPcn(pcn);
    setPcnSearchQuery(pcn.pcn);
    setShowPcnSuggestions(false);

    // reset downstream
    setRxGroups([]);
    setSelectedRxGroup(null);
    setDrugs([]);
    setSelectedDrug(null);
    setDrugSearchQuery("");
    setNdcList([]);
    setSelectedNdc("");
    setNdcSearchQuery("");

    try {
      setApiError(null);
      const { data } = await api.get<RxGroupModel[]>(
        `/drug/GetInsurancesRxByPcnId?pcnId=${pcn.id}`
      );
      setRxGroups(Array.isArray(data) ? data : []);
      // auto-pick first RxGroup for Medi-Cal PCN
      if (pcn.pcn === "Medi-Cal" && data?.[0]) {
        setSelectedRxGroup(data[0]);
        setRxGroupSearchQuery(data[0].rxGroup);
      }
    } catch (e: any) {
      if (e?.response?.status === 401 || e?.response?.status === 403) {
        setApiError("You need to log in to see Rx Groups.");
      } else {
        setApiError("Failed to load Rx Groups.");
      }
    }
  };

  /** ======== Rx Group ======== */
  const onPickRx = (rx: RxGroupModel) => {
    setSelectedRxGroup(rx);
    setRxGroupSearchQuery(rx.rxGroup);
    setShowRxGroupSuggestions(false);

    // reset drug/ndc
    setDrugs([]);
    setSelectedDrug(null);
    setDrugSearchQuery("");
    setNdcList([]);
    setSelectedNdc("");
    setNdcSearchQuery("");
  };

  /** ======== Drug search (API + pagination) ======== */
  const fetchDrugsPage = useCallback(
    async (page: number, append = false) => {
      if (!drugSearchQuery.trim()) {
        setDrugs([]);
        setCurrentPage(1);
        return;
      }

      let url = "";
      if (limitSearch) {
        if (selectedRxGroup) {
          url = `/drug/GetDrugsByInsuranceNamePagintated?insurance=${encodeURIComponent(
            selectedRxGroup.rxGroup
          )}&drugName=${encodeURIComponent(drugSearchQuery)}&pageNumber=${page}&pageSize=${PAGE_SIZE}`;
        } else if (selectedPcn) {
          url = `/drug/GetDrugsByPCNPagintated?insurance=${encodeURIComponent(
            selectedPcn.pcn
          )}&drugName=${encodeURIComponent(drugSearchQuery)}&pageNumber=${page}&pageSize=${PAGE_SIZE}`;
        } else if (selectedBin) {
          url = `/drug/GetDrugsByBINPagintated?insurance=${encodeURIComponent(
            selectedBin.bin
          )}&drugName=${encodeURIComponent(drugSearchQuery)}&pageNumber=${page}&pageSize=${PAGE_SIZE}`;
        }
      } else {
        url = `/drug/searchByName?name=${encodeURIComponent(
          drugSearchQuery
        )}&pageNumber=${page}&pageSize=${PAGE_SIZE}`;
      }

      if (!url) return;
      try {
        setApiError(null);
        setIsLoadingDrugs(true);
        const { data } = await api.get<DrugModel[]>(url);
        const payload = Array.isArray(data) ? data : [];
        setDrugs(prev => (append ? [...prev, ...payload] : payload));
        setCurrentPage(page);
      } catch (e: any) {
        if (e?.response?.status === 401 || e?.response?.status === 403) {
          setApiError("You need to log in to search drugs.");
        } else {
          setApiError("Failed to load drugs.");
        }
      } finally {
        setIsLoadingDrugs(false);
      }
    },
    [drugSearchQuery, limitSearch, selectedRxGroup, selectedPcn, selectedBin]
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
    debouncedDrugSearch();
  }, [drugSearchQuery, limitSearch, selectedBin, selectedPcn, selectedRxGroup, debouncedDrugSearch]);

  // infinite scroll
  useEffect(() => {
    const el = drugDropdownRef.current;
    if (!el) return;
    const onScroll = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      const atBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 4;
      if (atBottom && !isLoadingDrugs && drugs.length >= PAGE_SIZE * currentPage) {
        fetchDrugsPage(currentPage + 1, true);
      }
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [drugs, currentPage, isLoadingDrugs, fetchDrugsPage]);

  const filterDrugNames = useMemo(
    () => Array.from(new Map(drugs.map(d => [d.name, d])).values()),
    [drugs]
  );

  const onPickDrug = (drug: DrugModel) => {
    setSelectedDrug(drug);

    // gather NDCs for this name from current results
    const ndcs = Array.from(new Set(drugs.filter(d => d.name === drug.name).map(d => d.ndc)));
    setNdcList(ndcs);
    setSelectedNdc(ndcs[0] ?? "");
    setNdcSearchQuery(ndcs[0] ?? "");
    setShowDrugSuggestions(false);
  };

  /** ======== Fetch Details when NDC + RxGroup ready ======== */
  useEffect(() => {
    (async () => {
      if (!selectedNdc || !selectedRxGroup) {
        setNetDetails(null);
        return;
      }
      try {
        setApiError(null);
        const { data } = await api.get<Prescription>(
          `/drug/GetDetails?ndc=${encodeURIComponent(selectedNdc)}&insuranceId=${selectedRxGroup.id}`
        );
        setNetDetails(data ?? null);
      } catch (e: any) {
        if (e?.response?.status === 401 || e?.response?.status === 403) {
          setNetDetails(null);
          setApiError("You need to log in to view net price.");
        } else {
          setNetDetails(null);
          setApiError("Failed to load drug details.");
        }
      }
    })();
  }, [selectedNdc, selectedRxGroup]);

  /** ======== NDC ======== */
  const filteredNdcList = useMemo(() => {
    const q = ndcSearchQuery.toLowerCase();
    return q ? ndcList.filter(n => n.toLowerCase().includes(q)) : ndcList;
  }, [ndcList, ndcSearchQuery]);

  const onPickNdc = (ndc: string) => {
    setSelectedNdc(ndc);
    setNdcSearchQuery(ndc);
    setShowNdcSuggestions(false);
  };

  /** ======== Clear All + click-outside ======== */
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

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest(".js-suggest")) hideAllSuggestions();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div className="container mid py-4">
      <PageMeta title="Insurance Search" description="Search by BIN / PCN / Rx Group (live API)." />
      <div className="d-flex flex-column align-items-center text-center mb-4">
        <AutoBreadcrumb title="Insurance Search" />
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="card-header bg- text-white py-4 px-5">
              <h4 className="mb-0 fw-semibold">
                <i className="ti ti-building-bank me-2"></i>
                Insurance Search
              </h4>
              <p className="mb-0 opacity-75 mt-2">
                Search for drugs based on BIN, PCN, and Rx Group — now wired to the API.
                {apiError && <span className="ms-2 text-warning">{apiError}</span>}
              </p>
            </div>

            <div className="card-body p-5">
              {/* Toggle limit search */}
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

              {/* BIN */}
              <div className="mb-4 position-relative js-suggest">
                <label className="form-label fw-medium text-dark mb-2">
                  <i className="ti ti-id me-1"></i>
                  Type BIN or Insurance Name
                </label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="ti ti-search text-primary" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-2"
                    placeholder="e.g., 610011 or Optum"
                    value={binQuery}
                    onChange={(e) => setBinQuery(e.target.value)}
                    onFocus={() => setShowBinSuggestions(true)}
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
                    aria-label="BIN suggestions"
                  >
                    {binSuggestions.map((b) => (
                      <button
                        key={b.id}
                        className="list-group-item list-group-item-action border-0 py-3 px-4"
                        onClick={() => onPickBin(b)}
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
              {pcnList.length > 0 && (
                <div className="mb-4 position-relative js-suggest">
                  <label className="form-label fw-medium text-dark mb-2">
                    <i className="ti ti-id-badge me-1"></i>
                    Search for PCN
                  </label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="ti ti-search text-primary" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-2"
                      placeholder="e.g., MEDI-RX…"
                      value={pcnSearchQuery}
                      onChange={(e) => setPcnSearchQuery(e.target.value)}
                      onFocus={() => setShowPcnSuggestions(true)}
                      style={{ height: "52px" }}
                    />
                  </div>
                  {showPcnSuggestions && filteredPcnList.length > 0 && (
                    <div
                      className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-lg"
                      style={{ maxHeight: 240, overflowY: "auto", zIndex: 1050 }}
                      role="listbox"
                      aria-label="PCN suggestions"
                    >
                      {filteredPcnList.map((p) => (
                        <button
                          key={p.id}
                          className="list-group-item list-group-item-action border-0 py-3 px-4"
                          onClick={() => onPickPcn(p)}
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
                <div className="mb-4 position-relative js-suggest">
                  <label className="form-label fw-medium text-dark mb-2">
                    <i className="ti ti-users me-1"></i>
                    Search for Rx Group
                  </label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="ti ti-search text-primary" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-2"
                      placeholder="e.g., Medi-Cal Plus…"
                      value={rxGroupSearchQuery}
                      onChange={(e) => setRxGroupSearchQuery(e.target.value)}
                      onFocus={() => setShowRxGroupSuggestions(true)}
                      style={{ height: "52px" }}
                    />
                  </div>
                  {showRxGroupSuggestions && filteredRxGroupList.length > 0 && (
                    <div
                      className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-lg"
                      style={{ maxHeight: 240, overflowY: "auto", zIndex: 1050 }}
                      role="listbox"
                      aria-label="Rx Group suggestions"
                    >
                      {filteredRxGroupList.map((rx) => (
                        <button
                          key={rx.id}
                          className="list-group-item list-group-item-action border-0 py-3 px-4"
                          onClick={() => onPickRx(rx)}
                        >
                          {rx.rxGroup}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Drug search */}
              {(selectedBin?.bin ?? "").length > 0 && (
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
                      onFocus={() => setShowDrugSuggestions(true)}
                      style={{ height: "52px" }}
                    />
                  </div>
                  {showDrugSuggestions && filterDrugNames.length > 0 && (
                    <div
                      ref={drugDropdownRef}
                      className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-lg"
                      style={{ maxHeight: 260, overflowY: "auto", zIndex: 1050 }}
                      role="listbox"
                      aria-label="Drug suggestions"
                    >
                      {filterDrugNames.map((d) => (
                        <button
                          key={d.id}
                          className="list-group-item list-group-item-action border-0 py-3 px-4"
                          onClick={() => onPickDrug(d)}
                        >
                          <div className="d-flex align-items-center">
                            <i className="ti ti-pill text-primary me-2"></i>
                            {d.name}
                          </div>
                        </button>
                      ))}
                      {(isLoadingDrugs || filterDrugNames.length >= PAGE_SIZE * currentPage) && (
                        <div className="text-center small text-muted py-3 border-top">
                          <i className="ti ti-loader me-1"></i>
                          Loading more…
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

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
                      onFocus={() => setShowNdcSuggestions(true)}
                      style={{ height: "52px" }}
                    />
                  </div>
                  {showNdcSuggestions && filteredNdcList.length > 0 && (
                    <div
                      className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded-3 shadow-lg"
                      style={{ maxHeight: 240, overflowY: "auto", zIndex: 1050 }}
                      role="listbox"
                      aria-label="NDC suggestions"
                    >
                      {filteredNdcList.map((ndc, i) => (
                        <button
                          key={`${ndc}-${i}`}
                          className="list-group-item list-group-item-action border-0 py-3 px-4"
                          onClick={() => onPickNdc(ndc)}
                        >
                          <div className="d-flex align-items-center">
                            <i className="ti ti-barcode text-primary me-2"></i>
                            {ndc}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Preview */}
              {selectedDrug && selectedNdc && (
                <div className="alert alert-primary d-flex align-items-center gap-3 p-3 rounded-3 mb-4">
                  <div className="bg-white p-3 rounded-3">
                    <i className="ti ti-currency-dollar text-primary fs-4" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="fw-semibold">Estimated Net Price</div>
                    <div className="fs-5 fw-bold">
                      {netDetails?.net != null ? `$${netDetails.net}` : (apiError ? "—" : "…")}
                    </div>
                  </div>
                </div>
              )}

              {/* Action */}
              {selectedDrug && selectedNdc && selectedRxGroup && (
                <button
                  type="button"
                  className="btn btn-primary btn-lg w-100 py-3 fw-semibold"
                  onClick={() => {
                    try {
                      // persist selection for details page
                      localStorage.setItem("selectedRx", selectedRxGroup.rxGroup);
                      if (selectedPcn?.pcn) localStorage.setItem("selectedPcn", selectedPcn.pcn);
                      if (selectedBin?.bin) localStorage.setItem("selectedBin", selectedBin.bin);
                    } catch {}
                    window.location.href = `/drug/${selectedDrug.id}?ndc=${encodeURIComponent(
                      selectedNdc
                    )}&insuranceId=${selectedRxGroup.id}`;
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

export default InsuranceSearch;
