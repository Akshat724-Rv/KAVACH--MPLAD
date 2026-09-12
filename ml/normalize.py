import sys
from pathlib import Path
import numpy as np
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
RAW_FILE = BASE_DIR / "data" / "raw" / "mplads_works_raw.csv"
PROCESSED_DIR = BASE_DIR / "data" / "processed"
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def normalize_dataset():
    print("[*] Phase 2: Running Data Normalization Pipeline...")

    if not RAW_FILE.exists():
        print(f"[!] Error: Raw file missing at {RAW_FILE}")
        sys.exit(1)

    df = pd.read_csv(RAW_FILE)

    # 1. Date Parsing & Delay Feature Extraction
    df["recommend_date"] = pd.to_datetime(df["recommend_date"])
    df["sanction_date"] = pd.to_datetime(df["sanction_date"])
    df["completion_date"] = pd.to_datetime(df["completion_date"])

    # Sanction Delay (in days)
    df["days_to_sanction"] = (
        df["sanction_date"] - df["recommend_date"]
    ).dt.days

    # Completion Delay (in days) - if completed
    df["days_to_complete"] = (
        df["completion_date"] - df["sanction_date"]
    ).dt.days
    df["days_to_complete"] = df["days_to_complete"].fillna(-1)

    # 2. Text Normalization for NLP / Duplicate Check
    df["clean_description"] = (
        df["work_description"]
        .str.lower()
        .str.replace(r"[^\w\s]", "", regex=True)
        .str.strip()
    )

    # 3. Financial Ratio Features
    df["expenditure_ratio"] = np.where(
        df["sanctioned_amount"] > 0,
        (df["expenditure_amount"] / df["sanctioned_amount"]).round(4),
        0.0,
    )

    # Save Cleaned Analytical Dataset
    output_path = PROCESSED_DIR / "mplads_works_normalized.parquet"
    df.to_parquet(output_path, index=False)

    csv_output_path = PROCESSED_DIR / "mplads_works_normalized.csv"
    df.to_csv(csv_output_path, index=False)

    print(f"[✔] Normalization Complete! Processed dataset saved at:")
    print(f"    - {output_path}")
    print(f"    - {csv_output_path}")


if __name__ == "__main__":
    normalize_dataset()