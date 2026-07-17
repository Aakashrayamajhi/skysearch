# Search Engine System

## Overview

This project implements a scalable, distributed search engine using a microservices-based architecture. The system is designed to handle web crawling, data ingestion, indexing, and query processing at scale, following patterns used in modern search platforms.

The architecture separates responsibilities across independent services, enabling horizontal scalability, fault isolation, and independent deployment.

---

## System Architecture

The system is composed of multiple services that communicate through synchronous APIs and asynchronous messaging (Kafka). The overall flow can be divided into three primary pipelines:

1. Crawling Pipeline: Fetch and process web content
2. Indexing Pipeline: Transform and store searchable data
3. Query Pipeline: Serve user search requests

---

## Project Structure

```
search-engine/
│
├── services/                # Microservices
├── core/                    # Shared libraries and logic
├── infra/                   # Infrastructure configuration
├── data/                    # Local storage (development)
├── queue/                   # Messaging (Kafka)
├── cache/                   # Redis configuration
├── db/                      # Database schemas
├── scripts/                 # Utility scripts
├── tests/                   # Testing
├── configs/                 # Environment configurations
├── docs/                    # Documentation
└── README.md
```

---

## Services

### 1. API Gateway

The API Gateway acts as the single entry point for all client requests. It abstracts internal service communication and provides a unified interface.

Responsibilities:

* Route incoming requests to appropriate services
* Perform authentication and authorization
* Apply rate limiting and request validation
* Centralized logging and monitoring
* Handle retries and failure responses

This layer improves security and simplifies client interaction by hiding internal service complexity.

## Project Structure
```
api-gateway/
├── src/
│   ├── routes/
│   │   └── search.route.js
│   ├── controllers/
│   │   └── gateway.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── rateLimiter.js
│   │   └── logging.middleware.js
│   ├── services/
│   │   └── proxy.service.js   # forward to search-service
│   ├── clients/
│   │   └── search.client.js
│   └── app.js
├── configs/
├── Dockerfile
└── README.md

```

---

### 2. Search Service

The Search Service is responsible for handling user queries and returning relevant results.

Responsibilities:

* Parse and normalize user queries
* Execute search queries against the index (ElasticSearch)
* Apply ranking algorithms such as BM25
* Integrate caching (Redis) for frequently requested queries
* Combine and format results before returning to the client

This service is latency-sensitive and optimized for fast read operations.

## Folder structure

```
search-service/
├── src/
│   ├── controllers/
│   │   └── search.controller.js
│   ├── services/
│   │   ├── search.service.js
│   │   ├── query.service.js
│   │   └── ranking.service.js
│   ├── repositories/
│   │   ├── index.repo.js
│   │   └── cache.repo.js
│   ├── clients/
│   │   ├── elastic.client.js
│   │   └── redis.client.js
│   ├── models/
│   └── app.js
├── configs/
└── Dockerfile

```

---

### 3. Crawler Service

The Crawler Service is responsible for discovering and fetching web content.

Responsibilities:

* Crawl web pages starting from seed URLs
* Respect robots.txt and domain-level rate limits
* Extract HTML content and metadata
* Normalize and validate URLs
* Publish crawled data to Kafka for downstream processing

This service operates asynchronously and is designed for high throughput.

## Folder Structure

```
crawler-service/
├── src/
│   ├── workers/
│   │   └── crawler.worker.js
│   ├── services/
│   │   ├── crawl.service.js
│   │   └── url.service.js
│   ├── queue/
│   │   └── producer.js
│   ├── parsers/
│   │   └── html.parser.js
│   ├── utils/
│   │   └── robots.js
│   └── app.js
├── configs/
└── Dockerfile

```

---

### 4. Indexer Service

The Indexer Service processes raw crawled data and converts it into a searchable format.

Responsibilities:

* Consume crawl data from Kafka
* Perform tokenization and text normalization
* Build and update the inverted index
* Store processed documents in ElasticSearch
* Handle indexing strategies such as batching and deduplication

This service bridges raw data and the searchable index.

## Folder Structure

```

indexer-service/
├── src/
│   ├── consumers/
│   │   └── crawl.consumer.js   
│   ├── services/
│   │   ├── index.service.js
│   │   ├── tokenize.service.js
│   │   └── normalize.service.js
│   ├── repositories/
│   │   └── index.repo.js
│   ├── clients/
│   │   └── elastic.client.js
│   └── app.js
├── configs/
└── Dockerfile

```

---

### 5. Ranking Service

The Ranking Service provides advanced ranking capabilities beyond basic scoring.

Responsibilities:

* Apply advanced scoring algorithms
* Compute feature-based ranking signals
* Support machine learning-based ranking models (future extension)
* Re-rank top results returned by the Search Service

This service is typically used for secondary ranking to improve relevance.

## Folder Structure

```
ranking-service/
├── src/
│   ├── services/
│   │   ├── ranking.service.js
│   │   ├── scoring.service.js
│   │   └── features.service.js
│   ├── models/
│   │   └── ranking.model.js
│   ├── utils/
│   │   └── math.js
│   └── app.js
├── configs/
└── Dockerfile

```

---

### 6. Ingestion Service

The Ingestion Service handles data processing from various pipelines, including logs and crawl data.

Responsibilities:

* Consume events from Kafka (crawl data, user logs)
* Validate and clean incoming data
* Store structured data into databases
* Enable analytics and monitoring use cases

This service is essential for maintaining data quality and supporting analytics workflows.

## Folder structure

```
ingestion-service/
├── src/
│   ├── consumers/
│   │   ├── crawl.consumer.js
│   │   └── log.consumer.js
│   ├── services/
│   │   ├── process.service.js
│   │   └── validate.service.js
│   ├── repositories/
│   │   └── storage.repo.js
│   └── app.js
├── configs/
└── Dockerfile

```

---

## Core Modules

The `core/` directory contains reusable logic shared across services.

* Tokenizer: Splits text into tokens for indexing
* Parser: Extracts meaningful content from HTML
* Index: Implements inverted index logic
* Ranking: Provides ranking algorithms such as BM25
* Utils: Logging, helpers, and shared utilities

This separation avoids duplication and ensures consistency.

---

## Infrastructure

The `infra/` directory contains deployment and infrastructure configurations.

* Docker: Containerization for all services
* Kubernetes: Orchestration and scaling
* Terraform: Infrastructure as code
* Nginx: Load balancing and reverse proxy

These tools enable production-grade deployment and scalability.

---

## Data Storage

* ElasticSearch: Stores indexed documents and supports fast search queries
* Redis: Caches frequently accessed data and query results
* SQL Databases: Store metadata and logs
* Local Data (data/): Used for development and testing

---

## Messaging System

Kafka is used for asynchronous communication between services.

Key use cases:

* Crawler → Indexer communication
* Logging and analytics pipelines
* Decoupling services for better scalability

---

## Data Flow

### Crawling Pipeline

Crawler Service → Kafka → Indexer Service → ElasticSearch

### Query Pipeline

User → API Gateway → Search Service → Ranking Service → Response

### Logging Pipeline

User Actions → Kafka → Ingestion Service → Database

---

## Setup Instructions

### Clone Repository

```
git clone https://github.com/your-username/search-engine.git
cd search-engine
```

### Run with Docker

```
docker-compose up --build
```

### Run Individual Service

```
cd services/api-gateway
npm install
npm start
```

---

## Testing

```
npm run test
```

Includes:

* Unit tests
* Integration tests

---

## Scripts

```
./scripts/start.sh       # Start system
python crawl_seed.py     # Seed URLs for crawler
python reindex.py        # Rebuild search index
```

---

## Future Enhancements

* Query autocomplete and spell correction
* Personalized search results
* Learning-to-rank models
* Distributed indexing with sharding
* Real-time analytics dashboard

---

## Conclusion

This project demonstrates a production-oriented search engine architecture using modern distributed system principles. It is designed for scalability, extensibility, and real-world applicability.

---

## License

MIT License
