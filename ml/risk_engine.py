import sys
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

BASE_DIR = Path(__file__).resolve().parent.parent
INPUT_FILE = BASE_DIR / "data" / "processed" / "mplads_works_normalized.csv"
OUTPUT_FILE = BASE_DIR / "data" / "processed" / "mplads_works_scored.csv"


def generate_reasons(row):
    """Generates human-readable explainable evidence for human auditors."""
    reasons = []
    if row["cost_anomaly_score"] > 0.3:
        reasons.append(
            f"Sanctioned cost (₹{row['sanctioned_amount']:,}) exceeds the category median baseline."
        )
    if row["delay_anomaly_score"] > 0.3:
        reasons.append(
            f"Administrative delay of {row['days_to_sanction']} days between recommendation and sanction."
        )
    if row["duplicate_score"] > 0.5:
        reasons.append(
            f"High textual similarity ({int(row['duplicate_score']*100)}%) detected with another registered work."
        )
    if row["multivariate_score"] > 0.5:
        reasons.append(
            "Isolation Forest model flagged multivariate numerical anomaly."
        )

    if not reasons:
        reasons.append("All baseline metrics within acceptable operational limits.")

    return reasons


def calculate_risk():
    print("[*] Phase 3: Executing Multi-Signal Risk Engine...")

    if not INPUT_FILE.exists():
        print(f"[!] Input file missing: {INPUT_FILE}")
        sys.exit(1)

    df = pd.read_csv(INPUT_FILE)

    # 1. Cost Anomaly (Peer Group IQR / Median)
    category_medians = df.groupby("work_category")[
        "sanctioned_amount"
    ].transform("median")
    df["cost_ratio"] = df["sanctioned_amount"] / np.maximum(
        category_medians, 1.0
    )
    df["cost_anomaly_score"] = np.clip(
        (df["cost_ratio"] - 1.0) / 2.0, 0.0, 1.0
    )

    # 2. Delay Anomaly
    df["delay_anomaly_score"] = np.clip(df["days_to_sanction"] / 120.0, 0.0, 1.0)

    # 3. Text Duplicate Detection (TF-IDF + Cosine Similarity)
    tfidf = TfidfVectorizer(stop_words="english")
    tfidf_matrix = tfidf.fit_transform(df["clean_description"].fillna(""))
    sim_matrix = cosine_similarity(tfidf_matrix)
    np.fill_diagonal(sim_matrix, 0.0)
    df["duplicate_score"] = sim_matrix.max(axis=1)

    # 4. Multivariate Anomaly (Isolation Forest)
    features = df[
        ["sanctioned_amount", "days_to_sanction", "expenditure_ratio"]
    ].fillna(0)
    iso = IsolationForest(contamination=0.2, random_state=42)
    df["iso_anomaly"] = iso.fit_predict(features)
    df["multivariate_score"] = np.where(df["iso_anomaly"] == -1, 0.8, 0.1)

    # 5. Composite Weighted Risk Score (0 - 100)
    df["risk_score"] = (
        (df["cost_anomaly_score"] * 0.30)
        + (df["delay_anomaly_score"] * 0.25)
        + (df["duplicate_score"] * 0.25)
        + (df["multivariate_score"] * 0.20)
    ) * 100
    df["risk_score"] = df["risk_score"].round(2)

    # Risk Severity & Action Labels
    df["severity"] = pd.cut(
        df["risk_score"],
        bins=[-1, 35, 65, 100],
        labels=["LOW", "MEDIUM", "HIGH"],
    )
    df["recommended_action"] = "Priority verification recommended"

    # Generate Explainable Reasons
    df["risk_reasons"] = df.apply(generate_reasons, axis=1)

    # Save Scored Dataset
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"[✔] Risk Engine Completed! Output saved at:")
    print(f"    - {OUTPUT_FILE}")


if __name__ == "__main__":
    calculate_risk()