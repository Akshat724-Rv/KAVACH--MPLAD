import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class ESATARKRiskEngine:
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()
        self._preprocess_data()

    def _preprocess_data(self):
        # Data Normalization
        self.df['sanctioned_amount'] = pd.to_numeric(self.df.get('sanctioned_amount', 0), errors='coerce').fillna(0)
        self.df['sanction_delay_days'] = pd.to_numeric(self.df.get('sanction_delay_days', 0), errors='coerce').fillna(0)
        self.df['work_category'] = self.df.get('work_category', 'General').fillna('General')
        self.df['state'] = self.df.get('state', 'Unknown').fillna('Unknown')
        self.df['agency_name'] = self.df.get('agency_name', 'Unknown Agency').fillna('Unknown Agency')
        self.df['work_description'] = self.df.get('work_description', '').fillna('')

    def calculate_peer_benchmarks(self):
        """1. PEER BENCHMARKING ENGINE"""
        # Group by State & Category to find Median Cost
        group_cols = ['state', 'work_category']
        medians = self.df.groupby(group_cols)['sanctioned_amount'].transform('median')
        
        # Calculate Percentage Deviation from Peer Median
        self.df['peer_median_cost'] = medians
        self.df['cost_peer_deviation_pct'] = np.where(
            self.df['peer_median_cost'] > 0,
            ((self.df['sanctioned_amount'] - self.df['peer_median_cost']) / self.df['peer_median_cost']) * 100,
            0
        )
        
        # Peer Risk Signal (High deviation = High Risk)
        self.df['signal_peer_cost'] = np.where(self.df['cost_peer_deviation_pct'] > 50, 1.0, 0.0)

    def analyze_agency_network(self):
        """2. AGENCY / WORK NETWORK INTELLIGENCE (Cartelization Detector)"""
        # Agency Concentration in Constituency
        agency_counts = self.df.groupby(['constituency', 'agency_name'])['work_id'].transform('count')
        total_constituency_works = self.df.groupby('constituency')['work_id'].transform('count')
        
        self.df['agency_work_share_pct'] = (agency_counts / total_constituency_works) * 100
        
        # Text Similarity Detection for Split Micro-Tenders (TF-IDF)
        tfidf = TfidfVectorizer(stop_words='english')
        tfidf_matrix = tfidf.fit_transform(self.df['work_description'])
        similarity_matrix = cosine_similarity(tfidf_matrix)
        
        # High similarity flag (> 0.85 similarity with other works)
        np.fill_diagonal(similarity_matrix, 0)
        max_sim = similarity_matrix.max(axis=1)
        self.df['text_similarity_score'] = max_sim
        
        # Network Anomaly Signal
        self.df['signal_network_cartel'] = np.where(
            (self.df['agency_work_share_pct'] > 40) | (self.df['text_similarity_score'] > 0.85),
            1.0, 0.0
        )

    def run_isolation_forest(self):
        """Unsupervised Anomaly Detection Baseline"""
        features = self.df[['sanctioned_amount', 'sanction_delay_days']].fillna(0)
        iso = IsolationForest(contamination=0.1, random_state=42)
        self.df['iso_anomaly_score'] = iso.fit_predict(features)
        self.df['signal_iso_forest'] = np.where(self.df['iso_anomaly_score'] == -1, 1.0, 0.0)

    def compute_evidence_fusion_and_priority(self):
        """3. MULTI-SIGNAL EVIDENCE FUSION & 4. INVESTIGATION PRIORITY QUEUE"""
        self.calculate_peer_benchmarks()
        self.analyze_agency_network()
        self.run_isolation_forest()

        # Additional basic signals
        self.df['signal_delay'] = np.where(self.df['sanction_delay_days'] > 90, 1.0, 0.0)

        # Signal Count
        signal_cols = ['signal_peer_cost', 'signal_network_cartel', 'signal_iso_forest', 'signal_delay']
        self.df['active_signals_count'] = self.df[signal_cols].sum(axis=1)

        # Weighted Evidence Fusion (Normalized 0 - 100)
        self.df['risk_score'] = (
            self.df['signal_peer_cost'] * 30 +
            self.df['signal_network_cartel'] * 35 +
            self.df['signal_iso_forest'] * 20 +
            self.df['signal_delay'] * 15
        ).clip(0, 100)

        # CAG Audit Category Mapping
        conditions = [
            (self.df['risk_score'] >= 75),
            (self.df['risk_score'] >= 45),
            (self.df['risk_score'] < 45)
        ]
        choices = ['HIGH RISK (Verification Urged)', 'MEDIUM RISK (Audit Alert)', 'LOW RISK']
        self.df['audit_verdict'] = np.select(conditions, choices, default='LOW RISK')

        # Investigation Priority Score = Risk Score * Financial Exposure (Amount in Lakhs)
        self.df['financial_exposure_lakhs'] = self.df['sanctioned_amount'] / 100000
        self.df['investigation_priority_score'] = self.df['risk_score'] * self.df['financial_exposure_lakhs']

        # Sort by Priority Queue
        self.df = self.df.sort_values(by='investigation_priority_score', ascending=False)
        return self.df

    def get_priority_queue_results(self):
        processed_df = self.compute_evidence_fusion_and_priority()
        
        output = []
        for _, row in processed_df.iterrows():
            reasons = []
            if row['signal_peer_cost'] == 1.0:
                reasons.append(f"Cost (+{row['cost_peer_deviation_pct']:.1f}%) significantly exceeds state peer median (₹{row['peer_median_cost']/100000:.1f}L)")
            if row['signal_network_cartel'] == 1.0:
                reasons.append(f"Agency concentration anomaly: {row['agency_name']} holds {row['agency_work_share_pct']:.1f}% of constituency works")
            if row['signal_delay'] == 1.0:
                reasons.append(f"Sanction delay anomaly ({int(row['sanction_delay_days'])} days)")
            if row['text_similarity_score'] > 0.85:
                reasons.append(f"High description similarity ({row['text_similarity_score']:.2f}) indicates potential split micro-tender")

            output.append({
                "work_id": str(row.get('work_id', 'N/A')),
                "work_description": row['work_description'],
                "constituency": row['constituency'],
                "agency_name": row['agency_name'],
                "sanctioned_amount_inr": float(row['sanctioned_amount']),
                "risk_score": float(row['risk_score']),
                "audit_verdict": row['audit_verdict'],
                "investigation_priority_score": float(row['investigation_priority_score']),
                "active_signals_count": int(row['active_signals_count']),
                "explainable_reasons": reasons
            })
        return output