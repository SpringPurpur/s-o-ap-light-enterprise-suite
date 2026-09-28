using System;
using System.Text;
using System.Text.Json;
using InventoryService.Services;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace InventoryService.Events;

public record OrderLineItemPayload(string ProductId, int Quantity);
public record OrderCreatedPayload(int OrderId, int CustomerId, List<OrderLineItemPayload> LineItems);
public record OrderCreatedEnvelope(string EventId, string EventType, DateTime OccurredAt, OrderCreatedPayload Payload);

public class RabbitMqOrderCreatedConsumer : BackgroundService
{
    private const string ExchangeName = "enterprise.events";
    private const string RoutingKey = "order.created";
    private const string QueueName = "inventory.order-created";
    private const string DefaultWarehouseId = "warehouse-01";

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly string _connectionString;
    private IConnection? _connection;
    private IChannel? _channel;

    public RabbitMqOrderCreatedConsumer(IServiceScopeFactory scopeFactory, IConfiguration config)
    {
        _scopeFactory = scopeFactory;
        _connectionString = config["RabbitMq:ConnectionString"]
            ?? "amqp://enterprise:enterprise_dev_pw@localhost:5672";
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var factory = new ConnectionFactory { Uri = new Uri(_connectionString) };
        _connection = await factory.CreateConnectionAsync(stoppingToken);
        _channel = await _connection.CreateChannelAsync(cancellationToken: stoppingToken);

        await _channel.ExchangeDeclareAsync(ExchangeName, ExchangeType.Topic, durable: true, cancellationToken: stoppingToken);
        await _channel.QueueDeclareAsync(QueueName, durable: true, exclusive: false, autoDelete: false, cancellationToken: stoppingToken);
        await _channel.QueueBindAsync(QueueName, ExchangeName, RoutingKey, cancellationToken: stoppingToken);

        var consumer = new AsyncEventingBasicConsumer(_channel);
        consumer.ReceivedAsync += OnMessageReceivedAsync;

        await _channel.BasicConsumeAsync(QueueName, autoAck: false, consumer, cancellationToken: stoppingToken);
    }

    private async Task OnMessageReceivedAsync(object sender, BasicDeliverEventArgs ea)
    {
        try
        {
            var json = Encoding.UTF8.GetString(ea.Body.ToArray());
            var envelope = JsonSerializer.Deserialize<OrderCreatedEnvelope>(json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (envelope?.Payload is not null)
            {
                using var scope = _scopeFactory.CreateScope();
                var stockCheckService = scope.ServiceProvider.GetRequiredService<IStockCheckService>();

                foreach (var item in envelope.Payload.LineItems)
                {
                    await stockCheckService.CheckStockAsync(item.ProductId, DefaultWarehouseId, item.Quantity);
                }
            }

            await _channel!.BasicAckAsync(ea.DeliveryTag, multiple: false);
        }
        catch (Exception)
        {
            // Reject without requeue for now — a malformed message would otherwise loop forever.
            // Worth replacing with a dead-letter queue once you care about inspecting failures.
            await _channel!.BasicNackAsync(ea.DeliveryTag, multiple: false, requeue: false);
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        if (_channel is not null) await _channel.CloseAsync(cancellationToken);
        if (_connection is not null) await _connection.CloseAsync(cancellationToken);
        await base.StopAsync(cancellationToken);
    }
}
