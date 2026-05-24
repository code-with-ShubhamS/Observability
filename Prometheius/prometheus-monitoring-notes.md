# Prometheus Monitoring & Alerting — Node.js

## Overview
Implemented basic observability and monitoring in a Node.js backend using Prometheus and Alertmanager.

The setup focuses on:
- Collecting application metrics
- Monitoring API performance
- Writing PromQL queries
- Creating alerts
- Sending notifications through Alertmanager

---

# Architecture

```text
Node.js App
   └── /metrics endpoint

Prometheus
   ├── Scrapes metrics
   ├── Stores time-series data
   ├── Executes PromQL queries
   └── Triggers alerts

Alertmanager
   ├── Receives alerts
   ├── Sends Email/Slack notifications
   └── Can trigger webhook/API callbacks
```

---

# What I Implemented

## 1. Exposed Metrics Endpoint
Integrated Prometheus metrics in the Node.js backend and exposed a `/metrics` endpoint for scraping.

### Collected Metrics
- API request count
- API response time
- Error rate
- Default Node.js/process metrics
- Memory usage
- CPU/process metrics

---

## 2. Prometheus Configuration
Configured Prometheus using YAML configuration files.

### Key Configurations
- Scrape targets
- Metrics endpoint path
- Scrape interval
- Alert rules
- Labels & descriptions

---

## 3. PromQL Queries
Used PromQL (Prometheus Query Language) to analyze metrics and monitor application health.

### Example Use Cases
- High response time detection
- Error rate monitoring
- Request count tracking
- Resource usage analysis

### Sample Queries

```promql
rate(http_requests_total[1m])
```

```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

---

## 4. Alerting
Created alert rules in Prometheus based on metric thresholds.

### Example Alerts
- High API latency
- High error rate
- Server memory usage spike
- Service downtime

### Alert Features
- Severity labels
- Custom descriptions
- Threshold-based monitoring

---

## 5. Alertmanager Integration
Integrated Alertmanager for notification management.

### Supported Notifications
- Email alerts
- Slack notifications
- Webhook/API callbacks

### Purpose
Ensures the team gets notified immediately when abnormal behavior is detected.

---

# Key Learnings

- Prometheus works on a pull-based scraping model.
- Metrics are exposed through `/metrics`.
- PromQL is used to query and analyze time-series data.
- Alertmanager handles routing and notification delivery.
- Monitoring can be done for both:
  - Infrastructure (RAM, CPU, Disk)
  - Application-level APIs and performance

---

# Interview Highlights

## What I Built
- Integrated Prometheus with a Node.js backend
- Exposed and monitored application metrics
- Configured Prometheus scraping using YAML
- Wrote PromQL queries for monitoring
- Created alert rules
- Integrated Alertmanager for notifications

---

# Important Concepts to Remember

| Concept | Purpose |
|---|---|
| Prometheus | Metrics collection & monitoring |
| `/metrics` | Exposes application metrics |
| PromQL | Query language for metrics |
| Alert Rules | Detect abnormal behavior |
| Alertmanager | Sends notifications |
| Time-Series Data | Metrics stored over time |

---

# Final Understanding

Prometheus is used to monitor:
- Application health
- API performance
- System resources
- Error rates
- Operational stability

It helps identify issues before system failure and enables proactive monitoring in production systems.
