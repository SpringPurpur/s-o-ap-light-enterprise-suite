using System;
using InventoryService.Data;
using InventoryService.Models;
using MongoDB.Driver;

namespace InventoryService.Repositories;

public class ProductRepository : RepositoryBase<Product>
{
    public ProductRepository(MongoDbContext context) : base(context, "products") { }

    public async Task<Product?> GetBySkuAsync(string sku) =>
        await Collection.Find(p => p.Sku == sku).FirstOrDefaultAsync();
}
