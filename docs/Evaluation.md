# Evaluation & Confidence Scoring

Workplace SafetyWatch surfaces clearly separated probabilistic evaluation metrics across every stage of the multi-agent workflow:

---

## Metric Breakdown
1. **Detection Confidence:** Probabilistic model confidence that visual features or description denote an active safety anomaly.
2. **Classification Confidence:** Probability of correct taxonomy mapping within the 10 approved industrial hazard classes.
3. **Rule Match Confidence:** Relevance ranking score against curated standards in the safety database.
4. **Risk Assessment Confidence:** Robustness of severity and likelihood calibration under the explainable rubric.
5. **Overall Analysis Score:** Weighted composite evaluation index across all agents.

```
Detection Confidence:       94.0%
Classification Confidence:  91.0%
Rule Match Confidence:      95.0%
Risk Assessment Confidence: 88.0%
---------------------------------
Overall Analysis Score:     92.0%
```

## Mandatory Evaluation Disclaimer
All UI views and API responses explicitly include the disclaimer:
> **"Model confidence / system evaluation metrics — not certified measurements."**

This ensures compliance with engineering guidelines and prevents misleading users into believing AI probabilistic scores are official laboratory-certified ratings.

See also: [[Agent Design]], [[Risk Scoring Rubric]], [[Project Overview]].
