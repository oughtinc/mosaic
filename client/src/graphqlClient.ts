import { InMemoryCache } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { ApolloLink } from "apollo-link";
import { onError } from "apollo-link-error";
import { getUserAccessToken } from "./auth/getUserAccessToken";
import { getUserId } from "./auth/getUserId";

const SERVER_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080/graphql"
    : `${window.location.protocol}//${window.location.hostname}/graphql`;

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}. Path: ${path}. Location: `,
        locations,
      ),
    );
  }
  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
  }
});

const authLink = new ApolloLink((operation, forward) => {
  operation.setContext(context => ({
    ...context,
    headers: {
      ...context.headers,
      authorization: `${getUserAccessToken()}::${getUserId()}`,
    },
  }));
  return forward ? forward(operation) : null;
});

const link = ApolloLink.from([
  authLink,
  errorLink,
  new HttpLink({ uri: SERVER_URL }),
]);

export const client: any = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
