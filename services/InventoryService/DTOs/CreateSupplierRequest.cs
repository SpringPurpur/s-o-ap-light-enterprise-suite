namespace InventoryService.DTOs;

public record class CreateSupplierRequest(string Name, string ContactInfo, int LeadTimeDays) { }
