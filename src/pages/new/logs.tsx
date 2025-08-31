import React, { useState, useEffect } from "react";

type Action =
  | "SEARCH_DRUG"
  | "SEARCH_INSURANCE"
  | "VIEW_DRUG_DETAILS"
  | "PRINT_LABEL"
  | "SAVE_SEARCH"
  | "EXPORT_DATA";

interface Log {
  id: number;
  timestamp: Date; // keep as Date for easy comparisons/formatting
  user: string;
  action: Action;
  details: string;
  ip: string;
  device: "Desktop" | "Mobile";
  sessionId: string;
}

interface Filters {
  user: string;
  action: "" | Action;
  dateFrom: string; // yyyy-mm-dd from <input type="date">
  dateTo: string;   // yyyy-mm-dd
  search: string;
}

// Mock data for user activity logs
const generateMockLogs = (): Log[] => {
  const actions: Action[] = [
    "SEARCH_DRUG",
    "SEARCH_INSURANCE",
    "VIEW_DRUG_DETAILS",
    "PRINT_LABEL",
    "SAVE_SEARCH",
    "EXPORT_DATA",
  ];

  const drugs = ["Metformin", "Atorvastatin", "Lisinopril", "Amlodipine", "Losartan", "Levothyroxine"];
  const insuranceTypes = ["Medi-Cal", "OptumRx", "Caremark", "Blue Cross", "Aetna"];
  const users = ["john.doe@example.com", "jane.smith@example.com", "admin@dreamsemr.com", "pharmacist@example.com"];

  const logs: Log[] = [];

  for (let i = 0; i < 50; i++) {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const timestamp = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000));

    let details = "";
    if (action === "SEARCH_DRUG") {
      details = `Searched for drug: ${drugs[Math.floor(Math.random() * drugs.length)]}`;
    } else if (action === "SEARCH_INSURANCE") {
      details = `Searched insurance: ${insuranceTypes[Math.floor(Math.random() * insuranceTypes.length)]}`;
    } else if (action === "VIEW_DRUG_DETAILS") {
      details = `Viewed details for: ${drugs[Math.floor(Math.random() * drugs.length)]}`;
    } else if (action === "PRINT_LABEL") {
      details = `Printed label for: ${drugs[Math.floor(Math.random() * drugs.length)]}`;
    } else if (action === "SAVE_SEARCH") {
      details = `Saved search criteria`;
    } else if (action === "EXPORT_DATA") {
      details = `Exported data to CSV`;
    }

    logs.push({
      id: i + 1,
      timestamp,
      user,
      action,
      details,
      ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      device: Math.random() > 0.5 ? "Desktop" : "Mobile",
      sessionId: `session-${Math.floor(Math.random() * 10000)}`,
    });
  }

  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

const UserActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
  const [filters, setFilters] = useState<Filters>({
    user: "",
    action: "",
    dateFrom: "",
    dateTo: "",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const mockLogs = generateMockLogs();
    setLogs(mockLogs);
    setFilteredLogs(mockLogs);
  }, []);

  useEffect(() => {
    let result = [...logs];

    if (filters.user) {
      result = result.filter((log) => log.user.toLowerCase().includes(filters.user.toLowerCase()));
    }

    if (filters.action) {
      result = result.filter((log) => log.action === filters.action);
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      result = result.filter((log) => log.timestamp >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter((log) => log.timestamp <= toDate);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(
        (log) =>
          log.details.toLowerCase().includes(searchTerm) ||
          log.user.toLowerCase().includes(searchTerm) ||
          log.ip.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredLogs(result);
    setCurrentPage(1);
  }, [filters, logs]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      user: "",
      action: "",
      dateFrom: "",
      dateTo: "",
      search: "",
    });
  };

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (date: Date | string) => new Date(date).toLocaleString();

  const getActionBadgeClass = (action: Action): string => {
    switch (action) {
      case "SEARCH_DRUG":
        return "bg-primary";
      case "SEARCH_INSURANCE":
        return "bg-info";
      case "VIEW_DRUG_DETAILS":
        return "bg-success";
      case "PRINT_LABEL":
        return "bg-warning";
      case "SAVE_SEARCH":
        return "bg-secondary";
      case "EXPORT_DATA":
        return "bg-dark";
      default:
        return "bg-light text-dark";
    }
  };

  const getActionIcon = (action: Action): string => {
    switch (action) {
      case "SEARCH_DRUG":
        return "ti ti-search";
      case "SEARCH_INSURANCE":
        return "ti ti-building";
      case "VIEW_DRUG_DETAILS":
        return "ti ti-file-text";
      case "PRINT_LABEL":
        return "ti ti-printer";
      case "SAVE_SEARCH":
        return "ti ti-bookmark";
      case "EXPORT_DATA":
        return "ti ti-download";
      default:
        return "ti ti-activity";
    }
  };

  return (
    <div className="page-wrapper" id="main-content">
      <div className="row justify-content-center">
        <div className="col-12">
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="card-header bg- text-white py-4 px-5">
              <h4 className="mb-0 fw-semibold">
                <i className="ti ti-history me-2"></i>
                User Activity Logs
              </h4>
              <p className="mb-0 opacity-75 mt-2">
                Track and monitor user activities and searches on the platform
              </p>
            </div>

            <div className="card-body p-5">
              {/* Filters */}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="card bg-light border-0">
                    <div className="card-body">
                      <h6 className="card-title mb-3">
                        <i className="ti ti-filter me-2"></i>
                        Filter Logs
                      </h6>
                      <div className="row g-3">
                        <div className="col-md-3">
                          <label className="form-label">User Email</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Filter by user"
                            name="user"
                            value={filters.user}
                            onChange={handleFilterChange}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Action Type</label>
                          <select
                            className="form-select"
                            name="action"
                            value={filters.action}
                            onChange={handleFilterChange}
                          >
                            <option value="">All Actions</option>
                            <option value="SEARCH_DRUG">Drug Search</option>
                            <option value="SEARCH_INSURANCE">Insurance Search</option>
                            <option value="VIEW_DRUG_DETAILS">View Drug Details</option>
                            <option value="PRINT_LABEL">Print Label</option>
                            <option value="SAVE_SEARCH">Save Search</option>
                            <option value="EXPORT_DATA">Export Data</option>
                          </select>
                        </div>
                        <div className="col-md-2">
                          <label className="form-label">Date From</label>
                          <input
                            type="date"
                            className="form-control"
                            name="dateFrom"
                            value={filters.dateFrom}
                            onChange={handleFilterChange}
                          />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label">Date To</label>
                          <input
                            type="date"
                            className="form-control"
                            name="dateTo"
                            value={filters.dateTo}
                            onChange={handleFilterChange}
                          />
                        </div>
                        <div className="col-md-2 d-flex align-items-end">
                          <button className="btn btn-outline-secondary w-100" onClick={clearFilters}>
                            Clear Filters
                          </button>
                        </div>
                      </div>
                      <div className="row mt-3">
                        <div className="col-12">
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="ti ti-search"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Search across all fields..."
                              name="search"
                              value={filters.search}
                              onChange={handleFilterChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Summary */}
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="card bg-primary text-white text-center">
                    <div className="card-body py-3">
                      <h5 className="card-title mb-0">{filteredLogs.length}</h5>
                      <p className="card-text mb-0">Total Activities</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-info text-white text-center">
                    <div className="card-body py-3">
                      <h5 className="card-title mb-0">
                        {filteredLogs.filter((log) => log.action === "SEARCH_DRUG").length}
                      </h5>
                      <p className="card-text mb-0">Drug Searches</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-success text-white text-center">
                    <div className="card-body py-3">
                      <h5 className="card-title mb-0">
                        {new Set(filteredLogs.map((log) => log.user)).size}
                      </h5>
                      <p className="card-text mb-0">Active Users</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-warning text-dark text-center">
                    <div className="card-body py-3">
                      <h5 className="card-title mb-0">
                        {filteredLogs.filter((log) => log.action === "EXPORT_DATA").length}
                      </h5>
                      <p className="card-text mb-0">Data Exports</p>
                    </div>
                  </div>
                </div>
              </div>

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
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLogs.length > 0 ? (
                      paginatedLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="text-nowrap">
                            <small>{formatDate(log.timestamp)}</small>
                          </td>
                          <td>
                            <span className="d-block text-truncate" style={{ maxWidth: "150px" }}>
                              {log.user}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getActionBadgeClass(log.action)}`}>
                              <i className={`${getActionIcon(log.action)} me-1`}></i>
                              {log.action.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td>{log.details}</td>
                          <td>{log.ip}</td>
                          <td>
                            <span className="badge bg-light text-dark">
                              <i
                                className={
                                  log.device === "Desktop"
                                    ? "ti ti-device-desktop me-1"
                                    : "ti ti-device-mobile me-1"
                                }
                              ></i>
                              {log.device}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
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
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredLogs.length)} of{" "}
                      {filteredLogs.length} entries
                    </span>
                  </div>
                  <nav>
                    <ul className="pagination mb-0">
                      <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        >
                          Previous
                        </button>
                      </li>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <li key={pageNum} className={`page-item ${currentPage === pageNum ? "active" : ""}`}>
                            <button className="page-link" onClick={() => setCurrentPage(pageNum)}>
                              {pageNum}
                            </button>
                          </li>
                        );
                      })}

                      <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}

              {/* Export Button */}
              {filteredLogs.length > 0 && (
                <div className="d-flex justify-content-end mt-4">
                  <button className="btn btn-outline-primary">
                    <i className="ti ti-download me-2"></i>
                    Export to CSV
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserActivityLogs;
