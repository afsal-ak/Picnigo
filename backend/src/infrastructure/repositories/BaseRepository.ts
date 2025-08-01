import { Model, UpdateQuery, Document, SortOrder } from "mongoose";

export abstract class BaseRepository<T> {
    protected model: Model<T & Document>;

    constructor(model: Model<T & Document>) {
        this.model = model;
    }

    async create(data: Partial<T>): Promise<T> {
        return (await this.model.create(data)).toObject();
    }

    async findById(id: string): Promise<T | null> {
        const result = await this.model.findById(id).lean();
        return result as T | null;
    }

    async findAll(
        page = 1,
        limit = 10,
        filter: Record<string, any> = {},
        sort: 'newest' | 'oldest' = 'newest'
    ): Promise<{ data: T[]; total: number; page: number; totalPages: number }> {
        const skip = (page - 1) * limit;

        const sortOption: Record<string, SortOrder> =
            sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

        const [data, total] = await Promise.all([
            this.model.find(filter).sort(sortOption).skip(skip).limit(limit).lean(),
            this.model.countDocuments(filter),
        ]);

        return {
            data: data as T[],
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async update(id: string, data: Partial<T>): Promise<T | null> {
        const result = await this.model.findByIdAndUpdate(
            id,
            { $set: data } as UpdateQuery<T & Document>,
            { new: true }
        ).lean();
        return result as T | null;
    }
    
    async delete(id: string): Promise<void> {
        await this.model.findByIdAndDelete(id);
    }
}
