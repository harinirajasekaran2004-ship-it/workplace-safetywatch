# Testing Strategy

The test suite ensures reliability across all agents, API endpoints, error edge cases, and deterministic mathematical risk formulas.

---

## 1. Test Automation (`pytest`)
Located under `tests/`:
- `tests/test_backend.py`: Core REST endpoints, health check, safety rules catalogue, demo scenario #17 (exposed wires), safe condition early exit, manager lifecycle.
- `tests/test_advanced.py`: Risk rubric unit calculations, file type validation errors (PDF/TXT rejection), oversized payload rejection ($>10$ MB), blocked exit scenario, missing PPE scenario, wet floor scenario, 404 lookups.

## 2. Test Execution
```bash
# Run entire automated test suite
pytest -v tests/
```

## 3. Representative Verification Scenarios
1. **Exposed Electrical Wires (Demo Scenario 17):**
   - Detection: Positive ($\ge 90\%$)
   - Category: `Electrical`
   - Risk: High/Critical ($\text{Score} \approx 88$)
   - Rule Matched: `SAFE-ELEC-101`
   - Notification: `simulated` manager alert
2. **Blocked Fire Exit:**
   - Category: `Emergency Exit`
   - Rule Matched: `SAFE-EXIT-201`
3. **Missing PPE:**
   - Category: `PPE`
   - Rule Matched: `SAFE-PPE-301`
4. **Clean Lobby / Safe Area:**
   - Detection: Negative
   - Early Exit: No hazard branch, score = 0, status = RESOLVED.

See also: [[Risk Scoring Rubric]], [[LangGraph Workflow]], [[API Documentation]].
