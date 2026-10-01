// Seed data for InventoryDb — run via Compass's built-in shell (the ">_MONGOSH"
// tab at the bottom of the Compass window), or via the `mongosh` CLI if installed.
// Fixed _id values are used deliberately so the Sales/Order Postgres seed script
// can reference these exact product ids and stay in sync.

use InventoryDb;

db.products.insertMany([
  {
    _id: ObjectId("507f1f77bcf86cd799439011"),
    sku: "PUMP-100",
    name: "Industrial Pump 100",
    category: "Pumps",
    unitOfMeasure: "each",
    specs: { flowRateLpm: 250, maxPressureBar: 16 }
  },
  {
    _id: ObjectId("507f1f77bcf86cd799439012"),
    sku: "SENSOR-VIB-200",
    name: "Vibration Sensor 200",
    category: "Sensors",
    unitOfMeasure: "each",
    specs: { range: "0-50mm/s", outputType: "4-20mA" }
  },
  {
    _id: ObjectId("507f1f77bcf86cd799439013"),
    sku: "VALVE-CTRL-300",
    name: "Control Valve 300",
    category: "Valves",
    unitOfMeasure: "each",
    specs: { size: "DN50", material: "Stainless Steel" }
  }
]);

db.suppliers.insertOne({
  _id: ObjectId("507f1f77bcf86cd799439021"),
  name: "Global Industrial Supply Co",
  contactInfo: "orders@globalindustrial.example",
  leadTimeDays: 14
});

db.stockItems.insertMany([
  {
    productId: "507f1f77bcf86cd799439011",
    warehouseId: "warehouse-01",
    quantityOnHand: 40,
    reorderThreshold: 10
  },
  {
    // Deliberately below threshold — good for testing the shortfall/requisition flow.
    productId: "507f1f77bcf86cd799439012",
    warehouseId: "warehouse-01",
    quantityOnHand: 5,
    reorderThreshold: 10
  },
  {
    productId: "507f1f77bcf86cd799439013",
    warehouseId: "warehouse-01",
    quantityOnHand: 15,
    reorderThreshold: 5
  }
]);

// Quick check afterward:
// db.products.find();
// db.stockItems.find();
// db.suppliers.find();
