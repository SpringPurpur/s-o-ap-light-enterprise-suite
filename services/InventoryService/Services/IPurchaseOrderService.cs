using System;
using InventoryService.Models;

namespace InventoryService.Services;

public interface IPurchaseOrderService
{
    Task<PurchaseOrder?> CreateFromRequisitionAsync(string requisitionId, string supplierId);
    Task<bool> UpdateStatusAsync(string id, PurchaseOrderStatus newStatus);
}
