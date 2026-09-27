using System;
using InventoryService.Data;
using InventoryService.Models;
using MongoDB.Driver;

namespace InventoryService.Repositories;

public class StockItemRepository : RepositoryBase<StockItem>
{
    public StockItemRepository(MongoDbContext context) : base (context, "stockItems") { }

    public async Task<StockItem> GetByProductAndWarehouseAsync(string productId, string warehouseId) =>
        await Collection.Find(s => s.ProductId == productId && s.WarehouseId == warehouseId).FirstOrDefaultAsync();

    public async Task<StockItem> UpsertQuantityAsync(string productId, string warehouseId, int quantityToAdd, int? reorderThreshold)
    {
        var existing = await Collection
            .Find(s => s.ProductId == productId && s.WarehouseId == warehouseId)
            .FirstOrDefaultAsync();

        if (existing is not null)
        {
            existing.QuantityOnHand += quantityToAdd;
            if (reorderThreshold.HasValue)
                existing.ReorderThreshold = reorderThreshold.Value;

            await UpdateAsync(existing.Id, existing);
            return existing;
        }

        var newItem = new StockItem
        {
            ProductId = productId,
            WarehouseId = warehouseId,
            QuantityOnHand = quantityToAdd,
            ReorderThreshold = reorderThreshold ?? 0
        };

        await CreateAsync(newItem);
        return newItem;
    }
}
