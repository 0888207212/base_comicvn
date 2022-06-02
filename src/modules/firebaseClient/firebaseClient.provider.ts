import { Provider } from '@nestjs/common';
import firebase from 'firebase';
import { getConfig } from '../common/config.provider';
const config = getConfig();
const serviceAccount = JSON.parse(config.get('firebase.client'));

export const FirebaseClientToken = 'FirebaseClientToken';

export const firebaseClientProvider: Provider = {
  provide: FirebaseClientToken,
  useFactory: () => firebase.initializeApp(serviceAccount),
};
