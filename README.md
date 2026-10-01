# Meridian Enterprise Suite

An event-driven order-to-cash and procurement platform for a fictional diversified industrial equipment manufacturer. Three backend services, each in a different language, each owning its own database, integrated through a message broker rather than direct API calls between them, with service boundaries drawn along SAP's SD (Sales & Distribution), MM (Materials Management), and FI (Financial Accounting) module lines.

An order placed in Sales triggers a warehouse stock check in Inventory. A shortfall automatically creates a purchase requisition. Once approved and a purchase order is issued, fulfilling the order triggers Finance to issue an invoice. Nothing in this chain is wired through direct service-to-service HTTP calls; every step after the initial order is driven by events on a shared broker.

**Architecture and class diagrams:** [interactive, pan/zoomable](https://claude.ai/artifact/9qeDYW6NccWUyg3BH4rK2B)

---

## Architecture

```
                         ┌─────────────────────┐
                         │   Angular Frontend    │
                         │  (Overview, Orders,   │
                         │  Stock, Requisitions,  │
                         │      Invoices)         │
                         └──────────┬────────────┘
                                    │ REST
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
   ┌──────▼──────┐          ┌───────▼───────┐          ┌──────▼──────┐
   │ Sales/Order  │          │  Inventory /   │          │  Finance /   │
   │  Service     │          │  Procurement   │          │  Invoicing   │
   │ Node.js + TS │          │    .NET 10     │          │ Java/Spring  │
   │  PostgreSQL  │          │   MongoDB      │          │  PostgreSQL  │
   └──────┬──────┘          └───────┬───────┘          └──────┬──────┘
          │ publishes                │ consumes                │ consumes
          │ order.created             │ order.created            │ order.created,
          │ order.status-changed      │                          │ order.status-changed
          └─────────────┬─────────────┴──────────────────────────┘
                         │
                  ┌──────▼──────┐
                  │  RabbitMQ    │
                  │ enterprise.  │
                  │ events (topic)│
                  └──────────────┘
```

Each service owns its data exclusively. Cross-service references (a Sales order line's `productId`, a Finance invoice's `orderId`) are plain IDs, never foreign keys or joins across service boundaries, resolved only at the application level.

---

## Services

| Service | Stack | Database | Port |
|---|---|---|---|
| Sales / Order | Node.js, TypeScript, Express, Prisma 8 (RC) | PostgreSQL | `3000` |
| Inventory / Procurement | C#, .NET 10, ASP.NET Core | MongoDB | `5212` |
| Finance / Invoicing | Java, Spring Boot 4, Spring Data JPA, Flyway | PostgreSQL | `8080` |
| Frontend | Angular 22 (zoneless, standalone, signals) | — | `4200` |
| Message broker | RabbitMQ 4 (management UI) | — | `5672` / `15672` |

**Sales/Order** owns customers and orders, including price snapshots on each line item, and publishes `OrderCreated` and `OrderStatusChanged` events after its database transaction commits, using broker-confirmed publishing.

**Inventory/Procurement** owns the product catalog (MongoDB, chosen for its flexible schema across varied equipment specs), warehouse-scoped stock levels, and the purchase requisition → purchase order lifecycle. A background consumer reacts to `OrderCreated` by checking stock and automatically generating a requisition on shortfall.

**Finance/Invoicing** owns invoices, with a domain-enforced state machine (`DRAFT → ISSUED → PAID`, or `VOID`). A RabbitMQ listener creates draft invoices from `OrderCreated` and issues or voids them on `OrderStatusChanged`, with idempotent event handling via a `processed_event` table keyed by event ID, so a redelivered message can't create a duplicate invoice.

**Frontend** is a single Angular dashboard covering all three services: an overview with live counts, order entry and listing, stock levels with low-stock highlighting, a requisition approval queue, and invoice status tracking with payment actions.

---

## Event contract

All events share one envelope, published to a single topic exchange, `enterprise.events`:

```json
{
  "eventId": "uuid",
  "eventType": "OrderCreated",
  "occurredAt": "2026-09-27T10:00:00Z",
  "payload": { "...": "event-specific" }
}
```

| Routing key | Published by | Consumed by |
|---|---|---|
| `order.created` | Sales | Inventory, Finance |
| `order.status-changed` | Sales | Finance |

---

## Getting started

**Prerequisites:** Docker and Docker Compose, Node.js 22+, a JDK (for local Finance development only, not required to run via Docker).

**1. Start the backend suite** (three services, three databases, RabbitMQ):
```bash
docker compose up -d --build
```

**2. Seed test data**, in order (Sales references Inventory's product IDs, so Inventory needs to be seeded first):
```bash
# In Compass's built-in mongosh shell, or via the mongosh CLI:
#   run seed-inventory-data.js against InventoryDb

# In pgAdmin's Query Tool, against SalesDb:
#   run seed-sales-data.sql
```

**3. Start the frontend** (run separately, not containerized):
```bash
cd frontend
npm install
ng serve
```

**4. Open** `http://localhost:4200`.

To verify the full chain manually instead:
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerId": 1, "lineItems": [{"productId": "507f1f77bcf86cd799439012", "quantity": 8, "unitPriceCents": 8900}]}'

curl -X PATCH http://localhost:3000/api/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "Fulfilled"}'

curl http://localhost:5212/api/purchase/requisitions
curl http://localhost:8080/api/invoices
```

**Admin tools:** MongoDB Compass (`mongodb://localhost:27017`), pgAdmin (`localhost:5433` for Sales, `localhost:5434` for Finance), RabbitMQ management UI (`http://localhost:15672`).

---

## Design process

The business processes behind this system (predictive maintenance triggering spare-parts procurement, the as-is/to-be contrast of a manual vs. automated service operation) were first modeled in BPMN 2.0 before any code was written. The build then shifted to an architecture-first, build-one-service-at-a-time approach, which is what this repository reflects.

---

## Known limitations

Documented here deliberately, rather than left implicit, since each is a reasonable thing to be asked about:

- **Cross-service references are application-level only.** Nothing enforces that a Finance invoice's `orderId` still exists in Sales, or that a Sales order line's `productId` exists in Inventory. A destructive operation on one service outside the normal event flow (a manual truncate, for instance) can orphan data on another service, as it did during development.
- **A true cold start can drop a message.** Both Inventory's and Finance's consumers declare their own durable queue at startup, which safely handles a consumer being temporarily down. If neither consumer has ever run once against a brand-new broker, a message published into that window has no queue to route into and is lost. In practice, this means bringing up the broker and both consumers once before relying on Sales to publish.
- **Inventory's warehouse selection is hardcoded.** The `OrderCreated` event carries no warehouse information, so the consumer checks stock against a single default warehouse rather than any real fulfillment-routing logic.
- **Stock shortfall doesn't yet publish its own event.** A created purchase requisition is visible via the API and the approval queue, but nothing downstream is notified automatically.
- **Prisma 8 is pre-release software** (Release Candidate at the time of writing), chosen deliberately for this non-production project; its API differs meaningfully from Prisma 6/7 and documentation is still catching up.
- **No automated tests yet.** Finance's dependencies include Testcontainers in anticipation of this.
- **No authentication.** All services are open on their local ports, and RabbitMQ/database credentials are plaintext environment variables suitable only for local development.

A fuller conceptual write-up of what was learned while building this, organized by technology, is [here](https://claude.ai/artifact/9qeDYW6NccWUyg3BH4rK2B).