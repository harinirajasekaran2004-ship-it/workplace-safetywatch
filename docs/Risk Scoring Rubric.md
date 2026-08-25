# Risk Scoring Rubric

Workplace SafetyWatch utilizes an **explainable, deterministic mathematical scoring matrix** rather than a black-box LLM rating.

---

## 1. Severity Dimension ($S \in [1, 5]$)
- **1 — Negligible:** Minor nuisance or trivial scratch; zero lost time; negligible equipment damage.
- **2 — Minor:** Requires on-site standard first aid; minimal facility disruption ($<\$500$).
- **3 — Moderate:** Medical treatment or clinic visit required; localized work cell stoppage.
- **4 — Major:** Severe physical injury (fracture, deep laceration, electrical shock, chemical burn); substantial structural impact.
- **5 — Catastrophic:** Potential fatality, permanent disability, acute explosion, or widespread structural collapse.

---

## 2. Likelihood Dimension ($L \in [1, 5]$)
- **1 — Rare / Exceptional:** Unlikely under standard operating procedures; low worker exposure.
- **2 — Unlikely:** Could happen irregularly; periodic maintenance area.
- **3 — Possible:** Regular operational shift occurrence; moderate foot-traffic corridor.
- **4 — Likely:** High-traffic path; repeated near-miss conditions observed.
- **5 — Almost Certain / Imminent:** Unprotected live hazard in continuous daily worker path.

---

## 3. Mathematical Formula

$$\text{Base Risk Product} = S \times L \quad (1 \le S \times L \le 25)$$

$$\text{Base Risk Percentage} = \left(\frac{S \times L}{25}\right) \times 100$$

$$\text{Adjusted Risk Score} = \text{Clamp}(\text{Base Risk Percentage} + \text{Category Weight}, 0, 100)$$

*Category weights reflect inherent escalation velocity (e.g. Electrical / Fire = $+8$, Chemical / Machinery = $+4$).*

---

## 4. Priority Classifications & Action Thresholds

| Risk Score | Priority | Severity Level | Operational Protocol | Manager Escalation |
| :--- | :--- | :--- | :--- | :--- |
| **80 – 100** | **Urgent** | **Critical** | Immediate stop-work, area evacuation | Automated SMS/Email Alert |
| **60 – 79** | **High** | **High** | Remediation required within 2–4 hours | Automated Manager Alert |
| **35 – 59** | **Medium** | **Medium** | Remediate within 24 hours / next shift | Logged on Dashboard |
| **0 – 34** | **Low** | **Low** | Routine preventive maintenance log | Standard Weekly Review |

See also: [[Agent Design]], [[Testing Strategy]].
