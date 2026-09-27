using System;
using InventoryService.Data;
using InventoryService.Models;

namespace InventoryService.Repositories;

public class PurchaseOrderRepository : RepositoryBase<PurchaseOrder>
{
    public PurchaseOrderRepository(MongoDbContext context) : base(context, "purchaseOrders") { }
}
