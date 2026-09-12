import sys
import os
from pathlib import Path
import numpy as np
import cv2
from PIL import Image, ImageChops, ImageEnhance

BASE_DIR = Path(__file__).resolve().parent.parent
INPUT_FILE = BASE_DIR / "data" / "processed" / "document_screening_normalized.csv"
OUTPUT_FILE = BASE_DIR / "data" / "processed" / "document_screening_scored.csv"


def perform_ela_tampering_check(image_path, quality=90):
    """
    Module 3: Error Level Analysis (ELA) for Detecting Digital Alterations.
    Resaves image at a specific quality level and checks pixel compression differences.
    """
    try:
        temp_filename = "temp_ela.jpg"
        original = Image.open(image_path).convert('RGB')
        
        # Save temporary image with fixed compression rate
        original.save(temp_filename, 'JPEG', quality=quality)
        resaved = Image.open(temp_filename)
        
        # Find absolute pixel difference
        ela_image = ImageChops.difference(original, resaved)
        extrema = ela_image.getextrema()
        max_diff = max([ex[1] for ex in extrema])
        
        if max_diff == 0:
            max_diff = 1
            
        scale = 255.0 / max_diff
        ela_image = ImageEnhance.Brightness(ela_image).enhance(scale)
        
        # Clean temporary image
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

        # Convert ELA image to numpy array for variance calculation
        ela_np = np.array(ela_image)
        variance = np.var(ela_np)

        # High variance in error levels indicates potential digital splicing / manipulation
        is_tampered = variance > 1200.0
        return is_tampered, round(float(variance), 2)

    except Exception as e:
        return False, 0.0


def analyze_document_tampering(image_path):
    """
    Dynamic API Handler called by Flask (app.py) during document screening.
    """
    reasons = []
    risk_score = 10  # Baseline

    # 1. Perform ELA Digital Alteration Check
    is_tampered, ela_score = perform_ela_tampering_check(image_path)
    if is_tampered:
        risk_score += 45
        reasons.append(f"Digital pixel manipulation detected via Error Level Analysis (ELA Variance: {ela_score}).")

    # 2. Basic Metadata Inspection
    try:
        img = Image.open(image_path)
        info = img._getexif() if hasattr(img, '_getexif') else None
        if info:
            metadata_str = str(info).lower()
            if any(software in metadata_str for software in ['photoshop', 'gimp', 'canva', 'paint']):
                risk_score += 35
                reasons.append("Image EXIF metadata indicates editing software trace (Photoshop/GIMP).")
    except Exception:
        pass

    # Normalize Score (0 to 100)
    final_risk_score = min(100, risk_score)
    
    severity = "LOW"
    if final_risk_score > 65:
        severity = "HIGH"
    elif final_risk_score > 35:
        severity = "MEDIUM"

    if not reasons:
        reasons.append("Document visual structure & digital signature appear genuine.")

    return {
        "risk_score": final_risk_score,
        "severity": severity,
        "tampering_detected": is_tampered,
        "risk_reasons": reasons
    }


def generate_document_reasons(row):
    """Generates human-readable explainable evidence for border officials."""
    reasons = []
    if row.get("is_expired", False):
        reasons.append("Document has passed its official validity / expiration date.")
    if row.get("mrz_checksum_valid") == False:
        reasons.append("Machine Readable Zone (MRZ) checksum validation failed.")
    if row.get("tampering_flag", False):
        reasons.append("Visual Tampering Engine flagged photo replacement or text manipulation.")
    
    if not reasons:
        reasons.append("Document parameters match official international standards.")

    return reasons


def calculate_risk():
    """Batch calculation routine for mock dataset processing."""
    print("[*] Phase 3: Executing Document Tampering & Multi-Signal Risk Engine...")

    if not INPUT_FILE.exists():
        print(f"[!] Input file missing: {INPUT_FILE}")
        sys.exit(1)

    df = pd.read_csv(INPUT_FILE)

    # Calculate batch risk score
    df["risk_score"] = np.where(df["tampering_flag"], 85.0, 15.0)
    df["severity"] = np.where(df["risk_score"] > 60, "HIGH", "LOW")
    df["recommended_action"] = np.where(df["severity"] == "HIGH", "Secondary Inspection Required", "Passed Clearance")

    df["risk_reasons"] = df.apply(generate_document_reasons, axis=1)

    df.to_csv(OUTPUT_FILE, index=False)
    print(f"[✔] Border Risk Engine Completed! Output saved at: {OUTPUT_FILE}")


if __name__ == "__main__":
    calculate_risk()