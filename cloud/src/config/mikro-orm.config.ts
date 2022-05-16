import { MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';

export default {
  metadataProvider: TsMorphMetadataProvider,
  entities: ['./dist/entities/**/*.js'],
  entitiesTs: ['./src/entities/**/*.ts'],
  dbName: 'demo1',
  user: 'demo1',
  password: '123456',
  type: 'mysql',
  persistOnCreate: true,
  highlighter: new SqlHighlighter(),
  schemaGenerator: {
    disableForeignKeys: false,
    createForeignKeyConstraints: false,
  },
  seeder: {
    path: './dist/database/seeders',
    pathTs: './src/database/seeders',
  },
} as MikroOrmModuleSyncOptions;

