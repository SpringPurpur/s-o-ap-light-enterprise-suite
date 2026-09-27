using System;
using System.Collections.ObjectModel;
using InventoryService.Models;
using InventoryService.Repositories;
using InventoryService.Services;
using Microsoft.AspNetCore.Mvc;

namespace InventoryService.Controllers;

public record StockCheckRequest(string ProductId, string WarehouseId, int QuantityNeeded);
public record ReceiveStockRequest(string ProductId, string WarehouseId, int Quantity, int? ReorderThreshold);
[ApiController]
[Route("api/stock")]
public class StockController : ControllerBase
{
    private readonly StockItemRepository _repository;
    private readonly IStockCheckService _stockCheckService;

    public StockController(StockItemRepository repository, IStockCheckService stockCheckService)
    {
        _repository = repository;
        _stockCheckService = stockCheckService;
    }

    [HttpGet("{productId}")]
    public async Task<IActionResult> GetByProduct(string productId, string warehouseId)
    {
        var stock = await _repository.GetByProductAndWarehouseAsync(productId, warehouseId);
        return stock is null ? NotFound() : Ok(stock);
    }

    [HttpPost("check")]
    public async Task<ActionResult<StockCheckResult>> Check(StockCheckRequest request)
    {
        var result = await _stockCheckService.CheckStockAsync(request.ProductId, request.WarehouseId, request.QuantityNeeded);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<StockItem>> Receive(ReceiveStockRequest request)
    {
        var stockItem = await _repository.UpsertQuantityAsync(
            request.ProductId, request.WarehouseId, request.Quantity, request.ReorderThreshold);
        return Ok(stockItem);
    }


}
