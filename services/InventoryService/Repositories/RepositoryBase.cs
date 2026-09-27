using System;
using InventoryService.Data;
using MongoDB.Bson;
using MongoDB.Driver;

namespace InventoryService.Repositories;

public abstract class RepositoryBase<T>
{
    protected readonly IMongoCollection<T> Collection;

    protected RepositoryBase(MongoDbContext context, string collectionName)
    {
        Collection = context.GetCollection<T>(collectionName);
    }

    public async Task<List<T>> GetAllAsync() =>
        await Collection.Find(_ => true).ToListAsync();

    public async Task<T?> GetByIdAsync(string id) =>
        await Collection.Find(Builders<T>.Filter.Eq("_id", ObjectId.Parse(id))).FirstOrDefaultAsync();
    
    public async Task CreateAsync(T entity) =>
        await Collection.InsertOneAsync(entity);

    public async Task UpdateAsync(string id, T entity) =>
        await Collection.ReplaceOneAsync(Builders<T>.Filter.Eq("_id", ObjectId.Parse(id)), entity);

    public async Task DeleteAsync(string id) =>
        await Collection.DeleteOneAsync(Builders<T>.Filter.Eq("_id", ObjectId.Parse(id)));
}
