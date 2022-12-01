"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createAccounts = undefined;

var _apolloServer = require("apollo-server");

var _graphqlToolkit = require("graphql-toolkit");

var _graphqlApi = require("@accounts/graphql-api");

var _password = require("@accounts/password");

var _server = require("@accounts/server");

var _typeorm = require("@accounts/typeorm");

var _connect = require("./connect");

const createAccounts = exports.createAccounts = async () => {
  const connection = await (0, _connect.connect)(process.env.DATABASE_URL); // Like, fix this man!

  const tokenSecret = 'process.env.ACCOUNTS_SECRET' || 'change this in .env';
  const db = new _typeorm.AccountsTypeorm({
    connection,
    cache: 1000
  });
  const password = new _password.AccountsPassword();
  const accountsServer = new _server.AccountsServer({
    db,
    tokenSecret,
    siteUrl: 'http://localhost:3000'
  }, {
    password
  }); // Creates resolvers, type definitions, and schema directives used by accounts-js

  const accountsGraphQL = _graphqlApi.AccountsModule.forRoot({
    accountsServer
  });

  const typeDefs = `
type PrivateType @auth {
field: String
}

# Our custom fields to add to the user
extend input CreateUserInput {
profile: CreateUserProfileInput!
}

input CreateUserProfileInput {
firstName: String!
lastName: String!
}

type Query {
publicField: String
privateField: String @auth
privateType: PrivateType
}

type Mutation {
_: String
}
`;
  const resolvers = {
    Query: {
      publicField: () => 'public',
      privateField: () => 'private',
      privateType: () => ({
        field: () => 'private'
      })
    }
  };
  const schema = (0, _apolloServer.makeExecutableSchema)({
    typeDefs: (0, _graphqlToolkit.mergeTypeDefs)([typeDefs, accountsGraphQL.typeDefs]),
    resolvers: (0, _graphqlToolkit.mergeResolvers)([accountsGraphQL.resolvers, resolvers]),
    schemaDirectives: { ...accountsGraphQL.schemaDirectives
    }
  }); // Create the Apollo Server that takes a schema and configures internal stuff

  const server = new _apolloServer.ApolloServer({
    schema,
    context: accountsGraphQL.context
  });
  server.listen(4000).then(({
    url
  }) => {
    // tslint:disable-next-line:no-console
    console.log(`🚀  Server ready at ${url}`);
  });
};

createAccounts();