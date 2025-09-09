import { Link } from "react-router-dom";
import CommonFooter from "../../../components/common-footer/commonFooter";
import SettingsTabs from "./SettingsTabs";
import CommonSelect from "../../../components/common-select/commonSelect";
import { City, Country, State } from "../../../core/json/selectOption";
import { all_routes } from "../../../routes/all_routes";

const GeneralSettings = () => {
  return (
    <>
      {/* ========================
			Start Page Content
		========================= */}
      <div className="page-wrapper">
        {/* Start Content */}
        <div className="content">
          {/* Page Header */}
          <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
            <div className="breadcrumb-arrow">
              <h4 className="mb-1">Settings</h4>
              <div className="text-end">
                <ol className="breadcrumb m-0 py-0">
                  <li className="breadcrumb-item">
                    <Link to={all_routes.dashboard}>Home</Link>
                  </li>
                  <li className="breadcrumb-item active">Settings</li>
                </ol>
              </div>
            </div>
          </div>
          {/* End Page Header */}
          {/* Start Tabs */}
          <SettingsTabs />
          {/* End Tabs */}
          {/* Start form */}
          <form>
            <div className="card mb-0">
              <div className="card-header border-0 pb-1">
                <h5 className="mb-0 pt-2">Personal Information</h5>
              </div>
              <div className="card-body">
               
                <div className="border-bottom mb-3 pb-3 justify-content-center">
                  {/* start row */}
                  <div className="row">
                    <div className="col-xl-4 col-md-6">
                      <div className="mb-3 mb-lg-0">
                        <label className="form-label">Hospital Name</label>
                        <input type="text" className="form-control" />
                      </div>
                    </div>{" "}
                    {/* end col */}
                    <div className="col-xl-4 col-md-6">
                      <div className="mb-3 mb-lg-0">
                        <label className="form-label">Email</label>
                        <input type="text" className="form-control" />
                      </div>
                    </div>{" "}
                    {/* end col */}
                    <div className="col-xl-4 col-md-6">
                      <div className="mb-0 w-100">
                        <label className="form-label d-block">
                          Mobile Number
                        </label>
                        <input
                          type="text"
                          className="form-control w-100"
                          name="phone"
                        />
                      </div>
                    </div>{" "}
                    {/* end col */}
                  </div>
                  {/* end row */}
                </div>
                <div className="border-bottom mb-3">
                  <h5 className="mb-3">Address</h5>
                  {/* start row */}
                  <div className="row">
                     {/* end col */}
                     <div className="col-xl-4 col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Address Line 1</label>
                        <input type="text" className="form-control" />
                      </div>
                    </div>{" "}
                    {/* end col */}
                    <div className="col-xl-4 col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Address Line 2</label>
                        <input type="text" className="form-control" />
                      </div>
                    </div>{" "}
                    {/* end col */}
                    <div className="col-xl-4 col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Pincode</label>
                        <input type="text" className="form-control" />
                      </div>
                    </div>{" "}
                    {/* end col */}
                    <div className="col-xl-4 col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Country</label>
                        <CommonSelect
                          options={Country}
                          className="select"
                          defaultValue={Country[0]}
                        />
                      </div>
                    </div>{" "}
                    {/* end col */}
                    <div className="col-xl-4 col-md-6">
                      <div className="mb-3">
                        <label className="form-label">State</label>
                        <CommonSelect
                          options={State}
                          className="select"
                          defaultValue={State[0]}
                        />
                      </div>
                    </div>{" "}
                    {/* end col */}
                    <div className="col-xl-4 col-md-6">
                      <div className="mb-3">
                        <label className="form-label">City</label>
                        <CommonSelect
                          options={City}
                          className="select"
                          defaultValue={City[0]}
                        />
                      </div>
                    </div>{" "}

                   
                  </div>
                  {/* end row */}
                </div>
                <div className="d-flex align-items-center justify-content-end gap-2">
                  <Link to="" className="btn btn-white">
                    {" "}
                    Cancel
                  </Link>
                  <Link to="" className="btn btn-primary">
                    {" "}
                    Save Changes
                  </Link>
                </div>
              </div>
            </div>
          </form>
          {/* End form */}
        </div>
        {/* End Content */}
        {/* Start Footer */}
        <CommonFooter />
        {/* End Footer */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
    </>
  );
};

export default GeneralSettings;
