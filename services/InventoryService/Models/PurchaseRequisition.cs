using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace InventoryService.Models;

public class PurchaseRequisition
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("productId")]
    public string ProductId { get; set; } = null!;

    [BsonElement("quantityRequested")]
    public int QuantityRequested { get; set; }

    [BsonElement("status")]
    [BsonRepresentation(BsonType.String)]
    public RequisitionStatus Status { get; set; } = RequisitionStatus.Pending; // Pending | Approved | Rejected

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
