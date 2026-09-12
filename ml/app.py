import ast
from pathlib import Path
from flask import Flask, jsonify
import pandas as pd

app = Flask(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent
SCORED_FILE = BASE_DIR / "data" / "processed" / "mplads_works_scored.csv"


def load_data():
  if not SCORED_FILE.exists():
    return None
  df = pd.read_csv(SCORED_FILE)

  # Safely parse stringified list into actual python list
  if "risk_reasons" in df.columns:

    def parse_reasons(val):
      if isinstance(val, str):
        try:
          return ast.literal_eval(val)
        except Exception:
          return [val]
      return val

    df["risk_reasons"] = df["risk_reasons"].apply(parse_reasons)

  return df


@app.route("/health", methods=["GET"])
def health():
  return jsonify({"status": "online", "service": "e-SATARK AI ML Engine API"})


@app.route("/api/works", methods=["GET"])
def get_works():
  df = load_data()
  if df is None:
    return (
        jsonify({"error": "Data file not found. Run risk_engine.py first"}),
        404,
    )

  records = df.to_dict(orient="records")
  return jsonify({"count": len(records), "data": records})


@app.route("/api/works/high-risk", methods=["GET"])
def get_high_risk():
  df = load_data()
  if df is None:
    return jsonify({"error": "Data file not found"}), 404

  high_risk_df = df[df["severity"] == "HIGH"]
  records = high_risk_df.to_dict(orient="records")
  return jsonify({"count": len(records), "data": records})


if __name__ == "__main__":
  print("[*] Starting e-SATARK ML REST API on http://127.0.0.1:5000 ...")
  app.run(host="127.0.0.1", port=5000, debug=True)