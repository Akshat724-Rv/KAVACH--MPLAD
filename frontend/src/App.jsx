import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./index.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

/* =========================================================
   DEMO DATA
========================================================= */

const demoWorks = [
  {
    work_id: "MPLAD-001",
    work_description: "Construction of rural community road",
    constituency: "Bhopal",
    state: "Madhya Pradesh",
    work_category: "Infrastructure",
    agency_name: "District Works Agency",
    sanctioned_amount_inr: 8500000,
    sanction_delay_days: 74,
    risk_score: 86,
    investigation_priority_score: 92,
    active_signals_count: 4,
    audit_verdict: "Priority Review",
    explainable_reasons: [
      "Sanctioned cost is materially above peer-work median.",
      "Implementation delay exceeds expected project timeline.",
      "Similar work descriptions detected in the monitored dataset.",
      "Multivariate anomaly signal detected."
    ],
    lat: 23.2599,
    lng: 77.4126
  },
  {
    work_id: "MPLAD-002",
    work_description: "Construction of government school building",
    constituency: "Lucknow",
    state: "Uttar Pradesh",
    work_category: "Education",
    agency_name: "District Education Works",
    sanctioned_amount_inr: 6200000,
    sanction_delay_days: 41,
    risk_score: 79,
    investigation_priority_score: 84,
    active_signals_count: 3,
    audit_verdict: "Priority Review",
    explainable_reasons: [
      "Cost deviation requires peer comparison.",
      "Project timeline shows elevated delay.",
      "Text similarity with another monitored work requires verification."
    ],
    lat: 26.8467,
    lng: 80.9462
  },
  {
    work_id: "MPLAD-003",
    work_description: "Improvement of village drinking water facility",
    constituency: "Jaipur",
    state: "Rajasthan",
    work_category: "Water & Sanitation",
    agency_name: "Rural Development Agency",
    sanctioned_amount_inr: 3900000,
    sanction_delay_days: 18,
    risk_score: 61,
    investigation_priority_score: 63,
    active_signals_count: 2,
    audit_verdict: "Review Required",
    explainable_reasons: [
      "Moderate delay indicator detected.",
      "Cost requires routine peer verification."
    ],
    lat: 26.9124,
    lng: 75.7873
  },
  {
    work_id: "MPLAD-004",
    work_description: "Community health centre equipment and facility improvement",
    constituency: "Mumbai",
    state: "Maharashtra",
    work_category: "Health",
    agency_name: "Urban Health Infrastructure Cell",
    sanctioned_amount_inr: 4800000,
    sanction_delay_days: 22,
    risk_score: 57,
    investigation_priority_score: 58,
    active_signals_count: 2,
    audit_verdict: "Review Required",
    explainable_reasons: [
      "Moderate implementation delay detected.",
      "Project value is above the local peer median."
    ],
    lat: 19.076,
    lng: 72.8777
  },
  {
    work_id: "MPLAD-005",
    work_description: "Renovation of public library and reading facility",
    constituency: "Ahmedabad",
    state: "Gujarat",
    work_category: "Education",
    agency_name: "Municipal Works Division",
    sanctioned_amount_inr: 3100000,
    sanction_delay_days: 9,
    risk_score: 44,
    investigation_priority_score: 45,
    active_signals_count: 1,
    audit_verdict: "Routine Monitoring",
    explainable_reasons: [
      "No major anomaly detected.",
      "Routine monitoring recommended."
    ],
    lat: 23.0225,
    lng: 72.5714
  },
  {
    work_id: "MPLAD-006",
    work_description: "Installation of solar street lighting in public area",
    constituency: "Bengaluru",
    state: "Karnataka",
    work_category: "Energy",
    agency_name: "Urban Infrastructure Agency",
    sanctioned_amount_inr: 2700000,
    sanction_delay_days: 7,
    risk_score: 35,
    investigation_priority_score: 34,
    active_signals_count: 1,
    audit_verdict: "Routine Monitoring",
    explainable_reasons: [
      "No significant anomaly signal detected."
    ],
    lat: 12.9716,
    lng: 77.5946
  },
  {
    work_id: "MPLAD-007",
    work_description: "Drainage improvement and flood mitigation work",
    constituency: "Bhubaneswar",
    state: "Odisha",
    work_category: "Infrastructure",
    agency_name: "Municipal Engineering Division",
    sanctioned_amount_inr: 5500000,
    sanction_delay_days: 28,
    risk_score: 68,
    investigation_priority_score: 71,
    active_signals_count: 3,
    audit_verdict: "Review Required",
    explainable_reasons: [
      "Cost is elevated relative to peer works.",
      "Implementation delay requires validation.",
      "Infrastructure project shows multiple active signals."
    ],
    lat: 20.2961,
    lng: 85.8245
  },
  {
    work_id: "MPLAD-008",
    work_description: "Upgradation of village primary health sub-centre",
    constituency: "Patna",
    state: "Bihar",
    work_category: "Health",
    agency_name: "District Health Society",
    sanctioned_amount_inr: 7300000,
    sanction_delay_days: 56,
    risk_score: 82,
    investigation_priority_score: 88,
    active_signals_count: 4,
    audit_verdict: "Priority Review",
    explainable_reasons: [
      "High implementation delay.",
      "Sanctioned amount requires peer-cost verification.",
      "Multiple anomaly indicators are active.",
      "Project requires supporting-document verification."
    ],
    lat: 25.5941,
    lng: 85.1376
  },
  {
    work_id: "MPLAD-009",
    work_description: "Construction of community hall",
    constituency: "Hyderabad",
    state: "Telangana",
    work_category: "Infrastructure",
    agency_name: "District Infrastructure Cell",
    sanctioned_amount_inr: 4600000,
    sanction_delay_days: 15,
    risk_score: 49,
    investigation_priority_score: 50,
    active_signals_count: 1,
    audit_verdict: "Routine Monitoring",
    explainable_reasons: [
      "Minor delay indicator detected."
    ],
    lat: 17.385,
    lng: 78.4867
  },
  {
    work_id: "MPLAD-010",
    work_description: "Rural irrigation channel rehabilitation",
    constituency: "Nagpur",
    state: "Maharashtra",
    work_category: "Infrastructure",
    agency_name: "Water Resources Division",
    sanctioned_amount_inr: 6900000,
    sanction_delay_days: 47,
    risk_score: 73,
    investigation_priority_score: 77,
    active_signals_count: 3,
    audit_verdict: "Review Required",
    explainable_reasons: [
      "Implementation delay is above normal range.",
      "Cost deviation detected.",
      "Peer comparison recommended."
    ],
    lat: 21.1458,
    lng: 79.0882
  },
  {
    work_id: "MPLAD-011",
    work_description: "Construction of public sanitation facility",
    constituency: "Kochi",
    state: "Kerala",
    work_category: "Water & Sanitation",
    agency_name: "Local Development Authority",
    sanctioned_amount_inr: 2400000,
    sanction_delay_days: 6,
    risk_score: 28,
    investigation_priority_score: 25,
    active_signals_count: 0,
    audit_verdict: "Routine Monitoring",
    explainable_reasons: [
      "No significant anomaly signal detected."
    ],
    lat: 9.9312,
    lng: 76.2673
  }
];

/* =========================================================
   HELPERS
========================================================= */

const riskMeta = (score) => {
  const value = Number(score || 0);

  if (value >= 75) {
    return {
      label: "HIGH",
      className: "high"
    };
  }

  if (value >= 50) {
    return {
      label: "MEDIUM",
      className: "medium"
    };
  }

  return {
    label: "LOW",
    className: "low"
  };
};

const money = (value) => {
  const amount = Number(value || 0);

  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }

  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }

  return `₹${amount.toLocaleString("en-IN")}`;
};

const Icon = ({ type, size = 18 }) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  };

  const paths = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    queue: (
      <>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
        <circle cx="8" cy="6" r="1" />
        <circle cx="16" cy="12" r="1" />
        <circle cx="11" cy="18" r="1" />
      </>
    ),
    analytics: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <rect x="7" y="12" width="2.8" height="5" />
        <rect x="11" y="9" width="2.8" height="8" />
        <rect x="15" y="6" width="2.8" height="11" />
      </>
    ),
    map: (
      <>
        <path d="M9 18l-5 3V6l5-3 6 3 5-3v15l-5 3-6-3z" />
        <path d="M9 3v15" />
        <path d="M15 6v15" />
      </>
    ),
    evidence: (
      <>
        <path d="M5 3h10l4 4v14H5z" />
        <path d="M15 3v5h4" />
        <path d="M8 13h8" />
        <path d="M8 17h6" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 11a8 8 0 0 0-14.7-4L3 10" />
        <path d="M3 5v5h5" />
        <path d="M4 13a8 8 0 0 0 14.7 4L21 14" />
        <path d="M21 19v-5h-5" />
      </>
    ),
    sync: (
      <>
        <path d="M17 1l4 4-4 4" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <path d="M7 23l-4-4 4-4" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-4-4" />
      </>
    ),
    filter: (
      <>
        <path d="M4 6h16" />
        <path d="M7 12h10" />
        <path d="M10 18h4" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12" />
        <path d="M8 11l4 4 4-4" />
        <path d="M4 21h16" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V4" />
        <path d="M8 8l4-4 4 4" />
        <path d="M4 20h16" />
      </>
    ),
    close: (
      <>
        <path d="M6 6l12 12" />
        <path d="M18 6L6 18" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="M13 6l6 6-6 6" />
      </>
    ),
    alert: (
      <>
        <path d="M12 3l9 17H3z" />
        <path d="M12 9v5" />
        <path d="M12 17h.01" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3l8 3v5c0 5-3.2 8.4-8 10-4.8-1.6-8-5-8-10V6z" />
        <path d="M8 12l2.5 2.5L16 9" />
      </>
    )
  };

  return <svg {...common}>{paths[type] || paths.dashboard}</svg>;
};

/* =========================================================
   INDIA MAP HELPERS
========================================================= */

const isValidIndiaCoordinate = (lat, lng) => {
  const latitude = Number(lat);
  const longitude = Number(lng);

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= 6 &&
    latitude <= 37 &&
    longitude >= 68 &&
    longitude <= 98
  );
};

const INDIA_MAP_BOUNDS = {
  minLat: 6,
  maxLat: 37,
  minLng: 68,
  maxLng: 98
};

const getIndiaMarkerPosition = (lat, lng) => {
  const latitude = Number(lat);
  const longitude = Number(lng);

  const x =
    ((longitude - INDIA_MAP_BOUNDS.minLng) /
      (INDIA_MAP_BOUNDS.maxLng - INDIA_MAP_BOUNDS.minLng)) *
    100;

  const y =
    ((INDIA_MAP_BOUNDS.maxLat - latitude) /
      (INDIA_MAP_BOUNDS.maxLat - INDIA_MAP_BOUNDS.minLat)) *
    100;

  return {
    left: `${Math.max(2, Math.min(98, x))}%`,
    top: `${Math.max(3, Math.min(97, y))}%`
  };
};

/* =========================================================
   APP
========================================================= */

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
  const [fileRef, setFileRef] = useState(null);

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

  /* =======================================================
     NOTIFICATION
  ======================================================= */

  const notify = (message) => {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 3000);
  };

  /* =======================================================
     LOAD WORKS
  ======================================================= */

  const loadWorks = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API}/api/priority-queue`);

      const incoming =
        response.data?.priority_queue ||
        response.data?.works ||
        response.data ||
        [];

      if (Array.isArray(incoming) && incoming.length > 0) {
        setWorks(incoming);
      } else {
        setWorks(demoWorks);
      }
    } catch (error) {
      console.warn("Using demo monitoring data:", error.message);
      setWorks(demoWorks);
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     HEALTH
  ======================================================= */

  const checkHealth = async () => {
    try {
      const response = await axios.get(`${API}/api/health`);

      setHealth(
        response.status === 200 &&
          (response.data?.status === "ok" ||
            response.data?.status === "healthy" ||
            response.data?.ok === true)
      );
    } catch {
      setHealth(false);
    }
  };

  useEffect(() => {
    loadWorks();
    checkHealth();

    const timer = window.setInterval(() => {
      loadWorks();
      checkHealth();
    }, 15000);

    return () => window.clearInterval(timer);
  }, []);

  /* =======================================================
     SYNC ML ENGINE
  ======================================================= */

  const syncEngine = async () => {
    try {
      setSyncing(true);

      await axios.post(`${API}/api/analyze-and-sync`);

      await loadWorks();

      notify("AI risk engine synchronized successfully.");
    } catch (error) {
      notify(
        error.response?.data?.error ||
          "AI synchronization failed. Check backend and ML services."
      );
    } finally {
      setSyncing(false);
    }
  };

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    const total = works.length;

    const high = works.filter(
      (work) => Number(work.risk_score || 0) >= 75
    ).length;

    const medium = works.filter((work) => {
      const score = Number(work.risk_score || 0);
      return score >= 50 && score < 75;
    }).length;

    const low = works.filter(
      (work) => Number(work.risk_score || 0) < 50
    ).length;

    const atRisk = high + medium;

    const avg =
      total > 0
        ? Math.round(
            works.reduce(
              (sum, work) => sum + Number(work.risk_score || 0),
              0
            ) / total
          )
        : 0;

    return {
      total,
      high,
      medium,
      low,
      atRisk,
      avg
    };
  }, [works]);

  /* =======================================================
     FILTER OPTIONS
  ======================================================= */

  const states = useMemo(() => {
    return [...new Set(works.map((work) => work.state).filter(Boolean))].sort();
  }, [works]);

  const categories = useMemo(() => {
    return [
      ...new Set(
        works.map((work) => work.work_category).filter(Boolean)
      )
    ].sort();
  }, [works]);

  /* =======================================================
     FILTERED WORKS
  ======================================================= */

  const filteredWorks = useMemo(() => {
    const search = query.trim().toLowerCase();

    return [...works]
      .filter((work) => {
        if (!search) return true;

        return [
          work.work_id,
          work.work_description,
          work.constituency,
          work.state,
          work.work_category,
          work.agency_name
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search);
      })
      .filter((work) => {
        if (riskFilter === "ALL") return true;

        return riskMeta(work.risk_score).label === riskFilter;
      })
      .filter((work) => {
        if (stateFilter === "ALL") return true;

        return work.state === stateFilter;
      })
      .filter((work) => {
        if (categoryFilter === "ALL") return true;

        return work.work_category === categoryFilter;
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

  /* =======================================================
     INDIA MAP WORKS
  ======================================================= */

  const indiaMapWorks = useMemo(() => {
    return works.filter((work) =>
      isValidIndiaCoordinate(work.lat, work.lng)
    );
  }, [works]);

  /* =======================================================
     EXPORT
  ======================================================= */

  const exportCSV = () => {
    if (!filteredWorks.length) {
      notify("No records available for export.");
      return;
    }

    const headers = [
      "Work ID",
      "Description",
      "Constituency",
      "State",
      "Category",
      "Agency",
      "Sanctioned Amount",
      "Delay Days",
      "Risk Score",
      "Priority Score",
      "Active Signals",
      "Verdict"
    ];

    const rows = filteredWorks.map((work) => [
      work.work_id,
      work.work_description,
      work.constituency,
      work.state,
      work.work_category,
      work.agency_name,
      work.sanctioned_amount_inr,
      work.sanction_delay_days,
      work.risk_score,
      work.investigation_priority_score,
      work.active_signals_count,
      work.audit_verdict
    ]);

    const csv = [
      headers,
      ...rows
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? "").replaceAll('"', '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "kavach-mplad-risk-queue.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    notify("Risk queue CSV exported.");
  };

  /* =======================================================
     SCROLL
  ======================================================= */

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };

  /* =======================================================
     COPILOT
  ======================================================= */

  const runCopilot = (question) => {
    let answer = "";

    if (question === "high") {
      answer =
        `There are ${stats.high} high-risk works and ${stats.medium} medium-risk works currently requiring verification.`;
    } else if (question === "why") {
      const risky = [...works]
        .filter((work) => Number(work.risk_score || 0) >= 75)
        .sort(
          (a, b) =>
            Number(b.risk_score || 0) -
            Number(a.risk_score || 0)
        )[0];

      if (risky) {
        answer =
          `${risky.work_id} is prioritised because of ${
            risky.active_signals_count || 0
          } active risk signals including cost, delay or similarity indicators.`;
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

  /* =======================================================
     PRECHECK
  ======================================================= */

  const runPrecheck = () => {
    const amount = Number(precheck.amount || 0);
    const description = precheck.description.trim();

    if (!description || !amount) {
      notify("Enter work description and estimated cost.");
      return;
    }

    let score = 30;

    if (amount >= 5000000) score += 20;
    if (amount >= 10000000) score += 10;
    if (description.length < 35) score += 8;

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

  /* =======================================================
     UPLOAD
  ======================================================= */

  const uploadEvidence = async () => {
    if (!fileRef) {
      notify("Select an evidence document first.");
      return;
    }

    if (!selected) {
      notify("Select a work before uploading evidence.");
      return;
    }

    const formData = new FormData();

    formData.append("document", fileRef);
    formData.append("work_id", selected.work_id);

    try {
      await axios.post(
        `${API}/api/upload-document`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      notify("Evidence uploaded successfully.");
      setFileRef(null);
    } catch (error) {
      notify(
        error.response?.data?.error ||
          "Evidence upload failed."
      );
    }
  };

  /* =======================================================
     STATE RISK
  ======================================================= */

  const stateRisk = useMemo(() => {
    const map = {};

    works.forEach((work) => {
      const state = work.state || "Unknown";

      if (!map[state]) {
        map[state] = {
          state,
          total: 0,
          risk: 0,
          high: 0
        };
      }

      map[state].total += 1;
      map[state].risk += Number(work.risk_score || 0);

      if (Number(work.risk_score || 0) >= 75) {
        map[state].high += 1;
      }
    });

    return Object.values(map)
      .map((item) => ({
        ...item,
        avg: Math.round(item.risk / item.total)
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [works]);

  /* =======================================================
     SIGNAL COUNTS
  ======================================================= */

  const signalCounts = useMemo(() => {
    const signals = {
      "Cost anomaly": 0,
      "Delay anomaly": 0,
      "Similarity": 0,
      "Multivariate": 0
    };

    works.forEach((work) => {
      const reasons = Array.isArray(
        work.explainable_reasons
      )
        ? work.explainable_reasons.join(" ").toLowerCase()
        : "";

      if (reasons.includes("cost")) {
        signals["Cost anomaly"] += 1;
      }

      if (
        reasons.includes("delay") ||
        reasons.includes("timeline")
      ) {
        signals["Delay anomaly"] += 1;
      }

      if (
        reasons.includes("similar") ||
        reasons.includes("peer")
      ) {
        signals["Similarity"] += 1;
      }

      if (
        reasons.includes("multivariate") ||
        reasons.includes("multiple")
      ) {
        signals["Multivariate"] += 1;
      }
    });

    return Object.entries(signals).sort(
      (a, b) => b[1] - a[1]
    );
  }, [works]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="app-shell">

      {/* ===================================================
          TOP BAR
      =================================================== */}

      <header className="topbar">

        <div className="brand-block">

          <div className="brand-mark">
            K
          </div>

          <div>
            <div className="brand-name">
              KAVACH-MPLAD
            </div>

            <div className="brand-subtitle">
              MPLADS Risk Intelligence & Audit Decision Support
            </div>
          </div>

        </div>


        <div className="topbar-right">

          <span className="prototype-label">
            GOVERNMENT DECISION-SUPPORT INTERFACE
          </span>

          <span
            className={`system-status ${
              health ? "online" : "offline"
            }`}
          >
            <i></i>

            {health
              ? "SYSTEM ONLINE"
              : "OFFLINE / DEMO MODE"}
          </span>

        </div>

      </header>


      <div className="accent-line"></div>


      {/* ===================================================
          BODY
      =================================================== */}

      <div className="layout">

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="sidebar">

          <div className="sidebar-heading">
            MONITORING CELL
          </div>

          <div className="sidebar-scheme">
            MPLADS
          </div>

          <div className="sidebar-description">
            Risk & Compliance Intelligence
          </div>


          <nav className="sidebar-nav">

            <button
              className="nav-item active"
              onClick={() => scrollTo("overview")}
            >
              <Icon type="dashboard" size={17} />
              <span>Dashboard</span>
            </button>

            <button
              className="nav-item"
              onClick={() => scrollTo("risk-queue")}
            >
              <Icon type="queue" size={17} />
              <span>Risk Queue</span>
            </button>

            <button
              className="nav-item"
              onClick={() => scrollTo("analytics")}
            >
              <Icon type="analytics" size={17} />
              <span>Analytics</span>
            </button>

            <button
              className="nav-item"
              onClick={() => scrollTo("geo-risk")}
            >
              <Icon type="map" size={17} />
              <span>Geo Risk Map</span>
            </button>

            <button
              className="nav-item"
              onClick={() => scrollTo("evidence")}
            >
              <Icon type="evidence" size={17} />
              <span>Evidence</span>
            </button>

          </nav>


          <div className="sidebar-footer">

            <div className="sidebar-footer-label">
              PROTOTYPE
            </div>

            <div className="sidebar-footer-title">
              SIH 2026
            </div>

            <div className="sidebar-footer-text">
              AI-powered anomaly and risk monitoring for MPLADS.
            </div>

          </div>

        </aside>


        {/* =================================================
            MAIN
        ================================================= */}

        <main className="main-content">

          {/* =================================================
              OVERVIEW
          ================================================= */}

          <section id="overview">

            <div className="page-heading">

              <div>

                <span className="section-label">
                  NATIONAL MONITORING OVERVIEW
                </span>

                <h1>
                  Risk Intelligence Dashboard
                </h1>

                <p>
                  AI-assisted monitoring of MPLADS works,
                  anomalies and verification priorities.
                </p>

              </div>


              <div className="heading-actions">

                <button
                  className="btn secondary"
                  onClick={loadWorks}
                >
                  <Icon type="refresh" size={14} />
                  Refresh
                </button>

                <button
                  className="btn primary"
                  onClick={syncEngine}
                  disabled={syncing}
                >
                  <Icon type="sync" size={14} />

                  {syncing
                    ? "Syncing..."
                    : "Sync AI Engine"}
                </button>

              </div>

            </div>


            <div className="notice-bar">

              <Icon type="shield" size={17} />

              <span>
                AI outputs indicate potential risk and
                prioritisation signals. Final findings require
                human and documentary verification.
              </span>

            </div>


            {/* KPI GRID */}

            <div className="kpi-grid">

              <button
                className="kpi-card"
                onClick={() => {
                  setRiskFilter("ALL");
                  scrollTo("risk-queue");
                }}
              >
                <span className="kpi-label">
                  MONITORED WORKS
                </span>

                <strong>{stats.total}</strong>

                <span className="kpi-link">
                  Open monitoring queue →
                </span>
              </button>


              <button
                className="kpi-card danger"
                onClick={() => {
                  setRiskFilter("HIGH");
                  scrollTo("risk-queue");
                }}
              >
                <span className="kpi-label">
                  HIGH RISK
                </span>

                <strong>{stats.high}</strong>

                <span className="kpi-link">
                  View high-risk works →
                </span>
              </button>


              <button
                className="kpi-card warning"
                onClick={() => {
                  setRiskFilter("MEDIUM");
                  scrollTo("risk-queue");
                }}
              >
                <span className="kpi-label">
                  REVIEW REQUIRED
                </span>

                <strong>{stats.medium}</strong>

                <span className="kpi-link">
                  Open review queue →
                </span>
              </button>


              <button
                className="kpi-card success"
                onClick={() => scrollTo("analytics")}
              >
                <span className="kpi-label">
                  AVG. RISK SCORE
                </span>

                <strong>{stats.avg}</strong>

                <span className="kpi-link">
                  Open analytics →
                </span>
              </button>

            </div>


            {/* RISK DISTRIBUTION */}

            <div className="dashboard-grid">

              <div className="panel">

                <div className="panel-heading">

                  <div>
                    <span className="section-label">
                      RISK DISTRIBUTION
                    </span>

                    <h2>
                      Current Monitoring Profile
                    </h2>
                  </div>

                  <button
                    className="text-button"
                    onClick={() =>
                      scrollTo("risk-queue")
                    }
                  >
                    View queue →
                  </button>

                </div>


                <div className="risk-distribution">

                  <div className="risk-distribution-item">

                    <div className="risk-dist-top">
                      <span>
                        <i className="risk-dot high"></i>
                        High
                      </span>

                      <strong>{stats.high}</strong>
                    </div>

                    <div className="progress">
                      <span
                        className="progress-high"
                        style={{
                          width: `${
                            stats.total
                              ? (stats.high /
                                  stats.total) *
                                100
                              : 0
                          }%`
                        }}
                      ></span>
                    </div>

                  </div>


                  <div className="risk-distribution-item">

                    <div className="risk-dist-top">
                      <span>
                        <i className="risk-dot medium"></i>
                        Medium
                      </span>

                      <strong>{stats.medium}</strong>
                    </div>

                    <div className="progress">
                      <span
                        className="progress-medium"
                        style={{
                          width: `${
                            stats.total
                              ? (stats.medium /
                                  stats.total) *
                                100
                              : 0
                          }%`
                        }}
                      ></span>
                    </div>

                  </div>


                  <div className="risk-distribution-item">

                    <div className="risk-dist-top">
                      <span>
                        <i className="risk-dot low"></i>
                        Low
                      </span>

                      <strong>{stats.low}</strong>
                    </div>

                    <div className="progress">
                      <span
                        className="progress-low"
                        style={{
                          width: `${
                            stats.total
                              ? (stats.low /
                                  stats.total) *
                                100
                              : 0
                          }%`
                        }}
                      ></span>
                    </div>

                  </div>

                </div>

              </div>


              <div className="panel readiness-panel">

                <div className="panel-heading">

                  <div>
                    <span className="section-label">
                      SYSTEM READINESS
                    </span>

                    <h2>
                      Monitoring Services
                    </h2>
                  </div>

                </div>


                <div className="service-row">

                  <span>
                    Node API
                  </span>

                  <b
                    className={
                      health ? "service-ok" : "service-demo"
                    }
                  >
                    {health ? "ONLINE" : "DEMO"}
                  </b>

                </div>


                <div className="service-row">

                  <span>
                    ML Risk Engine
                  </span>

                  <b className="service-ok">
                    READY
                  </b>

                </div>


                <div className="service-row">

                  <span>
                    Risk Intelligence
                  </span>

                  <b className="service-ok">
                    ACTIVE
                  </b>

                </div>


                <div className="service-row">

                  <span>
                    Human Verification
                  </span>

                  <b className="service-required">
                    REQUIRED
                  </b>

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              AI COMMAND CENTER
          ================================================= */}

          <section className="section-space">

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
                  before a new work enters the monitoring
                  queue.
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


          {/* =================================================
              GEO MAP
          ================================================= */}

          <section
            id="geo-risk"
            className="section-space"
          >

            <div className="section-heading-row">

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
                  <i className="legend-dot high"></i>
                  High
                </span>

                <span>
                  <i className="legend-dot medium"></i>
                  Medium
                </span>

                <span>
                  <i className="legend-dot low"></i>
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
                  {indiaMapWorks.length} monitored works
                </strong>
              </div>


              <div>
                <span>
                  PRIORITY VERIFICATION
                </span>

                <strong>
                  {stats.high + stats.medium} works
                </strong>
              </div>


              <div>
                <span>
                  AI SIGNALS
                </span>

                <strong>
                  {indiaMapWorks.reduce(
                    (sum, work) =>
                      sum +
                      Number(
                        work.active_signals_count || 0
                      ),
                    0
                  )}{" "}
                  active
                </strong>
              </div>


              <button
                type="button"
                onClick={() =>
                  scrollTo("risk-queue")
                }
              >
                Open Risk Queue →
              </button>

            </div>


            <div className="national-map-wrapper">

              <iframe
                title="India National Risk Map"
                className="national-map"
                src="https://www.openstreetmap.org/export/embed.html?bbox=68%2C6%2C98%2C37&layer=mapnik"
                loading="lazy"
              />


              <div className="map-marker-layer">

                {indiaMapWorks.map((work) => {

                  const score = Number(
                    work.risk_score || 0
                  );

                  const risk = riskMeta(score);

                  const position =
                    getIndiaMarkerPosition(
                      work.lat,
                      work.lng
                    );

                  return (
                    <button
                      key={work.work_id}
                      type="button"
                      className={`risk-map-marker ${risk.className}`}
                      style={position}
                      title={`${work.work_id} — Risk Score ${score}`}
                      onClick={() =>
                        setSelected(work)
                      }
                    >

                      <span className="risk-marker-dot"></span>

                      <span className="risk-marker-tooltip">

                        <strong>
                          {work.work_id}
                        </strong>

                        <span>
                          Risk Score: {score}
                        </span>

                        <span>
                          {risk.label}
                        </span>

                      </span>

                    </button>
                  );
                })}

              </div>


              <div className="map-info-card">

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


          {/* =================================================
              RISK QUEUE
          ================================================= */}

          <section
            id="risk-queue"
            className="section-space"
          >

            <div className="section-heading-row">

              <div>
                <span className="section-label">
                  AI PRIORITISATION
                </span>

                <h2>
                  Risk Verification Queue
                </h2>
              </div>


              <button
                className="btn secondary"
                onClick={exportCSV}
              >
                <Icon
                  type="download"
                  size={14}
                />
                Export CSV
              </button>

            </div>


            <div className="filters-bar">

              <div className="search-box">

                <Icon
                  type="search"
                  size={15}
                />

                <input
                  value={query}
                  onChange={(event) =>
                    setQuery(event.target.value)
                  }
                  placeholder="Search work ID, description, state..."
                />

              </div>


              <div className="filter-control">

                <Icon
                  type="filter"
                  size={14}
                />

                <select
                  value={riskFilter}
                  onChange={(event) =>
                    setRiskFilter(event.target.value)
                  }
                >
                  <option value="ALL">
                    All Risk
                  </option>

                  <option value="HIGH">
                    High
                  </option>

                  <option value="MEDIUM">
                    Medium
                  </option>

                  <option value="LOW">
                    Low
                  </option>
                </select>

              </div>


              <select
                className="select-control"
                value={stateFilter}
                onChange={(event) =>
                  setStateFilter(event.target.value)
                }
              >
                <option value="ALL">
                  All States
                </option>

                {states.map((state) => (
                  <option
                    key={state}
                    value={state}
                  >
                    {state}
                  </option>
                ))}
              </select>


              <select
                className="select-control"
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value)
                }
              >
                <option value="ALL">
                  All Categories
                </option>

                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>

            </div>


            <div className="table-panel">

              {loading ? (
                <div className="table-empty">
                  Loading monitoring data...
                </div>
              ) : filteredWorks.length === 0 ? (
                <div className="table-empty">
                  No works match the current filters.
                </div>
              ) : (

                <div className="table-scroll">

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
                      </tr>

                    </thead>


                    <tbody>

                      {filteredWorks.map(
                        (work, index) => {

                          const risk = riskMeta(
                            work.risk_score
                          );

                          return (
                            <tr
                              key={work.work_id}
                              onClick={() =>
                                setSelected(work)
                              }
                              className="table-row-clickable"
                            >

                              <td>
                                <span className="priority-number">
                                  {String(index + 1).padStart(
                                    2,
                                    "0"
                                  )}
                                </span>
                              </td>


                              <td>

                                <div className="work-cell">

                                  <strong>
                                    {work.work_id}
                                  </strong>

                                  <span>
                                    {work.work_description}
                                  </span>

                                </div>

                              </td>


                              <td>

                                <div className="location-cell">

                                  <strong>
                                    {work.constituency}
                                  </strong>

                                  <span>
                                    {work.state}
                                  </span>

                                </div>

                              </td>


                              <td>
                                <span className="category-pill">
                                  {work.work_category ||
                                    "General"}
                                </span>
                              </td>


                              <td>
                                <strong>
                                  {money(
                                    work.sanctioned_amount_inr
                                  )}
                                </strong>
                              </td>


                              <td>
                                <span
                                  className={
                                    Number(
                                      work.sanction_delay_days ||
                                        0
                                    ) >= 45
                                      ? "delay-high"
                                      : "delay-normal"
                                  }
                                >
                                  {Number(
                                    work.sanction_delay_days ||
                                      0
                                  )}
                                  d
                                </span>
                              </td>


                              <td>

                                <span
                                  className={`priority ${risk.className}`}
                                >
                                  {work.risk_score}
                                  <small>
                                    {risk.label}
                                  </small>
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

                            </tr>
                          );
                        }
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          </section>


          {/* =================================================
              ANALYTICS
          ================================================= */}

          <section
            id="analytics"
            className="section-space"
          >

            <div className="section-heading-row">

              <div>
                <span className="section-label">
                  EXPLAINABLE ANALYTICS
                </span>

                <h2>
                  Risk Signals & State Intelligence
                </h2>
              </div>

            </div>


            <div className="analytics-grid">

              <div className="panel">

                <div className="panel-heading">

                  <div>
                    <span className="section-label">
                      STATE-WISE RISK
                    </span>

                    <h2>
                      Average Risk Score
                    </h2>
                  </div>

                </div>


                <div className="state-list">

                  {stateRisk.map((item) => (

                    <button
                      key={item.state}
                      className="state-row"
                      onClick={() => {
                        setStateFilter(item.state);
                        scrollTo("risk-queue");
                      }}
                    >

                      <div className="state-name">

                        <strong>
                          {item.state}
                        </strong>

                        <span>
                          {item.total} monitored works
                        </span>

                      </div>


                      <div className="state-bar">

                        <span
                          style={{
                            width: `${item.avg}%`
                          }}
                        ></span>

                      </div>


                      <strong className="state-score">
                        {item.avg}
                      </strong>

                    </button>

                  ))}

                </div>

              </div>


              <div className="panel">

                <div className="panel-heading">

                  <div>
                    <span className="section-label">
                      DETECTION SIGNALS
                    </span>

                    <h2>
                      Active Indicators
                    </h2>
                  </div>

                </div>


                <div className="signal-list">

                  {signalCounts.map(
                    ([label, count]) => (

                      <div
                        className="signal-row"
                        key={label}
                      >

                        <div>

                          <strong>
                            {label}
                          </strong>

                          <span>
                            AI screening indicator
                          </span>

                        </div>


                        <b>
                          {count}
                        </b>

                      </div>

                    )
                  )}

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              EVIDENCE
          ================================================= */}

          <section
            id="evidence"
            className="section-space"
          >

            <div className="section-heading-row">

              <div>
                <span className="section-label">
                  DOCUMENTARY VERIFICATION
                </span>

                <h2>
                  Evidence Workspace
                </h2>
              </div>

            </div>


            <div className="evidence-grid">

              <div className="evidence-card">

                <div className="evidence-icon">
                  <Icon
                    type="evidence"
                    size={21}
                  />
                </div>

                <strong>
                  Sanction Documents
                </strong>

                <span>
                  Sanction order and approval evidence.
                </span>

              </div>


              <div className="evidence-card">

                <div className="evidence-icon">
                  <Icon
                    type="evidence"
                    size={21}
                  />
                </div>

                <strong>
                  Cost Estimates
                </strong>

                <span>
                  Approved estimates and BOQ records.
                </span>

              </div>


              <div className="evidence-card">

                <div className="evidence-icon">
                  <Icon
                    type="evidence"
                    size={21}
                  />
                </div>

                <strong>
                  Progress Evidence
                </strong>

                <span>
                  Work completion and implementation evidence.
                </span>

              </div>


              <div className="evidence-card">

                <div className="evidence-icon">
                  <Icon
                    type="upload"
                    size={21}
                  />
                </div>

                <strong>
                  Upload Evidence
                </strong>

                <span>
                  Attach supporting documents to a selected work.
                </span>

                <label className="upload-button">

                  Select Document

                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(event) =>
                      setFileRef(
                        event.target.files?.[0] ||
                          null
                      )
                    }
                  />

                </label>

                {fileRef && (
                  <span className="selected-file">
                    {fileRef.name}
                  </span>
                )}

                <button
                  className="btn primary full"
                  onClick={uploadEvidence}
                >
                  Upload to Selected Work
                </button>

              </div>

            </div>

          </section>


          {/* =================================================
              FOOTER
          ================================================= */}

          <footer className="footer">

            <span>
              KAVACH-MPLAD • SIH 2026 Prototype
            </span>

            <span>
              AI-assisted decision support • Human verification required
            </span>

          </footer>

        </main>

      </div>


      {/* =====================================================
          WORK DRAWER
      ===================================================== */}

      {selected && (

        <div
          className="drawer-backdrop"
          onClick={() => setSelected(null)}
        >

          <aside
            className="work-drawer"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="drawer-header">

              <div>

                <span className="section-label">
                  INVESTIGATION WORKSPACE
                </span>

                <h2>
                  {selected.work_id}
                </h2>

              </div>


              <button
                className="icon-button"
                onClick={() =>
                  setSelected(null)
                }
              >
                <Icon
                  type="close"
                  size={18}
                />
              </button>

            </div>


            <div className="drawer-risk">

              <div>

                <span>
                  AI RISK SCORE
                </span>

                <strong>
                  {selected.risk_score}/100
                </strong>

              </div>


              <span
                className={`priority ${riskMeta(
                  selected.risk_score
                ).className}`}
              >
                {
                  riskMeta(
                    selected.risk_score
                  ).label
                }
              </span>

            </div>


            <div className="drawer-section">

              <span className="section-label">
                WORK DETAILS
              </span>


              <h3>
                {selected.work_description}
              </h3>


              <div className="detail-grid">

                <div>
                  <span>Constituency</span>
                  <strong>
                    {selected.constituency}
                  </strong>
                </div>

                <div>
                  <span>State</span>
                  <strong>
                    {selected.state}
                  </strong>
                </div>

                <div>
                  <span>Category</span>
                  <strong>
                    {selected.work_category}
                  </strong>
                </div>

                <div>
                  <span>Agency</span>
                  <strong>
                    {selected.agency_name}
                  </strong>
                </div>

                <div>
                  <span>Sanctioned Value</span>
                  <strong>
                    {money(
                      selected.sanctioned_amount_inr
                    )}
                  </strong>
                </div>

                <div>
                  <span>Delay</span>
                  <strong>
                    {selected.sanction_delay_days} days
                  </strong>
                </div>

              </div>

            </div>


            <div className="drawer-section">

              <span className="section-label">
                EXPLAINABLE AI SIGNALS
              </span>


              <div className="reason-list">

                {(
                  Array.isArray(
                    selected.explainable_reasons
                  )
                    ? selected.explainable_reasons
                    : []
                ).map((reason, index) => (

                  <div
                    className="reason-item"
                    key={index}
                  >

                    <b>
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </b>

                    <span>
                      {reason}
                    </span>

                  </div>

                ))}

              </div>

            </div>


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
                    Compare sanctioned cost with peer works.
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
                    Validate execution timeline and progress records.
                  </small>

                </span>

              </button>


              <button
                onClick={() =>
                  notify(
                    "Document verification added to verification workflow."
                  )
                }
              >

                <b>03</b>

                <span>

                  <strong>
                    Verify Supporting Documents
                  </strong>

                  <small>
                    Check sanction, estimate and progress evidence.
                  </small>

                </span>

              </button>

            </div>


            <button
              className="btn primary full drawer-upload"
              onClick={() => {
                setSelected(selected);
                scrollTo("evidence");
                notify(
                  "Select a document in the Evidence Workspace."
                );
              }}
            >
              Add Verification Evidence
            </button>

          </aside>

        </div>

      )}


      {/* =====================================================
          COPILOT MODAL
      ===================================================== */}

      {copilotOpen && (

        <div
          className="modal-backdrop"
          onClick={() =>
            setCopilotOpen(false)
          }
        >

          <div
            className="copilot-modal"
            onClick={(event) =>
              event.stopPropagation()
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

              <p>
                {copilotMessage}
              </p>

            </div>


            <div className="copilot-modal-actions">

              <button
                onClick={() =>
                  runCopilot("high")
                }
              >
                Priority Works
              </button>

              <button
                onClick={() =>
                  runCopilot("why")
                }
              >
                Explain Risk
              </button>

              <button
                onClick={() =>
                  runCopilot("action")
                }
              >
                Recommended Actions
              </button>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          PRECHECK MODAL
      ===================================================== */}

      {precheckOpen && (

        <div
          className="modal-backdrop"
          onClick={() =>
            setPrecheckOpen(false)
          }
        >

          <div
            className="precheck-modal"
            onClick={(event) =>
              event.stopPropagation()
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
              Preliminary screening for potential risk
              indicators before detailed verification.
            </p>


            <label>
              Work Description
            </label>

            <textarea
              value={precheck.description}
              onChange={(event) =>
                setPrecheck({
                  ...precheck,
                  description:
                    event.target.value
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
                  value={precheck.state}
                  onChange={(event) =>
                    setPrecheck({
                      ...precheck,
                      state: event.target.value
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
                  value={precheck.category}
                  onChange={(event) =>
                    setPrecheck({
                      ...precheck,
                      category:
                        event.target.value
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
                    Water & Sanitation
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
              value={precheck.amount}
              onChange={(event) =>
                setPrecheck({
                  ...precheck,
                  amount: event.target.value
                })
              }
              placeholder="5000000"
            />


            <button
              className="btn primary full"
              onClick={runPrecheck}
            >
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
                      {precheckResult.score}/100
                    </strong>

                  </div>


                  <span
                    className={`priority ${precheckResult.risk.className}`}
                  >
                    {precheckResult.risk.label}
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
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </b>

                      <span>
                        {reason}
                      </span>

                    </div>

                  )
                )}


                <div className="precheck-note">

                  AI pre-check is a screening indicator
                  and requires human/document verification.

                </div>

              </div>

            )}

          </div>

        </div>

      )}


      {/* =====================================================
          TOAST
      ===================================================== */}

      {toast && (

        <div className="toast">

          <span className="toast-check">
            ✓
          </span>

          {toast}

        </div>

      )}

    </div>
  );
}