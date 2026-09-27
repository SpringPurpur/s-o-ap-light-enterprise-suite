using System;

namespace InventoryService.Services;

public record StockCheckResult(
    bool Available,
    int QuantityOnHand,
    int ShortfallQuantity,
    string? CreatedRequisitionId
);
