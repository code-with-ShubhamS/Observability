# Complete Loki + Alloy + Pino Logging Architecture Guide

# 1. Introduction

This document explains the complete production-grade logging architecture using:

- Pino
- Pino HTTP
- Pino Pretty
- Grafana Alloy
- Loki
- Grafana
- Docker
- S3
- Log Rotation
- Retention Policies

This guide is written to help understand:
- how logs flow through the system
- why Alloy is used
- where logs are stored
- how retention works
- how Docker logging works
- how S3 works with Loki

---

# 2. Basic Logging with Pino

## What is Pino?

Pino is a fast structured logger for Node.js.

It generates logs in JSON format.

Example:

```js
import pino from "pino";

const logger = pino();

logger.info("Server started");
```

Output:

```json
{
  "level":30,
  "time":1716540000,
  "msg":"Server started"
}
```

---

# 3. What is Pino HTTP?

Pino HTTP automatically logs HTTP requests and responses in Express apps.

Example:

```js
import express from "express";
import pinoHttp from "pino-http";

const app = express();

app.use(pinoHttp());

app.get("/", (req, res) => {
  req.log.info("Home route called");
  res.send("Hello");
});

app.listen(3000);
```

---

# 4. What is Pino Pretty?

Pino Pretty converts raw JSON logs into readable logs for development.

Example:

```bash
node app.js | pino-pretty
```

Good for:
- local development
- debugging

Not recommended for production.

Production should keep logs in JSON format.

---

# 5. Traditional Logging Architecture

Traditional architecture:

```text
Node.js App
   ↓
app.log
   ↓
Alloy
   ↓
Loki
   ↓
Grafana
```

In this setup:
- app writes logs into files
- Alloy reads log files
- Alloy sends logs to Loki
- Grafana visualizes logs

---

# 6. Why Alloy is Used

Without Alloy:

```text
App → Loki
```

Problems:
- app handles retry logic
- app handles buffering
- app knows Loki URLs
- logging failures can affect app performance

With Alloy:

```text
App → Alloy → Loki
```

Benefits:
- app only focuses on business logic
- Alloy handles shipping logs
- Alloy handles retries
- Alloy handles batching
- Alloy handles buffering
- Alloy handles failures safely

---

# 7. What Alloy Actually Does

Grafana Alloy is a telemetry collector.

It can collect:
- logs
- metrics
- traces

Alloy can read logs from:
- log files
- Docker logs
- Kubernetes logs
- systemd/journald
- OpenTelemetry

---

# 8. Where Alloy Should Be Installed

Alloy is usually installed on the same server where the app runs.

Example:

```text
Server 1 → App + Alloy
Server 2 → App + Alloy
Server 3 → App + Alloy
```

Reason:
- Alloy needs local access to logs
- Alloy reads local files or Docker logs

---

# 9. Modern Docker Logging Architecture

Modern production systems usually DO NOT write logs into files manually.

Instead:

```text
Pino → stdout
Docker → captures stdout
Alloy → reads Docker logs
Loki → stores logs
Grafana → visualizes logs
```

This is the preferred cloud-native architecture.

---

# 10. Pino with Docker

Pino already writes to stdout by default.

Example:

```js
import pino from "pino";

const logger = pino();

logger.info("Server started");
```

No file handling required.

---

# 11. Where Docker Stores Logs

Docker automatically captures stdout/stderr logs.

Docker stores logs internally at:

```text
/var/lib/docker/containers/<container-id>/<container-id>-json.log
```

Usually we do not access these files manually.

---

# 12. How to View Docker Logs

Use:

```bash
docker logs <container-name>
```

Example:

```bash
docker logs my-node-app
```

---

# 13. How Alloy Reads Docker Logs

Alloy can discover Docker containers automatically.

Example Alloy config:

```hcl
discovery.docker "containers" {
  host = "unix:///var/run/docker.sock"
}

loki.source.docker "default" {
  host       = "unix:///var/run/docker.sock"
  targets    = discovery.docker.containers.targets
  forward_to = [loki.write.default.receiver]
}
```

---

# 14. Sending Logs to Loki

Example Alloy config:

```hcl
loki.write "default" {
  endpoint {
    url = "http://loki:3100/loki/api/v1/push"
  }
}
```

---

# 15. What Loki Does

Loki is responsible for:
- storing logs
- indexing logs
- querying logs

Grafana only visualizes logs.

---

# 16. Where Loki Stores Data

Loki usually stores logs in:
- S3
- MinIO
- GCS
- Azure Blob
- local filesystem

Production usually uses S3.

---

# 17. How Loki Stores Logs

Loki stores:
- compressed chunks
- indexes

Loki DOES NOT fully index log content like Elasticsearch.

Loki mainly indexes labels.

Example labels:

```text
service=payment
level=error
```

This makes Loki cheaper and lightweight.

---

# 18. Loki Architecture

```text
Apps
  ↓
Alloy
  ↓
Loki
  ↓
S3
  ↓
Grafana
```

---

# 19. What is TSDB in Loki

TSDB means:

```text
Time Series Database
```

In Loki:
- TSDB is NOT a separate database
- TSDB is an indexing and organization strategy

TSDB organizes:
- chunks
- time ranges
- indexes

---

# 20. TSDB + S3 Relationship

TSDB does NOT replace S3.

Instead:

```text
TSDB = indexing system
S3 = storage backend
```

Loki stores:
- chunks in S3
- indexes in S3

---

# 21. Loki S3 Configuration

Example Loki config:

```yaml
schema_config:
  configs:
    - from: 2024-01-01
      store: tsdb
      object_store: s3
      schema: v13
      index:
        prefix: index_
        period: 24h

storage_config:
  aws:
    bucketnames: my-loki-logs
    region: ap-south-1
```

---

# 22. Log Retention

Retention means:
- deleting old logs automatically

Very important for:
- storage cost optimization
- scalability

---

# 23. Loki Retention Configuration

Example:

```yaml
limits_config:
  retention_period: 720h

compactor:
  retention_enabled: true
```

Example:
- 720h = 30 days

Meaning:
- logs older than 30 days get deleted

---

# 24. What is Compactor?

Compactor is a Loki component responsible for:
- compaction
- optimization
- retention cleanup
- deleting expired chunks

---

# 25. S3 Lifecycle Rules

AWS S3 can also automatically delete old files.

Example:
- delete logs after 30 days
- move old logs to Glacier

Recommended:
- use both Loki retention and S3 lifecycle rules

---

# 26. Traditional File Logging with logrotate

If using traditional VM/server logging:

```text
Node.js App
   ↓
app.log
   ↓
logrotate
   ↓
Alloy
   ↓
Loki
```

---

# 27. What is logrotate?

Ubuntu/Linux provides:

logrotate

Used for:
- rotating logs
- compressing logs
- deleting old logs

---

# 28. Example logrotate Configuration

File:

```text
/etc/logrotate.d/myapp
```

Example config:

```conf
/var/log/myapp/*.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
    copytruncate
}
```

---

# 29. Meaning of logrotate Options

## daily
Rotate every day

## rotate 7
Keep 7 old files

## compress
Compress old logs

## copytruncate
Safely truncate logs while app keeps running

Very important for Node.js apps.

---

# 30. Docker Log Rotation

Docker already supports log rotation.

Example Docker config:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "5"
  }
}
```

Meaning:
- max 10MB per log file
- keep 5 rotated files

Usually no need for logrotate in Docker setups.

---

# 31. Kubernetes Logging Architecture

In Kubernetes:

```text
stdout
   ↓
container runtime
   ↓
node logs
   ↓
Alloy DaemonSet
   ↓
Loki
```

Usually:
- Alloy runs as a DaemonSet
- one Alloy pod per node

---

# 32. Best Production Recommendation

Recommended modern architecture:

```text
Pino → stdout
Docker → capture logs
Alloy → collect logs
Loki → store logs
S3 → long-term storage
Grafana → visualization
```

Benefits:
- scalable
- cloud-native
- simpler maintenance
- better observability
- easier centralized logging

---

# 33. Final Mental Model

## Pino
Generates structured logs

## Docker
Captures stdout logs

## Alloy
Collects and ships logs

## Loki
Stores and indexes logs

## S3
Long-term storage backend

## Grafana
Visualizes logs

## logrotate
Manages local log files in traditional VM setups

---

# 34. Important Final Notes

## Prefer JSON Logs
Always prefer structured JSON logs in production.

## Prefer stdout in Containers
Avoid manual log files in Docker/Kubernetes.

## Use Retention Policies
Without retention, storage costs will increase heavily.

## Use S3 Lifecycle Rules
Helpful for long-term cost optimization.

## Keep App Simple
App should only generate logs.
Alloy should handle shipping and observability logic.

---

# 35. Final Production Flow

## Traditional VM Architecture

```text
Pino → app.log
       ↓
logrotate
       ↓
Alloy
       ↓
Loki
       ↓
S3
       ↓
Grafana
```

## Modern Docker/Kubernetes Architecture

```text
Pino → stdout
       ↓
Docker/Kubernetes logs
       ↓
Alloy
       ↓
Loki
       ↓
S3
       ↓
Grafana
```

