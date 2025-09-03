import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import type { ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  AnimatePresence,
  useInView,
} from "framer-motion";
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
} from "react-icons/ri";

/* ================= Data ================= */
interface Service { title: string; description: string; icon: ReactNode }
interface Feature { title: string; description: string; icon: ReactNode }

const brand = "MedSearch";
const HERO_IMG =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Empty_shelves_in_one_pharmacy_in_Suzhou-20220214.jpg/1280px-Empty_shelves_in_one_pharmacy_in_Suzhou-20220214.jpg";

const services: Service[] = [
  { title: "Prescription Refill & Tracking", description: "Request refills in one tap, get SMS updates, and track your order from pharmacy to doorstep.", icon: <RiCapsuleLine /> },
  { title: "Transfer Prescriptions", description: "Moving from another pharmacy? We handle the transfer so you don’t have to.", icon: <RiMedicineBottleLine /> },
  { title: "Insurance & Savings", description: "We optimize copays, find generics, and apply manufacturer coupons when available.", icon: <RiWallet3Line /> },
  { title: "Home Delivery & Pickup", description: "Fast local delivery and curbside pickup to match your schedule.", icon: <RiTruckLine /> },
  { title: "Vaccinations", description: "Seasonal flu, COVID-19, and travel vaccines—administered by licensed pharmacists.", icon: <RiSyringeLine /> },
  { title: "Compounding & Special Orders", description: "Custom strengths, dye-free, and pediatric flavors prepared on request.", icon: <RiTestTubeLine /> },
];

const features: Feature[] = [
  { title: "Licensed & Secure", description: "State-licensed pharmacy with HIPAA-compliant systems to protect your data.", icon: <RiShieldCheckLine /> },
  { title: "Refill Reminders", description: "Never run out—smart reminders keep your medications on schedule.", icon: <RiAlarmWarningLine /> },
  { title: "People Love Us", description: "Friendly pharmacists, quick service, and transparent prices—every time.", icon: <RiStarSmileLine /> },
];

/* =============== Variants / helpers =============== */
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { delay, duration: 0.55, ease: "easeOut" } },
});

const containerStagger = (delay = 0) => ({
  hidden: {},
  show: { transition: { delay, staggerChildren: 0.08, when: "beforeChildren" } },
});

const pop = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.35 } },
};

/* Scroll-reveal wrapper to reuse */
const Reveal: React.FC<{ children: React.ReactNode; delay?: number; style?: React.CSSProperties; className?: string; }> = ({ children, delay = 0, style, className }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  return (
    <motion.div
      ref={ref}
      variants={fadeUp(delay)}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ================= Page ================= */
const LandingPage: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [navBlur, setNavBlur] = useState(false);
  useEffect(() => {
    const onScroll = () => setNavBlur(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* scroll progress bar */
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 20, mass: 0.2 });

  /* subtle hero parallax */
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 400], [0, prefersReducedMotion ? 0 : -60]);

  return (
    <div className="pharmacy-homepage">
      {/* ===== Top scroll progress ===== */}
      <motion.div className="scrollbar" style={{ scaleX: progress }} />

      {/* ===== NAVBAR (glass + blur on scroll) ===== */}
      <nav className={`navbar navbar-expand-lg fixed-top custom-nav ${navBlur ? "scrolled" : ""}`}>
        <Container>
          <a className="navbar-brand fw-bold d-flex align-items-center" href="#">
            <span className="brand-dot me-2 d-inline-flex align-items-center justify-content-center" aria-hidden>S</span>
            <span className="gradient-text">{brand}</span>
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><a className="nav-link active" href="#">Home</a></li>
              <li className="nav-item"><a className="nav-link" href="#features">Features</a></li>
              <li className="nav-item"><a className="nav-link" href="#services">Services</a></li>
              <li className="nav-item"><a className="nav-link" href="#contact">Contact</a></li>
            </ul>
            <div className="d-flex ms-lg-3 gap-2">
              <a href="/login">
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline-primary" className="btn-soft">Sign In</Button>
                </motion.div>
              </a>
              <a href="/search1">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="primary" className="btn-gradient">Dashboard</Button>
                </motion.div>
              </a>
            </div>
          </div>
        </Container>
      </nav>

      {/* ===== HERO ===== */}
      <section className="hero-section">
        <div className="grid-bg" aria-hidden />
        <Container>
          <Row className="align-items-center py-5">
            <Col lg={6} className="mb-5 mb-lg-0">
              <Reveal>
                <h1 className="display-5 fw-bold text-dark mb-3">
                  Your Neighborhood Pharmacy—<span className="gradient-text">Modernized</span>
                </h1>
              </Reveal>
              <Reveal delay={0.08}>
                <p className="lead text-muted mb-4">
                  Manage prescriptions, get refills delivered, and save on medications—all with friendly pharmacist support.
                </p>
              </Reveal>
              <Reveal delay={0.16}>
                <div className="d-flex flex-wrap gap-3">
                  <Button size="lg" className="btn-gradient magnet">Get Started</Button>
                  <Button size="lg" variant="outline-primary" className="btn-soft magnet">Pricing & Insurance</Button>
                </div>
              </Reveal>
              <Reveal delay={0.24}>
                <div className="d-flex gap-3 mt-4 small text-muted">
                  <div className="d-flex align-items-center gap-2"><RiShieldCheckLine /> HIPAA Compliant</div>
                  <div className="d-flex align-items-center gap-2"><RiTruckLine /> Same-day local delivery</div>
                </div>
              </Reveal>
            </Col>

            <Col lg={6}>
              <motion.div style={{ y: yParallax }}>
                <motion.div
                  className="hero-frame shadow-lg"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.45 }}
                  transition={{ duration: 0.6 }}
                  whileHover={{ scale: prefersReducedMotion ? 1 : 1.01 }}
                >
                  <img src={HERO_IMG} alt="Pharmacy shelves" className="img-fluid hero-img" />
                  <div className="hero-badge">
                    <span className="pulse" />
                    Trusted local care
                  </div>
                </motion.div>
            </motion.div>
            </Col>
          </Row>
        </Container>
        <div className="section-divider" aria-hidden />
      </section>

      {/* ===== FEATURES (stagger + glass + tilt) ===== */}
      <section id="features" className="section-pad">
        <Container>
          <Reveal>
            <div className="text-center mb-5">
              <h2 className="fw-bold">Why Choose {brand}?</h2>
              <p className="text-muted">Simple, reliable care with real savings.</p>
            </div>
          </Reveal>
          <motion.div variants={containerStagger()} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }}>
            <Row>
              {features.map((f) => (
                <Col md={4} key={f.title} className="mb-4">
                  <motion.div variants={pop} whileHover={{ y: -6, rotateX: 1.5, rotateY: -1.5 }}>
                    <Card className="h-100 border-0 glass card-hover gradient-border">
                      <Card.Body className="p-4 text-center">
                        <div className="display-5 mb-3 text-primary" aria-hidden>{f.icon}</div>
                        <h5 className="fw-bold">{f.title}</h5>
                        <p className="text-muted mb-0">{f.description}</p>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>
        </Container>
      </section>

      {/* ===== SERVICES (animated grid) ===== */}
      <section id="services" className="bg-light section-pad">
        <Container>
          <Reveal>
            <div className="text-center mb-5">
              <h2 className="fw-bold">What we do</h2>
              <p className="text-muted">Everyday pharmacy services designed around you</p>
            </div>
          </Reveal>

          <motion.div variants={containerStagger()} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
            <Row>
              {services.map((s) => (
                <Col lg={4} md={6} key={s.title} className="mb-4">
                  <motion.div variants={pop} whileHover={{ y: -8 }}>
                    <Card className="h-100 border-0 shadow-sm card-hover tilt">
                      <Card.Body className="p-4">
                        <div className="fs-1 mb-3 text-primary" aria-hidden>{s.icon}</div>
                        <h5 className="fw-bold">{s.title}</h5>
                        <p className="text-muted">{s.description}</p>
                        <Button variant="link" className="p-0 link-arrow" href="#contact">
                          Learn more
                        </Button>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>
        </Container>
      </section>

      {/* ===== CTA (animated gradient + buttons) ===== */}
      <section className="cta-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={8} className="mb-4 mb-lg-0">
              <Reveal>
                <h3 className="fw-bold mb-2 text-white">Ready to modernize your pharmacy experience?</h3>
              </Reveal>
              <Reveal delay={0.08}>
                <p className="mb-0 text-white-80">Create your account in minutes—refills, reminders, and savings included.</p>
              </Reveal>
            </Col>
            <Col lg={4} className="text-lg-end">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <a href="/login">
                  <Button size="lg" className="btn-light-contrast w-100 magnet">Create free account</Button>
                </a>
              </motion.div>
            </Col>
          </Row>
        </Container>
        <div className="orb orb-a" aria-hidden />
        <div className="orb orb-b" aria-hidden />
      </section>

      {/* ===== FOOTER (fade in + icon hover) ===== */}
      <footer id="contact" className="footer bg-dark text-white-90 py-5">
        <Container>
          <Row>
            <Col lg={4} className="mb-4">
              <Reveal>
                <h5 className="fw-bold mb-3 text-white">{brand}</h5>
                <p className="text-light-strong">
                  A modern neighborhood pharmacy—fast refills, fair prices, and friendly help when you need it.
                </p>
              </Reveal>
            </Col>
            <Col lg={2} className="mb-4">
              <Reveal><h6 className="fw-bold mb-3 text-white">Company</h6></Reveal>
              <Reveal delay={0.05}>
                <ul className="list-unstyled">
                  <li><a href="#" className="footer-link">About</a></li>
                  <li><a href="#" className="footer-link">Careers</a></li>
                  <li><a href="#" className="footer-link">Press</a></li>
                </ul>
              </Reveal>
            </Col>
            <Col lg={2} className="mb-4">
              <Reveal><h6 className="fw-bold mb-3 text-white">Services</h6></Reveal>
              <Reveal delay={0.05}>
                <ul className="list-unstyled">
                  <li><a href="#services" className="footer-link">Refills</a></li>
                  <li><a href="#services" className="footer-link">Delivery</a></li>
                  <li><a href="#services" className="footer-link">Vaccines</a></li>
                  <li><a href="#services" className="footer-link">Compounding</a></li>
                </ul>
              </Reveal>
            </Col>
            <Col lg={2} className="mb-4">
              <Reveal><h6 className="fw-bold mb-3 text-white">Support</h6></Reveal>
              <Reveal delay={0.05}>
                <ul className="list-unstyled">
                  <li><a href="#" className="footer-link">Help Center</a></li>
                  <li><a href="#" className="footer-link">Insurance</a></li>
                  <li><a href="#" className="footer-link">Accessibility</a></li>
                  <li><a href="#" className="footer-link">Status</a></li>
                </ul>
              </Reveal>
            </Col>
            <Col lg={2} className="mb-4">
              <Reveal><h6 className="fw-bold mb-3 text-white">Legal</h6></Reveal>
              <Reveal delay={0.05}>
                <ul className="list-unstyled">
                  <li><a href="#" className="footer-link">Privacy</a></li>
                  <li><a href="#" className="footer-link">Terms</a></li>
                  <li><a href="#" className="footer-link">HIPAA</a></li>
                  <li><a href="#" className="footer-link">Cookies</a></li>
                </ul>
              </Reveal>
            </Col>
          </Row>

          <hr className="my-4 border-gray-700" />
          <Row className="align-items-center">
            <Col md={6} className="small text-light-strong">
              © {new Date().getFullYear()} {brand}. All rights reserved.
            </Col>
            <Col md={6} className="text-md-end">
              <div className="d-flex justify-content-md-end gap-3 fs-5">
                <motion.a whileHover={{ y: -2 }} aria-label="Twitter" href="#" className="footer-icon"><RiTwitterLine /></motion.a>
                <motion.a whileHover={{ y: -2 }} aria-label="Facebook" href="#" className="footer-icon"><RiFacebookCircleLine /></motion.a>
                <motion.a whileHover={{ y: -2 }} aria-label="LinkedIn" href="#" className="footer-icon"><RiLinkedinLine /></motion.a>
                <motion.a whileHover={{ y: -2 }} aria-label="Instagram" href="#" className="footer-icon"><RiInstagramLine /></motion.a>
              </div>
            </Col>
          </Row>
        </Container>

        <style>{`
          .text-white-90 { color: rgba(255,255,255,.92); }
          .text-light-strong { color: rgba(255,255,255,.88); }
          .footer-link { color: rgba(255,255,255,.86); text-decoration: none; }
          .footer-link:hover { color: #fff; text-decoration: underline; }
          .footer-icon { color: rgba(255,255,255,.85); transition: transform .2s; }
          .footer-icon:hover { color: #fff; transform: translateY(-2px); }
        `}</style>
      </footer>

      {/* ===== Styles (scoped) ===== */}
      <style>{`
        :root{
          --brand:#2c6bac;
          --gradA:#6aa5ff;
          --gradB:#8fd3fe;
          --gradC:#00e1c2;
        }
        html { scroll-behavior: smooth; }
        .pharmacy-homepage { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }

        /* progress bar */
        .scrollbar{
          position: fixed; inset: 0 auto auto 0; height: 3px; width: 100%;
          background: linear-gradient(90deg, var(--gradA), var(--gradB), var(--gradC));
          transform-origin: 0 0; z-index: 2000;
        }

        /* NAV */
        .custom-nav{
          background: rgba(255,255,255,.6);
          backdrop-filter: blur(10px);
          transition: box-shadow .25s ease, background .25s ease;
        }
        .custom-nav.scrolled{ background: rgba(255,255,255,.9); box-shadow: 0 10px 30px rgba(0,0,0,.08); }
        .navbar .nav-link{ color:#15293b; font-weight:500; }
        .navbar .nav-link:hover{ color:var(--brand); }
        .brand-dot{ width:40px;height:40px;border-radius:999px;color:#fff;font-weight:700;
          background: linear-gradient(135deg, var(--gradA), var(--gradB));
        }
        .gradient-text{
          background: linear-gradient(90deg,#0e58ff, #00c2ff 60%, var(--gradC));
          -webkit-background-clip:text; background-clip:text; color:transparent;
        }

        /* HERO */
        .hero-section{ padding-top:7.5rem; position:relative; overflow:hidden; }
        .hero-frame{ position:relative; border-radius:1.1rem; overflow:hidden; background:#fff; }
        .hero-img{ display:block; width:100%; height:auto; object-fit:cover; }
        .hero-badge{
          position:absolute; left:14px; bottom:14px; backdrop-filter: blur(8px);
          background: rgba(255,255,255,.7); border:1px solid rgba(0,0,0,.06);
          padding:.4rem .75rem; border-radius:999px; font-weight:600; font-size:.9rem;
          display:flex; align-items:center; gap:.5rem;
        }
        .hero-badge .pulse{
          width:8px; height:8px; border-radius:999px; background:#22c55e; box-shadow:0 0 0 rgba(34,197,94,.7);
          animation:pulse 2s infinite;
        }
        @keyframes pulse { 0%{ box-shadow:0 0 0 0 rgba(34,197,94,.5);}
                           70%{ box-shadow:0 0 0 10px rgba(34,197,94,0);}
                           100%{ box-shadow:0 0 0 0 rgba(34,197,94,0);} }

        .grid-bg{
          position:absolute; inset:-10% 0 auto 0; height:56vh;
          background:
            radial-gradient(closest-side, rgba(140,197,255,.25), transparent 70%) -10% -20% / 60% 80% no-repeat,
            radial-gradient(closest-side, rgba(168,237,234,.25), transparent 70%) 110% -10% / 60% 80% no-repeat,
            repeating-linear-gradient(0deg, rgba(0,0,0,.035) 0 1px, transparent 1px 40px),
            repeating-linear-gradient(90deg, rgba(0,0,0,.035) 0 1px, transparent 1px 40px),
            linear-gradient(180deg, rgba(255,255,255,1), rgba(255,255,255,.85));
          pointer-events:none;
        }
        .section-divider{
          height: 48px;
          background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(0,0,0,.04) 100%);
          mask: radial-gradient(120% 90% at 50% -10%, #000 60%, transparent 61%);
        }

        /* Sections */
        .section-pad{ padding: 5rem 0; }
        .glass{ background: rgba(255,255,255,.7)!important; backdrop-filter: blur(8px); }
        .gradient-border{ position:relative; }
        .gradient-border::after{
          content:""; position:absolute; inset:-1px; border-radius:1.2rem; z-index:-1;
          background: linear-gradient(120deg, rgba(106,165,255,.6), rgba(143,211,254,.6), rgba(0,225,194,.6));
          filter: blur(12px); opacity:.35;
        }
        .card-hover{ transition: transform .22s ease, box-shadow .22s ease; }
        .card-hover:hover{ transform: translateY(-6px); box-shadow: 0 16px 40px rgba(0,0,0,.08)!important; }
        .tilt:hover{ transform: perspective(800px) rotateX(2deg) rotateY(-2deg); }

        /* Buttons / micro-interactions */
        .btn-gradient{ background: linear-gradient(90deg, var(--gradA), var(--gradB)); border:none; color:#05223d; }
        .btn-gradient:hover{ filter: brightness(1.05); }
        .btn-soft{ border-color: var(--brand); color: var(--brand); }
        .btn-soft:hover{ background: rgba(44,107,172,.08); }
        .btn-light-contrast{ background:#fff; color:#0b2340; border:none; box-shadow:0 10px 26px rgba(0,0,0,.15); }
        .btn-light-contrast:hover{ transform: translateY(-1px); }
        .link-arrow{ color: var(--brand); font-weight:600; }
        .link-arrow::after{ content:" →"; transition: transform .2s; display:inline-block; }
        .link-arrow:hover::after{ transform: translateX(3px); }

        /* Magnetic hover (subtle) */
        .magnet{ transition: transform .2s ease; }
        .magnet:hover{ transform: translateY(-2px); }

        /* CTA */
        .cta-section{
          position:relative;
          background: conic-gradient(from 180deg at 50% 50%, var(--gradA), var(--gradB), var(--gradC), var(--gradA));
          animation: spin 12s linear infinite;
          padding: 3.5rem 0;
          overflow:hidden;
        }
        @keyframes spin { to { transform: rotate(1turn); } }
        .cta-section > * { position: relative; z-index: 1; }
        .orb{ position:absolute; border-radius:999px; filter: blur(30px); opacity:.3; }
        .orb-a{ width:200px; height:200px; left:5%; bottom:-40px; background:#fff; }
        .orb-b{ width:220px; height:220px; right:10%; top:-40px; background:#fff; }
        .text-white-80{ color: rgba(255,255,255,.9); }

        /* Anchors */
        #features, #services, #contact { scroll-margin-top: 90px; }
      `}</style>
    </div>
  );
};

export default LandingPage;
