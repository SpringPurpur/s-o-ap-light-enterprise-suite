using System;

namespace InventoryService.Models;

public enum RequisitionStatus
{
    Pending,
    Approved,
    Rejected
}

public enum PurchaseOrderStatus
{
    Open,
    Shipped,
    Received,
    Closed,
    Cancelled
}