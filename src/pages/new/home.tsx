// src/pages/Gateway/LandingPage.tsx
import React from "react";
import { Container, Row, Col, Carousel } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  RiSearchLine,
  RiDashboard2Line,
  RiQuestionLine,
  RiAlertLine,
} from "react-icons/ri";
import { motion } from "framer-motion";
import { Search, ShieldCheck, Cpu, Headphones } from "lucide-react";

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { delay, duration: 0.5 } },
});

const LandingPage: React.FC = () => {
  const actions = [
    {
      title: "Search for Medicines",
      desc: "Find a drug, compare options, and check insurance fit.",
      to: "/search1",
      icon: <RiSearchLine />,
      color: "#2563eb",
    },
    {
      title: "Dashboard",
      desc: "Jump into saved searches and recent activity.",
      to: "/dashboard1",
      icon: <RiDashboard2Line />,
      color: "#0ea5e9",
    },
    {
      title: "Help & Support",
      desc: "Guides, FAQs, and how-tos to get unstuck fast.",
      to: "/help",
      icon: <RiQuestionLine />,
      color: "#10b981",
    },
  ];

  return (
    <div className="gw2">
      {/* --- Header --- */}
     <header className="gw2-header bg-black">
  <Container fluid className="py-2">
    <nav className="navbar navbar-expand-lg navbar-dark">
      <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
        <span className="gw2-logo" aria-hidden />
        <span className="gw2-brand">PharmaSearch</span>
      </Link>

      {/* Toggle Button for Mobile */}
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mainNav"
        aria-controls="mainNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      {/* Links */}
      <div className="collapse navbar-collapse" id="mainNav">
        <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
          <li className="nav-item">
            <Link to="/search1" className="nav-link">Search</Link>
          </li>
          <li className="nav-item">
            <Link to="/dashboard1" className="nav-link">Dashboards</Link>
          </li>
          <li className="nav-item">
            <Link to="/logs" className="nav-link">Logs</Link>
          </li>
          <li className="nav-item">
            <Link to="/help" className="nav-link">Help &amp; Support</Link>
          </li>
          <li className="nav-item mt-2 mt-lg-0">
            <Link to="/login" className="btn btn-outline-light w-100 w-lg-auto">
              Log in
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  </Container>
</header>


      {/* --- Carousel --- */}
      <Carousel fade interval={5000}>
        <Carousel.Item>
          <img
            className="d-block w-100 gw2-slide-img"
            src="2.jpg"
            alt="Medicine shelves"
          />
          <Carousel.Caption className="gw2-caption">
            <motion.h2 variants={fadeUp(0)} initial="hidden" animate="show">
              Smarter Pharmacy Decisions
            </motion.h2>
            <motion.p variants={fadeUp(0.2)} initial="hidden" animate="show">
              Analyze, compare, and decide faster with clear insights.
            </motion.p>
            <motion.div
              variants={fadeUp(0.4)}
              initial="hidden"
              animate="show"
              className="mt-3"
            >
              <Link to="/search1" className="btn btn-primary btn-lg me-2">
                Start Searching
              </Link>
              <Link to="/dashboard1" className="btn btn-outline-light btn-lg">
                View Dashboard
              </Link>
            </motion.div>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          <img
            className="d-block w-100 gw2-slide-img"
            src="1.png"
            alt="Pharmacy analytics"
          />
          <Carousel.Caption className="gw2-caption">
            <motion.h2 variants={fadeUp(0)} initial="hidden" animate="show">
              Stay Ahead with Data
            </motion.h2>
            <motion.p variants={fadeUp(0.2)} initial="hidden" animate="show">
              Compare alternatives and optimize coverage with ease.
            </motion.p>
            <motion.div
              variants={fadeUp(0.4)}
              initial="hidden"
              animate="show"
              className="mt-3"
            >
              <Link to="/help" className="btn btn-success btn-lg me-2">
                Get Support
              </Link>
              <Link to="/login" className="btn btn-outline-light btn-lg">
                Sign In
              </Link>
            </motion.div>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>

      {/* --- Actions --- */}
      <Container className="py-5">
      <Row className="g-4 text-center align-items-stretch">
  {actions.map((a, i) => (
    <Col key={a.title} md={4} className="d-flex">
      <motion.div
        variants={fadeUp(i * 0.2)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="flex-fill"
      >
        <Link
          to={a.to}
          className="gw2-tile text-decoration-none d-block p-4 h-100"
        >
          <div className="gw2-ic mb-3" style={{ color: a.color }}>
            {a.icon}
          </div>
          <h4>{a.title}</h4>
          <p className="text-secondary">{a.desc}</p>
        </Link>
      </motion.div>
    </Col>
  ))}
</Row>

      </Container>
{/* --- About Section --- */}
<section className="about-section py-5 position-relative bg-light">
  <div className="container">
    {/* Header */}
    <div className="text-center mb-5">
      <span className="text-primary fw-semibold d-inline-block">About Us</span>
      <h2 className="fw-bold mt-2">Who We Are & Our Vision</h2>
      <div className="divider mx-auto my-3"></div>
      <p className="text-muted mx-auto" style={{ maxWidth: "680px" }}>
        At PharmaCare, we simplify the process of finding medicines and managing prescriptions through modern technology and a user-friendly platform.
      </p>
    </div>

    {/* Row */}
    <div className="row align-items-center g-5">
      {/* Image */}
      <div className="col-md-6 text-center">
        <div className="image-wrapper position-relative">
          <img
            src="about.jpg"
            alt="About PharmaCare"
            className="img-fluid rounded-5 shadow-lg"
          />
        </div>
      </div>

      {/* Cards */}
      <div className="col-md-6">
        <div className="d-flex flex-column gap-4">
          <div className="info-card">
            <h4 className="fw-bold text-dark">Who We Are</h4>
            <p className="text-muted mb-0">
              We are a dedicated team of healthcare and technology professionals committed to making medicines accessible and affordable for everyone.
            </p>
          </div>
          <div className="info-card">
            <h4 className="fw-bold text-dark">Our Vision</h4>
            <p className="text-muted mb-0">
              We envision a world where every individual has easy access to the right medicines, ensuring better health outcomes for all.
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Why Choose Us */}
 


<div className="why-section mt-5 p-5 rounded-4 shadow-lg bg-white">
  <h5 className="fw-bold text-center text-primary mb-5">Why Choose Us?</h5>

  <div className="row text-center g-4">
    <div className="col-md-3 col-6">
      <div className="feature-card">
        <div className="feature-icon bg-gradient-primary">
          <Search size={28} />
        </div>
        <h6 className="fw-bold mt-3">Easy Search</h6>
        <p className="small text-muted">
          Quickly find any medicine with our smart search tools.
        </p>
      </div>
    </div>

    <div className="col-md-3 col-6">
      <div className="feature-card">
        <div className="feature-icon bg-gradient-success">
          <ShieldCheck size={28} />
        </div>
        <h6 className="fw-bold mt-3">Secure Uploads</h6>
        <p className="small text-muted">
          Upload prescriptions safely with full data encryption.
        </p>
      </div>
    </div>

    <div className="col-md-3 col-6">
      <div className="feature-card">
        <div className="feature-icon bg-gradient-info">
          <Cpu size={28} />
        </div>
        <h6 className="fw-bold mt-3">Modern Tech</h6>
        <p className="small text-muted">
          Powered by AI and cloud to ensure seamless service.
        </p>
      </div>
    </div>

    <div className="col-md-3 col-6">
      <div className="feature-card">
        <div className="feature-icon bg-gradient-warning">
          <Headphones size={28} />
        </div>
        <h6 className="fw-bold mt-3">24/7 Support</h6>
        <p className="small text-muted">
          We’re here to help anytime, anywhere you need us.
        </p>
      </div>
    </div>
  </div>

  <style>{`
    .feature-card {
      padding: 20px;
      transition: all 0.3s ease;
    }
    .feature-card:hover {
      transform: translateY(-6px);
    }
    .feature-icon {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      color: #fff;
      margin: 0 auto;
      box-shadow: 0 6px 15px rgba(0,0,0,0.15);
    }
    .bg-gradient-primary {
      background: linear-gradient(135deg,#2196f3,#06b6d4);
    }
    .bg-gradient-success {
      background: linear-gradient(135deg,#34d399,#059669);
    }
    .bg-gradient-info {
      background: linear-gradient(135deg,#3b82f6,#2563eb);
    }
    .bg-gradient-warning {
      background: linear-gradient(135deg,#f59e0b,#d97706);
    }
  `}</style>
</div>


  </div>

  <style>{`
    .divider {
      width: 60px;
      height: 4px;
      border-radius: 4px;
      background: linear-gradient(90deg,#2196f3,#06b6d4);
    }
    .blob-shape {
      position: absolute;
      top: -40px;
      right: -40px;
      width: 200px;
      height: 200px;
      background: radial-gradient(circle at 30% 30%, #2196f3, transparent 70%);
      border-radius: 50%;
      z-index: 0;
    }
   
.info-card {
  background: #fff;
  border-left: 5px solid #2196f3;
  padding: 30px;              /* زودنا الـ padding */
  border-radius: 12px;
  min-height: 160px;          /* ارتفاع أدنى */
  box-shadow: 0 6px 20px rgba(0,0,0,0.06);
  transition: transform 0.3s;
  display: flex;
  flex-direction: column;
  justify-content: center;    /* يخلي المحتوى متوسّط عمودي */
}
.info-card:hover {
  transform: translateY(-5px);
}

  
  `}</style>
</section>



      {/* --- Disclaimer --- */}
      <Container>
        <motion.div
          className="gw2-note d-flex gap-3 align-items-start mt-5"
          variants={fadeUp(0.3)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <span className="gw2-note-ic">
            <RiAlertLine aria-hidden />
          </span>
          <div>
            <div className="fw-semibold mb-1">Disclaimer</div>
            <p className="mb-0 text-secondary">
              This tool supports review of historical data and suggests
              alternatives. It does not confirm the final medication to
              dispense. Clinical decisions must be made by licensed
              professionals. Pricing and coverage references are historical and
              must be verified with current sources/insurers.
            </p>
          </div>
        </motion.div>
      </Container>

      {/* --- Footer --- */}
      <footer className="text-center text-light small py-4 bg-dark mt-5">
        © {new Date().getFullYear()} PharmaSearch
      </footer>

      {/* --- Styles --- */}
      <style>{`
        .gw2-slide-img { max-height: 420px; object-fit: cover; }
        .gw2-caption { background: rgba(0,0,0,0.5); padding: 20px; border-radius: 12px; }
        .gw2-logo { width:28px; height:28px; border-radius:4px; background:linear-gradient(135deg, #0ea5e9, #2563eb); }
        .gw2-brand { letter-spacing:.2px; color:#fff; }
        .gw2-nav-link { color:#fff; text-decoration:none; }
        .gw2-nav-link:hover { text-shadow:0 0 6px rgba(255,255,255,0.5); }
        .gw2-tile { border:1px solid #e7e9ee; border-radius:12px; transition:.2s; background:#fff; }
        .gw2-tile:hover { transform:translateY(-4px); box-shadow:0 10px 24px rgba(0,0,0,0.08); }
        .gw2-ic { font-size:36px; }
        .gw2-note { border-left:4px solid #f2c94c; background:#fffdf4; padding:14px 16px; border-radius:8px; }
        .gw2-note-ic { width:34px; height:34px; border-radius:999px; background:#ffeaa0; color:#7a5a00; display:inline-flex; align-items:center; justify-content:center; }
     
     
     .gw2-caption h2,
.gw2-caption p {
  color: #fff;
  text-shadow: 0 2px 8px rgba(0,0,0,0.8);
}
.gw2-caption h2 {
  font-weight: 700;
}


.carousel-item::before {
  background: linear-gradient(
    rgba(0,0,0,0.65),
    rgba(0,0,0,0.3)
  );
}





.about-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}
.about-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

     .about-section {
  background: #f9fafb; /* subtle light gray */
}

.why-card {
  border-left: 4px solid #2563eb;
}


/* hero  */





.carousel-caption {
  bottom: 11%;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  text-align: center;
}

@media (max-width: 768px) {
  .carousel-caption h2 {
    font-size: 1.4rem;
    line-height: 1.4;
  }

  .carousel-caption p {
    font-size: 0.9rem;
  }

  .carousel-caption .btn-lg {
    padding: 0.5rem 1.2rem;
    font-size: 0.85rem;
  }
}


/*header */

/* Make header links brighter */
.gw2-nav-link {
  color: white !important;      /* pure white */
  font-weight: 500;               /* slightly bold */
  transition: color 0.2s ease;
}

.gw2-nav-link:hover {
  color: #f1f5f9 !important;      /* very light gray on hover */
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.6);
}

.gw2-header {
  position: sticky;
  top: 0;
  z-index: 1030;
}

@media (max-width: 768px) {
  .gw2-header .container {
    flex-direction: row;
    justify-content: space-between;
  }

  .gw2-nav-list {
    display: none; /* اختفي على الموبايل */
  }

  .navbar-toggler {
    display: block; /* خلي زرار الهامبرجر يظهر */
  }

  .gw2-brand {
    font-size: 1rem;
  }
}


/*         */
/* ====== HERO FIXES FOR MOBILE ====== */
.gw2-slide-img {
  max-height: 80vh;       /* خلي الهيرو ياخد ارتفاع الشاشة كله */
  height: 100vh;           /* يملأ الشاشة */
  object-fit: cover;       /* يخلي الصورة كاملة بدون تمدد */
}

/* الكابتشن يتوسّط أحسن */
.gw2-caption {
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  max-width: 90%;
  padding: 1rem;
}

/* النص يبان أوضح */
.gw2-caption h2, 
.gw2-caption p {
  color: #fff;
  text-shadow: 0 2px 8px rgba(0,0,0,0.9);
  font-size: clamp(1.2rem, 4vw, 2rem); /* Responsive font size */
}

/* الأزرار تبقى تحت بعض في الموبايل */
@media (max-width: 768px) {
  .gw2-caption .btn {
    display: block;
    width: 100%;
    margin: 8px 0;
    font-size: 1rem;
  }
}

/* ====== HEADER RESPONSIVE ====== */
.gw2-header {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  background: rgba(0,0,0,0.85);
}

.gw2-header .gw2-brand {
  font-size: 1.1rem;
  font-weight: 600;
}

.gw2-nav-list {
  flex-wrap: wrap;
  gap: 1rem;
}

@media (max-width: 768px) {
  .gw2-nav-list {
    display: none; /* يتقفل ويتفتح مع الـ Hamburger */
  }
}

     `}</style>
    </div>
  );
};

export default LandingPage;
