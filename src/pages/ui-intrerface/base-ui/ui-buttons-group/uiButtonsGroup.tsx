import AutoBreadcrumb from "../../../../components/breadcrumb/AutoBreadcrumb"
import CommonFooter from "../../../../components/common-footer/commonFooter"


const UiButtonsGroup = () => {
  return (
    <>
  {/* ========================
			Start Page Content
		========================= */}
  <div className="page-wrapper">
    {/* Start Content */}
    <div className="content pb-0">
      {/* Page Header */}
      <AutoBreadcrumb title="Button Group" />
      {/* End Page Header */}
      {/* start row */}
      <div className="row">
        <div className="col-xl-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Basic Button Group</h5>
            </div>
            <div className="card-body">
              <div
                className="btn-group"
                role="group"
                aria-label="Basic example"
              >
                <button className="btn btn-primary" type="button">
                  Left
                </button>
                <button className="btn btn-primary" type="button">
                  Middle
                </button>
                <button className="btn btn-primary" type="button">
                  Right
                </button>
              </div>
            </div>{" "}
            {/* end card body */}
          </div>{" "}
          {/* end card*/}
        </div>{" "}
        {/* end col */}
        <div className="col-xl-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Outline button group</h5>
            </div>
            <div className="card-body">
              <div
                className="btn-group"
                role="group"
                aria-label="Basic example"
              >
                <button className="btn btn-outline-primary" type="button">
                  Left
                </button>
                <button className="btn btn-outline-primary" type="button">
                  Middle
                </button>
                <button className="btn btn-outline-primary" type="button">
                  Right
                </button>
              </div>
            </div>{" "}
            {/* end card body */}
          </div>{" "}
          {/* end card*/}
        </div>{" "}
        {/* end col */}
      </div>
      {/* end row */}
      {/* start row */}
      <div className="row">
        <div className="col-xl-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Mixed Styles</h5>
            </div>
            <div className="card-body">
              <div
                className="btn-group"
                role="group"
                aria-label="Basic mixed styles example"
              >
                <button type="button" className="btn btn-danger">
                  Left
                </button>
                <button type="button" className="btn btn-warning">
                  Middle
                </button>
                <button type="button" className="btn btn-success">
                  Right
                </button>
              </div>
            </div>{" "}
            {/* end card body */}
          </div>{" "}
          {/* end card*/}
        </div>{" "}
        {/* end col */}
        <div className="col-xl-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Nesting</h5>
            </div>
            <div className="card-body">
              <div
                className="btn-group"
                role="group"
                aria-label="Button group with nested dropdown"
              >
                <button type="button" className="btn btn-primary">
                  1
                </button>
                <button type="button" className="btn btn-primary">
                  2
                </button>
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className="btn btn-primary dropdown-toggle"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Dropdown
                  </button>
                  <ul className="dropdown-menu">
                    <li>
                      <a className="dropdown-item" href="#">
                        Dropdown link
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#">
                        Dropdown link
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>{" "}
            {/* end card body */}
          </div>{" "}
          {/* end card*/}
        </div>{" "}
        {/* end col */}
        <div className="col-xl-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Checkbox Button Groups</h5>
            </div>
            <div className="card-body">
              <div
                className="btn-group"
                role="group"
                aria-label="Basic checkbox toggle button group"
              >
                <input
                  type="checkbox"
                  className="btn-check"
                  id="btncheck1"
                  defaultChecked
                />
                <label className="btn btn-outline-primary" htmlFor="btncheck1">
                  Checkbox 1
                </label>
                <input type="checkbox" className="btn-check" id="btncheck2" />
                <label className="btn btn-outline-primary" htmlFor="btncheck2">
                  Checkbox 2
                </label>
                <input type="checkbox" className="btn-check" id="btncheck3" />
                <label className="btn btn-outline-primary" htmlFor="btncheck3">
                  Checkbox 3
                </label>
              </div>
            </div>{" "}
            {/* end card body */}
          </div>{" "}
          {/* end card*/}
        </div>{" "}
        {/* end col */}
        <div className="col-xl-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Radio Button Groups</h5>
            </div>
            <div className="card-body radio-button-group">
              <div
                className="btn-group"
                role="group"
                aria-label="Basic radio toggle button group"
              >
                <input
                  type="radio"
                  className="btn-check"
                  name="btnradio"
                  id="btnradio1"
                  defaultChecked
                />
                <label className="btn btn-outline-primary" htmlFor="btnradio1">
                  Radio 1
                </label>
                <input
                  type="radio"
                  className="btn-check"
                  name="btnradio"
                  id="btnradio2"
                />
                <label className="btn btn-outline-primary" htmlFor="btnradio2">
                  Radio 2
                </label>
                <input
                  type="radio"
                  className="btn-check"
                  name="btnradio"
                  id="btnradio3"
                />
                <label className="btn btn-outline-primary" htmlFor="btnradio3">
                  Radio 3
                </label>
              </div>
            </div>{" "}
            {/* end card body */}
          </div>{" "}
          {/* end card*/}
        </div>{" "}
        {/* end col */}
      </div>
      {/* end row */}
      {/* start row */}
      <div className="row">
        <div className="col-xl-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Sizing</h5>
            </div>
            <div className="card-body">
              <div
                className="btn-group btn-group-lg mb-3"
                role="group"
                aria-label="Large button group"
              >
                <button type="button" className="btn btn-primary">
                  Left
                </button>
                <button type="button" className="btn btn-primary">
                  Middle
                </button>
                <button type="button" className="btn btn-primary">
                  Right
                </button>
              </div>
              <br />
              <div
                className="btn-group mb-3"
                role="group"
                aria-label="Default button group"
              >
                <button type="button" className="btn btn-secondary">
                  Left
                </button>
                <button type="button" className="btn btn-secondary">
                  Middle
                </button>
                <button type="button" className="btn btn-secondary">
                  Right
                </button>
              </div>
              <br />
              <div
                className="btn-group btn-group-sm"
                role="group"
                aria-label="Small button group"
              >
                <button type="button" className="btn btn-light">
                  Left
                </button>
                <button type="button" className="btn btn-light">
                  Middle
                </button>
                <button type="button" className="btn btn-light">
                  Right
                </button>
              </div>
            </div>{" "}
            {/* end card body */}
          </div>{" "}
          {/* end card*/}
        </div>{" "}
        {/* end col */}
        <div className="col-xl-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Button Toolbar</h5>
            </div>
            <div className="card-body">
              <div
                className="btn-toolbar mb-3"
                role="toolbar"
                aria-label="Toolbar with button groups"
              >
                <div
                  className="btn-group me-2 my-1"
                  role="group"
                  aria-label="First group"
                >
                  <button type="button" className="btn btn-primary">
                    1
                  </button>
                  <button type="button" className="btn btn-primary">
                    2
                  </button>
                  <button type="button" className="btn btn-primary">
                    3
                  </button>
                  <button type="button" className="btn btn-primary">
                    4
                  </button>
                </div>
                <div
                  className="btn-group me-2 my-1"
                  role="group"
                  aria-label="Second group"
                >
                  <button type="button" className="btn btn-secondary">
                    5
                  </button>
                  <button type="button" className="btn btn-secondary">
                    6
                  </button>
                  <button type="button" className="btn btn-secondary">
                    7
                  </button>
                </div>
                <div
                  className="btn-group my-1"
                  role="group"
                  aria-label="Third group"
                >
                  <button type="button" className="btn btn-info">
                    8
                  </button>
                </div>
              </div>
              <div
                className="btn-toolbar mb-3"
                role="toolbar"
                aria-label="Toolbar with button groups"
              >
                <div
                  className="btn-group me-2 my-1"
                  role="group"
                  aria-label="First group"
                >
                  <button type="button" className="btn btn-outline-secondary">
                    1
                  </button>
                  <button type="button" className="btn btn-outline-secondary">
                    2
                  </button>
                  <button type="button" className="btn btn-outline-secondary">
                    3
                  </button>
                  <button type="button" className="btn btn-outline-secondary">
                    4
                  </button>
                </div>
                <div className="input-group my-1">
                  <div className="input-group-text" id="btnGroupAddon">
                    @
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Input group example"
                    aria-label="Input group example"
                    aria-describedby="btnGroupAddon"
                  />
                </div>
              </div>
              <div
                className="btn-toolbar justify-content-between"
                role="toolbar"
                aria-label="Toolbar with button groups"
              >
                <div
                  className="btn-group my-1"
                  role="group"
                  aria-label="First group"
                >
                  <button type="button" className="btn btn-outline-secondary">
                    1
                  </button>
                  <button type="button" className="btn btn-outline-secondary">
                    2
                  </button>
                  <button type="button" className="btn btn-outline-secondary">
                    3
                  </button>
                  <button type="button" className="btn btn-outline-secondary">
                    4
                  </button>
                </div>
                <div className="input-group my-1">
                  <div className="input-group-text" id="btnGroupAddon2">
                    @
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Input group example"
                    aria-label="Input group example"
                    aria-describedby="btnGroupAddon2"
                  />
                </div>
              </div>
            </div>{" "}
            {/* end card body */}
          </div>{" "}
          {/* end card*/}
        </div>{" "}
        {/* end col */}
        <div className="col-xl-6">
          <div className="card card-h-100">
            <div className="card-header">
              <h5 className="card-title">Vertical</h5>
            </div>
            <div className="card-body">
              <div className="row gap-2">
                <div className="col-sm-3">
                  <div
                    className="btn-group-vertical"
                    role="group"
                    aria-label="Vertical button group"
                  >
                    <button type="button" className="btn btn-primary">
                      Button
                    </button>
                    <div className="btn-group" role="group">
                      <button
                        type="button"
                        className="btn btn-primary dropdown-toggle"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Dropdown
                      </button>
                      <ul className="dropdown-menu">
                        <li>
                          <a className="dropdown-item" href="#">
                            Dropdown link
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="#">
                            Dropdown link
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div className="btn-group dropstart" role="group">
                      <button
                        type="button"
                        className="btn btn-primary dropdown-toggle"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Dropdown
                      </button>
                      <ul className="dropdown-menu">
                        <li>
                          <a className="dropdown-item" href="#">
                            Dropdown link
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="#">
                            Dropdown link
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div className="btn-group dropend" role="group">
                      <button
                        type="button"
                        className="btn btn-primary dropdown-toggle"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Dropdown
                      </button>
                      <ul className="dropdown-menu">
                        <li>
                          <a className="dropdown-item" href="#">
                            Dropdown link
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="#">
                            Dropdown link
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div className="btn-group dropup" role="group">
                      <button
                        type="button"
                        className="btn btn-primary dropdown-toggle"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Dropdown
                      </button>
                      <ul className="dropdown-menu">
                        <li>
                          <a className="dropdown-item" href="#">
                            Dropdown link
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="#">
                            Dropdown link
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col-sm-3">
                  <div
                    className="btn-group-vertical"
                    role="group"
                    aria-label="Vertical button group"
                  >
                    <button type="button" className="btn btn-primary">
                      Button
                    </button>
                    <button type="button" className="btn btn-primary">
                      Button
                    </button>
                    <button type="button" className="btn btn-primary">
                      Button
                    </button>
                    <button type="button" className="btn btn-primary">
                      Button
                    </button>
                  </div>
                </div>
                <div className="col-sm-3">
                  <div
                    className="btn-group-vertical"
                    role="group"
                    aria-label="Vertical radio toggle button group"
                  >
                    <input
                      type="radio"
                      className="btn-check"
                      name="vbtn-radio"
                      id="vbtn-radio1"
                      defaultChecked
                    />
                    <label
                      className="btn btn-outline-primary"
                      htmlFor="vbtn-radio1"
                    >
                      Radio 1
                    </label>
                    <input
                      type="radio"
                      className="btn-check"
                      name="vbtn-radio"
                      id="vbtn-radio2"
                    />
                    <label
                      className="btn btn-outline-primary"
                      htmlFor="vbtn-radio2"
                    >
                      Radio 2
                    </label>
                    <input
                      type="radio"
                      className="btn-check"
                      name="vbtn-radio"
                      id="vbtn-radio3"
                    />
                    <label
                      className="btn btn-outline-primary"
                      htmlFor="vbtn-radio3"
                    >
                      Radio 3
                    </label>
                  </div>
                </div>
              </div>
            </div>{" "}
            {/* end card body */}
          </div>{" "}
          {/* end card */}
        </div>{" "}
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

  )
}

export default UiButtonsGroup