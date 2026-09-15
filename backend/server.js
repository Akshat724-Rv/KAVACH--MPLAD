const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
const multer = require("multer");
const { MongoMemoryServer } = require("mongodb-memory-server");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = Number(process.env.PORT || 8000);
const FLASK_URL = String(process.env.FLASK_ML_URL || "http://127.0.0.1:5000")
  .replace(/\/+$/, "");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const workSchema = new mongoose.Schema(
  {
    work_id: { type: String, unique: true, index: true },
    work_description: String,
    constituency: String,
    state: String,
    work_category: String,
    agency_name: String,
    sanctioned_amount_inr: Number,
    sanction_delay_days: Number,
    document_proof_url: String,
    risk_score: Number,
    audit_verdict: String,
    investigation_priority_score: Number,
    active_signals_count: Number,
    explainable_reasons: [String],
    lat: Number,
    lng: Number,
    updated_at: { type: Date, default: Date.now }
  },
  { strict: false }
);

const Work = mongoose.model("Work", workSchema);

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

async function connectDatabase() {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 3000
      });
      console.log("MongoDB connected.");
      return;
    }
  } catch (err) {
    console.log("Local MongoDB unavailable. Using temporary database.");
  }

  const mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  console.log("MongoMemoryServer connected.");
}

async function seedIfEmpty() {
  const count = await Work.countDocuments();

  if (count === 0) {
    await Work.insertMany(demoWorks);
    console.log(`Seeded ${demoWorks.length} demonstration works.`);
  }
}

app.get("/api/health", async (req, res) => {
  res.json({
    success: true,
    service: "KAVACH-MPLAD Node Gateway",
    ml_endpoint: `${FLASK_URL}/api/analyze-priority-queue`,
    database: mongoose.connection.readyState === 1 ? "connected" : "not-connected",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/priority-queue", async (req, res) => {
  try {
    const works = await Work.find({}).sort({ risk_score: -1 }).lean();

    res.json({
      success: true,
      count: works.length,
      data: works
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

app.get("/api/projects", async (req, res) => {
  try {
    const works = await Work.find({}).sort({ risk_score: -1 }).lean();
    res.json({ success: true, count: works.length, data: works });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/analyze-and-sync", async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_URL}/api/analyze-priority-queue`, {
      timeout: 30000
    });

    const analyzed = Array.isArray(response.data?.priority_queue)
      ? response.data.priority_queue
      : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

    if (analyzed.length > 0) {
      for (const item of analyzed) {
        if (!item.work_id) continue;

        await Work.findOneAndUpdate(
          { work_id: item.work_id },
          {
            ...item,
            updated_at: new Date()
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    }

    const works = await Work.find({}).sort({ risk_score: -1 }).lean();

    res.json({
      success: true,
      message: "Risk engine analysis completed and records synchronized.",
      count: works.length,
      data: works
    });
  } catch (err) {
    console.error("ML sync error:", err.message);

    const works = await Work.find({}).sort({ risk_score: -1 }).lean();

    res.status(200).json({
      success: false,
      fallback: true,
      message: "ML service unavailable. Existing monitoring records returned.",
      count: works.length,
      data: works
    });
  }
});

app.post("/api/upload-document", upload.single("document"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No document selected."
    });
  }

  const configured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_CLOUD_NAME !== "demo";

  if (!configured) {
    return res.status(503).json({
      success: false,
      message: "Document storage is not configured. Add valid Cloudinary credentials to .env."
    });
  }

  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "kavach-mplad/evidence"
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    res.json({
      success: true,
      message: "Evidence uploaded successfully.",
      url: result.secure_url
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Evidence upload failed.",
      error: err.message
    });
  }
});

async function start() {
  try {
    await connectDatabase();
    await seedIfEmpty();

    app.listen(PORT, () => {
      console.log("");
      console.log("==============================================");
      console.log(" KAVACH-MPLAD NODE GATEWAY");
      console.log(` http://localhost:${PORT}`);
      console.log(` ML: ${FLASK_URL}/api/analyze-priority-queue`);
      console.log("==============================================");
      console.log("");
    });
  } catch (err) {
    console.error("SERVER START ERROR:", err);
    process.exit(1);
  }
}

start();