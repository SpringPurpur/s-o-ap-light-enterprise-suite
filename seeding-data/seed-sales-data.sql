-- Seed data for SalesDb — run in pgAdmin's Query Tool against the SalesDb database.
-- Uses chained CTEs so you don't need to hardcode ids or know what auto-increment
-- values already exist. Safe to run multiple times (each run adds new rows).

WITH new_customers AS (
  INSERT INTO "Customer" (name, "contactInfo", "createdAt", "updatedAt")
  VALUES
    ('Acme Corp', 'ops@acme.com', now(), now()),
    ('Meridian Industrial Group', 'procurement@meridian.example', now(), now()),
    ('Northwind Traders', 'contact@northwind.example', now(), now())
  RETURNING id, name
),

new_orders AS (
  INSERT INTO "Order" ("customerId", status, "createdAt", "updatedAt")
  SELECT id, 'Created', now(), now()
  FROM new_customers
  WHERE name = 'Acme Corp'
  RETURNING id, "customerId"
),

new_order_2 AS (
  INSERT INTO "Order" ("customerId", status, "createdAt", "updatedAt")
  SELECT id, 'Fulfilled', now(), now()
  FROM new_customers
  WHERE name = 'Meridian Industrial Group'
  RETURNING id, "customerId"
)

-- productId values below match the fixed ObjectIds in seed-inventory-data.js:
--   507f1f77bcf86cd799439011 = Industrial Pump 100    (40 on hand, warehouse-01)
--   507f1f77bcf86cd799439012 = Vibration Sensor 200   (5 on hand — below threshold, good for shortfall testing)
--   507f1f77bcf86cd799439013 = Control Valve 300      (15 on hand, warehouse-01)
-- unitPriceCents is integer minor units: 125000 = 1,250.00 (single currency for the MVP)
INSERT INTO "OrderLineItem" ("orderId", "productId", quantity, "unitPriceCents")
SELECT id, '507f1f77bcf86cd799439011', 3, 125000 FROM new_orders
UNION ALL
SELECT id, '507f1f77bcf86cd799439012', 8, 8900 FROM new_orders  -- exceeds the 5 on hand — triggers a requisition
UNION ALL
SELECT id, '507f1f77bcf86cd799439013', 5, 32000 FROM new_order_2;

-- Quick check afterward:
-- SELECT o.id, o.status, c.name AS customer, li."productId", li.quantity, li."unitPriceCents"
-- FROM "Order" o
-- JOIN "Customer" c ON c.id = o."customerId"
-- JOIN "OrderLineItem" li ON li."orderId" = o.id
-- ORDER BY o.id;
