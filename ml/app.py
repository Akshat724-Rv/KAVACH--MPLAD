from flask import Flask, jsonify, request
import pandas as pd
from risk_engine import ESATARKRiskEngine

app = Flask(__name__)

# Mock Dataset representing MPLADS e-SAKSHI Data Feed
MOCK_MPLADS_DATA = [
    {
        "work_id": "MPLADS-2026-101",
        "work_description": "Construction of Community Hall in Block A",
        "constituency": "Jabalpur",
        "state": "Madhya Pradesh",
        "work_category": "Infrastructure",
        "agency_name": "Apex Infra Works",
        "sanctioned_amount": 7500000,
        "sanction_delay_days": 110
    },
    {
        "work_id": "MPLADS-2026-102",
        "work_description": "Construction of Community Center in Block A",
        "constituency": "Jabalpur",
        "state": "Madhya Pradesh",
        "work_category": "Infrastructure",
        "agency_name": "Apex Infra Works",
        "sanctioned_amount": 7200000,
        "sanction_delay_days": 105
    },
    {
        "work_id": "MPLADS-2026-103",
        "work_description": "Installation of Solar Street Lights",
        "constituency": "Jabalpur",
        "state": "Madhya Pradesh",
        "work_category": "Sanitation",
        "agency_name": "GreenPower Solutions",
        "sanctioned_amount": 1200000,
        "sanction_delay_days": 15
    }
]

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "e-SATARK ML Intelligence Engine"})

@app.route('/api/analyze-priority-queue', methods=['GET', 'POST'])
def analyze_priority_queue():
    try:
        # Load incoming data or fallback to MPLADS mock pipeline
        input_data = request.json.get('data') if request.is_json and 'data' in request.json else MOCK_MPLADS_DATA
        df = pd.DataFrame(input_data)
        
        engine = ESATARKRiskEngine(df)
        priority_queue = engine.get_priority_queue_results()
        
        return jsonify({
            "status": "success",
            "total_works_analyzed": len(priority_queue),
            "priority_queue": priority_queue
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    print("[*] Starting e-SATARK ML Intelligence Engine on http://127.0.0.1:5000")
    app.run(host='127.0.0.1', port=5000, debug=True)