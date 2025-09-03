import React, { useEffect, useMemo, useRef, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/* ========================= Types & helpers ========================= */

type Action =
  | "SEARCH_DRUG"
  | "SEARCH_INSURANCE"
  | "VIEW_DRUG_DETAILS"
  | "PRINT_LABEL"
  | "SAVE_SEARCH"
  | "EXPORT_DATA"
  | "LOGIN"
  | "LOGOUT";

interface ApiLog {
  id: number;
  userName: string;
  date: string; // ISO from backend
  action: string; // e.g. "GetLogs", "ViewDrugDetails: ..."
  details?: string; // optional, if backend sends
  ip?: string;
  device?: string;
  sessionId?: string;
}

interface Log {
  id: number;
  timestamp: string; // keep as string, parse on demand
  user: string;
  action: Action | string; // keep unknowns as string for safety
  details: string;
  ip?: string;
  device?: "Desktop" | "Mobile" | string;
  sessionId?: string;
  parsedDetails?: Record<string, string>;
  rawAction?: string; // original backend action after cleaning
}

interface Filters {
  user: string;
  action: "" | Action | string;
  dateFrom: string; // yyyy-mm-dd
  dateTo: string;   // yyyy-mm-dd
  search: string;
}

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
});

// Map backend action keys to readable labels (and optionally to Action enum)
const actionNameMap: Record<string, string> = {
  GetLogs: "View Logs",
  GetAllLatestScripts: "Latest Scripts",
  searchByName: "Search Drug by Name",
  getDrugNDCs: "Search Drug by NDC",
  GetInsuranceByNdc: "Get Insurance by NDC",
  SearchByNdc: "Search by NDC",
  GetDetails: "View Drug Details",
  GetClassById: "View Drug Class",
  GetAlternativesByClassIdBranchId: "Get Drug Alternatives",
  GetAllDrugs: "View All Drugs",
  GetInsurancesBinsByName: "Get BINs by Insurance Name",
  GetDrugsByBin: "Get Drugs by BIN",
  GetAllRxGroups: "View All RxGroups",
  GetInsuranceDetails: "View Insurance Details",
  GetInsurancePCNDetails: "View PCN Details",
  GetInsuranceBINDetails: "View BIN Details",
  GetAllPCNsByBINId: "List PCNs by BIN",
  GetAllRxGroupsByBINId: "List RxGroups by BIN",
  GetAllRxGroupsByPcnId: "List RxGroups by PCN",
  GetScriptByScriptCode: "Get Script by Code",
  UserById: "View User Profile",
  UpdateUser: "Update User Info",
  GetInsurancesPcnByBinId: "Get PCNs by BIN",
  GetDrugsByInsuranceName: "Get Drugs by Insurance",
  GetInsurancesRxByPcnId: "Get RxGroups by PCN",
  GetDrugsByPCN: "Get Drugs by PCN",
  Login: "User Sign in",
  Logout: "User Sign out",
  ViewDrugDetails: "View Drug Search Log",
  ViewDrugDetailsLog: "View Drug Search Log",
};

const normalizeToActionEnum = (key: string): Action | string => {
  // Try to coerce backend action to your Action union
  const k = key.toLowerCase();
  if (k.includes("viewdrugdetails")) return "VIEW_DRUG_DETAILS";
  if (k.includes("search") && k.includes("ndc")) return "SEARCH_DRUG"; // best-effort
  if (k.includes("search") && k.includes("insurance")) return "SEARCH_INSURANCE";
  if (k === "login") return "LOGIN";
  if (k === "logout") return "LOGOUT";
  return key; // keep original for anything else
};

const parseViewDrugDetails = (text: string): Record<string, string> => {
  const result: Record<string, string> = {};
  const regex = /([A-Za-z\s\?\.]+):\s*([^\n,]+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const key = match[1].trim();
    const value = match[2].trim();
    result[key] = value;
  }
  return result;
};

/* ---------------- prettier stat cards ---------------- */
const StatCard: React.FC<{
  title: string;
  value: number | string;
  iconClass: string;
  gradientFrom: string;
  gradientTo: string;
  footNote?: string;
}> = ({ title, value, iconClass, gradientFrom, gradientTo, footNote }) => (
  <div className="col-12 col-sm-6 col-lg-3">
    <div
      className="card h-100 border-0 shadow-sm stats-card text-white position-relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`, borderRadius: "1rem" }}
      aria-label={title}
    >
      <div className="card-body py-3">
        <div className="d-flex align-items-center justify-content-between">
          <span className="fw-semibold text-uppercase small text-white-50">{title}</span>
          <div className="bg-white bg-opacity-10 rounded-3 p-2 d-inline-flex">
            <i className={`${iconClass}`} />
          </div>
        </div>
        <h3 className="mt-2 mb-1 fw-bolder">
          {Number.isFinite(+((value as unknown) as number)) ? (+value).toLocaleString() : value}
        </h3>
        {footNote && <small className="text-white-50">{footNote}</small>}
      </div>
      <div
        className="position-absolute rounded-circle"
        style={{
          width: 160,
          height: 160,
          right: -40,
          bottom: -40,
          background: "radial-gradient(closest-side, rgba(255,255,255,.25), rgba(255,255,255,0))",
          pointerEvents: "none",
        }}
      />
    </div>
  </div>
);

const StatsCardStyles = () => (
  <style>{`
    .stats-card { transition: transform .18s ease, box-shadow .18s ease; }
    .stats-card:hover { transform: translateY(-2px); box-shadow: 0 .75rem 1.75rem rgba(16,24,40,.18); }
    .stats-card .card-body { position: relative; z-index: 1; }
    .stats-card::after { content: ""; position: absolute; inset: 0; border-radius: 1rem; pointer-events: none; border: 1px solid rgba(255,255,255,.18); }
  `}</style>
);
/* ================================================================== */

const UserActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [filters, setFilters] = useState<Filters>({ user: "", action: "", dateFrom: "", dateTo: "", search: "" });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  // Suggestions
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [showActionSuggestions, setShowActionSuggestions] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);

  // Auth guard — don't show logs if not signed in
  const [isAuthed, setIsAuthed] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setIsAuthed(false);
      setError("You must be signed in to view logs.");
      setLoading(false);
      return;
    }
    setIsAuthed(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserSuggestions(false);
      if (actionRef.current && !actionRef.current.contains(e.target as Node)) setShowActionSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isAuthed) return;

    const fetchLogs = async () => {
      try {
        const res = await axiosInstance.get<ApiLog[]>(`/Logs/GetLogs`, { headers: getAuthHeader() });

        const processed: Log[] = res.data
          .filter(l => !l.action.toLowerCase().includes("token-test"))
          .map((l) => {
            const cleanAction = l.action.replace(/^User requested\s*/i, "");
            const parsed = cleanAction.toLowerCase().startsWith("viewdrugdetails") ? parseViewDrugDetails(cleanAction) : undefined;
            const normalized = normalizeToActionEnum(cleanAction);

            return {
              id: l.id,
              timestamp: l.date,
              user: l.userName,
              action: normalized,
              details: l.details || cleanAction,
              ip: l.ip,
              device: (l.device as any) || "Desktop",
              sessionId: l.sessionId,
              parsedDetails: parsed,
              rawAction: cleanAction,
            } as Log;
          })
          .filter(l => {
            const key = typeof l.action === "string" ? l.action.toString() : (l.action as string);
            return Object.keys(actionNameMap).includes(key) || key.toLowerCase().startsWith("viewdrugdetails");
          });

        setLogs(processed);
        setFilteredLogs(processed);
      } catch (e: any) {
        setError("Sorry, you don’t have access. Please contact your system administrator.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [isAuthed]);

  // Suggestions lists
  const userSuggestions = useMemo(() => {
    const unique = Array.from(new Set(logs.map(l => l.user)));
    return unique.filter(u => u.toLowerCase().includes(filters.user.toLowerCase()));
  }, [logs, filters.user]);

  const actionSuggestions = useMemo(() => {
    const unique = Array.from(new Set(logs.map(l => (typeof l.action === 'string' ? l.action : l.action.toString()))));
    return unique.filter(a => a.toLowerCase().includes((filters.action || "").toString().toLowerCase()));
  }, [logs, filters.action]);

  // Filtering
  useEffect(() => {
    let result = [...logs];

    if (filters.user) {
      result = result.filter((log) => log.user.toLowerCase().includes(filters.user.toLowerCase()));
    }

    if (filters.action) {
      result = result.filter((log) => (typeof log.action === 'string' ? log.action : log.action.toString()) === filters.action);
    }

    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      result = result.filter((log) => new Date(log.timestamp) >= from);
    }

    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((log) => new Date(log.timestamp) <= to);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((log) =>
        (log.details || '').toLowerCase().includes(q) ||
        log.user.toLowerCase().includes(q) ||
        (log.ip || '').toLowerCase().includes(q) ||
        (log.sessionId || '').toLowerCase().includes(q)
      );
    }

    setFilteredLogs(result);
    setCurrentPage(1);
  }, [filters, logs]);

  const clearFilters = () => setFilters({ user: "", action: "", dateFrom: "", dateTo: "", search: "" });
  const handleClearAll = () => {
    clearFilters();
    setShowUserSuggestions(false);
    setShowActionSuggestions(false);
  };

  /* ========================= Pagination ========================= */
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  /* ========================= Charts & Working Hours ========================= */
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredLogs.forEach(l => {
      const day = new Date(l.timestamp).toLocaleDateString();
      counts[day] = (counts[day] || 0) + 1;
    });
    const labels = Object.keys(counts).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());
    const data = labels.map(lbl => counts[lbl]);
    return { labels, data };
  }, [filteredLogs]);

  const lineData = {
    labels: chartData.labels,
    datasets: [{ label: "Number of Logs", data: chartData.data, fill: false, borderColor: "rgba(75,192,192,1)", tension: 0.1 }],
  };
  const lineOptions = { responsive: true, plugins: { legend: { position: 'top' as const }, title: { display: true, text: filters.user ? `Activity for ${filters.user}` : 'Logs Per Day' } } };

  const actionChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredLogs.forEach(l => {
      const key = (typeof l.action === 'string' ? l.action : l.action.toString()).trim();
      const tokens = key.split(" ");
      const last = tokens[tokens.length - 1];
      counts[last] = (counts[last] || 0) + 1;
    });
    const labels = Object.keys(counts);
    const data = labels.map(k => counts[k]);
    const prettyLabels = labels.map(k => actionNameMap[k] || k);
    return { labels: prettyLabels, data };
  }, [filteredLogs]);

  const barData = { labels: actionChartData.labels, datasets: [{ label: "Action Usage Count", data: actionChartData.data, backgroundColor: "rgba(75,192,192,0.6)", borderColor: "rgba(75,192,192,1)", borderWidth: 1 }] };
  const barOptions = { responsive: true, plugins: { legend: { position: 'top' as const }, title: { display: true, text: 'Action Usage Overview (Last Word)' } } };

  // Working hours (per selected user only)
  const workingHoursData = useMemo(() => {
    if (!filters.user) return [] as { day: string; signIn: string; lastActivity: string; hours: string; normalHours: string; extra: string }[];
    const userLogs = logs.filter(l => l.user.toLowerCase() === filters.user.toLowerCase());

    const grouped: Record<string, Log[]> = userLogs.reduce((acc, l) => {
      const day = new Date(l.timestamp).toLocaleDateString();
      (acc[day] ||= []).push(l);
      return acc;
    }, {} as Record<string, Log[]>);

    const out: { day: string; signIn: string; lastActivity: string; hours: string; normalHours: string; extra: string }[] = [];

    Object.keys(grouped).forEach(day => {
      const arr = grouped[day];
      // treat earliest activity as sign-in if explicit Login not present
      const loginLike = arr.filter(l => (typeof l.action === 'string' ? l.action.toString() : l.action) === 'LOGIN' || (l.rawAction || '').toLowerCase() === 'login');
      const first = (loginLike.length > 0 ? loginLike : arr).reduce((a,b) => new Date(a.timestamp) < new Date(b.timestamp) ? a : b);
      const last = arr.reduce((a,b) => new Date(a.timestamp) > new Date(b.timestamp) ? a : b);

      const diffMs = new Date(last.timestamp).getTime() - new Date(first.timestamp).getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      const normal = Math.min(diffHours, 8);
      const extra = Math.max(diffHours - 8, 0);

      out.push({
        day,
        signIn: new Date(first.timestamp).toLocaleTimeString(),
        lastActivity: new Date(last.timestamp).toLocaleTimeString(),
        hours: diffHours.toFixed(2),
        normalHours: normal.toFixed(2),
        extra: extra.toFixed(2),
      });
    });

    return out.sort((a,b) => new Date(a.day).getTime() - new Date(b.day).getTime());
  }, [logs, filters.user]);

  const workingHoursChartData = useMemo(() => {
    const labels = workingHoursData.map(i => i.day);
    const normal = workingHoursData.map(i => parseFloat(i.normalHours));
    const extra = workingHoursData.map(i => parseFloat(i.extra));
    return { labels, datasets: [ { label: 'Normal Hours', data: normal, backgroundColor: 'rgba(54,162,235,0.6)' }, { label: 'Extra Hours', data: extra, backgroundColor: 'rgba(255,99,132,0.6)' } ] };
  }, [workingHoursData]);

  const workingHoursChartOptions = { responsive: true, plugins: { legend: { position: 'top' as const }, title: { display: true, text: 'Working Hours Breakdown per Day' } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } };

  /* ========================= CSV Export ========================= */
  const downloadCSV = () => {
    const headers = ["ID", "User", "Action", "Date", "Details", "IP", "Device"];
    const rows = filteredLogs.map(l => [
      l.id,
      l.user,
      `"${(actionNameMap[(l.action as string)] || l.action).toString()}"`,
      `"${new Date(l.timestamp).toLocaleString()}"`,
      `"${(l.details || '').replace(/"/g, '"')}"`,
      l.ip || "",
      l.device || "",
    ].join(","));

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "user-activity-logs.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  /* ========================= Derived stats ========================= */
  const totalActivities = filteredLogs.length;
  const drugSearches = filteredLogs.filter(l => (l.action === 'SEARCH_DRUG')).length;
  const activeUsers = new Set(filteredLogs.map(l => l.user)).size;
  const dataExports = filteredLogs.filter(l => (l.action === 'EXPORT_DATA')).length;

  const formatDate = (d: string | Date) => new Date(d).toLocaleString();

  /* ========================= Render ========================= */
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 320 }}>
        <span>Loading logs...</span>
      </div>
    );
  }

  if (error || !isAuthed) {
    return (
      <div className="alert alert-warning mt-4 justify-content center" role="alert">
        {error || "You are not authorized to view this page."}
      </div>
    );
  }

  return (
    <div className="page-wrapper" id="main-content">
      <div className="row justify-content-center">
        <div className="col-12">
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="card-header py-4 px-5 bg- text-white">
              <h4 className="mb-0 fw-semibold"><i className="ti ti-history me-2"></i>User Activity Logs</h4>
              <p className="mb-0 opacity-75 mt-2">Track and monitor user activities and searches on the platform</p>
            </div>

            <div className="card-body p-5">
              {/* Filters */}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="card bg-light border-0">
                    <div className="card-body">
                      <h6 className="card-title mb-3"><i className="ti ti-filter me-2"></i>Filter Logs</h6>
                      <div className="row g-3">
                        {/* User with suggestions */}
                        <div className="col-md-3" ref={userRef}>
                          <label className="form-label">User Email</label>
                          <div className="position-relative">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Filter by user"
                              name="user"
                              value={filters.user}
                              onChange={(e) => { setFilters(prev => ({ ...prev, user: e.target.value })); setShowUserSuggestions(true); }}
                              onFocus={() => setShowUserSuggestions(true)}
                            />
                            {filters.user && (
                              <button type="button" className="btn btn-sm btn-link position-absolute end-0 top-0 mt-2 me-2 text-muted" onClick={() => setFilters(prev => ({ ...prev, user: '' }))}>&times;</button>
                            )}
                            {showUserSuggestions && userSuggestions.length > 0 && (
                              <ul className="list-group position-absolute w-100 mt-1" style={{ zIndex: 20 }}>
                                {userSuggestions.map((u, idx) => (
                                  <li key={idx} className="list-group-item list-group-item-action" onClick={() => { setFilters(prev => ({ ...prev, user: u })); setShowUserSuggestions(false); }}>{u}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>

                        {/* Action with suggestions */}
                        <div className="col-md-3" ref={actionRef}>
                          <label className="form-label">Action Type</label>
                          <div className="position-relative">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Filter by action"
                              name="action"
                              value={(filters.action as string) || ''}
                              onChange={(e) => { setFilters(prev => ({ ...prev, action: e.target.value })); setShowActionSuggestions(true); }}
                              onFocus={() => setShowActionSuggestions(true)}
                            />
                            {(filters.action as string) && (
                              <button type="button" className="btn btn-sm btn-link position-absolute end-0 top-0 mt-2 me-2 text-muted" onClick={() => setFilters(prev => ({ ...prev, action: '' }))}>&times;</button>
                            )}
                            {showActionSuggestions && actionSuggestions.length > 0 && (
                              <ul className="list-group position-absolute w-100 mt-1" style={{ zIndex: 20 }}>
                                {actionSuggestions.map((a, idx) => (
                                  <li key={idx} className="list-group-item list-group-item-action" onClick={() => { setFilters(prev => ({ ...prev, action: a })); setShowActionSuggestions(false); }}>{actionNameMap[a] || a}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>

                        <div className="col-md-2">
                          <label className="form-label">Date From</label>
                          <input type="date" className="form-control" name="dateFrom" value={filters.dateFrom} onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))} />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label">Date To</label>
                          <input type="date" className="form-control" name="dateTo" value={filters.dateTo} onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))} />
                        </div>
                      </div>

                      {/* Search row */}
                      <div className="row mt-3">
                        <div className="col-12">
                          <div className="input-group">
                            <span className="input-group-text"><i className="ti ti-search"></i></span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Search across all fields..."
                              name="search"
                              value={filters.search}
                              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Clear All button UNDER all inputs (clears everything incl. search) */}
                      <div className="row mt-3">
                        <div className="col-12">
                          <button
                            className="btn btn-outline-danger w-100"
                            onClick={handleClearAll}
                            title="Clear all filters (including search)"
                            aria-label="Clear all filters"
                          >
                            <i className="ti ti-broom me-2" />
                            Clear All Filters
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <StatsCardStyles />
              <div className="row g-3 mb-4">
                <StatCard title="Total Activities" value={totalActivities} iconClass="ti ti-activity" gradientFrom="#4F46E5" gradientTo="#8B5CF6" />
                <StatCard title="Drug Searches" value={drugSearches} iconClass="ti ti-search" gradientFrom="#0284C7" gradientTo="#06B6D4" />
                <StatCard title="Active Users" value={activeUsers} iconClass="ti ti-users" gradientFrom="#059669" gradientTo="#22C55E" />
                <StatCard title="Data Exports" value={dataExports} iconClass="ti ti-download" gradientFrom="#F59E0B" gradientTo="#F97316" />
              </div>

              {/* Charts (visible once a user filter is chosen) */}
              {filters.user ? (
                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-6">
                    <div className="card h-100">
                      <div className="card-body"><Line data={lineData} options={lineOptions as any} /></div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="card h-100">
                      <div className="card-body"><Bar data={barData} options={barOptions as any} /></div>
                    </div>
                  </div>

                  {/* Working Hours Table */}
                  <div className="col-12">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title mb-3">Daily Working Hours</h5>
                        {workingHoursData.length > 0 ? (
                          <div className="table-responsive">
                            <table className="table">
                              <thead className="table-light">
                                <tr>
                                  <th>Date</th>
                                  <th>First Sign In</th>
                                  <th>Last Activity</th>
                                  <th>Total Hours</th>
                                  <th>Extra Hours</th>
                                </tr>
                              </thead>
                              <tbody>
                                {workingHoursData.map((row, idx) => (
                                  <tr key={idx}>
                                    <td>{row.day}</td>
                                    <td>{row.signIn}</td>
                                    <td>{row.lastActivity}</td>
                                    <td>{row.hours}</td>
                                    <td>{row.extra}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-muted">No working hours data available for this user.</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Working Hours Bar Chart */}
                  <div className="col-12">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title mb-3">Working Hours Overview</h5>
                        <Bar data={workingHoursChartData as any} options={workingHoursChartOptions as any} />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted mb-4">Select a user to view activity charts and working hours.</div>
              )}

              {/* Logs Table */}
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Timestamp</th>
                      <th>User</th>
                      <th>Action</th>
                      <th>Details</th>
                      <th>IP Address</th>
                      <th>Device</th>
                      <th>Search Log</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLogs.length > 0 ? (
                      paginatedLogs.map((log) => (
                        <tr key={log.id} className="align-middle">
                          <td className="text-nowrap"><small>{formatDate(log.timestamp)}</small></td>
                          <td><span className="d-block text-truncate" style={{ maxWidth: 180 }}>{log.user}</span></td>
                          <td title={actionNameMap[(log.action as string)] || (log.action as string)}>
                            <span className="badge bg-secondary">
                              {(actionNameMap[(log.action as string)] || (log.action as string)).toString()}
                            </span>
                          </td>
                          <td className="text-truncate" style={{ maxWidth: 260 }} title={log.details}>{log.details}</td>
                          <td>{log.ip || "—"}</td>
                          <td>
                            <span className="badge bg-light text-dark">
                              <i className={((log.device || "Desktop") === "Desktop") ? "ti ti-device-desktop me-1" : "ti ti-device-mobile me-1"}></i>
                              {log.device || "Desktop"}
                            </span>
                          </td>
                          <td style={{ cursor: 'pointer' }} onClick={() => setSelectedLog(log)} title="Click to view full details">
                            <div className="text-truncate" style={{ maxWidth: 240 }}>
                              {(actionNameMap[(log.action as string)] || (log.action as string)).toString()}
                            </div>
                            {log.parsedDetails && (
                              <small className="text-muted d-block text-truncate" style={{ maxWidth: 240 }}>
                                {Object.entries(log.parsedDetails).map(([k,v]) => `${k}: ${v}`).join(", ")}
                              </small>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-4">
                          <i className="ti ti-alert-circle fs-1 text-muted d-block mb-2"></i>
                          <span className="text-muted">No activity logs found matching your filters</span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredLogs.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div>
                    <span className="text-muted">
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredLogs.length)} of {filteredLogs.length} entries
                    </span>
                  </div>
                  <nav>
                    <ul className="pagination mb-0">
                      <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}>Previous</button>
                      </li>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) pageNum = i + 1;
                        else if (currentPage <= 3) pageNum = i + 1;
                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                        else pageNum = currentPage - 2 + i;
                        return (
                          <li key={pageNum} className={`page-item ${currentPage === pageNum ? "active" : ""}`}>
                            <button className="page-link" onClick={() => setCurrentPage(pageNum)}>{pageNum}</button>
                          </li>
                        );
                      })}

                      <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}>Next</button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}

              {/* Export Button */}
              {filteredLogs.length > 0 && (
                <div className="d-flex justify-content-end mt-4">
                  <button className="btn btn-outline-primary" onClick={downloadCSV}>
                    <i className="ti ti-download me-2"></i>Export to CSV
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for selected log */}
      {selectedLog && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Log Details</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedLog(null)}></button>
              </div>
              <div className="modal-body">
                <p><strong>User:</strong> {selectedLog.user}</p>
                <p><strong>Date:</strong> {formatDate(selectedLog.timestamp)}</p>
                <p><strong>Action:</strong> {(actionNameMap[(selectedLog.action as string)] || (selectedLog.action as string)).toString()}</p>
                {selectedLog.details && <p><strong>Details:</strong> {selectedLog.details}</p>}
                {selectedLog.parsedDetails && (
                  <div className="mt-3">
                    <h6>Search Details:</h6>
                    <ul className="small">
                      {Object.entries(selectedLog.parsedDetails).map(([k,v]) => (<li key={k}><strong>{k}:</strong> {v}</li>))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedLog(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserActivityLogs;
