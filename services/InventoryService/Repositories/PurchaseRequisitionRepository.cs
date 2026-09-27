using System;
using InventoryService.Data;
using InventoryService.Models;
using MongoDB.Driver;

namespace InventoryService.Repositories;

public class PurchaseRequisitionRepository : RepositoryBase<PurchaseRequisition>
{
    public PurchaseRequisitionRepository(MongoDbContext context) : base(context, "purchaseRequisitions") { }

    public async Task<List<PurchaseRequisition>> GetPendingRequisitionAsync() =>
        await Collection.Find(pr => pr.Status == RequisitionStatus.Pending).ToListAsync();
}
