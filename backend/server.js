const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

const app = express();
app.use(express.json());
app.use(cors());

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || '123456789',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'secret'
});

const upload = multer({ storage: multer.memoryStorage() });

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/esatark_mplads';
mongoose.connect(MONGO_URI)
  .then(() => console.log('[*] Connected to MongoDB (e-SATARK DB)'))
  .catch(err => console.error('[!] MongoDB Connection Error:', err));

// MongoDB Schema
const WorkSchema = new mongoose.Schema({
  work_id: { type: String, required: true, unique: true },
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
  updated_at: { type: Date, default: Date.now }
});

const Work = mongoose.model('Work', WorkSchema);

const FLASK_ML_URL = 'http://127.0.0.1:5000/api/analyze-priority-queue';

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'online', 
    gateway: 'e-SATARK Node Express Gateway', 
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' 
  });
});

app.post('/api/upload-document', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'esatark_mplads_docs' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    res.status(200).json({
      status: 'success',
      secure_url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.get('/api/priority-queue', async (req, res) => {
  try {
    const works = await Work.find().sort({ investigation_priority_score: -1 });
    res.status(200).json({ status: 'success', count: works.length, data: works });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.post('/api/analyze-and-sync', async (req, res) => {
  try {
    const mlResponse = await axios.get(FLASK_ML_URL);
    const analyzedWorks = mlResponse.data.priority_queue;

    const bulkOps = analyzedWorks.map(work => ({
      updateOne: {
        filter: { work_id: work.work_id },
        update: { $set: { ...work, updated_at: new Date() } },
        upsert: true
      }
    }));

    await Work.bulkWrite(bulkOps);

    const updatedWorks = await Work.find().sort({ investigation_priority_score: -1 });
    res.status(200).json({
      status: 'success',
      message: 'ML analysis synced with MongoDB successfully',
      count: updatedWorks.length,
      data: updatedWorks
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to communicate with ML Engine or DB' });
  }
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`[*] Node.js Gateway + Cloudinary running on http://localhost:${PORT}`);
});