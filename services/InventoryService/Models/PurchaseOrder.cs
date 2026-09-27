using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace InventoryService.Models;

public class PurchaseOrder
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("requisitionId")]
    public string RequisitionId { get; set; } = null!;

    [BsonElement("supplierId")]
    public string SupplierId { get; set; } = null!;

    [BsonElement("status")]
    [BsonRepresentation(BsonType.String)]
    public PurchaseOrderStatus Status { get; set; } = PurchaseOrderStatus.Open; // Open | Shipped | Received | Closed | Cancelled

    [BsonElement("expectedDeliveryDate")]
    public DateTime? ExpectedDeliveryDate { get; set; }
}
