// src/pages/OrderHistoryPro.tsx
import React, { useEffect, useMemo, useState } from "react";
import type { OrderReadDto } from "../../types";
import axiosInstance from "../../api/axiosInstance";


/** Tiny CSS to match the “pro” look */
const ProOrderStyles = () => (
  <style>{`
    @keyframes cardEntry { from {opacity: 0; transform: translateY(8px)} to {opacity: 1; transform: translateY(0)} }
    .pro-card { background: rgba(255,255,255,.95); backdrop-filter: blur(10px); border: 1px solid rgba(148,163,184,.35); }
    [data-theme="dark"] .pro-card { background: rgba(31,41,55,.95); border-color: rgba(51,65,85,.5); }
    .pro-topbar { position:absolute; top:0; left:0; right:0; height:4px; background: linear-gradient(90deg,#34d399,#60a5fa,#a78bfa); }
    .pro-anim { animation: cardEntry .25s ease-out both; }
    .pro-toolbar .form-control::placeholder { color: #9aa3af; }
    .pro-sticky { position: sticky; top: 0; z-index: 1; }
  `}</style>
);

type StatusKey = "processing" | "shipped" | "delivered";

const currency = (n: number) =>
  (n ?? 0).toLocaleString(undefined, { style: "currency", currency: "USD" });

const dateTime = (v: string | Date) =>
  new Date(v).toLocaleString();

/** Fallback status derivation if backend doesn't provide one */
const deriveStatus = (o: OrderReadDto): StatusKey => {
  // tweak as needed if your backend has "status"
  // @ts-ignore
  const serverStatus: string | undefined = o.status;
  if (serverStatus) {
    const k = serverStatus.toLowerCase();
    if (k.includes("deliver")) return "delivered";
    if (k.includes("ship")) return "shipped";
    return "processing";
  }
  if (o.totalInsurancePay > 0 && o.totalPatientPay > 0) return "delivered";
  if (o.totalInsurancePay > 0) return "shipped";
  return "processing";
};

const statusBadge = (s: StatusKey) => {
  switch (s) {
    case "delivered":
      return (
        <span className="badge rounded-pill text-bg-success d-inline-flex align-items-center gap-1">
          <i className="ti ti-checkbox"></i> Delivered
        </span>
      );
    case "shipped":
      return (
        <span className="badge rounded-pill text-bg-primary d-inline-flex align-items-center gap-1">
          <i className="ti ti-truck"></i> Shipped
        </span>
      );
    default:
      return (
        <span className="badge rounded-pill text-bg-warning d-inline-flex align-items-center gap-1">
          <i className="ti ti-clock"></i> Processing
        </span>
      );
  }
};

export default function OrderHistoryPro() {
  const [orders, setOrders] = useState<OrderReadDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | StatusKey>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosInstance.get<OrderReadDto[]>(
          "/order/GetAllOrdersByUserId?userId=64"
        );
        setOrders(res.data ?? []);
      } catch (e: any) {
        console.error(e);
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    let out = orders.filter((o) => {
      const st = deriveStatus(o);
      const statusPass = statusFilter === "all" ? true : st === statusFilter;

      const idHit = o.id.toString().includes(needle);
      const itemHit = o.orderItemReadDtos?.some(
        (it) =>
          it.drugName?.toLowerCase().includes(needle) ||
          it.ndc?.toLowerCase().includes(needle) ||
          it.searchLogReadDto?.drugName?.toLowerCase().includes(needle) ||
          it.searchLogReadDto?.ndc?.toLowerCase().includes(needle)
      );

      const searchPass = needle ? idHit || itemHit : true;
      return statusPass && searchPass;
    });

    out.sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "oldest")
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === "highest") return b.totalNet - a.totalNet;
      if (sortBy === "lowest") return a.totalNet - b.totalNet;
      return 0;
    });

    return out;
  }, [orders, search, statusFilter, sortBy]);

  return (
    <>
      <ProOrderStyles />
      <div className="container py-4">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a className="text-decoration-none" href="/">
                  Home
                </a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Order History
              </li>
            </ol>
          </nav>
          <span className="badge text-bg-secondary">
            {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Toolbar */}
        <div className="card pro-card rounded-4 shadow-sm position-relative pro-anim">
          <div className="pro-topbar" />
          <div className="card-body pro-toolbar">
            <div className="row g-2 align-items-end">
              <div className="col-md-6">
                <label className="form-label small mb-1">Search</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent">
                    <i className="ti ti-search text-secondary"></i>
                  </span>
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Order ID, drug name, NDC…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setSearch("")}
                      title="Clear"
                    >
                      <i className="ti ti-x"></i>
                    </button>
                  )}
                </div>
              </div>

              <div className="col-md-3">
                <label className="form-label small mb-1">Status</label>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <option value="all">All</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label small mb-1">Sort by</label>
                <select
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="highest">Highest NET</option>
                  <option value="lowest">Lowest NET</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-3">
          {loading && (
            <div className="alert alert-secondary d-flex align-items-center" role="alert">
              <i className="ti ti-loader-3 me-2"></i>
              Loading orders…
            </div>
          )}
          {error && (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <i className="ti ti-alert-triangle me-2"></i>
              {error}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="alert alert-light border d-flex align-items-center" role="alert">
              <i className="ti ti-package-off me-2"></i>
              No orders found.
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="d-flex flex-column gap-3">
              {filtered.map((order) => {
                const st = deriveStatus(order);
                const open = expandedId === order.id;

                return (
                  <div
                    key={order.id}
                    className="card pro-card rounded-4 shadow-sm position-relative pro-anim"
                  >
                    <div className="pro-topbar" />

                    {/* Row header */}
                    <button
                      className="card-body text-start border-0 bg-transparent"
                      onClick={() => setExpandedId(open ? null : order.id)}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          <span
                            className="rounded-3 bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center"
                            style={{ width: 40, height: 40 }}
                          >
                            <i className="ti ti-package"></i>
                          </span>
                          <div className="text-start">
                            <div className="fw-semibold">
                              Order #{order.id}
                            </div>
                            <div className="small text-muted">
                              {dateTime(order.date)}
                            </div>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-3">
                          <div className="text-end">
                            <div className="fw-semibold">{currency(order.totalNet)}</div>
                            <div className="small text-muted">
                              Items: {order.orderItemReadDtos?.length ?? 0}
                            </div>
                          </div>
                          <div>{statusBadge(st)}</div>
                          <i className={`ti ${open ? "ti-chevron-up" : "ti-chevron-down"} text-secondary`}></i>
                        </div>
                      </div>
                    </button>

                    {/* Expanded details */}
                    {open && (
                      <>
                        <div className="border-top" />

                        <div className="card-body">
                          <h6 className="mb-3 d-flex align-items-center gap-2 text-secondary">
                            <i className="ti ti-list-details"></i>
                            Order Items
                          </h6>

                          <div className="table-responsive">
                            <table className="table align-middle mb-0">
                              <thead className="table-light">
                                <tr>
                                  <th>Drug</th>
                                  <th className="text-nowrap">NDC</th>
                                  <th className="text-nowrap">Insurance</th>
                                  <th className="text-center">Qty</th>
                                  <th className="text-end">Net</th>
                                  <th className="text-end">Patient</th>
                                  <th className="text-end">Insurance</th>
                                  <th className="text-end">ACQ</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.orderItemReadDtos.map((it) => (
                                  <tr key={it.id}>
                                    <td>
                                      <div className="fw-medium text-truncate" title={it.drugName}>
                                        {it.drugName}
                                      </div>
                                      <div className="small text-muted">
                                        RxGroup: {it.insuranceRxName || "—"}
                                      </div>
                                    </td>
                                    <td className="text-muted">{it.ndc}</td>
                                    <td>{it.insuranceRxName || "—"}</td>
                                    <td className="text-center">{it.amount}</td>
                                    <td className="text-end">{currency(it.netPrice)}</td>
                                    <td className="text-end">{currency(it.patientPay)}</td>
                                    <td className="text-end">{currency(it.insurancePay)}</td>
                                    <td className="text-end">{currency(it.acquisitionCost)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Optional: Search log per row – kept compact */}
                          {order.orderItemReadDtos.some((x) => x.searchLogReadDto) && (
                            <div className="mt-3">
                              <h6 className="mb-2 text-secondary d-flex align-items-center gap-2">
                                <i className="ti ti-history"></i>
                                Search Log
                              </h6>
                              <div className="row g-2">
                                {order.orderItemReadDtos.map((it) =>
                                  it.searchLogReadDto ? (
                                    <div className="col-md-6" key={`log-${it.id}`}>
                                      <div className="border rounded-3 p-2 small">
                                        <div className="fw-semibold">{it.searchLogReadDto.drugName}</div>
                                        <div className="text-muted">
                                          NDC: {it.searchLogReadDto.ndc || "—"}
                                          {" · "}Type: {it.searchLogReadDto.searchType || "—"}
                                        </div>
                                        <div className="text-muted">
                                          BIN: {it.searchLogReadDto.binName || "NA"} · PCN: {it.searchLogReadDto.pcnName || "NA"} · RxGroup: {it.searchLogReadDto.rxgroupName || "—"}
                                        </div>
                                        <div className="text-muted">
                                          {dateTime(it.searchLogReadDto.date)}
                                        </div>
                                      </div>
                                    </div>
                                  ) : null
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Row footer */}
                        <div className="card-footer bg-body-tertiary d-flex align-items-center justify-content-between">
                          <small className="text-secondary d-flex align-items-center gap-2">
                            <i className="ti ti-info-circle" />
                            Prices updated according to the last scripts
                          </small>
                          <div className="d-flex align-items-center gap-3">
                            <span className="small text-muted">
                              Patient: {currency(order.totalPatientPay)} · Insurance: {currency(order.totalInsurancePay)}
                            </span>
                            <span className="badge rounded-pill text-bg-secondary">
                              NET: {currency(order.totalNet)}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
