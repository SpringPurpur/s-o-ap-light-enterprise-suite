using System;
// PLACEHOLDER
namespace InventoryService.Events;

public class ConsoleEventPublisher : IEventPublisher
{
    private readonly ILogger<ConsoleEventPublisher> _logger;

    public ConsoleEventPublisher(ILogger<ConsoleEventPublisher> logger)
    {
        _logger = logger;
    }

    public Task PublishAsync(string eventName, object payload)
    {
        _logger.LogInformation("[EVENT] {EventName} -> {Payload}", eventName, System.Text.Json.JsonSerializer.Serialize(payload));
        return Task.CompletedTask;
    }
}
