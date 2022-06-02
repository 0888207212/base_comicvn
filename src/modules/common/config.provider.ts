import * as config from 'config';
import { IConfig } from 'config';

export const getHost = () => {
  const hostname = config.get('server.hostname');
  if (hostname) {
    return `${hostname}`;
  }
  return `${config.get('server.host')}:${config.get('server.port')}`;
};

export const getConfig = () => {
  return config;
};

// In case of functional programming require
export const configProviders = [
  {
    provide: 'configService',
    useFactory: (): IConfig => config,
  },
  {
    provide: 'hostName',
    useFactory: (): string => getHost(),
  },
];
