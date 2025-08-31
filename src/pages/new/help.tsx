import React, { useState } from 'react';
import { Container, Row, Col, Card, Accordion, Form, InputGroup, Button } from 'react-bootstrap';
import { RiSearchLine, RiCustomerService2Line, RiQuestionLine, RiFileList3Line, RiMedicineBottleLine, RiBuildingLine, RiGroupLine, RiDashboardLine, RiHistoryLine } from 'react-icons/ri';

const HelpSupportPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const helpSections = [
    {
      title: "Search By Drug Name",
      icon: <RiMedicineBottleLine />,
      content: (
        <ul>
          <li>Type the desired drug name in the search bar.</li>
          <li>You will get all available NDCs.</li>
          <li>Choose the desired NDC.</li>
          <li>If the selected NDC has insurance, you will get suggested insurance options to choose from.</li>
          <li>Then click on 'View Drug Details'.</li>
          <li><strong>Note:</strong> If you don't choose the RxGroup and click on 'View Drug Details', you will get the details without prices.</li>
        </ul>
      )
    },
    {
      title: "Search By Insurance Data",
      icon: <RiBuildingLine />,
      content: (
        <ul>
          <li>Type the desired BIN or insurance name in the search bar.</li>
          <li>You will get all available insurances.</li>
          <li>Choose the desired insurance to get all available PCNs. You can also search for a drug using only the BIN.</li>
          <li>Search for the RxGroup to see all available drugs and NDCs.</li>
          <li>Click on 'View Drug Details' to see the details with prices.</li>
          <li><strong>Note:</strong> If you don't choose the RxGroup and click on 'View Drug Details', you will get the details without prices.</li>
        </ul>
      )
    },
    {
      title: "Search By RxGroup Directly",
      icon: <RiGroupLine />,
      content: (
        <ul>
          <li>Search for the desired RxGroup directly.</li>
          <li>Select the desired drug and NDC.</li>
          <li>Click on 'View Drug Details' to see the details with prices.</li>
        </ul>
      )
    },
    {
      title: "Drug Details Alternatives",
      icon: <RiFileList3Line />,
      content: (
        <ul>
          <li>Alternatives are based on drug class—you will get all alternatives that belong to the same class.</li>
          <li>The first table contains alternatives that have insurance.</li>
          <li>The second table contains alternatives that don't have insurance.</li>
        </ul>
      )
    },
    {
      title: "All Scripts Audit Dashboard",
      icon: <RiDashboardLine />,
      content: (
        <ul>
          <li>Get estimated data for all scripts.</li>
          <li>Get estimated predicted revenue for all scripts.</li>
          <li>Get real revenue for all scripts.</li>
          <li><strong>Note:</strong> The best net is calculated based on the previous month of the targeted script.</li>
        </ul>
      )
    },
    {
      title: "Matched Scripts Audit Dashboard",
      icon: <RiDashboardLine />,
      content: (
        <ul>
          <li>Get estimated data for all scripts that match with the best drug to be sold.</li>
          <li>Get estimated predicted revenue for all scripts.</li>
          <li>Get real revenue for all scripts.</li>
          <li><strong>Note:</strong> The best net is calculated based on the previous month of the targeted script.</li>
        </ul>
      )
    },
    {
      title: "Mismatched Scripts Audit Dashboard",
      icon: <RiDashboardLine />,
      content: (
        <ul>
          <li>Get estimated data for all scripts that mismatch with the best drug to be sold.</li>
          <li>Get estimated predicted revenue for all scripts.</li>
          <li>Get real revenue for all scripts.</li>
          <li><strong>Note:</strong> The best net is calculated based on the previous month of the targeted script.</li>
        </ul>
      )
    },
    {
      title: "User Logs",
      icon: <RiHistoryLine />,
      content: (
        <ul>
          <li>View all user logs.</li>
          <li>Filter logs by selected filters and date range.</li>
          <li>View a performance graph showing user activity using the tool.</li>
        </ul>
      )
    }
  ];

  const filteredSections = helpSections.filter(section => 
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    section.content.props.children.some((item: any) => 
      typeof item === 'string' ? item.toLowerCase().includes(searchQuery.toLowerCase()) : false
    )
  );

  return (
<Container className="py-5 content-with-sidebar">
      {/* Header Section */}
      <Row className="mb-5">
        <Col className="text-center">
          <h1 className="display-5 fw-bold text-primary mb-3">
            <RiCustomerService2Line className="me-2" />
            Help & Support
          </h1>
          <p className="lead text-muted">
            Find answers to your questions and learn how to make the most of our platform
          </p>
        </Col>
      </Row>

      {/* Search Section */}
      <Row className="mb-5">
        <Col lg={8} className="mx-auto">
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3">
                <RiSearchLine className="me-2" />
                Search Help Topics
              </h5>
              <InputGroup size="lg">
                <Form.Control
                  type="text"
                  placeholder="Search help topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button variant="primary">
                  <RiSearchLine />
                </Button>
              </InputGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* How It Works Section */}
      <Row className="mb-5">
        <Col>
          <Card className="border-0 bg-light">
            <Card.Body className="p-5 text-center">
              <div className="mb-4">
                <RiQuestionLine size={48} className="text-primary mb-3" />
                <h2 className="fw-bold">How It Works</h2>
                <p className="text-muted">Follow these simple steps to get started</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Help Sections */}
      <Row>
        <Col>
          <h3 className="fw-bold mb-4">Help Sections</h3>
          
          {filteredSections.length > 0 ? (
            <Accordion defaultActiveKey="0" className="help-accordion">
              {filteredSections.map((section, index) => (
                <Accordion.Item eventKey={index.toString()} key={index} className="mb-3 border-0">
                  <Accordion.Header className="fw-bold">
                    <span className="me-3 text-primary">{section.icon}</span>
                    {section.title}
                  </Accordion.Header>
                  <Accordion.Body className="bg-light">
                    {section.content}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          ) : (
            <Card className="border-0 text-center py-5">
              <Card.Body>
                <RiSearchLine size={48} className="text-muted mb-3" />
                <h5 className="fw-bold">No results found</h5>
                <p className="text-muted">Try searching with different keywords</p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Contact Section */}
      <Row className="mt-5">
        <Col className="text-center">
          <Card className="border-0 bg-primary text-white">
            <Card.Body className="p-5">
              <h3 className="fw-bold mb-3">Still need help?</h3>
              <p className="mb-4">Our support team is here to assist you</p>
              <Button variant="light" size="lg">
                Contact Us
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

     
  <style>{`
    .content-with-sidebar {
      margin-left: 230px; /* match your sidebar width */
      transition: margin-left .2s ease;
    }

    /* On mobile, sidebar overlays, so remove margin */
    @media (max-width: 991.98px) {
      .content-with-sidebar {
        margin-left: 0;
      }
    }

    /* If your layout toggles a collapsed sidebar class, shrink margin */
    body.sidebar-collapsed .content-with-sidebar,
    .page-wrapper.sidebar-collapsed .content-with-sidebar {
      margin-left: 72px; /* collapsed width */
    }
  `}</style>
    </Container>
  );
};

export default HelpSupportPage;