import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'node:path';
import { formatGraphqlError } from '../common/graphql/format-error';

// The landing-page package ships ESM types while the Nest driver uses CJS types.
const landingPagePlugin = ApolloServerPluginLandingPageLocalDefault() as unknown as NonNullable<
  ApolloDriverConfig['plugins']
>[number];

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: false,
      introspection: true,
      includeStacktraceInErrorResponses: false,
      formatError: formatGraphqlError,
      plugins: [landingPagePlugin],
    }),
  ],
})
export class GraphqlConfigModule {}
