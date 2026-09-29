using System;
using InventoryService.DTOs;
using InventoryService.Models;
using InventoryService.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace InventoryService.Controllers;

[ApiController]
[Route("api/suppliers")]
public class SuppliersController : ControllerBase
{
    private readonly SupplierRepository _repository;

    public SuppliersController(SupplierRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<ActionResult<List<Supplier>>> GetAll() =>
        Ok(await _repository.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<ActionResult<Supplier>> GetById(string id)
    {
        var supplier = _repository.GetByIdAsync(id);
        return supplier is null ? NotFound() : Ok(supplier);
    }

    [HttpPost]
    public async Task<ActionResult<Supplier>> Create(Supplier supplier)
    {
        await _repository.CreateAsync(supplier);
        return CreatedAtAction(nameof(GetById), new { id = supplier.Id }, supplier);
    }

    [HttpPost]
    public async Task<ActionResult<Supplier>> Create(CreateSupplierRequest request)
    {
        var supplier = new Supplier
        {
            Name = request.Name,
            ContactInfo = request.ContactInfo,
            LeadTimeDays = request.LeadTimeDays
        };

        await _repository.CreateAsync(supplier);
        return CreatedAtAction(nameof(GetById), new { id = supplier.Id }, supplier);
    }
}
