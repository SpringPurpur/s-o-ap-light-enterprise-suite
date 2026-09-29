using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace InventoryService.Models;

public class Product
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("sku")]
    public string Sku { get; set; } = null!;

    [BsonElement("name")]
    public string Name { get; set; } = null!;

    [BsonElement("category")]
    public string Category { get; set; } = null!;

    [BsonElement("unitOfMeasure")]
    public string UnitOfMeasure { get; set; } = null!;

    [BsonElement("specs")]
    public Dictionary<string, object>? Specs { get; set; } = null!;
}
