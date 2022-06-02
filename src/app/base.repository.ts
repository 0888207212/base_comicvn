import { ClientSession, Document, Model, SaveOptions } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { TransactionOptions } from 'mongodb';
import { merge, slice } from 'lodash';
import {
  DeleteOptions,
  FindAndDeleteOptions,
  FindAndUpdateOptions,
  FindOptions,
  IncludeSoftDeletedOptions,
  UpdateOptions,
} from '../shared/mongoose';
import { Repository } from './base.repository.interface';

export class BaseRepository<T extends Document> implements Repository<T> {
  protected primaryKey = '_id';

  constructor(public readonly model: Model<T>) {}

  aggregate(aggregations?: any[], options?: IncludeSoftDeletedOptions): Promise<any[]> {
    aggregations = slice(aggregations);
    return this.model.aggregate(aggregations).exec();
  }

  async count(conditions: any): Promise<number> {
    return this.model.countDocuments(conditions).exec();
  }

  async countAll(): Promise<number> {
    return this.count({});
  }

  async create(doc: Record<any, any>, options?: SaveOptions): Promise<T>;
  async create(docs: Record<any, any>[], options?: SaveOptions): Promise<T[]>;
  async create(
    docs: Record<any, any> | Record<any, any>[],
    options?: SaveOptions,
  ): Promise<T | T[]> {
    if (Array.isArray(docs)) {
      const result: T[] = [];
      for (const doc of docs) {
        result.push(await this.create(doc, options));
      }
      return result;
    }
    return this.save(new this.model(docs), options);
  }

  async delete(doc: T, options?: DeleteOptions): Promise<T>;
  async delete(docs: T[], options?: DeleteOptions): Promise<T[]>;
  async delete(docs: T | T[], options?: DeleteOptions): Promise<T | T[]> {
    if (Array.isArray(docs)) {
      const result: T[] = [];
      for (const doc of docs) {
        result.push(await this.delete(doc, options));
      }
      return result;
    }
    if (options && options.session) {
      docs.$session(options.session);
    }
    return docs.remove();
  }

  async deleteAll(options?: DeleteOptions): Promise<number> {
    return this.deleteMany({}, options);
  }

  async deleteById(id: any, options?: FindAndDeleteOptions): Promise<T> {
    return this.deleteOne({ [this.primaryKey]: id }, options);
  }

  async deleteMany(conditions: any, options?: DeleteOptions): Promise<number> {
    let query = this.model.deleteMany(conditions);
    if (options && options.session) {
      query = query.session(options.session);
    }
    const result = await query.exec();
    return result.ok ? result.n : 0;
  }

  async deleteOne(conditions: any, options?: FindAndDeleteOptions): Promise<T> {
    return this.model.findOneAndDelete(conditions, options).exec();
  }

  async exists(conditions: any): Promise<boolean> {
    return this.model.exists(conditions);
  }

  async existsById(id: any): Promise<boolean> {
    return this.exists({ [this.primaryKey]: id });
  }

  async find(conditions: any, options?: FindOptions): Promise<T[]> {
    return this.model.find(conditions, null, options).exec();
  }

  async findAll(options?: FindOptions): Promise<T[]> {
    return this.find({}, options);
  }

  async findById(id: any, options?: FindOptions): Promise<T> {
    return this.findOne({ [this.primaryKey]: id }, options);
  }

  async findOne(conditions: any, options?: FindOptions): Promise<T> {
    return this.model.findOne(conditions, null, options).exec();
  }

  async findOneOrCreate(
    conditions: any,
    doc: any,
    options?: FindOptions & SaveOptions,
  ): Promise<T> {
    let document = await this.findOne(conditions, options);
    if (!document) {
      document = await this.create(merge({}, conditions, doc), options);
    }
    return document;
  }

  async findByIdOrFail(id: string): Promise<T> {
    const instance = await this.findById(id);
    if (!instance) {
      return this.throwErrorNotFound();
    }

    return instance;
  }

  async findOneOrFail(conditions: any, options?: FindOptions): Promise<T> {
    const res = await this.findOne(conditions, options);
    if (!res) {
      return this.throwErrorNotFound();
    }
    return res;
  }

  throwErrorNotFound(): never {
    throw new NotFoundException();
  }

  async save(doc: T, options?: SaveOptions): Promise<T>;
  async save(docs: T[], options?: SaveOptions): Promise<T[]>;
  async save(docs: T | T[], options?: SaveOptions): Promise<T | T[]> {
    if (Array.isArray(docs)) {
      return this.model.insertMany(docs, options);
    }
    return docs.save(options);
  }

  async update(conditions: any, doc: any, options?: UpdateOptions): Promise<number> {
    const result = await this.model.update(conditions, doc, options).exec();
    return result.ok ? result.nModified : 0;
  }

  async updateById(id: any, doc: any, options?: FindAndUpdateOptions): Promise<T> {
    return this.updateOne({ [this.primaryKey]: id }, doc, options);
  }

  async updateMany(conditions: any, doc: any, options?: UpdateOptions): Promise<number> {
    const result = await this.model.updateMany(conditions, doc, options).exec();

    return result.ok ? result.nModified : 0;
  }

  async updateOne(conditions: any, doc: any, options?: FindAndUpdateOptions): Promise<T> {
    return this.model.findOneAndUpdate(conditions, doc, { ...options, new: true }).exec();
  }

  async updateOneOrCreate(conditions: any, doc: any, options?: FindAndUpdateOptions): Promise<T> {
    return this.updateOne(
      conditions,
      doc,
      merge({ new: true, upsert: true, setDefaultsOnInsert: true }, options),
    );
  }

  async withTransaction<U>(
    fn: (session: ClientSession) => Promise<U>,
    options?: TransactionOptions,
  ): Promise<U> {
    const session = await this.model.db.startSession();
    let result: U;
    try {
      await session.withTransaction(async (ses) => {
        result = await fn(ses);
      }, options);
      return result;
    } finally {
      session.endSession();
    }
  }

  getCollectionName(): string {
    return this.model.collection.collectionName;
  }

  async createCollection(): Promise<void> {
    if (!(await this.isCollectionExists())) {
      await this.model.createCollection();
    }
  }

  async dropCollection(): Promise<void> {
    if (await this.isCollectionExists()) {
      await this.model.collection.drop();
    }
  }

  getPrimaryKey(): string {
    return this.primaryKey;
  }

  private async isCollectionExists(): Promise<boolean> {
    const result = await this.model.db.db
      .listCollections({ name: this.model.collection.collectionName })
      .next();
    return !!result;
  }
}
