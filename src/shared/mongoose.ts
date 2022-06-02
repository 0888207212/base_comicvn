import { NotFoundException } from '@nestjs/common';
import { merge, slice } from 'lodash';
import { TransactionOptions } from 'mongodb';
import { ClientSession, Document, Model, Query, QueryOptions, SaveOptions, Schema } from 'mongoose';
import { convertObject } from './helpers';
import { getNow } from './time-helpers';

type DocumentSaveCallback<T> = (err: any, doc: T) => void;

interface ModelOptions {
  session?: ClientSession | null;
}

export interface BaseDocument extends Document {
  createdAt?: Date;
  updatedAt?: Date;
  _deleted?: boolean;

  softDelete(fn?: DocumentSaveCallback<this>): Promise<this>;

  softDelete(options?: SaveOptions, fn?: DocumentSaveCallback<this>): Promise<this>;

  restore(fn?: DocumentSaveCallback<this>): Promise<this>;

  restore(options?: SaveOptions, fn?: DocumentSaveCallback<this>): Promise<this>;
}

export function getBaseSchema<T extends BaseDocument>(options = {}): Schema<T> {
  return new Schema<T>(
    {
      _deleted: {
        type: Boolean,
        default: false,
        index: true,
      },
      createdAt: Date,
      updatedAt: Date,
      deletedAt: Date,
    },
    {
      timestamps: true,
      toObject: {
        transform: (_, ret) => convertObject(ret),
      },
      toJSON: {
        transform: (_, ret) => convertObject(ret),
      },
      ...options,
    },
  );
}

export interface IncludeSoftDeletedOptions {
  includeSoftDeleted?: boolean;
}

export interface FindOptions extends QueryOptions {
  sort?: Record<string, unknown> | string;
  limit?: number;
  skip?: number;
  maxscan?: number;
  batchSize?: number;
  comment?: string;
  snapshot?: boolean;
  hint?: Record<string, unknown>;
}

export type DeleteOptions = ModelOptions;

export interface UpdateOptions extends DeleteOptions, IncludeSoftDeletedOptions {
  multi?: boolean;
  upsert?: boolean;
  setDefaultsOnInsert?: boolean;
  timestamps?: boolean;
  omitUndefined?: boolean;
  overwrite?: boolean;
  runValidators?: boolean;
  context?: string;
  multipleCastError?: boolean;
}

export interface FindAndDeleteOptions extends QueryOptions {
  sort?: Record<string, unknown> | string;
}

export interface FindAndUpdateOptions extends QueryOptions, UpdateOptions {
  new?: boolean;
  fields?: Record<string, unknown> | string;
}
