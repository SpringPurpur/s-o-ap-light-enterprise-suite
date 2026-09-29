using System;

namespace InventoryService.DTOs;

public record CreateProductRequest(
    string Sku,
    string Name,
    string Category,
    string UnitOfMeasure,
    Dictionary<string, object>? Specs
) { }
