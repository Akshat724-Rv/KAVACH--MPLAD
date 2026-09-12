import sys
from pathlib import Path
import numpy as np
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
RAW_FILE = BASE_DIR / "data" / "raw" / "document_screening_raw.csv"
PROCESSED_DIR = BASE_DIR / "data" / "processed"
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def normalize_screening_dataset():
    print("[*] Phase 2: Running Document Screening Data Normalization...")

    if not RAW_FILE.exists():
        print(f"[!] Error: Raw document screening file missing at {RAW_FILE}")
        sys.exit(1)

    df = pd.read_csv(RAW_FILE)

    # 1. Date Parsing & Expiry Days Feature Extraction
    df["dob"] = pd.to_datetime(df["dob"], errors="coerce")
    df["expiry_date"] = pd.to_datetime(df["expiry_date"], errors="coerce")
    today = pd.to_datetime("today")

    # Days remaining until document expires (negative values indicate expired document)
    df["days_to_expiry"] = (df["expiry_date"] - today).dt.days

    # Expired Document Flag
    df["is_expired"] = df["days_to_expiry"] < 0

    # 2. Text Normalization for Name Alignment & OCR Noise Cleanup
    df["clean_passenger_name"] = (
        df["passenger_name"]
        .astype(str)
        .str.upper()
        .str.replace(r"[^\w\s]", "", regex=True)
        .str.strip()
    )

    df["clean_doc_number"] = (
        df["document_number"]
        .astype(str)
        .str.upper()
        .str.replace(r"\s+", "", regex=True)
    )

    # 3. Document Integrity Validation Indicator
    df["mrz_checksum_valid"] = df["mrz_status"] == "MATCHED"

    # Save Cleaned Analytical Dataset
    output_path = PROCESSED_DIR / "document_screening_normalized.parquet"
    df.to_parquet(output_path, index=False)

    csv_output_path = PROCESSED_DIR / "document_screening_normalized.csv"
    df.to_csv(csv_output_path, index=False)

    print(f"[✔] Normalization Complete! Processed screening dataset saved at:")
    print(f"    - {output_path}")
    print(f"    - {csv_output_path}")


if __name__ == "__main__":
    normalize_screening_dataset()