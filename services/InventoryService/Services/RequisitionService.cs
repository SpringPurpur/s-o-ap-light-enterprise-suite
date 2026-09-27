using System;
using InventoryService.Models;
using InventoryService.Repositories;

namespace InventoryService.Services;

public class RequisitionService : IRequisitionService
{
    private readonly PurchaseRequisitionRepository _purchaseRequisitionRepository;

    public RequisitionService(PurchaseRequisitionRepository purchaseRequisitionRepository)
    {
        _purchaseRequisitionRepository = purchaseRequisitionRepository;
    }

    public Task<PurchaseRequisition?> GetByIdAsync(string id) =>
        _purchaseRequisitionRepository.GetByIdAsync(id);

    public Task<List<PurchaseRequisition>> GetPendingAsync() =>
        _purchaseRequisitionRepository.GetPendingRequisitionAsync();

    public async Task<bool> ApproveAsync(string id)
    {
        var requisition = await _purchaseRequisitionRepository.GetByIdAsync(id);
        if (requisition is null || requisition.Status != RequisitionStatus.Pending)
            return false;

        requisition.Status = RequisitionStatus.Approved;
        await _purchaseRequisitionRepository.UpdateAsync(id, requisition);
        return true;
    }

    public async Task<bool> RejectAsync(string id)
    {
        var requisition = await _purchaseRequisitionRepository.GetByIdAsync(id);
        if (requisition is null || requisition.Status != RequisitionStatus.Pending)
            return false;
        requisition.Status = RequisitionStatus.Rejected;
        await _purchaseRequisitionRepository.UpdateAsync(id, requisition);
        return true;
    }
}
