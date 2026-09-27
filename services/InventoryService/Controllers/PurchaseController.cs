using System;
using InventoryService.Models;
using InventoryService.Services;
using Microsoft.AspNetCore.Mvc;

namespace InventoryService.Controllers;

public record CreateOrderRequest(string RequisitionId, string SupplierId);
public record UpdateOrderStatusRequest(PurchaseOrderStatus Status);
[ApiController]
[Route("api/purchase")]
public class PurchaseController : ControllerBase
{
    private readonly IRequisitionService _requisitionService;
    private readonly IPurchaseOrderService _orderService;

    public PurchaseController(IRequisitionService requisitionService, IPurchaseOrderService purchaseOrderService)
    {
        _requisitionService = requisitionService;
        _orderService = purchaseOrderService;
    }

    [HttpGet("requisitions")]
    public async Task<ActionResult<List<PurchaseRequisition>>> GetPendingRequisitions() =>
        Ok(await _requisitionService.GetPendingAsync());

    [HttpGet("requisitions/{id}")]
    public async Task<ActionResult<PurchaseRequisition>> GetRequisition(string id)
    {
        var requisition = await _requisitionService.GetByIdAsync(id);
        return requisition is null ? NotFound() : Ok(requisition);
    }

    [HttpPost("requisitions/{id}/approve")]
    public async Task<IActionResult> Approve(string id) =>
        await _requisitionService.ApproveAsync(id) ? NoContent() : BadRequest("Requisition not found or pending.");

    [HttpPost("requisitions/{id}/reject")]
    public async Task<IActionResult> Reject(string id) =>
        await _requisitionService.RejectAsync(id) ? NoContent() : BadRequest("Requisition not found or pending.");

    [HttpPost("orders")]
    public async Task<ActionResult<PurchaseOrder>> CreateOrder(CreateOrderRequest request)
    {
        var order = await _orderService.CreateFromRequisitionAsync(request.RequisitionId, request.SupplierId);
        return order is null ? BadRequest("Requisition not approved or supplier not found.") : Ok(order);
    }

    [HttpPatch("orders/{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(string id, UpdateOrderStatusRequest request) =>
        await _orderService.UpdateStatusAsync(id, request.Status) ? NoContent() : BadRequest("Order not found.");
}
