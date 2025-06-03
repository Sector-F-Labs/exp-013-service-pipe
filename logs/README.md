# Experiment Logs

This directory contains documented findings, observations, and outcomes from the service pipe architecture experiment.

## Naming Convention

Log files should be named using the ISO date format: `YYYY-MM-DD-description.md`

Examples:
- `2025-05-31-pipeline-performance.md`
- `2025-06-02-load-balancer-behavior.md`
- `2025-06-15-parallel-scaling-results.md`

## Entry Template

Each log entry should include:

### Date & Context
- **Date:** YYYY-MM-DD
- **Engineer(s):** Name(s)
- **Pipeline Configuration:** Brief description of setup being tested

### Objective
What was being tested or investigated?

### Findings
Key observations, measurements, and results.

### Unexpected Outcomes
Any surprising behaviors, edge cases, or failure modes discovered.

### Performance Notes
Throughput, latency, resource usage, or scaling observations.

### Action Items
Next steps, further investigation needed, or architectural changes to consider.

### Related Files/Commits
Links to relevant code, configuration files, or commits.

---

## Example Entry

### Date & Context
- **Date:** 2025-05-31
- **Engineer(s):** Divan Visagie, Denny Sims
- **Pipeline Configuration:** telegram-input | auth-service | capability-dispatcher | load-balancer --workers 4 | parallel --jobs 4

### Objective
Test initial pipeline setup with 4 parallel workers processing LLM requests.

### Findings
- Pipeline processes messages successfully end-to-end
- Load balancer distributes work evenly across workers
- correlationId preserved through entire pipeline
- Average response time: 2.3 seconds per LLM request

### Unexpected Outcomes
- Worker 3 occasionally receives double the messages due to hash collision in load balancer
- parallel --line-buffer sometimes reorders output despite correlationId

### Performance Notes
- Peak throughput: 15 messages/second
- Memory usage stable at ~200MB per worker
- CPU utilization: 60% during load testing

### Action Items
- Investigate load balancer hash distribution algorithm
- Add explicit output ordering by correlationId in parallel block
- Consider persistent worker pools for better resource utilization

### Related Files/Commits
- `load-balancer.rs` - main load balancing logic
- `test-scripts/load-test.sh` - load testing configuration