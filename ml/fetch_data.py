import json
from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = BASE_DIR / "data" / "raw"
RAW_DIR.mkdir(parents=True, exist_ok=True)


def load_border_screening_mock_data():
    print(
        "[*] Generating raw Border Document Screening dataset..."
    )

    dataset = [
        {
            "screening_id": "CHK/2026/001",
            "checkpoint_name": "IGI Airport - Terminal 3",
            "document_type": "Passport",
            "document_number": "J8291048",
            "passenger_name": "JOHN DOE",
            "nationality": "IND",
            "dob": "1992-05-14",
            "expiry_date": "2029-08-20",
            "issue_country": "IND",
            "mrz_status": "MATCHED",
            "tampering_flag": False,
            "risk_score": 5,
            "screening_status": "CLEAR",
        },
        {
            "screening_id": "CHK/2026/002",
            "checkpoint_name": "Attari Border Checkpoint",
            "document_type": "Visa",
            "document_number": "VS991024",
            "passenger_name": "ALEX SMITH",
            "nationality": "USA",
            "dob": "1988-11-03",
            "expiry_date": "2025-01-10",  # Expired Visa Example
            "issue_country": "IND",
            "mrz_status": "CHECKSUM_ERROR",
            "tampering_flag": True,
            "risk_score": 88,
            "screening_status": "HIGH_RISK_FLAGGED",
        },
        {
            "screening_id": "CHK/2026/003",
            "checkpoint_name": "Mumbai Port Border",
            "document_type": "National ID",
            "document_number": "ID401928",
            "passenger_name": "SAMEER SHUKLA",
            "nationality": "IND",
            "dob": "1975-02-18",
            "expiry_date": "2032-12-31",
            "issue_country": "IND",
            "mrz_status": "MATCHED",
            "tampering_flag": False,
            "risk_score": 12,
            "screening_status": "CLEAR",
        },
        {
            "screening_id": "CHK/2026/004",
            "checkpoint_name": "IGI Airport - Terminal 3",
            "document_type": "Passport",
            "document_number": "K1920491",
            "passenger_name": "ROBERT BROWN",
            "nationality": "GBR",
            "dob": "1990-07-22",
            "expiry_date": "2028-03-15",
            "issue_country": "GBR",
            "mrz_status": "PHOTO_EDITED_ELA",
            "tampering_flag": True,
            "risk_score": 92,
            "screening_status": "HIGH_RISK_FLAGGED",
        },
    ]

    df = pd.DataFrame(dataset)
    target_path = RAW_DIR / "document_screening_raw.csv"
    df.to_csv(target_path, index=False)
    print(f"[✔] Border Document raw dataset created at: {target_path}")


if __name__ == "__main__":
    load_border_screening_mock_data()