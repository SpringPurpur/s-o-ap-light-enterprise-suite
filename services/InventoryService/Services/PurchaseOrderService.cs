using System;
using InventoryService.Events;
using InventoryService.Models;
using InventoryService.Repositories;

namespace InventoryService.Services;

public class PurchaseOrderService : IPurchaseOrderService
{
    private readonly PurchaseOrderRepository _orderRepository;
    private readonly PurchaseRequisitionRepository _requisitionRepository;
    private readonly SupplierRepository _supplierRepository;
    private readonly IEventPublisher _eventPublisher;

    public PurchaseOrderService(
        PurchaseOrderRepository orderRepository,
        PurchaseRequisitionRepository requisitionRepository,
        SupplierRepository supplierRepository,
        IEventPublisher eventPublisher)
    {
        _orderRepository = orderRepository;
        _requisitionRepository = requisitionRepository;
        _supplierRepository = supplierRepository;
        _eventPublisher = eventPublisher;
    }

    public async Task<PurchaseOrder?> CreateFromRequisitionAsync(string requisitionId, string supplierId)
    {
        var requisition = await _requisitionRepository.GetByIdAsync(requisitionId);
        if (requisition is null || requisition.Status != RequisitionStatus.Approved)
            return null;
        
        var supplier = await _supplierRepository.GetByIdAsync(supplierId);
        if (supplier is null)
            return null;
        
        var order = new PurchaseOrder
        {
            RequisitionId = requisitionId,
            SupplierId = supplierId,
            ExpectedDeliveryDate = DateTime.UtcNow.AddDays(supplier.LeadTimeDays)
        };

        await _orderRepository.CreateAsync(order);

        await _eventPublisher.PublishAsync("PurchaseOrderCreated", new
        {
            order.Id,
            requisitionId,
            supplierId,
            expectedDeliveryDate = order.ExpectedDeliveryDate
        });

        return order;
    }

    public async Task<bool> UpdateStatusAsync(string id, PurchaseOrderStatus newStatus)
    {
        var order = await _orderRepository.GetByIdAsync(id);
        if (order is null)
            return false;
        
        order.Status = newStatus;
        await _orderRepository.UpdateAsync(id, order);

        await _eventPublisher.PublishAsync("PurchaseOrderStatusChanged", new
        {
            order.Id,
            newStatus
        });
        
        return true;
    }
}
