import React, { useMemo, useState } from 'react';
import { Container, Row, Col, Card, Accordion, InputGroup, Form, Button, Nav, Badge } from 'react-bootstrap';
import {
  RiDashboardLine,
  RiSearchLine,
  RiShieldCheckLine,
  RiListCheck2,
  RiBarChart2Line,
  RiCheckDoubleLine,
  RiCloseCircleLine,
  RiUser3Line,
  RiQuestionLine,
  RiMailLine,
  RiDatabase2Line,
  RiGroupLine,
  RiRefreshLine,
} from 'react-icons/ri';

// --- Types ---
interface Step {
  id: string;
  title: string;
  icon: React.ReactNode;
  bullets: string[];
}

// --- Data (edit to fit your product) ---
const STEPS: Step[] = [
  {
    id: 'by-drug',
    title: 'Search by Drug Name',
    icon: <RiSearchLine />,
    bullets: [
      'Type the desired drug name in the search bar to see available NDCs.',
      'Choose the NDC you want. If it has insurance data you’ll see suggested insurance options.',
      'Click “View Drug Details” to see prices. Without an RxGroup you will see details without prices.',
    ],
  },
  {
    id: 'by-insurance',
    title: 'Search by Insurance Data',
    icon: <RiShieldCheckLine />,
    bullets: [
      'Enter a BIN or insurance name to get all matching insurances and PCNs.',
      'Pick an insurance to see all available PCNs, or search by BIN alone.',
      'Open “View Drug Details” for price breakdowns.',
    ],
  },
  {
    id: 'by-rxgroup',
    title: 'Search by RxGroup Directly',
    icon: <RiGroupLine />,
    bullets: [
      'Search for the RxGroup and select the desired drug and NDC.',
      'Click “View Drug Details” for availability and prices.',
    ],
  },
  {
    id: 'alternatives',
    title: 'Drug Details & Alternatives',
    icon: <RiListCheck2 />,
    bullets: [
      'Alternatives are based on the drug class—see all options within the same class.',
      'Table #1: alternatives with insurance data.',
      'Table #2: alternatives without insurance data.',
    ],
  },
  {
    id: 'all-scripts',
    title: 'All Scripts Audit Dashboard',
    icon: <RiBarChart2Line />,
    bullets: [
      'Estimated, predicted, and real revenue for all scripts.',
      '“Best net” is calculated based on previous month of the targeted script.',
    ],
  },
  {
    id: 'matched',
    title: 'Matched Scripts Audit Dashboard',
    icon: <RiCheckDoubleLine />,
    bullets: [
      'Focus on scripts that match with the best drug to be sold.',
      'See estimates, predictions, and real revenue in one place.',
    ],
  },
  {
    id: 'mismatched',
    title: 'Mismatched Scripts Audit Dashboard',
    icon: <RiCloseCircleLine />,
    bullets: [
      'Review scripts that don’t match the best drug to be sold.',
      'Use insights to correct future selections and improve margins.',
    ],
  },
  {
    id: 'logs',
    title: 'User Logs',
    icon: <RiUser3Line />,
    bullets: [
      'View and filter user activity by date range and attributes.',
      'Explore performance graphs to understand usage trends.',
    ],
  },
];

const HowItWorksModern: React.FC = () => {
  const [query, setQuery] = useState('');
  const [expandAll, setExpandAll] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return STEPS;
    const q = query.toLowerCase();
    return STEPS.filter((s) =>
      s.title.toLowerCase().includes(q) || s.bullets.some((b) => b.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <div className="howitworks-layout">
      {/* --- Sidebar --- */}
     

      {/* --- Main content --- */}
      <main className="content">
        <Container fluid="lg">
          {/* Header / hero */}
          <section className="hero glass">
            <div>
              <h1 className="title">How It Works</h1>
              <p className="subtitle">Follow these simple steps to get started.</p>
            </div>
            <div className="controls">
              <InputGroup className="search">
                <InputGroup.Text>
                  <RiSearchLine />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search help topics…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </InputGroup>
              <Button
                variant={expandAll ? 'outline-dark' : 'dark'}
                className="expand-btn"
                onClick={() => setExpandAll((p) => !p)}
              >
                {expandAll ? 'Collapse all' : 'Expand all'}
              </Button>
            </div>
            <div className="chips">
              <Badge pill bg="light" text="dark" onClick={() => setQuery('drug')}>Drug</Badge>
              <Badge pill bg="light" text="dark" onClick={() => setQuery('insurance')}>Insurance</Badge>
              <Badge pill bg="light" text="dark" onClick={() => setQuery('RxGroup')}>RxGroup</Badge>
              <Badge pill bg="light" text="dark" onClick={() => setQuery('audit')}>Audit</Badge>
            </div>
          </section>

          {/* Steps */}
          <section className="steps">
            <Accordion alwaysOpen={expandAll} className="accordion-modern">
              {filtered.map((s, idx) => (
                <Card key={s.id} id={s.id} className="step-card">
                  <Accordion.Item eventKey={String(idx)}>
                    <Accordion.Header>
                      <div className="step-icon">{s.icon}</div>
                      <span className="step-title">{s.title}</span>
                    </Accordion.Header>
                    <Accordion.Body>
                      <ul className="bullets">
                        {s.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </Accordion.Body>
                  </Accordion.Item>
                </Card>
              ))}
            </Accordion>
          </section>

          {/* CTA */}
          <section id="contact" className="cta glass">
            <div className="cta-text">
              Still need help?
              <a href="#" className="cta-link"><RiMailLine /> Contact us</a>
            </div>
          </section>
        </Container>
      </main>

      {/* Styles */}
      <style>{`
        :root{
          --bg:#0b1220; /* page bg gradient base */
          --card:#0f1b31;
          --muted:#7c8aaa;
          --brand:#4c82ff;
        }
        .howitworks-layout{ display:grid; grid-template-columns: 260px 1fr; min-height:100vh; background: radial-gradient(60% 50% at 50% 0%, #162238 0%, #0b1220 60%); color:#eaf1ff; }

        /* Sidebar */
        .sidebar{ position:sticky; top:0; height:100vh; padding:20px 16px; border-right:1px solid rgba(255,255,255,.06); backdrop-filter:saturate(1.2) blur(6px); }
        .brand{ display:flex; align-items:center; gap:10px; padding:6px 8px 16px; }
        .logo{ width:34px; height:34px; display:grid; place-items:center; border-radius:10px; background:linear-gradient(135deg,#5aa3ff,#8aa8ff); font-weight:800; }
        .name{ font-weight:700; letter-spacing:.2px; }
        .sb-section{ margin:16px 8px 6px; color:var(--muted); font-size:.8rem; text-transform:uppercase; letter-spacing:.08em; }
        .sb-link{ color:#dfe7ff; border-radius:10px; padding:10px 12px; display:flex; align-items:center; gap:10px; }
        .sb-link:hover{ background:rgba(255,255,255,.06); color:#fff; }
        .sb-link.active{ background:rgba(76,130,255,.15); color:#fff; }
        .divider{ height:1px; background:rgba(255,255,255,.08); margin:10px 0; }

        /* Content */
        .content{ padding:28px; }
        .hero{ display:flex; flex-direction:column; gap:16px; border-radius:16px; padding:24px; margin-bottom:24px; background:linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02)); border:1px solid rgba(255,255,255,.08); box-shadow: 0 10px 40px rgba(0,0,0,.35); }
        .title{ font-weight:800; letter-spacing:.2px; margin:0; }
        .subtitle{ margin:6px 0 0; color:var(--muted); }
        .controls{ display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
        .search .input-group-text{ background:transparent; color:var(--muted); border-right:0; }
        .search .form-control{ background:transparent; border-left:0; color:#fff; border-color:rgba(255,255,255,.15); }
        .search .form-control::placeholder{ color:#9fb0d1; }
        .expand-btn{ white-space:nowrap; }
        .chips{ display:flex; gap:8px; flex-wrap:wrap; }
        .chips .badge{ cursor:pointer; border:1px solid rgba(255,255,255,.15); }

        /* Cards / Accordion */
        .steps{ display:grid; gap:14px; }
        .accordion-modern .accordion-item{ background:linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02)); border:1px solid rgba(255,255,255,.08); border-radius:14px; overflow:hidden; }
        .accordion-modern .accordion-header{ padding: 0; }
        .accordion-modern .accordion-button{ background:transparent; color:#eaf1ff; padding:16px 18px; gap:10px; box-shadow:none; }
        .accordion-modern .accordion-button:not(.collapsed){ background:rgba(76,130,255,.12); color:#fff; }
        .accordion-modern .accordion-body{ color:#d5e1ff; padding:16px 22px 18px; }
        .bullets{ margin:0; padding-left:18px; }
        .bullets li{ margin:6px 0; }
        .step-icon{ display:grid; place-items:center; width:34px; height:34px; border-radius:10px; background:linear-gradient(135deg,#4c82ff,#69a6ff); color:#0b1220; font-size:18px; }
        .step-title{ font-weight:700; }

        /* CTA */
        .cta{ display:flex; justify-content:center; align-items:center; margin:28px 0 40px; padding:18px; border-radius:14px; border:1px solid rgba(255,255,255,.08); background:linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02)); }
        .cta-text{ color:#dfe7ff; display:flex; gap:12px; align-items:center; }
        .cta-link{ color:#fff; text-decoration:none; font-weight:700; display:inline-flex; gap:6px; align-items:center; padding:8px 12px; border-radius:10px; background:linear-gradient(135deg,#5aa3ff,#8aa8ff); }
        .cta-link:hover{ filter:brightness(1.05); }

        @media (max-width: 1024px){
          .howitworks-layout{ grid-template-columns: 86px 1fr; }
          .name{ display:none; }
          .sb-section{ display:none; }
        }
        @media (max-width: 768px){
          .howitworks-layout{ grid-template-columns: 1fr; }
          .sidebar{ position:relative; height:auto; display:flex; gap:10px; overflow-x:auto; }
        }
      `}</style>
    </div>
  );
};

export default HowItWorksModern;
