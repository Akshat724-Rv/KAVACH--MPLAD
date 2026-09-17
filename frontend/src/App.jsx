import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import axios from "axios";
import "./index.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const demoWorks = [
  {
    work_id: "MPLAD-2026-001",
    work_description: "Construction of Community Health Centre",
    constituency: "Jabalpur",
    state: "Madhya Pradesh",
    work_category: "Health Infrastructure",
    agency_name: "District Implementation Agency",
    sanctioned_amount_inr: 4250000,
    sanction_delay_days: 92,
    risk_score: 86,
    investigation_priority_score: 91,
    active_signals_count: 4,
    audit_verdict: "Priority Verification",
    explainable_reasons: [
      "Cost is above comparable works",
      "Execution delay exceeds expected threshold",
      "Similar work description detected",
      "Multiple risk indicators are active"
    ],
    lat: 23.1815,
    lng: 79.9864
  },
  {
    work_id: "MPLAD-2026-002",
    work_description: "Rural Road Improvement and Drainage",
    constituency: "Lucknow",
    state: "Uttar Pradesh",
    work_category: "Road Infrastructure",
    agency_name: "Local Works Agency",
    sanctioned_amount_inr: 6850000,
    sanction_delay_days: 48,
    risk_score: 61,
    investigation_priority_score: 67,
    active_signals_count: 2,
    audit_verdict: "Review Recommended",
    explainable_reasons: [
      "Execution delay detected",
      "Cost deviation requires verification"
    ],
    lat: 26.8467,
    lng: 80.9462
  },
  {
    work_id: "MPLAD-2026-003",
    work_description: "Village Drinking Water Facility",
    constituency: "Jaipur",
    state: "Rajasthan",
    work_category: "Water & Sanitation",
    agency_name: "Rural Development Agency",
    sanctioned_amount_inr: 3200000,
    sanction_delay_days: 18,
    risk_score: 35,
    investigation_priority_score: 30,
    active_signals_count: 1,
    audit_verdict: "Normal Monitoring",
    explainable_reasons: ["No significant anomaly detected"],
    lat: 26.9124,
    lng: 75.7873
  },
  {
    work_id: "MPLAD-2026-004",
    work_description: "Government School Building Upgrade",
    constituency: "Patna",
    state: "Bihar",
    work_category: "Education",
    agency_name: "State Works Division",
    sanctioned_amount_inr: 5100000,
    sanction_delay_days: 76,
    risk_score: 79,
    investigation_priority_score: 84,
    active_signals_count: 3,
    audit_verdict: "Priority Verification",
    explainable_reasons: [
      "Project delay is unusually high",
      "Cost pattern differs from peer projects",
      "High priority verification recommended"
    ],
    lat: 25.5941,
    lng: 85.1376
  },
  {
    work_id: "MPLAD-2026-005",
    work_description: "Urban Drainage Improvement",
    constituency: "Mumbai",
    state: "Maharashtra",
    work_category: "Urban Infrastructure",
    agency_name: "Municipal Implementation Unit",
    sanctioned_amount_inr: 9200000,
    sanction_delay_days: 61,
    risk_score: 68,
    investigation_priority_score: 73,
    active_signals_count: 2,
    audit_verdict: "Review Recommended",
    explainable_reasons: [
      "Cost deviation detected",
      "Implementation timeline requires review"
    ],
    lat: 19.076,
    lng: 72.8777
  },
  {
    work_id: "MPLAD-2026-006",
    work_description: "Solar Street Lighting Project",
    constituency: "Ahmedabad",
    state: "Gujarat",
    work_category: "Energy",
    agency_name: "Urban Local Body",
    sanctioned_amount_inr: 2800000,
    sanction_delay_days: 12,
    risk_score: 28,
    investigation_priority_score: 25,
    active_signals_count: 0,
    audit_verdict: "Normal Monitoring",
    explainable_reasons: ["No significant anomaly detected"],
    lat: 23.0225,
    lng: 72.5714
  },
  {
    work_id: "MPLAD-2026-007",
    work_description: "Primary School Digital Learning Facility",
    constituency: "Bengaluru",
    state: "Karnataka",
    work_category: "Education",
    agency_name: "Education Infrastructure Agency",
    sanctioned_amount_inr: 4500000,
    sanction_delay_days: 29,
    risk_score: 44,
    investigation_priority_score: 42,
    active_signals_count: 1,
    audit_verdict: "Normal Monitoring",
    explainable_reasons: ["Minor timeline variation detected"],
    lat: 12.9716,
    lng: 77.5946
  },
  {
    work_id: "MPLAD-2026-008",
    work_description: "Community Water Supply Network",
    constituency: "Bhubaneswar",
    state: "Odisha",
    work_category: "Water & Sanitation",
    agency_name: "Public Works Agency",
    sanctioned_amount_inr: 3900000,
    sanction_delay_days: 55,
    risk_score: 57,
    investigation_priority_score: 62,
    active_signals_count: 2,
    audit_verdict: "Review Recommended",
    explainable_reasons: [
      "Delay anomaly detected",
      "Peer cost comparison requires review"
    ],
    lat: 20.2961,
    lng: 85.8245
  }
];

function riskMeta(score) {
  const n = Number(score) || 0;

  if (n >= 75) {
    return {
      label: "HIGH",
      className: "high"
    };
  }

  if (n >= 45) {
    return {
      label: "MEDIUM",
      className: "medium"
    };
  }

  return {
    label: "LOW",
    className: "low"
  };
}

function money(value) {
  const n = Number(value) || 0;

  if (n >= 10000000) {
    return `₹${(n / 10000000).toFixed(2)} Cr`;
  }

  if (n >= 100000) {
    return `₹${(n / 100000).toFixed(2)} Lakh`;
  }

  return `₹${n.toLocaleString("en-IN")}`;
}

function Icon({ name }) {
  const paths = {
    dashboard:
      "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",

    shield:
      "M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z",

    chart:
      "M4 19V5M4 19h16M8 15l3-4 3 2 5-7",

    map:
      "M4 5l6-2 4 2 6-2v16l-6 2-4-2-6 2zM10 3v16M14 5v16",

    file:
      "M6 3h8l4 4v14H6zM14 3v5h5M9 13h6M9 17h6",

    refresh:
      "M20 11a8 8 0 00-14.9-3M4 5v4h4M4 13a8 8 0 0014.9 3M20 19v-4h-4",

    search:
      "M11 19a8 8 0 100-16 8 8 0 000 16zM17 17l4 4",

    download:
      "M12 3v12M7 10l5 5 5-5M4 21h16",

    eye:
      "M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6",

    spark:
      "M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z",

    check:
      "M5 12l4 4L19 6",

    alert:
      "M12 3l9 17H3L12 3zM12 9v4M12 17h.01"
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className="icon"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.shield} />
    </svg>
  );
}

export default function App() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [health, setHealth] = useState(false);

  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [stateFilter, setStateFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState("");

  const [copilotOpen, setCopilotOpen] = useState(false);

  const [copilotMessage, setCopilotMessage] = useState(
    "Hello. I can explain risk signals, identify priority works and suggest verification actions."
  );

  const [precheckOpen, setPrecheckOpen] = useState(false);
  const [precheckResult, setPrecheckResult] = useState(null);

  const [precheck, setPrecheck] = useState({
    description: "",
    state: "Madhya Pradesh",
    category: "Infrastructure",
    amount: ""
  });

  const fileRef = useRef(null);

  const notify = useCallback((message) => {
    setToast(message);

    window.clearTimeout(window.__kavachToast);

    window.__kavachToast = window.setTimeout(() => {
      setToast("");
    }, 3000);
  }, []);

  const loadWorks = useCallback(async () => {
    setLoading(true);

    try {
      const res = await axios.get(`${API}/api/priority-queue`);

      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      setWorks(data.length ? data : demoWorks);
    } catch {
      setWorks(demoWorks);

      notify(
        "Demo monitoring dataset loaded. Start backend for live data."
      );
    } finally {
      setLoading(false);
    }
  }, [notify]);

  const checkHealth = useCallback(async () => {
    try {
      await axios.get(`${API}/api/health`);
      setHealth(true);
    } catch {
      setHealth(false);
    }
  }, []);

  useEffect(() => {
    loadWorks();
    checkHealth();

    const timer = setInterval(checkHealth, 15000);

    return () => clearInterval(timer);
  }, [loadWorks, checkHealth]);

  const syncEngine = async () => {
    setSyncing(true);

    try {
      const res = await axios.post(
        `${API}/api/analyze-and-sync`
      );

      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      if (data.length) {
        setWorks(data);

        notify(
          `AI Risk Engine completed analysis of ${data.length} works.`
        );
      } else {
        setWorks(demoWorks);

        notify(
          "AI engine returned no records. Demonstration dataset loaded."
        );
      }
    } catch {
      setWorks(demoWorks);

      notify(
        "Backend analysis unavailable. Demonstration dataset loaded."
      );
    } finally {
      setSyncing(false);
    }
  };

  const stats = useMemo(() => {
    const total = works.length;

    const high = works.filter(
      w => Number(w.risk_score) >= 75
    ).length;

    const medium = works.filter(
      w =>
        Number(w.risk_score) >= 45 &&
        Number(w.risk_score) < 75
    ).length;

    const low = works.filter(
      w => Number(w.risk_score) < 45
    ).length;

    const atRisk = works
      .filter(w => Number(w.risk_score) >= 45)
      .reduce(
        (sum, w) =>
          sum + Number(w.sanctioned_amount_inr || 0),
        0
      );

    const avg = total
      ? works.reduce(
          (s, w) =>
            s + Number(w.risk_score || 0),
          0
        ) / total
      : 0;

    const activeSignals = works.reduce(
      (sum, w) =>
        sum + Number(w.active_signals_count || 0),
      0
    );

    return {
      total,
      high,
      medium,
      low,
      atRisk,
      avg,
      activeSignals
    };
  }, [works]);

  const states = useMemo(
    () =>
      [...new Set(
        works
          .map(w => w.state)
          .filter(Boolean)
      )].sort(),
    [works]
  );

  const categories = useMemo(
    () =>
      [...new Set(
        works
          .map(w => w.work_category)
          .filter(Boolean)
      )].sort(),
    [works]
  );

  const filteredWorks = useMemo(() => {
    return works
      .filter(w => {
        const text = `
          ${w.work_id}
          ${w.work_description}
          ${w.constituency}
          ${w.state}
          ${w.agency_name}
        `.toLowerCase();

        const matchesText = text.includes(
          query.toLowerCase()
        );

        const risk = riskMeta(w.risk_score).label;

        const matchesRisk =
          riskFilter === "ALL" ||
          risk === riskFilter;

        const matchesState =
          stateFilter === "ALL" ||
          w.state === stateFilter;

        const matchesCategory =
          categoryFilter === "ALL" ||
          w.work_category === categoryFilter;

        return (
          matchesText &&
          matchesRisk &&
          matchesState &&
          matchesCategory
        );
      })
      .sort(
        (a, b) =>
          Number(b.risk_score || 0) -
          Number(a.risk_score || 0)
      );
  }, [
    works,
    query,
    riskFilter,
    stateFilter,
    categoryFilter
  ]);

  const exportCSV = () => {
    const rows = filteredWorks.map(w => [
      w.work_id,
      w.state,
      w.constituency,
      w.work_category,
      w.work_description,
      w.sanctioned_amount_inr,
      w.sanction_delay_days,
      w.risk_score,
      riskMeta(w.risk_score).label,
      w.investigation_priority_score
    ]);

    const csv = [
      [
        "Work ID",
        "State",
        "Constituency",
        "Category",
        "Description",
        "Sanctioned Amount",
        "Delay Days",
        "Risk Score",
        "Risk Level",
        "Priority Score"
      ],
      ...rows
    ]
      .map(row =>
        row
          .map(v =>
            `"${String(v ?? "").replaceAll('"', '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "KAVACH-MPLAD-risk-queue.csv";
    a.click();

    URL.revokeObjectURL(url);

    notify("Risk queue exported successfully.");
  };

  const scrollTo = id => {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
  };

  const uploadEvidence = async e => {
    const file = e.target.files?.[0];

    if (!file) return;

    const form = new FormData();
    form.append("document", file);

    try {
      await axios.post(
        `${API}/api/upload-document`,
        form,
        {
          headers: {
            "Content-Type":
              "multipart/form-data"
          }
        }
      );

      notify("Evidence document uploaded.");
    } catch {
      notify(
        "Evidence upload requires configured document storage credentials."
      );
    } finally {
      e.target.value = "";
    }
  };

  /*
   * SENTINEL AI COPILOT
   */

  const runCopilot = question => {
    let answer = "";

    if (question === "high") {
      answer =
        `There are ${stats.high} high-risk works and ${stats.medium} medium-risk works currently requiring verification.`;
    } else if (question === "why") {
      const risky = works
        .filter(
          w => Number(w.risk_score) >= 75
        )
        .sort(
          (a, b) =>
            Number(b.risk_score) -
            Number(a.risk_score)
        )[0];

      if (risky) {
        answer =
          `${risky.work_id} is prioritised because of ${risky.active_signals_count || 0} active risk signals including cost, delay or similarity indicators.`;
      } else {
        answer =
          "No high-risk work is currently present. Medium-risk works remain available for review.";
      }
    } else if (question === "action") {
      answer =
        "Recommended workflow: verify cost estimate → check implementation delay → compare similar works → validate supporting documents.";
    } else {
      answer =
        "KAVACH-MPLAD analyses cost, delay, similarity and multiple project indicators to prioritise works for human verification.";
    }

    setCopilotMessage(answer);
    setCopilotOpen(true);
  };

  /*
   * AI PRE-CHECK
   */

  const runPrecheck = () => {
    const amount = Number(
      precheck.amount || 0
    );

    const description =
      precheck.description.trim();

    if (!description || !amount) {
      notify(
        "Enter work description and estimated cost."
      );
      return;
    }

    let score = 30;

    if (amount >= 5000000) {
      score += 20;
    }

    if (amount >= 10000000) {
      score += 10;
    }

    if (description.length < 35) {
      score += 8;
    }

    if (
      /road|building|drainage|construction/i.test(
        description
      )
    ) {
      score += 8;
    }

    score = Math.min(score, 92);

    const risk = riskMeta(score);

    const reasons = [];

    if (amount >= 5000000) {
      reasons.push(
        "Estimated value requires peer-cost verification."
      );
    }

    if (
      /road|building|drainage|construction/i.test(
        description
      )
    ) {
      reasons.push(
        "Infrastructure work selected for enhanced screening."
      );
    }

    if (description.length < 35) {
      reasons.push(
        "Limited description detail; supporting scope documents recommended."
      );
    }

    if (!reasons.length) {
      reasons.push(
        "No major preliminary indicator detected."
      );
    }

    setPrecheckResult({
      score,
      risk,
      reasons
    });
  };

  const stateRisk = states
    .map(state => {
      const stateWorks = works.filter(
        w => w.state === state
      );

      return {
        state,
        score: Math.round(
          stateWorks.reduce(
            (s, w) =>
              s + Number(w.risk_score || 0),
            0
          ) /
            Math.max(1, stateWorks.length)
        )
      };
    })
    .sort((a, b) => b.score - a.score);

  const signalCounts = {
    "Cost Anomaly": works.filter(
      w =>
        (w.explainable_reasons || []).some(
          r => /cost/i.test(r)
        )
    ).length,

    "Delay Anomaly": works.filter(
      w =>
        (w.explainable_reasons || []).some(
          r => /delay|timeline/i.test(r)
        )
    ).length,

    "Duplicate Similarity": works.filter(
      w =>
        (w.explainable_reasons || []).some(
          r => /similar|duplicate/i.test(r)
        )
    ).length,

    "Multi-Signal Risk": works.filter(
      w =>
        Number(
          w.active_signals_count || 0
        ) >= 3
    ).length
  };

  return (
    <div className="app-shell">

      {/* ================= TOP BAR ================= */}

      <header className="topbar">
        <div className="brand-area">
          <div className="brand-mark">
            <Icon name="shield" />
          </div>

          <div>
            <div className="brand-name">
              KAVACH-MPLAD
            </div>

            <div className="brand-subtitle">
              MPLADS Risk Intelligence &amp;
              Audit Decision Support
            </div>
          </div>
        </div>

        <div className="top-meta">
          <span>
            Government Decision-Support Interface
          </span>

          <span
            className={`online-badge ${
              health ? "" : "offline"
            }`}
          >
            <i />

            {health
              ? "SYSTEM ONLINE"
              : "BACKEND OFFLINE"}
          </span>
        </div>
      </header>

      <div className="accent-line">
        <span />
        <span />
      </div>

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">

        <div className="office-card">
          <div className="eyebrow">
            MONITORING CELL
          </div>

          <strong>MPLADS</strong>

          <small>
            Risk &amp; Compliance Intelligence
          </small>
        </div>

        <nav>

          <button
            className="nav-btn active"
            onClick={() =>
              scrollTo("overview")
            }
          >
            <Icon name="dashboard" />
            Dashboard
          </button>

          <button
            className="nav-btn"
            onClick={() =>
              scrollTo("risk-queue")
            }
          >
            <Icon name="shield" />
            Risk Queue

            <b className="nav-count">
              {stats.high + stats.medium}
            </b>
          </button>

          <button
            className="nav-btn"
            onClick={() =>
              scrollTo("analytics")
            }
          >
            <Icon name="chart" />
            Analytics
          </button>

          <button
            className="nav-btn"
            onClick={() =>
              scrollTo("geo-risk")
            }
          >
            <Icon name="map" />
            Geo Risk Map
          </button>

          <button
            className="nav-btn"
            onClick={() =>
              scrollTo("evidence")
            }
          >
            <Icon name="file" />
            Evidence
          </button>

        </nav>

        <div className="sidebar-footer">
          <div>
            SIH 2026 • SOFTWARE PROTOTYPE
          </div>

          <span>
            Risk indicators support human verification.
          </span>
        </div>
      </aside>

      {/* ================= MAIN ================= */}

      <main className="main-content">

        {/* ================= OVERVIEW ================= */}

        <section
          id="overview"
          className="section"
        >

          <div className="page-heading">

            <div>
              <div className="breadcrumb">
                MPLADS &nbsp;/&nbsp; MONITORING
                &nbsp;/&nbsp; RISK INTELLIGENCE
              </div>

              <h1>
                National Work Risk Dashboard
              </h1>

              <p>
                AI-assisted monitoring of project
                execution, expenditure patterns,
                delays and potential irregularities.
              </p>
            </div>

            <div className="heading-actions">

              <button
                className="btn secondary"
                onClick={() => {
                  loadWorks();
                  checkHealth();
                }}
              >
                <Icon name="refresh" />
                Refresh
              </button>

              <button
                className="btn primary"
                onClick={syncEngine}
                disabled={syncing}
              >
                <Icon name="refresh" />

                {syncing
                  ? "Analysing..."
                  : "Sync Risk Engine"}
              </button>

            </div>
          </div>

          <div className="notice">

            <div className="notice-icon">
              <Icon name="shield" />
            </div>

            <div>
              <strong>
                AI-assisted risk monitoring
              </strong>

              <span>
                KAVACH-MPLAD prioritises works
                requiring verification using multiple
                analytical signals. AI scores are
                indicators, not final findings.
              </span>
            </div>

          </div>

          {/* KPI */}

          <div className="kpi-grid">

            <div
              className="kpi-card blue clickable-kpi"
              onClick={() =>
                scrollTo("risk-queue")
              }
            >
              <span>WORKS MONITORED</span>

              <strong>
                {stats.total}
              </strong>

              <small>
                Records currently in monitoring queue
              </small>
            </div>

            <div
              className="kpi-card red clickable-kpi"
              onClick={() => {
                setRiskFilter("HIGH");
                scrollTo("risk-queue");
              }}
            >
              <span>HIGH RISK</span>

              <strong>
                {stats.high}
              </strong>

              <small>
                Priority verification recommended
              </small>
            </div>

            <div
              className="kpi-card amber clickable-kpi"
              onClick={() =>
                scrollTo("risk-queue")
              }
            >
              <span>AT-RISK VALUE</span>

              <strong>
                {money(stats.atRisk)}
              </strong>

              <small>
                Medium + high risk sanctioned value
              </small>
            </div>

            <div
              className="kpi-card blue clickable-kpi"
              onClick={() =>
                scrollTo("analytics")
              }
            >
              <span>AVERAGE RISK</span>

              <strong>
                {stats.avg.toFixed(1)}/100
              </strong>

              <small>
                Across monitored works
              </small>
            </div>

          </div>

          {/* Existing profile */}

          <div className="two-col">

            <div className="panel">

              <div className="panel-head">

                <div>
                  <span className="section-label">
                    RISK DISTRIBUTION
                  </span>

                  <h2>
                    Current Monitoring Profile
                  </h2>
                </div>

                <span className="mini-badge">
                  {stats.total} works
                </span>

              </div>

              {[
                [
                  "HIGH RISK",
                  stats.high,
                  "high"
                ],
                [
                  "MEDIUM RISK",
                  stats.medium,
                  "medium"
                ],
                [
                  "LOW RISK",
                  stats.low,
                  "low"
                ]
              ].map(
                ([label, value, cls]) => (
                  <div
                    className="risk-bar-row"
                    key={label}
                  >
                    <div>
                      <span
                        className={`dot ${cls}`}
                      />

                      {label}

                      <b>{value}</b>
                    </div>

                    <div className="bar">
                      <span
                        className={cls}
                        style={{
                          width: `${
                            stats.total
                              ? (value /
                                  stats.total) *
                                100
                              : 0
                          }%`
                        }}
                      />
                    </div>
                  </div>
                )
              )}

            </div>

            <div className="panel">

              <div className="panel-head">

                <div>
                  <span className="section-label">
                    MONITORING STATUS
                  </span>

                  <h2>
                    System Readiness
                  </h2>
                </div>

              </div>

              <div className="status-list">

                <div>
                  <i className="green-dot" />
                  Node Gateway

                  <b>
                    {health
                      ? "Operational"
                      : "Offline"}
                  </b>
                </div>

                <div>
                  <i className="green-dot" />
                  Risk Queue

                  <b>
                    {stats.high +
                      stats.medium}{" "}
                    items
                  </b>
                </div>

                <div>
                  <i className="blue-dot" />
                  ML Analysis

                  <b>On demand</b>
                </div>

                <div>
                  <i className="amber-dot" />
                  Human Review

                  <b>
                    Required for findings
                  </b>
                </div>

              </div>

            </div>
          </div>

          {/* ================= AI COMMAND CENTER ================= */}

          <div className="ai-command-grid">

            <div className="ai-copilot-card">

              <div className="ai-card-header">

                <div>
                  <span className="section-label">
                    SENTINEL AI
                  </span>

                  <h2>
                    Monitoring Copilot
                  </h2>
                </div>

                <span className="ai-status">
                  ● AI READY
                </span>

              </div>

              <div className="copilot-message">

                <div className="copilot-avatar">
                  S
                </div>

                <p>
                  {copilotMessage}
                </p>

              </div>

              <div className="copilot-actions">

                <button
                  onClick={() =>
                    runCopilot("high")
                  }
                >
                  Show priority works
                </button>

                <button
                  onClick={() =>
                    runCopilot("why")
                  }
                >
                  Explain risk
                </button>

                <button
                  onClick={() =>
                    runCopilot("action")
                  }
                >
                  Recommended actions
                </button>

              </div>

            </div>

            <div className="precheck-card">

              <div className="ai-card-header">

                <div>
                  <span className="section-label">
                    AI PRE-CHECK
                  </span>

                  <h2>
                    Screen a New Work
                  </h2>
                </div>

                <span className="precheck-badge">
                  EARLY SCREENING
                </span>

              </div>

              <p>
                Run a preliminary AI risk screening
                before a new work enters the
                monitoring queue.
              </p>

              <button
                className="btn primary"
                onClick={() => {
                  setPrecheckOpen(true);
                  setPrecheckResult(null);
                }}
              >
                + New Work AI Pre-Check
              </button>

            </div>

          </div>

        </section>

        {/* ================= GEO RISK ================= */}

        <section
          id="geo-risk"
          className="section"
        >

          <div className="section-title">

            <div>
              <span className="section-label">
                GEOSPATIAL RISK INTELLIGENCE
              </span>

              <h2>
                National Risk Map
              </h2>
            </div>

            <div className="map-legend">

              <span>
                <i className="map-dot high" />
                High
              </span>

              <span>
                <i className="map-dot medium" />
                Medium
              </span>

              <span>
                <i className="map-dot low" />
                Low
              </span>

            </div>

          </div>

          <div className="ai-map-summary">

            <div>
              <span>
                AI RISK COVERAGE
              </span>

              <strong>
                {works.length} monitored works
              </strong>
            </div>

            <div>
              <span>
                PRIORITY VERIFICATION
              </span>

              <strong>
                {stats.high +
                  stats.medium}{" "}
                works
              </strong>
            </div>

            <div>
              <span>
                AI SIGNALS
              </span>

              <strong>
                {stats.activeSignals} active
              </strong>
            </div>

            <button
              onClick={() =>
                scrollTo("risk-queue")
              }
            >
              Open Risk Queue →
            </button>

          </div>

          <div className="map-panel">

            <iframe
              title="India monitoring map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=68%2C7%2C97%2C36&layer=mapnik"
            />

            <div className="map-overlay">

              {works.map(w => {

                const left = Math.max(
                  8,
                  Math.min(
                    92,
                    ((Number(w.lng) - 68) /
                      29) *
                      100
                  )
                );

                const top = Math.max(
                  8,
                  Math.min(
                    92,
                    ((36 -
                      Number(w.lat)) /
                      29) *
                      100
                  )
                );

                const risk = riskMeta(
                  w.risk_score
                );

                return (
                  <button
                    key={w.work_id}
                    className={`map-marker ${risk.className}`}
                    style={{
                      left: `${left}%`,
                      top: `${top}%`
                    }}
                    title={`${w.work_id} • Risk ${w.risk_score}`}
                    onClick={() =>
                      setSelected(w)
                    }
                  >
                    {Number(
                      w.risk_score
                    )}
                  </button>
                );
              })}

            </div>

            <div className="map-caption">

              <strong>
                India-wide work monitoring
              </strong>

              <span>
                Risk markers represent analytical
                prioritisation, not confirmed findings.
              </span>

            </div>

          </div>

        </section>

        {/* ================= RISK QUEUE ================= */}

        <section
          id="risk-queue"
          className="section"
        >

          <div className="section-title">

            <div>
              <span className="section-label">
                PRIORITY MONITORING QUEUE
              </span>

              <h2>
                Works Requiring Verification
              </h2>
            </div>

            <button
              className="btn secondary small"
              onClick={exportCSV}
            >
              <Icon name="download" />
              Export CSV
            </button>

          </div>

          <div className="ai-map-summary queue-summary">

            <div>
              <span>
                FILTERED WORKS
              </span>

              <strong>
                {filteredWorks.length}
              </strong>
            </div>

            <div>
              <span>
                HIGH PRIORITY
              </span>

              <strong>
                {filteredWorks.filter(
                  w =>
                    Number(w.risk_score) >=
                    75
                ).length}
              </strong>
            </div>

            <div>
              <span>
                ACTIVE AI SIGNALS
              </span>

              <strong>
                {filteredWorks.reduce(
                  (sum, w) =>
                    sum +
                    Number(
                      w.active_signals_count ||
                        0
                    ),
                  0
                )}
              </strong>
            </div>

            <button
              onClick={() => {
                setRiskFilter("HIGH");
              }}
            >
              Show High Risk →
            </button>

          </div>

          <div className="filters">

            <div className="search-box">
              <Icon name="search" />

              <input
                value={query}
                onChange={e =>
                  setQuery(e.target.value)
                }
                placeholder="Search work ID, state, constituency..."
              />
            </div>

            <select
              value={riskFilter}
              onChange={e =>
                setRiskFilter(
                  e.target.value
                )
              }
            >
              <option value="ALL">
                All Risk Levels
              </option>

              <option value="HIGH">
                High Risk
              </option>

              <option value="MEDIUM">
                Medium Risk
              </option>

              <option value="LOW">
                Low Risk
              </option>
            </select>

            <select
              value={stateFilter}
              onChange={e =>
                setStateFilter(
                  e.target.value
                )
              }
            >
              <option value="ALL">
                All States
              </option>

              {states.map(s => (
                <option
                  key={s}
                  value={s}
                >
                  {s}
                </option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={e =>
                setCategoryFilter(
                  e.target.value
                )
              }
            >
              <option value="ALL">
                All Categories
              </option>

              {categories.map(c => (
                <option
                  key={c}
                  value={c}
                >
                  {c}
                </option>
              ))}
            </select>

            <button
              className="clear-btn"
              onClick={() => {
                setQuery("");
                setRiskFilter("ALL");
                setStateFilter("ALL");
                setCategoryFilter("ALL");
              }}
            >
              Clear
            </button>

          </div>

          <div className="table-wrap">

            {loading ? (
              <div className="empty-state">
                Loading monitoring records...
              </div>
            ) : (
              <table>

                <thead>
                  <tr>
                    <th>PRIORITY</th>
                    <th>WORK</th>
                    <th>LOCATION</th>
                    <th>CATEGORY</th>
                    <th>SANCTIONED VALUE</th>
                    <th>DELAY</th>
                    <th>RISK</th>
                    <th>AI RECOMMENDATION</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredWorks.map(w => {

                    const risk =
                      riskMeta(
                        w.risk_score
                      );

                    return (
                      <tr key={w.work_id}>

                        <td>
                          <span
                            className={`priority ${risk.className}`}
                          >
                            {risk.label}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {w.work_id}
                          </strong>

                          <small>
                            {w.work_description}
                          </small>
                        </td>

                        <td>
                          {w.state}

                          <small>
                            {w.constituency}
                          </small>
                        </td>

                        <td>
                          {w.work_category}
                        </td>

                        <td>
                          {money(
                            w.sanctioned_amount_inr
                          )}
                        </td>

                        <td>
                          {Number(
                            w.sanction_delay_days ||
                              0
                          )}{" "}
                          days
                        </td>

                        <td>
                          <span
                            className={`score ${risk.className}`}
                          >
                            {Number(
                              w.risk_score || 0
                            )}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`action-text ${risk.className}`}
                          >
                            {risk.label ===
                            "HIGH"
                              ? "Priority Verification"
                              : risk.label ===
                                "MEDIUM"
                              ? "Review Required"
                              : "Routine Monitoring"}
                          </span>
                        </td>

                        <td>
                          <button
                            className="view-btn"
                            onClick={() =>
                              setSelected(w)
                            }
                          >
                            <Icon name="eye" />
                            View
                          </button>
                        </td>

                      </tr>
                    );
                  })}

                </tbody>
              </table>
            )}

            {!loading &&
              filteredWorks.length === 0 && (
                <div className="empty-state">
                  No works match the selected
                  filters.
                </div>
              )}

          </div>

        </section>

        {/* ================= ANALYTICS ================= */}

        <section
          id="analytics"
          className="section"
        >

          <div className="section-title">

            <div>
              <span className="section-label">
                ANALYTICS &amp; DECISION SUPPORT
              </span>

              <h2>
                Risk Intelligence
              </h2>
            </div>

          </div>

          <div className="analytics-grid">

            <div className="panel">

              <div className="panel-head">

                <div>
                  <span className="section-label">
                    STATE-WISE RISK
                  </span>

                  <h2>
                    Average Risk Score
                  </h2>
                </div>

              </div>

              {stateRisk.map(x => (
                <div
                  className="analytics-row"
                  key={x.state}
                >

                  <span>
                    {x.state}
                  </span>

                  <div className="analytics-track">
                    <i
                      style={{
                        width: `${x.score}%`
                      }}
                    />
                  </div>

                  <b>
                    {x.score}
                  </b>

                </div>
              ))}

            </div>

            <div className="panel">

              <div className="panel-head">

                <div>
                  <span className="section-label">
                    DETECTION SIGNALS
                  </span>

                  <h2>
                    Active Risk Indicators
                  </h2>
                </div>

              </div>

              {Object.entries(
                signalCounts
              ).map(
                ([name, count]) => (
                  <div
                    className="analytics-row"
                    key={name}
                  >

                    <span>
                      {name}
                    </span>

                    <div className="analytics-track">
                      <i
                        style={{
                          width: `${
                            works.length
                              ? (count /
                                  works.length) *
                                100
                              : 0
                          }%`
                        }}
                      />
                    </div>

                    <b>
                      {count}
                    </b>

                  </div>
                )
              )}

            </div>

          </div>

        </section>

        {/* ================= EVIDENCE ================= */}

        <section
          id="evidence"
          className="section"
        >

          <div className="section-title">

            <div>
              <span className="section-label">
                DOCUMENT EVIDENCE
              </span>

              <h2>
                Verification Workspace
              </h2>
            </div>

            <button
              className="btn primary"
              onClick={() =>
                fileRef.current?.click()
              }
            >
              <Icon name="file" />
              Upload Evidence
            </button>

            <input
              ref={fileRef}
              type="file"
              hidden
              onChange={uploadEvidence}
            />

          </div>

          <div className="evidence-grid">

            <div className="evidence-card">
              <Icon name="file" />

              <div>
                <strong>
                  Sanction Orders
                </strong>

                <span>
                  Supporting administrative records
                </span>
              </div>
            </div>

            <div className="evidence-card">
              <Icon name="file" />

              <div>
                <strong>
                  Work Estimates
                </strong>

                <span>
                  Cost and scope verification
                </span>
              </div>
            </div>

            <div className="evidence-card">
              <Icon name="file" />

              <div>
                <strong>
                  Progress Reports
                </strong>

                <span>
                  Execution and timeline evidence
                </span>
              </div>
            </div>

            <div className="evidence-card">
              <Icon name="file" />

              <div>
                <strong>
                  Payment Records
                </strong>

                <span>
                  Expenditure verification
                </span>
              </div>
            </div>

          </div>

        </section>

        {/* ================= FOOTER ================= */}

        <footer>
          <span>
            KAVACH-MPLAD • SIH 2026 Prototype
          </span>

          <span>
            AI-generated risk indicators require
            human verification before any finding.
          </span>
        </footer>

      </main>

      {/* ==================================================
          INVESTIGATION DRAWER
      ================================================== */}

      {selected && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setSelected(null)
          }
        >

          <div
            className="drawer"
            onClick={e =>
              e.stopPropagation()
            }
          >

            <button
              className="close"
              onClick={() =>
                setSelected(null)
              }
            >
              ×
            </button>

            <span className="section-label">
              WORK INVESTIGATION
            </span>

            <h2>
              {selected.work_id}
            </h2>

            <p className="drawer-description">
              {selected.work_description}
            </p>

            <div className="risk-hero">

              <div>
                <span>
                  AI RISK SCORE
                </span>

                <strong>
                  {Number(
                    selected.risk_score || 0
                  )}

                  <small>
                    /100
                  </small>
                </strong>
              </div>

              <span
                className={`priority ${
                  riskMeta(
                    selected.risk_score
                  ).className
                }`}
              >
                {
                  riskMeta(
                    selected.risk_score
                  ).label
                }
              </span>

            </div>

            {/* Risk breakdown */}

            <div className="risk-breakdown">

              <div className="drawer-section-title">
                <span className="section-label">
                  EXPLAINABLE AI BREAKDOWN
                </span>
              </div>

              <div className="risk-signal-grid">

                <div>
                  <span>
                    SIGNALS
                  </span>

                  <strong>
                    {Number(
                      selected.active_signals_count ||
                        0
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    PRIORITY SCORE
                  </span>

                  <strong>
                    {Number(
                      selected.investigation_priority_score ||
                        0
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    DELAY
                  </span>

                  <strong>
                    {Number(
                      selected.sanction_delay_days ||
                        0
                    )}
                    d
                  </strong>
                </div>

              </div>

            </div>

            <div className="detail-grid">

              <div>
                <span>STATE</span>
                <b>
                  {selected.state}
                </b>
              </div>

              <div>
                <span>
                  CONSTITUENCY
                </span>
                <b>
                  {selected.constituency}
                </b>
              </div>

              <div>
                <span>CATEGORY</span>
                <b>
                  {selected.work_category}
                </b>
              </div>

              <div>
                <span>AGENCY</span>
                <b>
                  {selected.agency_name}
                </b>
              </div>

              <div>
                <span>
                  SANCTIONED VALUE
                </span>
                <b>
                  {money(
                    selected.sanctioned_amount_inr
                  )}
                </b>
              </div>

              <div>
                <span>DELAY</span>
                <b>
                  {selected.sanction_delay_days ||
                    0}{" "}
                  days
                </b>
              </div>

            </div>

            <div className="drawer-section">

              <span className="section-label">
                WHY WAS THIS WORK FLAGGED?
              </span>

              <div className="reason-list">

                {(selected.explainable_reasons ||
                  []).map(
                  (reason, i) => (
                    <div key={i}>
                      <b>
                        {String(
                          i + 1
                        ).padStart(2, "0")}
                      </b>

                      <span>
                        {reason}
                      </span>
                    </div>
                  )
                )}

              </div>

            </div>

            {/* AI Recommended Actions */}

            <div className="recommended-actions">

              <span className="section-label">
                AI RECOMMENDED ACTIONS
              </span>

              <button
                onClick={() =>
                  notify(
                    "Cost estimate verification added to review workflow."
                  )
                }
              >
                <b>01</b>

                <span>
                  <strong>
                    Review Cost Estimate
                  </strong>

                  <small>
                    Compare sanctioned cost
                    with peer works.
                  </small>
                </span>
              </button>

              <button
                onClick={() =>
                  notify(
                    "Timeline review added to verification workflow."
                  )
                }
              >
                <b>02</b>

                <span>
                  <strong>
                    Check Implementation Delay
                  </strong>

                  <small>
                    Validate execution timeline
                    and progress records.
                  </small>
                </span>
              </button>

              <button
                onClick={() =>
                  notify(
                    "Document verification added to review workflow."
                  )
                }
              >
                <b>03</b>

                <span>
                  <strong>
                    Verify Supporting Documents
                  </strong>

                  <small>
                    Check sanction, estimate
                    and progress evidence.
                  </small>
                </span>
              </button>

            </div>

            <div className="recommendation">

              <span>
                RECOMMENDED ACTION
              </span>

              <strong>
                {selected.audit_verdict ||
                  "Review Recommended"}
              </strong>

              <p>
                AI risk indicators should be
                validated through documentary
                and field-level verification.
              </p>

            </div>

            <button
              className="btn primary full"
              onClick={() => {
                fileRef.current?.click();

                notify(
                  "Select supporting evidence for this work."
                );
              }}
            >
              <Icon name="file" />
              Add Verification Evidence
            </button>

          </div>

        </div>
      )}

      {/* ==================================================
          SENTINEL AI COPILOT PANEL
      ================================================== */}

      {copilotOpen && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setCopilotOpen(false)
          }
        >

          <div
            className="copilot-modal"
            onClick={e =>
              e.stopPropagation()
            }
          >

            <button
              className="close"
              onClick={() =>
                setCopilotOpen(false)
              }
            >
              ×
            </button>

            <span className="section-label">
              SENTINEL AI
            </span>

            <h2>
              Monitoring Copilot
            </h2>

            <div className="copilot-large-message">

              <div className="copilot-avatar">
                S
              </div>

              <div>
                <strong>
                  KAVACH-MPLAD AI Assistant
                </strong>

                <p>
                  {copilotMessage}
                </p>
              </div>

            </div>

            <div className="copilot-stat-row">

              <div>
                <span>
                  HIGH RISK
                </span>

                <strong>
                  {stats.high}
                </strong>
              </div>

              <div>
                <span>
                  MEDIUM RISK
                </span>

                <strong>
                  {stats.medium}
                </strong>
              </div>

              <div>
                <span>
                  ACTIVE SIGNALS
                </span>

                <strong>
                  {stats.activeSignals}
                </strong>
              </div>

            </div>

            <div className="copilot-footer-note">
              Sentinel AI provides analytical
              decision support. Final verification
              remains with authorised human reviewers.
            </div>

          </div>

        </div>
      )}

      {/* ==================================================
          NEW WORK AI PRE-CHECK MODAL
      ================================================== */}

      {precheckOpen && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setPrecheckOpen(false)
          }
        >

          <div
            className="precheck-modal"
            onClick={e =>
              e.stopPropagation()
            }
          >

            <button
              className="close"
              onClick={() =>
                setPrecheckOpen(false)
              }
            >
              ×
            </button>

            <span className="section-label">
              SENTINEL AI
            </span>

            <h2>
              New Work AI Pre-Check
            </h2>

            <p className="precheck-intro">
              Preliminary screening for potential
              risk indicators before detailed
              verification.
            </p>

            <label>
              Work Description
            </label>

            <textarea
              value={
                precheck.description
              }
              onChange={e =>
                setPrecheck({
                  ...precheck,
                  description:
                    e.target.value
                })
              }
              placeholder="Example: Construction of rural community road..."
            />

            <div className="precheck-fields">

              <div>
                <label>
                  State
                </label>

                <select
                  value={
                    precheck.state
                  }
                  onChange={e =>
                    setPrecheck({
                      ...precheck,
                      state:
                        e.target.value
                    })
                  }
                >
                  <option>
                    Madhya Pradesh
                  </option>

                  <option>
                    Uttar Pradesh
                  </option>

                  <option>
                    Rajasthan
                  </option>

                  <option>
                    Maharashtra
                  </option>

                  <option>
                    Bihar
                  </option>

                  <option>
                    Gujarat
                  </option>

                  <option>
                    Karnataka
                  </option>

                  <option>
                    Odisha
                  </option>
                </select>
              </div>

              <div>
                <label>
                  Category
                </label>

                <select
                  value={
                    precheck.category
                  }
                  onChange={e =>
                    setPrecheck({
                      ...precheck,
                      category:
                        e.target.value
                    })
                  }
                >
                  <option>
                    Infrastructure
                  </option>

                  <option>
                    Education
                  </option>

                  <option>
                    Health
                  </option>

                  <option>
                    Road
                  </option>

                  <option>
                    Water &amp; Sanitation
                  </option>

                  <option>
                    Energy
                  </option>
                </select>
              </div>

            </div>

            <label>
              Estimated Cost (₹)
            </label>

            <input
              type="number"
              value={
                precheck.amount
              }
              onChange={e =>
                setPrecheck({
                  ...precheck,
                  amount:
                    e.target.value
                })
              }
              placeholder="5000000"
            />

            <button
              className="btn primary full"
              onClick={runPrecheck}
            >
              <Icon name="spark" />
              Run AI Pre-Check
            </button>

            {precheckResult && (
              <div className="precheck-result">

                <div className="precheck-score">

                  <div>
                    <span>
                      PRELIMINARY RISK
                    </span>

                    <strong>
                      {
                        precheckResult.score
                      }
                      /100
                    </strong>
                  </div>

                  <span
                    className={`priority ${
                      precheckResult
                        .risk
                        .className
                    }`}
                  >
                    {
                      precheckResult
                        .risk
                        .label
                    }
                  </span>

                </div>

                <span className="section-label">
                  DETECTED INDICATORS
                </span>

                {precheckResult.reasons.map(
                  (reason, index) => (
                    <div
                      className="precheck-reason"
                      key={index}
                    >
                      <b>
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </b>

                      <span>
                        {reason}
                      </span>
                    </div>
                  )
                )}

                <div className="precheck-note">
                  AI pre-check is a screening
                  indicator and requires
                  human/document verification.
                </div>

              </div>
            )}

          </div>

        </div>
      )}

      {/* TOAST */}

      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}

    </div>
  );
}