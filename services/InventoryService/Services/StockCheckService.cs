using System;
using InventoryService.Events;
using InventoryService.Models;
using InventoryService.Repositories;

namespace InventoryService.Services;

public class StockCheckService : IStockCheckService
{
    private readonly StockItemRepository _stockItemRepository;
    private readonly PurchaseRequisitionRepository _requisitionRepository;
    private readonly IEventPublisher _eventPublisher;

    public StockCheckService(
        StockItemRepository stockItemRepository,
        PurchaseRequisitionRepository requisitionRepository,
        IEventPublisher eventPublisher)
    {
        _stockItemRepository = stockItemRepository;
        _requisitionRepository = requisitionRepository;
        _eventPublisher = eventPublisher;
    }

    public async Task<StockCheckResult> CheckStockAsync(string productId, string warehouseId, int quantityNeeded)
    {
        var stockItem = await _stockItemRepository.GetByProductAndWarehouseAsync(productId, warehouseId);
        var onHand = stockItem?.QuantityOnHand ?? 0;

        if (onHand >= quantityNeeded)
        {
            return new StockCheckResult(true, onHand, 0, null);
        }

        var shortfall = quantityNeeded - onHand;

        var requisition = new PurchaseRequisition
        {
            ProductId = productId,
            QuantityRequested = shortfall
        };

        await _requisitionRepository.CreateAsync(requisition);

        await _eventPublisher.PublishAsync("PurchaseRequisitionCreated", new
        {
            requisition.Id,
            productId,
            warehouseId,
            quantityRequested = shortfall
        });

        return new StockCheckResult(false, onHand, shortfall, requisition.Id);
    }
}
