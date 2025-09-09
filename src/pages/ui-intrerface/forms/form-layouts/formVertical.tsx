import AutoBreadcrumb from "../../../../components/breadcrumb/AutoBreadcrumb";
import CommonFooter from "../../../../components/common-footer/commonFooter";




const FormVertical = () => {
  return (
    <>
      {/* ========================
			Start Page Content
		========================= */}
      <div className="page-wrapper">
        {/* Start Content */}
        <div className="content">
          {/* Page Header */}
         <AutoBreadcrumb title="Form Vertical" />

          {/* End Page Header */}
          {/* start row */}
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title">Basic Form</h5>
                </div>
                {/* end card-header */}
                <div className="card-body">
                  <form action="#">
                    <div className="mb-3">
                      <label className="form-label">First Name</label>
                      <input type="text" className="form-control" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Last Name</label>
                      <input type="text" className="form-control" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email Address</label>
                      <input type="email" className="form-control" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Username</label>
                      <input type="text" className="form-control" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Password</label>
                      <input type="password" className="form-control" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Repeat Password</label>
                      <input type="password" className="form-control" />
                    </div>
                    <div className="text-end">
                      <button type="submit" className="btn btn-primary">
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
                {/* end card-body */}
              </div>
              {/* end card */}
            </div>
            {/* end col */}
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title">Address Form</h5>
                </div>
                <div className="card-body">
                  <form action="#">
                    <div className="mb-3">
                      <label className="form-label">Address Line 1</label>
                      <input type="text" className="form-control" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Address Line 2</label>
                      <input type="text" className="form-control" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">City</label>
                      <input type="text" className="form-control" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">State</label>
                      <input type="text" className="form-control" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Country</label>
                      <input type="text" className="form-control" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Postal Code</label>
                      <input type="text" className="form-control" />
                    </div>
                    <div className="text-end">
                      <button type="submit" className="btn btn-primary">
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
                {/* end card-body */}
              </div>
              {/* end card */}
            </div>
            {/* end col */}
          </div>
          {/* end row */}
          {/* start row */}
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title">Two Column Vertical Form</h5>
                </div>
                {/* end card-header */}
                <div className="card-body">
                  <form action="#">
                    <h5 className="mb-2">Personal Information</h5>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">First Name</label>
                          <input type="text" className="form-control" />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Last Name</label>
                          <input type="text" className="form-control" />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Blood Group</label>
                          <select className="form-select">
                            <option>Select</option>
                            <option value={1}>A+</option>
                            <option value={2}>O+</option>
                            <option value={3}>B+</option>
                            <option value={4}>AB+</option>
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="d-block">Gender:</label>
                          <div className="form-check form-check-inline">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="gender"
                              id="gender_male"
                              defaultValue="option1"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="gender_male"
                            >
                              Male
                            </label>
                          </div>
                          <div className="form-check form-check-inline">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="gender"
                              id="gender_female"
                              defaultValue="option2"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="gender_female"
                            >
                              Female
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Username</label>
                          <input type="text" className="form-control" />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Email</label>
                          <input type="text" className="form-control" />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Password</label>
                          <input type="text" className="form-control" />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Repeat Password</label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                    </div>
                    <h5 className="mb-3">Postal Address</h5>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Address Line 1</label>
                          <input type="text" className="form-control" />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Address Line 2</label>
                          <input type="text" className="form-control" />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">State</label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">City</label>
                          <input type="text" className="form-control" />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Country</label>
                          <input type="text" className="form-control" />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Postal Code</label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                    </div>
                    <div className="text-end">
                      <button type="submit" className="btn btn-primary">
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
                {/* end card-body */}
              </div>
              {/* end card */}
            </div>
            {/* end col */}
          </div>
          {/* end row */}
          {/* start row */}
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title">Two Column Vertical Form</h5>
                </div>
                {/* end card-header */}
                <div className="card-body">
                  <form action="#">
                    <div className="row">
                      <div className="col-md-6">
                        <h5 className="mb-3">Personal Details</h5>
                        <div className="mb-3">
                          <label className="form-label">Name:</label>
                          <input type="text" className="form-control" />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Password:</label>
                          <input type="password" className="form-control" />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">State:</label>
                          <select className="form-select">
                            <option>Select State</option>
                            <option value={1}>California</option>
                            <option value={2}>Texas</option>
                            <option value={3}>Florida</option>
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label" htmlFor="vertical-message">Your Message:</label>
                          <textarea rows={5} cols={5} className="form-control" id="vertical-message" placeholder="Enter message" defaultValue={""} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <h5 className="mb-3">Personal Details</h5>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label" htmlFor="vertical-first-name">First Name:</label>
                              <input type="text" className="form-control" id="vertical-first-name" />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label" htmlFor="vertical-last-name">Last Name:</label>
                              <input type="text" className="form-control" id="vertical-last-name" />
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Email:</label>
                              <input type="text" className="form-control" />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Phone:</label>
                              <input type="text" className="form-control" />
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-12">
                            <div className="mb-3">
                              <label className="form-label">
                                Address line:
                              </label>
                              <input type="text" className="form-control" />
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Country:</label>
                              <select className="form-select">
                                <option>Select Country</option>
                                <option value={1}>USA</option>
                                <option value={2}>France</option>
                                <option value={3}>India</option>
                                <option value={4}>Spain</option>
                              </select>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label>State/Province:</label>
                              <input type="text" className="form-control" />
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">ZIP code:</label>
                              <input type="text" className="form-control" />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">City:</label>
                              <input type="text" className="form-control" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-end">
                      <button type="submit" className="btn btn-primary">
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
                {/* end card-body */}
              </div>
              {/* end card */}
            </div>
            {/* end col */}
          </div>
          {/* end row */}
          {/* start row */}
          <div className="row">
            <div className="col-xl-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title">Vertical Forms with icon</h5>
                </div>
                {/* end card-header */}
                <div className="card-body">
                  <div className="mb-3">
                    <label htmlFor="form-text1" className="form-label fs-14">
                      Enter name
                    </label>
                    <div className="input-group">
                      <div className="input-group-text">
                        <i className="ti ti-user" />
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        id="form-text1"
                        placeholder=""
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="form-password1"
                      className="form-label fs-14"
                    >
                      Enter Password
                    </label>
                    <div className="input-group">
                      <div className="input-group-text">
                        <i className="ti ti-lock" />
                      </div>
                      <input
                        type="password"
                        className="form-control"
                        id="form-password1"
                        placeholder=""
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="form-password1"
                      className="form-label fs-14"
                    >
                      Enter Repeat Password
                    </label>
                    <div className="input-group">
                      <div className="input-group-text">
                        <i className="ti ti-lock" />
                      </div>
                      <input
                        type="password"
                        className="form-control"
                        id="form-password2"
                        placeholder=""
                      />
                    </div>
                  </div>
                  <button className="btn btn-primary" type="submit">
                    Submit
                  </button>
                </div>
                {/* end card-body */}
              </div>
              {/* end card */}
            </div>
            {/* end col */}
            <div className="col-xl-6">
              <div className="card card-h-100">
                <div className="card-header">
                  <h5 className="card-title">Horizontal form label sizing</h5>
                </div>
                {/* end card-header */}
                <div className="card-body">
                  <div className="mb-3">
                    <label
                      htmlFor="colFormLabelSm"
                      className="form-label form-label-sm"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      id="colFormLabelSm"
                      placeholder="col-form-label-sm"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="colFormLabel" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="colFormLabel"
                      placeholder="col-form-label"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="colFormLabelLg"
                      className="form-label form-label-lg"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      id="colFormLabelLg"
                      placeholder="col-form-label-lg"
                    />
                  </div>
                </div>
                {/* end card-body */}
              </div>
              {/* end card */}
            </div>
            {/* end col */}
          </div>
          {/* end row */}
        </div>
        {/* End Content */}
        {/* Start Footer */}
       <CommonFooter/>
        {/* End Footer */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
    </>
  );
};

export default FormVertical;
