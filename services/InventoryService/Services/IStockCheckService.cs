using System;

namespace InventoryService.Services;

public interface IStockCheckService
{
    Task<StockCheckResult> CheckStockAsync(string productId, string warehouseId, int quantityNeeded);
}
