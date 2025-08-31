import React, { Suspense, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PageMeta from "../../components/PageMeta";
import AutoBreadcrumb from "../../components/breadcrumb/AutoBreadcrumb";
import CommonFooter from "../../components/common-footer/commonFooter";
import ImageWithBasePath from "../../components/image-with-base-path";
import PredefinedDatePicker from "../../components/common-date-range-picker/PredefinedDatePicker";
import { all_routes } from "../../routes/all_routes";

// شارتات التيمبليت
import ChartOne from "../dashboard/chart/chart1";
import ChartTwo from "../dashboard/chart/chart2";
import ChartThree from "../dashboard/chart/chart3";
import ChartFour from "../dashboard/chart/chart4";
import ChartFive from "../dashboard/chart/chart5";
// الداشبوردات بتاعة الصيدلية (بتاعتك)
import FirstDashboard from "./Dashboard";
import SecondDashBoard from "./SecondDashboard";
import ThirdDashBoard from "./ThirdDashboard";
import SemiDonutChart from "../dashboard/chart/semiDonutChart";

type TabKey = "1" | "2" | "3";

const MainDashboard: React.FC = () => {
  // هنسيب الـ param لو بتفتحي /dashboard/:dashboardId
  const { dashboardId } = useParams<{ dashboardId?: string }>();
  const [activeDashboard, setActiveDashboard] = useState<TabKey>(
    (dashboardId as TabKey) || "1"
  );

  useEffect(() => {
    if (dashboardId) setActiveDashboard(dashboardId as TabKey);
  }, [dashboardId]);

  const pageTitle = useMemo(() => {
    switch (activeDashboard) {
      case "1":
        return "Pharmacy Dashboard — One";
      case "2":
        return "Pharmacy Dashboard — Two";
      case "3":
        return "Pharmacy Dashboard — Three";
      default:
        return "Pharmacy Dashboard";
    }
  }, [activeDashboard]);

  return (
    <div className="page-wrapper" id="main-content">
      <div className="content">
        <PageMeta title={pageTitle} description="Pharmacy analytics" />
        <AutoBreadcrumb title="Dashboard" />

        {/* Header + Date Picker */}
        <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
          <div className="breadcrumb-arrow">
            <h4 className="mb-1">Welcome, Admin</h4>
            <p className="mb-0">
              Today you have 10 visits,&nbsp;
              <Link to={all_routes.visits} className="text-decoration-underline">
                View Details
              </Link>
            </p>
          </div>
          <PredefinedDatePicker />
        </div>

        {/* ======= أعلى 4 كروت من التيمبليت + الشارتات ======= */}
        <div className="row">
          <div className="col-xl-3 col-md-6 d-flex">
            <div className="card pb-2 flex-fill">
              <div className="d-flex align-items-center justify-content-between gap-1 card-body pb-0 mb-1">
                <div className="d-flex align-items-center overflow-hidden">
                  <span className="avatar bg-primary rounded-circle flex-shrink-0">
                    <i className="ti ti-user-exclamation fs-20" />
                  </span>
                  <div className="ms-2 overflow-hidden">
                    <p className="mb-1 text-truncate">Patients</p>
                    <h5 className="mb-0">108</h5>
                  </div>
                </div>
                <div className="text-end">
                  <span className="badge badge-soft-success">+20%</span>
                </div>
              </div>
              <Suspense fallback={<div />}>
                <ChartOne />
              </Suspense>
            </div>
          </div>

          <div className="col-xl-3 col-md-6 d-flex">
            <div className="card pb-2 flex-fill">
              <div className="d-flex align-items-center justify-content-between gap-1 card-body pb-0 mb-1">
                <div className="d-flex align-items-center overflow-hidden">
                  <span className="avatar bg-orange rounded-circle flex-shrink-0">
                    <i className="ti ti-calendar-check fs-20" />
                  </span>
                  <div className="ms-2 overflow-hidden">
                    <p className="mb-1 text-truncate">Appointments</p>
                    <h5 className="mb-0">658</h5>
                  </div>
                </div>
                <div className="text-end">
                  <span className="badge badge-soft-danger">-15%</span>
                </div>
              </div>
              <Suspense fallback={<div />}>
                <ChartTwo />
              </Suspense>
            </div>
          </div>

          <div className="col-xl-3 col-md-6 d-flex">
            <div className="card pb-2 flex-fill">
              <div className="d-flex align-items-center justify-content-between gap-1 card-body pb-0 mb-1">
                <div className="d-flex align-items-center overflow-hidden">
                  <span className="avatar bg-purple rounded-circle flex-shrink-0">
                    <i className="ti ti-stethoscope fs-20" />
                  </span>
                  <div className="ms-2 overflow-hidden">
                    <p className="mb-1 text-truncate">Doctors</p>
                    <h5 className="mb-0">565</h5>
                  </div>
                </div>
                <div className="text-end">
                  <span className="badge badge-soft-success">+18%</span>
                </div>
              </div>
              <Suspense fallback={<div />}>
                <ChartThree />
              </Suspense>
            </div>
          </div>

          <div className="col-xl-3 col-md-6 d-flex">
            <div className="card pb-2 flex-fill">
              <div className="d-flex align-items-center justify-content-between gap-1 card-body pb-0 mb-1">
                <div className="d-flex align-items-center overflow-hidden">
                  <span className="avatar bg-pink rounded-circle flex-shrink-0">
                    <i className="ti ti-moneybag fs-20" />
                  </span>
                  <div className="ms-2 overflow-hidden">
                    <p className="mb-1 text-truncate">Transactions</p>
                    <h5 className="mb-0">$5,523.56</h5>
                  </div>
                </div>
                <div className="text-end">
                  <span className="badge badge-soft-success">+12%</span>
                </div>
              </div>
              <Suspense fallback={<div />}>
                <ChartFour />
              </Suspense>
            </div>
          </div>
        </div>

        {/* ======= سكشنين من التيمبليت (Request + Patients Stats) ======= */}
        <div className="row">
          <div className="col-xl-6 d-flex">
            <div className="card flex-fill w-100">
              <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
                <h5 className="fw-bold mb-0">Appointment Request</h5>
                <Link
                  to={all_routes.appointments}
                  className="btn btn-sm btn-outline-light flex-shrink-0"
                >
                  All Appointments
                </Link>
              </div>
              {/* جدول بسيط عينة زي التيمبليت */}
              <div className="card-body p-1 py-2">
                <div className="table-responsive table-nowrap">
                  <table className="table table-borderless mb-0">
                    <tbody>
                      <tr>
                        <td>
                          <div className="d-flex align-items-center">
                            <Link to={all_routes.patientDetails} className="avatar me-2">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-23.jpg"
                                alt="patient"
                                className="rounded"
                              />
                            </Link>
                            <div>
                              <h6 className="fs-14 mb-1 fw-semibold">
                                <Link to={all_routes.patientDetails}>Dominic Foster</Link>
                              </h6>
                              <div className="d-flex align-items-center">
                                <p className="mb-0 fs-13 d-inline-flex align-items-center text-body">
                                  <i className="ti ti-calendar me-1" />
                                  12 Aug 2025
                                </p>
                                <span>
                                  <i className="ti ti-minus-vertical text-light fs-14 mx-1" />
                                </span>
                                <p className="mb-0 fs-13 d-inline-flex align-items-center text-body">
                                  <i className="ti ti-clock-hour-7 me-1" />
                                  11:35 PM
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-soft-success">Urology</span>
                        </td>
                        <td className="text-end border-0">
                          <div className="d-flex align-items-center justify-content-end gap-2">
                            <Link to="#" className="btn btn-icon btn-light" aria-label="Reject">
                              <i className="ti ti-xbox-x" />
                            </Link>
                            <Link to="#" className="btn btn-icon btn-light" aria-label="Accept">
                              <i className="ti ti-check" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                      {/* ... تقدري تسيبي بقية الروز أو تشيليها */}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-6 d-flex">
            <div className="card shadow flex-fill w-100">
              <div className="card-header d-flex align-items-center justify-content-between">
                <h5 className="fw-bold mb-0">Patients Statistics</h5>
                <Link to={all_routes.allPatientsList} className="btn btn-sm btn-outline-light">
                  View All
                </Link>
              </div>
              <div className="card-body pb-0">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <h6 className="fs-14 fw-semibold mb-0">Total No of Patients : 480</h6>
                  <div className="d-flex align-items-center gap-3">
                    <p className="mb-0 text-dark">
                      <i className="ti ti-point-filled me-1 text-primary" />
                      New Patients
                    </p>
                    <p className="mb-0 text-dark">
                      <i className="ti ti-point-filled me-1 text-soft-primary" />
                      Old Patients
                    </p>
                  </div>
                </div>
                <Suspense fallback={<div />}>
                  <ChartFive />
                </Suspense>
              </div>
            </div>
          </div>
        </div>

        {/* ======= روابط سريعة/ويبجتس (اختياري) ======= */}
        <div className="row">
          <div className="col-xl-2 col-md-4 col-sm-6">
            <Link to={all_routes.patients} className="card">
              <div className="card-body text-center">
                <span className="badge-soft-primary rounded w-100 d-flex p-3 justify-content-center fs-32 mb-2">
                  <i className="ti ti-users" />
                </span>
                <h6 className="fs-14 fw-semibold text-truncate mb-0">All Patient</h6>
              </div>
            </Link>
          </div>
          <div className="col-xl-2 col-md-4 col-sm-6">
            <Link to={all_routes.allDoctorsList} className="card">
              <div className="card-body text-center">
                <span className="badge-soft-success rounded w-100 d-flex p-3 justify-content-center fs-32 mb-2">
                  <i className="ti ti-topology-bus" />
                </span>
                <h6 className="fs-14 fw-semibold text-truncate mb-0">Doctors</h6>
              </div>
            </Link>
          </div>
          <div className="col-xl-2 col-md-4 col-sm-6">
            <Link to={all_routes.labResults} className="card">
              <div className="card-body text-center">
                <span className="badge-soft-warning rounded w-100 d-flex p-3 justify-content-center fs-32 mb-2">
                  <i className="ti ti-test-pipe-2" />
                </span>
                <h6 className="fs-14 fw-semibold text-truncate mb-0">Labs Results</h6>
              </div>
            </Link>
          </div>
          <div className="col-xl-2 col-md-4 col-sm-6">
            <Link to={all_routes.pharmacy} className="card">
              <div className="card-body text-center">
                <span className="badge-soft-danger rounded w-100 d-flex p-3 justify-content-center fs-32 mb-2">
                  <i className="ti ti-prescription" />
                </span>
                <h6 className="fs-14 fw-semibold text-truncate mb-0">Prescriptions</h6>
              </div>
            </Link>
          </div>
          <div className="col-xl-2 col-md-4 col-sm-6">
            <Link to={all_routes.visits} className="card">
              <div className="card-body text-center">
                <span className="badge-soft-purple rounded w-100 d-flex p-3 justify-content-center fs-32 mb-2">
                  <i className="ti ti-e-passport" />
                </span>
                <h6 className="fs-14 fw-semibold text-truncate mb-0">Visits</h6>
              </div>
            </Link>
          </div>
          <div className="col-xl-2 col-md-4 col-sm-6">
            <Link to={all_routes.medicalResults} className="card">
              <div className="card-body text-center">
                <span className="badge-soft-teal rounded w-100 d-flex p-3 justify-content-center fs-32 mb-2">
                  <i className="ti ti-file-description" />
                </span>
                <h6 className="fs-14 fw-semibold text-truncate mb-0">Medical Records</h6>
              </div>
            </Link>
          </div>
        </div>

        {/* ======= كارد مخصص لداشبورد الصيدلية (1/2/3) ======= */}
        <div className="card mt-4">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
            <h5 className="mb-0">Pharmacy Dashboards</h5>

            <ul className="nav nav-pills">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeDashboard === "1" ? "active" : ""}`}
                  onClick={() => setActiveDashboard("1")}
                >
                  One
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeDashboard === "2" ? "active" : ""}`}
                  onClick={() => setActiveDashboard("2")}
                >
                  Two
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeDashboard === "3" ? "active" : ""}`}
                  onClick={() => setActiveDashboard("3")}
                >
                  Three
                </button>
              </li>
            </ul>
          </div>

          {/* ملاحظة: الداشبوردات الداخلية مكتوبة Tailwind؛ بنحطها جوه card-body بس */}
          <div className="card-body p-0">
            {activeDashboard === "1" && <FirstDashboard />}
            {activeDashboard === "2" && <SecondDashBoard />}
            {activeDashboard === "3" && <ThirdDashBoard data={[]} />}
          </div>
        </div>

        {/* ======= سكشن من التيمبليت (أقسام عليا) - اختياري ======= */}
        <div className="row mt-4">
          <div className="col-xl-5 d-flex">
            <div className="card shadow flex-fill w-100">
              <div className="card-header d-flex align-items-center justify-content-between">
                <h5 className="mb-0">Top Departments</h5>
                <Link to="#" className="btn btn-sm btn-outline-light flex-shrink-0">
                  View All
                </Link>
              </div>
              <div className="card-body">
                <div className="row row-gap-3 align-items-center mb-4">
                  <div className="col-sm-6">
                    <div className="position-relative">
                      <Suspense fallback={<div />}>
                        <SemiDonutChart />
                      </Suspense>
                      <div className="position-absolute text-center top-50 start-50 translate-middle">
                        <p className="fs-13 mb-1">Appointments</p>
                        <h3>3656</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="text-sm-start text-center">
                      <p className="text-dark mb-2">
                        <i className="ti ti-circle-filled text-info fs-13 me-1" />
                        Cardiology
                      </p>
                      <p className="text-dark mb-2">
                        <i className="ti ti-circle-filled text-cyan fs-13 me-1" />
                        Neurology
                      </p>
                      <p className="text-dark mb-2">
                        <i className="ti ti-circle-filled text-purple fs-13 me-1" />
                        Dermatology
                      </p>
                      <p className="text-dark mb-2">
                        <i className="ti ti-circle-filled text-orange fs-13 me-1" />
                        Orthopedics
                      </p>
                      <p className="text-dark mb-2">
                        <i className="ti ti-circle-filled text-warning fs-13 me-1" />
                        Urology
                      </p>
                      <p className="text-dark mb-0">
                        <i className="ti ti-circle-filled text-indigo fs-13 me-1" />
                        Radiology
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border rounded p-1">
                  <div className="row g-0">
                    <div className="col-6 p-2 border-end text-center">
                      <h5 className="mb-1 ">$2512.32</h5>
                      <p className="mb-0 ">Revenue Generated</p>
                    </div>
                    <div className="col-6 p-2 text-center">
                      <h5 className="mb-1">3125+</h5>
                      <p className="mb-0">Appointments last month</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-7 d-flex">
            <div className="card shadow flex-fill w-100">
              <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
                <h5 className="mb-0">Patient Record</h5>
                <Link
                  to={all_routes.medicalResults}
                  className="btn btn-sm btn-outline-light flex-shrink-0"
                >
                  View All
                </Link>
              </div>
              {/* جدول مبسّط زي التيمبليت */}
              <div className="card-body">
                <div className="table-responsive table-nowrap">
                  <table className="table border mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Patient Name</th>
                        <th>Diagnosis</th>
                        <th>Department</th>
                        <th>Last Visit</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <h6 className="fs-14 mb-0 fw-medium">
                            <Link to={all_routes.patientDetails}>James Carter</Link>
                          </h6>
                        </td>
                        <td>Male</td>
                        <td>
                          <span className="badge badge-soft-info">Cardiology</span>
                        </td>
                        <td>17 Jun 2025</td>
                      </tr>
                      {/* ... باقي الصفوف اختياري */}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Appointments (من التيمبليت) — اختياري */}
        {/* تقدري ترجعي تضيفيه هنا لو عايزة */}
      </div>

      <CommonFooter />
    </div>
  );
};

export default MainDashboard;
