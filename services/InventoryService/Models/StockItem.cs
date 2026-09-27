using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace InventoryService.Models;

public class StockItem
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("productId")]
    public string ProductId { get; set; } = null!;

    [BsonElement("warehouseId")]
    public string WarehouseId { get; set; } = null!;

    [BsonElement("quantityOnHand")]
    public int QuantityOnHand { get; set; }

    [BsonElement("reorderThreshold")]
    public int ReorderThreshold { get; set; }
}
