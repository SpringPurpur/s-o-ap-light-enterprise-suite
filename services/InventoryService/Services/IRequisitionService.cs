using System;
using InventoryService.Models;

namespace InventoryService.Services;

public interface IRequisitionService
{
    Task<PurchaseRequisition?> GetByIdAsync(string id);
    Task<List<PurchaseRequisition>> GetPendingAsync();
    Task<bool> ApproveAsync(string id);
    Task<bool> RejectAsync(string id);
}
