import { BaseDocument } from '../../shared/mongoose';

export interface IGenre extends BaseDocument {
  name: string;
  description?: string;
  total: number;
}
