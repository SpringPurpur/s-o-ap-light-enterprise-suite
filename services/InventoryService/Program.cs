using InventoryService.Data;
using InventoryService.Events;
using InventoryService.Repositories;
using InventoryService.Services;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings")
);
builder.Services.AddSingleton<MongoDbContext>();

builder.Services.AddSingleton<ProductRepository>();
builder.Services.AddSingleton<StockItemRepository>();
builder.Services.AddSingleton<SupplierRepository>();
builder.Services.AddSingleton<PurchaseRequisitionRepository>();
builder.Services.AddSingleton<PurchaseOrderRepository>();

builder.Services.AddSingleton<IStockCheckService, StockCheckService>();
builder.Services.AddSingleton<IRequisitionService, RequisitionService>();
builder.Services.AddSingleton<IPurchaseOrderService, PurchaseOrderService>();

builder.Services.AddSingleton<IEventPublisher, ConsoleEventPublisher>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapControllers();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
