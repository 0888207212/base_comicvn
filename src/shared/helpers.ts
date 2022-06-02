import { Decimal128, ObjectId } from 'bson';
import * as _ from 'lodash';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { getConfig } from '../modules/common/config.provider';
import { ApiBody } from '@nestjs/swagger';
import {
  ArgumentsHost,
  ContextType,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { IGeneralErrorShape } from './constants';
import * as Bull from 'bull';
import { RedisOptions } from 'ioredis';

export interface ConvertObjectOptions {
  /**
   * Fields to exclude, either as dot-notation string or path array
   */
  exclude?: (string | string[])[];
  /**
   * Exclude properties starting with prefix
   */
  excludePrefix?: string;
  /**
   * Function to replace value (see lodash@cloneDeepWith)
   */
  replacer?: (value: any) => any;
  /**
   * Key-to-key mapping, or function
   */
  keymap?: { [key: string]: string } | ((key: string) => string);
}

export function convertSetToObject<T = any>(value: Set<T>): T[] {
  return Array.from(value.values());
}

export function convertMapToPlainObject<T = any>(value: Map<string, T>): { [key: string]: T } {
  return _.fromPairs(Array.from(value.entries()));
}

export function forOwnRecursive(
  obj: any,
  iteratee: (value: any, path: string[], obj: any) => any = _.identity,
) {
  return _.forOwn(obj, (value, key) => {
    const path = [].concat(key.toString());
    if (_.isPlainObject(value) || _.isArray(value)) {
      return forOwnRecursive(value, (v, p) => iteratee(v, path.concat(p), obj));
    }
    return iteratee(value, path, obj);
  });
}

export function convertObject(obj: any, options: ConvertObjectOptions = {}): any {
  const defaultReplacer = (value) => {
    if (value instanceof ObjectId) {
      return value.toHexString();
    }
    if (value instanceof Decimal128) {
      return Number(value.toString());
    }
    if (value instanceof Set) {
      return convertSetToObject(value);
    }
    if (value instanceof Map) {
      return convertMapToPlainObject(value);
    }
  };
  const {
    exclude = [],
    excludePrefix = '_',
    replacer = defaultReplacer,
    keymap = { _id: 'id' },
  } = options;
  const resultObj = _.cloneDeepWith(obj, replacer);
  if (_.isPlainObject(resultObj) || _.isArray(resultObj)) {
    forOwnRecursive(resultObj, (value, path) => {
      const key = _.last(path);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const newKey = _.isFunction(keymap) ? keymap(key) : _.get(keymap, key);
      if (newKey) {
        _.set(resultObj, _.concat(_.dropRight(path), newKey), value);
      }
    });
    forOwnRecursive(resultObj, (value, path) => {
      if (excludePrefix && _.last(path).startsWith(excludePrefix)) {
        _.unset(resultObj, path);
      }
      _.forEach(exclude, (field) => {
        if (_.isString(field)) {
          field = _.toPath(field);
        }
        if (_.isEqual(field, path)) {
          _.unset(resultObj, path);
          return false;
        }
      });
    });
  }
  return resultObj;
}

export function isClientErrorStatus(status) {
  if (!status) {
    return false;
  }

  return status.toString().match(/^4\d{2}$/);
}

export function createMongooseOptions(uriConfigPath: string): MongooseModuleOptions {
  return {
    uri: getConfig().get(uriConfigPath),
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  };
}

export function createRedisOptions(configPath: string): Bull.QueueOptions {
  const config = getConfig();
  const redisConfig = config.get(configPath);
  return {
    redis: { host: redisConfig.host, port: redisConfig.port, password: redisConfig.password },
  };
}

export function parseContext(context: ExecutionContext | ArgumentsHost): {
  request: Request;
  response: Response;
  contextType: ContextType;
} {
  const request = context.switchToHttp().getRequest<Request>();
  const response = context.switchToHttp().getResponse<Response>();

  return {
    request,
    response,
    contextType: context.getType<ContextType>(),
  };
}

export const ApiFile =
  (fileName = 'file'): MethodDecorator =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [fileName]: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    })(target, propertyKey, descriptor);
  };

export function createGeneralExceptionError(error): IGeneralErrorShape {
  if (!error) {
    return {
      message: 'Internal server error occurred',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }
  if (error instanceof HttpException) {
    const res = error.getResponse();
    if (typeof res === 'string') {
      return {
        statusCode: error.getStatus(),
        message: res,
      };
    }
    return error.getResponse() as IGeneralErrorShape;
  }
  if (error instanceof Error) {
    return {
      message: error.message,
      description: error.message,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }

  return {
    message: error.message,
  };
}

export const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
