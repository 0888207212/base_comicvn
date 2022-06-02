import { Global, Module } from '@nestjs/common';
import { firebaseClientProvider } from './firebaseClient.provider';

@Global()
@Module({
  providers: [firebaseClientProvider],
  exports: [firebaseClientProvider],
})
export class FirebaseClientModule {}
