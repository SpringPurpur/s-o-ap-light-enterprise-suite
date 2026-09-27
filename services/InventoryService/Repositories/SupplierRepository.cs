using System;
using InventoryService.Data;
using InventoryService.Models;

namespace InventoryService.Repositories;

public class SupplierRepository : RepositoryBase<Supplier>
{
    public SupplierRepository(MongoDbContext context) : base(context, "suppliers") { }
}
