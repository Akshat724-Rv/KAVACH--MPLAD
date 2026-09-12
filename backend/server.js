const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;
const FLASK_ML_URL = process.env.FLASK_ML_URL || 'http://127.0.0.1:5000';

app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        gateway: 'NIRIKSHAN-AI Node Gateway'
    });
});

app.post('/api/screen-document', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No document image provided' });
        }

        const filePath = req.file.path;
        const docType = req.body.doc_type || 'passport';

        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath), req.file.originalname);
        formData.append('doc_type', docType);

        const response = await axios.post(`${FLASK_ML_URL}/api/screen-document`, formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting temp file:', err);
        });

        return res.status(200).json(response.data);

    } catch (error) {
        console.error('Error forwarding request to ML engine:', error.message);
        return res.status(500).json({
            error: 'Document screening failed at Gateway or ML Service',
            details: error.response?.data || error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`[*] Node.js Gateway running on http://localhost:${PORT}`);
});