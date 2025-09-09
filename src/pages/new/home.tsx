// src/pages/Gateway/GatewayV2.tsx
import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { RiSearchLine, RiDashboard2Line, RiQuestionLine, RiAlertLine } from "react-icons/ri";

const fade = (d = 0) => ({
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { delay: d, duration: 0.4, ease: "easeOut" } },
});

const LandingPage: React.FC = () => {
  const reduce = useReducedMotion();

  const actions = [
    {
      title: "Search for Medicines",
      desc: "Find a drug, compare options, and check insurance fit.",
      to: "/search1",
      icon: <RiSearchLine />,
      color: "var(--accentA)",
    },
    {
      title: "Dashboard",
      desc: "Jump into saved searches and recent activity.",
      to: "/dashboard1",
      icon: <RiDashboard2Line />,
      color: "var(--accentB)",
    },
    {
      title: "Help & Support",
      desc: "Guides, FAQs, and how-tos to get unstuck fast.",
      to: "/help",
      icon: <RiQuestionLine />,
      color: "var(--accentC)",
    },
  ];

  return (
    <div className="gw2">
      {/* Header */}
    

<header className="gw2-header bg-black">
  <style>{`
    :root { --gw2-accent: #ffffff; } /* use pure white on dark */

    .gw2-header { border-bottom: 1px solid rgba(255,255,255,.08); }

    /* Brand: crisp white, slightly bolder */
    .gw2-brand {
      color: #fff !important;
      font-weight: 700;
      letter-spacing: .02em;
    }

    /* Nav list reset */
    .gw2-nav-list { list-style: none; margin: 0; padding: 0; }

    /* Links: bright white + animated underline */
    .gw2-nav-link {
      position: relative;
      color: rgba(255,255,255,0.98);
      text-decoration: none;
      font-weight: 500;
      letter-spacing: .01em;
      transition: color .2s ease, opacity .2s ease, text-shadow .2s ease;
      outline: none;
    }
    /* underline (slides in) */
    .gw2-nav-link::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: -4px;
      height: 2px;
      background: currentColor;
      transform: scaleX(0);
      transform-origin: left;
      transition: transform .25s ease;
      opacity: .95;
    }
    .gw2-nav-link:hover,
    .gw2-nav-link:focus-visible {
      color: #fff;                /* even whiter on hover */
      text-shadow: 0 0 6px rgba(255,255,255,.25);
    }
    .gw2-nav-link:hover::after,
    .gw2-nav-link:focus-visible::after {
      transform: scaleX(1);
    }

    /* Active/current page support (optional) */
    .gw2-nav-link[aria-current="page"] {
      color: #fff;
    }
    .gw2-nav-link[aria-current="page"]::after {
      transform: scaleX(1);
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .gw2-nav-link, .gw2-nav-link::after {
        transition: none;
      }
    }
  `}</style>

  <Container className="py-3 d-flex align-items-center justify-content-between">
    <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
      <span className="gw2-logo" aria-hidden />
      <span className="gw2-brand">PharmaSearch</span>
    </Link>

    <nav aria-label="Primary">
      <ul className="gw2-nav-list d-flex align-items-center gap-4">
        <li><Link to="/search1"      className="gw2-nav-link">Search</Link></li>
        <li><Link to="/dashboard1"   className="gw2-nav-link">Dashboards</Link></li>
        <li><Link to="/logs"         className="gw2-nav-link">Logs</Link></li>
        <li><Link to="/help"         className="gw2-nav-link">Help &amp; Support</Link></li>
<Link to="/login" className="btn btn-outline-dark">Log in</Link>            </ul>
    </nav>
  </Container>
</header>

      {/* Split Hero */}
      <section className="gw2-hero">
        <Container>
          <Row className="align-items-start g-5">
            {/* Left: headline + sub */}
            <Col lg={7}>
              <motion.h1
                className="display-5 fw-bold lh-sm mb-3 gw2-h1"
                variants={fade(0)}
                initial="hidden"
                animate="show"
              >
                Make faster, clearer decisions with your pharmacy data.
              </motion.h1>
              <motion.p
                className="lead text-secondary mb-4"
                variants={fade(0.05)}
                initial="hidden"
                animate="show"
              >
                One place to search drugs, compare alternatives, and move on. Built for speed and precision.
              </motion.p>

              {/* tiny highlights */}
              <motion.ul
                className="gw2-bullets"
                variants={fade(0.1)}
                initial="hidden"
                animate="show"
              >
                <li>Keyboard-first search (Tab / Enter)</li>
                <li>Consistent results with clear profitability cues</li>
                <li>HIPAA-aware workflows</li>
              </motion.ul>

              <motion.div
                className="d-flex flex-wrap gap-2 mt-3"
                variants={fade(0.15)}
                initial="hidden"
                animate="show"
              >
                <Link to="/search1" className="btn btn-dark btn-lg">Open Dashboard</Link>
                <Link to="/login" className="btn btn-outline-dark btn-lg">Sign in</Link>
              </motion.div>
            </Col>

            {/* Right: quick actions rail */}
            <Col lg={5}>
              <motion.div
                className="gw2-actions"
                initial={{ opacity: 0, y: 16, scale: reduce ? 1 : 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45 }}
              >
                <div className="text-uppercase fw-semibold small text-secondary mb-2">Quick actions</div>
                <ul className="list-unstyled m-0 d-grid gap-2">
                  {actions.map((a, i) => (
                    <li key={a.title}>
                      <Link to={a.to} className="gw2-tile" aria-label={a.title}>
                        <span className="gw2-rail" style={{ background: a.color }} aria-hidden />
                        <span className="gw2-ic" aria-hidden>{a.icon}</span>
                        <span className="gw2-content">
                          <span className="gw2-title">{a.title}</span>
                          <span className="gw2-desc">{a.desc}</span>
                        </span>
                        <span className="gw2-arrow" aria-hidden>→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </Col>
          </Row>

          {/* Disclaimer */}
          <motion.aside
            className="gw2-note d-flex gap-3 align-items-start mt-5"
            variants={fade(0.2)}
            initial="hidden"
            animate="show"
          >
            <span className="gw2-note-ic"><RiAlertLine aria-hidden /></span>
            <div>
              <div className="fw-semibold mb-1">Disclaimer</div>
              <p className="mb-0 text-secondary">
                This tool supports review of historical data and suggests alternatives. It does not confirm
                the final medication to dispense. Clinical decisions must be made by licensed professionals.
                Pricing and coverage references are historical and must be verified with current sources/insurers.
              </p>
            </div>
          </motion.aside>
        </Container>
      </section>

      <footer className="text-center text-secondary small py-4">
        © {new Date().getFullYear()} PharmaSearch
      </footer>

      <style>{`
        :root{
          --ink:#0b1220;
          --sub:#5b6472;
          --line:#e7e9ee;
          --accentA:#2563eb;
          --accentB:#0ea5e9;
          --accentC:#10b981;
        }
        .gw2{ background:#ffffff; color:var(--ink); }
        .gw2-header{
          border-bottom:1px solid var(--line);
          position:sticky; top:0; z-index:40; background:rgba(255,255,255,.9);
          backdrop-filter: blur(8px);
        }
        .gw2-logo{ width:28px; height:28px; border-radius:4px; background:linear-gradient(135deg, var(--accentB), var(--accentA)); }
        .gw2-brand{ letter-spacing:.2px; color:var(--ink); }
        .gw2-hero{ padding: 56px 0 32px; }

        /* Headline */
        .gw2-h1{ letter-spacing: .2px; }

        /* Bullets */
        .gw2-bullets{
          padding-left: 1.2rem;
          color: var(--sub);
        }
        .gw2-bullets li{ margin-bottom:.35rem; }

        /* Quick actions */
        .gw2-actions{}
        .gw2-tile{
          display:grid;
          grid-template-columns: 6px 40px 1fr auto;
          align-items:center;
          gap:16px;
          padding:14px 14px 14px 0;
          border:1px solid var(--line);
          border-radius:12px;
          background:#fff;
          text-decoration:none;
          color:inherit;
          transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
        }
        .gw2-rail{ width:6px; height:100%; border-radius:12px 0 0 12px; display:block; }
        .gw2-ic{
          width:40px;height:40px;border-radius:10px; background:#f5f7fb;
          display:inline-flex;align-items:center;justify-content:center; font-size:20px; color:#1f3a8a;
        }
        .gw2-content{ display:flex; flex-direction:column; gap:4px; }
        .gw2-title{ font-weight:600; }
        .gw2-desc{ color:var(--sub); font-size:.95rem; }
        .gw2-arrow{ font-weight:700; color:#111; opacity:.2; transition: transform .15s ease, opacity .15s; }

        .gw2-tile:hover, .gw2-tile:focus{
          transform: translateY(-2px);
          border-color:#cfd3dd;
          box-shadow: 0 14px 28px rgba(11,18,32,.06);
          outline: none;
        }
        .gw2-tile:hover .gw2-arrow, .gw2-tile:focus .gw2-arrow{ opacity:.65; transform: translateX(2px); }

        /* Disclaimer note */
        .gw2-note{
          border-left:4px solid #f2c94c;
          background:#fffdf4;
          padding:14px 16px;
          border-radius:8px;
          border:1px solid #f4e6b0;
        }
        .gw2-note-ic{
          width:34px;height:34px;border-radius:999px;background:#ffeaa0;color:#7a5a00;
          display:inline-flex;align-items:center;justify-content:center; font-size:18px; flex:0 0 auto;
        }

        @media (max-width: 991.98px){
          .gw2-hero{ padding-top: 36px; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
