using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace InventoryService.Models;

public class Supplier
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("name")]
    public string Name { get; set; } = null!;

    [BsonElement("contactInfo")]
    public string ContactInfo { get; set; } = null!;

    [BsonElement("leadTimeDays")]
    public int LeadTimeDays { get; set; }
}
