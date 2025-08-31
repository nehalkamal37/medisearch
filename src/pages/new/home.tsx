import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import type { ReactNode } from 'react';
// Graphic icons (Remix Icons via react-icons)
import {
  RiCapsuleLine,
  RiMedicineBottleLine,
  RiTruckLine,
  RiWallet3Line,
  RiSyringeLine,
  RiShieldCheckLine,
  RiStarSmileLine,
  RiAlarmWarningLine,
  RiTestTubeLine,
  RiTwitterLine,
  RiFacebookCircleLine,
  RiLinkedinLine,
  RiInstagramLine,
} from 'react-icons/ri';

// ===== Types =====
interface Service {
  title: string;
  description: string;
  icon: ReactNode;
}

interface Feature {
  title: string;
  description: string;
  icon: ReactNode;
}

const brand = 'MedSearch ';

const LandingPage: React.FC = () => {
  //const [_, setActiveTab] = useState<string>('home');

  // ===== PHARMACY CONTENT =====
  const services: Service[] = [
    {
      title: 'Prescription Refill & Tracking',
      description:
        'Request refills in one tap, get SMS updates, and track your order from pharmacy to doorstep.',
      icon: <RiCapsuleLine />,
    },
    {
      title: 'Transfer Prescriptions',
      description:
        'Moving from another pharmacy? We handle the transfer so you don’t have to.',
      icon: <RiMedicineBottleLine />,
    },
    {
      title: 'Insurance & Savings',
      description:
        'We optimize copays, find generic alternatives, and apply manufacturer coupons where available.',
      icon: <RiWallet3Line />,
    },
    {
      title: 'Home Delivery & Pickup',
      description:
        'Fast local delivery and curbside pickup options to match your schedule.',
      icon: <RiTruckLine />,
    },
    {
      title: 'Vaccinations',
      description:
        'Seasonal flu, COVID‑19, and travel vaccines—administered by licensed pharmacists.',
      icon: <RiSyringeLine />,
    },
    {
      title: 'Compounding & Special Orders',
      description:
        'Custom strengths, dye‑free, and pediatric flavors prepared on request.',
      icon: <RiTestTubeLine />,
    },
  ];

  const features: Feature[] = [
    {
      title: 'Licensed & Secure',
      description:
        'State‑licensed pharmacy with HIPAA‑compliant systems to protect your data.',
      icon: <RiShieldCheckLine />,
    },
    {
      title: 'Refill Reminders',
      description: 'Never run out—smart reminders keep your medications on schedule.',
      icon: <RiAlarmWarningLine />,
    },
    {
      title: 'People Love Us',
      description:
        'Friendly pharmacists, quick service, and transparent prices—every time.',
      icon: <RiStarSmileLine />,
    },
  ];
/*
  const testimonials: Testimonial[] = [
    {
      name: 'Amira Y.',
      role: 'Local Customer',
      content:
        'Fast refills and great advice on generics. Delivery arrived the same day! ',
      avatar: 'AY',
    },
    {
      name: 'Karim N.',
      role: 'Caregiver',
      content:
        'Medication sync made life easier—one pickup for the whole family each month.',
      avatar: 'KN',
    },
    {
      name: 'Mona S.',
      role: 'Business Owner',
      content:
        'They handled my prescription transfer in minutes. Super smooth experience.',
      avatar: 'MS',
    },
  ];
*/
  return (
    <div className="pharmacy-homepage">
      {/* ===== NAVBAR ===== */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white fixed-top shadow-sm">
        <Container>
          <a className="navbar-brand fw-bold text-primary d-flex align-items-center" href="#">
            <span
              className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
              style={{ width: '40px', height: '40px' }}
              aria-hidden
            >
              S
            </span>
            {brand}
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link active" href="#">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#features">Features</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#services">Services</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#contact">Contact</a>
              </li>
            </ul>
            <div className="d-flex ms-lg-3">
             <a href='/login'>   <Button variant="outline-primary" className="me-2">Sign In</Button></a>
             <a href='/search1'> <Button variant="primary">Dashboard</Button> </a>
            </div>
          </div>
        </Container>
      </nav>

      {/* ===== HERO ===== */}
      <section className="hero-section bg-light py-5 mt-5">
        <Container>
          <Row className="align-items-center py-5">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h1 className="display-5 fw-bold text-dark mb-3">Your Neighborhood Pharmacy—Modernized</h1>
              <p className="lead text-muted mb-4">
                Manage prescriptions, get refills delivered, and save on medications—all with friendly pharmacist support.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Button variant="primary" size="lg">Get Started</Button>
                <Button variant="outline-primary" size="lg">Pricing & Insurance</Button>
              </div>
              <div className="d-flex gap-3 mt-4 small text-muted">
                <div className="d-flex align-items-center gap-2"><RiShieldCheckLine /> HIPAA Compliant</div>
                <div className="d-flex align-items-center gap-2"><RiTruckLine /> Same‑day local delivery</div>
              </div>
            </Col>
            <Col lg={6}>
              <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Empty_shelves_in_one_pharmacy_in_Suzhou-20220214.jpg/1280px-Empty_shelves_in_one_pharmacy_in_Suzhou-20220214.jpg "
              //  src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1280&auto=format&fit=crop"
                alt="Modern pharmacy shelves and counter"
                className="img-fluid rounded shadow"
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="features-section py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="fw-bold">Why Choose {brand}?</h2>
              <p className="text-muted">Simple, reliable care with real savings.</p>
            </Col>
          </Row>
          <Row>
            {features.map((feature, index) => (
              <Col md={4} key={index} className="mb-4">
                <Card className="h-100 border-0 text-center">
                  <Card.Body className="p-4">
                    <div className="feature-icon display-4 mb-3 text-primary" aria-hidden>{feature.icon}</div>
                    <h5 className="fw-bold">{feature.title}</h5>
                    <p className="text-muted">{feature.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ===== SERVICES ===== */}
      <section id="services" className="services-section bg-light py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="fw-bold">What we do</h2>
              <p className="text-muted">Everyday pharmacy services designed around you</p>
            </Col>
          </Row>
          <Row>
            {services.map((service, index) => (
              <Col lg={4} md={6} key={index} className="mb-4">
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <div className="service-icon fs-1 mb-3 text-primary" aria-hidden>{service.icon}</div>
                    <h5 className="fw-bold">{service.title}</h5>
                    <p className="text-muted">{service.description}</p>
                    <a href="#contact" className="text-decoration-none">Learn more →</a>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

    
        
      {/* ===== FOOTER ===== */}
      <footer className="footer bg-dark text-white-90 py-5">
        <Container>
          <Row>
            <Col lg={4} className="mb-4">
              <h5 className="fw-bold mb-3 text-white">{brand}</h5>
              <p className="text-light-strong">
                A modern neighborhood pharmacy—fast refills, fair prices, and friendly help when you need it.
              </p>
            </Col>
            <Col lg={2} className="mb-4">
              <h6 className="fw-bold mb-3 text-white">Company</h6>
              <ul className="list-unstyled">
                <li><a href="#" className="footer-link">About</a></li>
                <li><a href="#" className="footer-link">Careers</a></li>
                <li><a href="#" className="footer-link">Press</a></li>
              </ul>
            </Col>
            <Col lg={2} className="mb-4">
              <h6 className="fw-bold mb-3 text-white">Services</h6>
              <ul className="list-unstyled">
                <li><a href="#services" className="footer-link">Refills</a></li>
                <li><a href="#services" className="footer-link">Delivery</a></li>
                <li><a href="#services" className="footer-link">Vaccines</a></li>
                <li><a href="#services" className="footer-link">Compounding</a></li>
              </ul>
            </Col>
            <Col lg={2} className="mb-4">
              <h6 className="fw-bold mb-3 text-white">Support</h6>
              <ul className="list-unstyled">
                <li><a href="#" className="footer-link">Help Center</a></li>
                <li><a href="#" className="footer-link">Insurance</a></li>
                <li><a href="#" className="footer-link">Accessibility</a></li>
                <li><a href="#" className="footer-link">Status</a></li>
              </ul>
            </Col>
            <Col lg={2} className="mb-4">
              <h6 className="fw-bold mb-3 text-white">Legal</h6>
              <ul className="list-unstyled">
                <li><a href="#" className="footer-link">Privacy</a></li>
                <li><a href="#" className="footer-link">Terms</a></li>
                <li><a href="#" className="footer-link">HIPAA</a></li>
                <li><a href="#" className="footer-link">Cookies</a></li>
              </ul>
            </Col>
          </Row>
          <hr className="my-4 border-gray-700" />
          <Row className="align-items-center">
            <Col md={6} className="small text-light-strong">
              © {new Date().getFullYear()} {brand}. All rights reserved.
            </Col>
            <Col md={6} className="text-md-end">
              <div className="d-flex justify-content-md-end gap-3 fs-5">
                <a aria-label="Twitter" href="#" className="footer-icon"><RiTwitterLine /></a>
                <a aria-label="Facebook" href="#" className="footer-icon"><RiFacebookCircleLine /></a>
                <a aria-label="LinkedIn" href="#" className="footer-icon"><RiLinkedinLine /></a>
                <a aria-label="Instagram" href="#" className="footer-icon"><RiInstagramLine /></a>
              </div>
            </Col>
          </Row>
        </Container>

        {/* Local styles for brighter footer text & nicer icons */}
        <style>{`
          .text-white-90 { color: rgba(255,255,255,.92); }
          .text-light-strong { color: rgba(255,255,255,.88); }
          .footer-link { color: rgba(255,255,255,.88); text-decoration: none; }
          .footer-link:hover { color: #fff; text-decoration: underline; }
          .footer-icon { color: rgba(255,255,255,.85); }
          .footer-icon:hover { color: #fff; }
        `}</style>
      </footer>

      {/* Page styles */}
      <style>{`
        .pharmacy-homepage { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .hero-section { padding-top: 7rem; padding-bottom: 5rem; }
        .features-section, .services-section, .testimonials-section { padding: 5rem 0; }
        .cta-section { padding: 4rem 0; }
        .feature-icon, .service-icon { color: #2c6bac; }
        .avatar { font-weight: 700; }
        .carousel-control-prev, .carousel-control-next { width: 5%; }
      `}</style>
    </div>
  );
};

export default LandingPage;
