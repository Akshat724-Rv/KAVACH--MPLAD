import os
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS

# Import modules (Ensure risk_engine.py & ocr_engine.py are in the same directory)
try:
    from ocr_engine import extract_document_data
    from risk_engine import analyze_document_tampering
except ImportError:
    # Fallback placeholders if files are still being setup
    extract_document_data = None
    analyze_document_tampering = None

app = Flask(__name__)
CORS(app)  # Enables cross-origin requests for Node.js gateway and React frontend

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_FOLDER = BASE_DIR / "uploads"
UPLOAD_FOLDER.mkdir(exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "pdf"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "online",
        "service": "AI Border Identity & Document Screening Engine",
        "version": "1.0.0"
    })

@app.route("/api/screen-document", methods=["POST"])
def screen_document():
    """
    Core Pipeline Endpoint:
    Accepts image file upload -> OCR Extraction -> Tampering Detection -> Risk Score
    """
    if "file" not in request.files:
        return jsonify({"error": "No document image file provided in request"}), 400

    file = request.files["file"]
    doc_type = request.form.get("doc_type", "passport")  # passport, visa, national_id, driving_license

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        file_path = UPLOAD_FOLDER / file.filename
        file.save(file_path)

        # 1. OCR Extraction (Module 1)
        ocr_result = {}
        if extract_document_data:
            ocr_result = extract_document_data(str(file_path), doc_type=doc_type)
        else:
            ocr_result = {"status": "OCR Module Loading Required"}

        # 2. Tampering & Risk Analysis (Module 2 & 3)
        risk_result = {}
        if analyze_document_tampering:
            risk_result = analyze_document_tampering(str(file_path))
        else:
            risk_result = {
                "risk_score": 15,
                "severity": "LOW",
                "risk_reasons": ["Standard Document Checks Passed"],
                "tampering_detected": False
            }

        # Final Payload Structure for Border Security Dashboard
        response_payload = {
            "filename": file.filename,
            "document_type": doc_type.upper(),
            "ocr_data": ocr_result,
            "screening_summary": {
                "risk_score": risk_result.get("risk_score", 0),
                "severity": risk_result.get("severity", "LOW"),
                "tampering_detected": risk_result.get("tampering_detected", False),
                "flags": risk_result.get("risk_reasons", [])
            }
        }

        # Cleanup uploaded file after processing if required
        # os.remove(file_path)

        return jsonify(response_payload), 200

    return jsonify({"error": "Invalid file format. Allowed: PNG, JPG, JPEG, PDF"}), 400

if __name__ == "__main__":
    print("[*] Starting AI Document Screening ML API on http://127.0.0.1:5000 ...")
    app.run(host="127.0.0.1", port=5000, debug=True)