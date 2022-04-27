import { MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';


export default {
  metadataProvider: TsMorphMetadataProvider,
  entities: ['./dist/entities/**/*.js'],
  entitiesTs: ['./src/entities/**/*.ts'],
  dbName: 'demo1',
  user: 'demo1',
  password: '123456',
  type: 'mysql',
} as MikroOrmModuleSyncOptions;

