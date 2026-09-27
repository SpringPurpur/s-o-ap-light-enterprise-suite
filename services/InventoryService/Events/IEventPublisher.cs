using System;

namespace InventoryService.Events;

public interface IEventPublisher
{
    Task PublishAsync(string eventName, object payload);
}
