import json
from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = BASE_DIR / "data" / "raw"
RAW_DIR.mkdir(parents=True, exist_ok=True)


def load_real_esakshi_data():
    print(
        "[*] Generating raw MPLADS dataset strictly matching eSAKSHI schema..."
    )

    dataset = [
        {
            "work_id": "MPLADS/18LS/MH/001",
            "state_name": "Maharashtra",
            "district_name": "Hingoli",
            "constituency_name": "HINGOLI",
            "mp_name": "AASHTIKAR PATIL NAGESH BAPURAO",
            "work_category": "Roads & Bridges",
            "work_description": (
                "Construction of CC Road from Main Square to Community Center"
            ),
            "sanctioned_amount": 1500000,
            "expenditure_amount": 1200000,
            "recommend_date": "2023-05-10",
            "sanction_date": "2023-06-15",
            "completion_date": "2023-11-20",
            "work_status": "Completed",
        },
        {
            "work_id": "MPLADS/18LS/MH/002",
            "state_name": "Maharashtra",
            "district_name": "Hingoli",
            "constituency_name": "HINGOLI",
            "mp_name": "AASHTIKAR PATIL NAGESH BAPURAO",
            "work_category": "Roads & Bridges",
            "work_description": (
                "Construction of Concrete Road near Community Center Hingoli"
            ),
            "sanctioned_amount": 1480000,
            "expenditure_amount": 0,
            "recommend_date": "2023-05-12",
            "sanction_date": "2023-06-18",
            "completion_date": "",
            "work_status": "Sanctioned",
        },
        {
            "work_id": "MPLADS/18LS/UP/001",
            "state_name": "Uttar Pradesh",
            "district_name": "Kannauj",
            "constituency_name": "KANNAUJ",
            "mp_name": "AKHILESH YADAV",
            "work_category": "Drinking Water",
            "work_description": (
                "Installation of 1000L Commercial RO Water Plant in District"
                " Hospital"
            ),
            "sanctioned_amount": 850000,
            "expenditure_amount": 850000,
            "recommend_date": "2023-04-20",
            "sanction_date": "2023-05-10",
            "completion_date": "2023-08-01",
            "work_status": "Completed",
        },
        {
            "work_id": "MPLADS/18LS/BR/001",
            "state_name": "Bihar",
            "district_name": "Aurangabad",
            "constituency_name": "AURANGABAD_BR",
            "mp_name": "ABHAY KUMAR SINHA",
            "work_category": "Education",
            "work_description": (
                "Construction of Additional Classroom Block in High School"
            ),
            "sanctioned_amount": 4500000,
            "expenditure_amount": 1500000,
            "recommend_date": "2023-01-10",
            "sanction_date": "2023-08-15",
            "completion_date": "",
            "work_status": "Non-Progress",
        },
        {
            "work_id": "MPLADS/18LS/WB/001",
            "state_name": "West Bengal",
            "district_name": "Tamluk",
            "constituency_name": "TAMLUK",
            "mp_name": "ABHIJIT GANGOPADHYAY",
            "work_category": "Sanitation",
            "work_description": (
                "Installation of Public Toilets near Bus Stand"
            ),
            "sanctioned_amount": 600000,
            "expenditure_amount": 600000,
            "recommend_date": "2023-06-01",
            "sanction_date": "2023-06-25",
            "completion_date": "2023-09-10",
            "work_status": "Completed",
        },
    ]

    df = pd.DataFrame(dataset)
    target_path = RAW_DIR / "mplads_works_raw.csv"
    df.to_csv(target_path, index=False)
    print(f"[✔] Raw dataset created at: {target_path}")


if __name__ == "__main__":
    load_real_esakshi_data()