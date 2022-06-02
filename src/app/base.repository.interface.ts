import { ClientSession, Document, SaveOptions } from 'mongoose';
import { TransactionOptions } from 'mongodb';
import {
  DeleteOptions,
  FindAndDeleteOptions,
  FindAndUpdateOptions,
  FindOptions,
  IncludeSoftDeletedOptions,
  UpdateOptions,
} from '../shared/mongoose';

export interface Repository<T extends Document> {
  aggregate(aggregations?: any[]): Promise<any[]>;

  count(conditions: any, options?: IncludeSoftDeletedOptions): Promise<number>;

  countAll(options?: IncludeSoftDeletedOptions): Promise<number>;

  create(doc: Record<string, unknown>, options?: SaveOptions): Promise<T>;

  create(docs: Record<string, unknown>[], options?: SaveOptions): Promise<T[]>;

  delete(doc: T, options?: DeleteOptions): Promise<T>;

  delete(docs: T[], options?: DeleteOptions): Promise<T[]>;

  deleteAll(options?: DeleteOptions): Promise<any>;

  deleteById(id: any, options?: FindAndDeleteOptions): Promise<T>;

  deleteMany(conditions: any, options?: DeleteOptions): Promise<any>;

  deleteOne(conditions: any, options?: FindAndDeleteOptions): Promise<T>;

  exists(conditions: any, options?: IncludeSoftDeletedOptions): Promise<boolean>;

  existsById(id: any, options?: IncludeSoftDeletedOptions): Promise<boolean>;

  find(conditions: any, options?: FindOptions): Promise<T[]>;

  findAll(options?: FindOptions): Promise<T[]>;

  findById(id: any, options?: any | FindOptions): Promise<T>;

  findOne(conditions: any, options?: FindOptions): Promise<T>;

  findOneOrCreate(conditions: any, doc: any, options?: FindOptions & SaveOptions): Promise<T>;

  save(doc: T, options?: SaveOptions): Promise<T>;

  save(docs: T[], options?: SaveOptions): Promise<T[]>;

  update(conditions: any, doc: any, options?: UpdateOptions): Promise<any>;

  updateById(id: any, doc: any, options?: FindAndUpdateOptions): Promise<T>;

  updateMany(conditions: any, doc: any, options?: UpdateOptions): Promise<any>;

  updateOne(conditions: any, doc: any, options?: FindAndUpdateOptions): Promise<T>;

  updateOneOrCreate(conditions: any, doc: any, options?: FindAndUpdateOptions): Promise<T>;

  withTransaction<U>(
    fn: (session: ClientSession) => Promise<U>,
    option?: TransactionOptions,
  ): Promise<U>;

  getCollectionName(): string;

  createCollection(): Promise<void>;

  dropCollection(): Promise<void>;

  getPrimaryKey(): string;
}
