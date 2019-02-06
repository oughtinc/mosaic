import * as React from "react";
import * as LogRocket from "logrocket";
import { BrowserRouter, Route, Redirect } from "react-router-dom";
import ApolloClient from "apollo-client";
import { ApolloProvider } from "react-apollo";
import { HttpLink } from "apollo-link-http";
import { ApolloLink } from "apollo-link";
import { onError } from "apollo-link-error";
import { InMemoryCache } from "apollo-cache-inmemory";
import { Provider } from "react-redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk from "redux-thunk";
import "bootstrap/dist/css/bootstrap.min.css";

import { EpisodeShowPage } from "./pages/EpisodeShowPage";
import { ExperimentShowPage } from "./pages/ExperimentShowPage";
import { NextEpisodeShowPage } from "./pages/NextEpisodeShowPage";
import { NextMaybeSuboptimalEpisodeShowPage } from "./pages/NextMaybeSuboptimalEpisodeShowPage";
import { BetweenEpisodesPage } from "./pages/BetweenEpisodesPage";
import { RootWorkspacePage } from "./pages/RootWorkspacePage";
import { applyMiddleware, combineReducers, createStore } from "redux";
import { blockReducer } from "./modules/blocks/reducer";
import { blockEditorReducer } from "./modules/blockEditor/reducer";
import { WorkspaceSubtreePage } from "./pages/WorkspaceSubtreePage";
import { ListenerThatClosesPointersOnPathnameChange } from "./components/ListenerThatClosesPointersOnPathnameChange";
import { Header } from "./components/Header";

import { Config } from "./config";
import { Auth } from "./auth";

const SERVER_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080/graphql"
    : `${window.location.protocol}//${window.location.hostname}/graphql`;

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}. Path: ${path}. Location: `,
        locations
      )
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
      authorization: Auth.accessToken(),
    },
  }));
  return forward ? forward(operation) : null;
});

const link = ApolloLink.from([
  authLink,
  errorLink,
  new HttpLink({ uri: SERVER_URL }),
]);

const client: any = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

const store = createStore(
  combineReducers({
    blocks: blockReducer,
    blockEditor: blockEditorReducer,
  } as any),
  composeWithDevTools(applyMiddleware(thunk))
);

export class Layout extends React.Component {
  public render() {
    return (
      <div className="Layout">
        <Header />
        {this.props.children}
      </div>
    );
  }
}

const Routes = () => (
  <div>
    <Route exact={true} path="/workspaces" render={() => <Redirect to="/" />} />
    <Route exact={true} path="/" component={RootWorkspacePage} />
    <Route exact={true} path="/next" component={NextEpisodeShowPage} />
    <Route exact={true} path="/nextMaybeSuboptimal" component={NextMaybeSuboptimalEpisodeShowPage} />
    <Route exact={true} path="/break" component={BetweenEpisodesPage} />
    <Route
      exact={true}
      path="/workspaces/:workspaceId"
      component={EpisodeShowPage}
    />
    <Route
      exact={true}
      path="/experiments/:experimentId"
      component={ExperimentShowPage}
    />
    <Route
      exact={true}
      path="/workspaces/:workspaceId/subtree"
      component={WorkspaceSubtreePage}
    />
    <Route
      path="/authCallback"
      render={props => {
        if (/access_token|error/.test(props.location.hash)) {
          Auth.handleAuthentication(() => {
            location.assign(Auth.getPreAuthUrl());
            Auth.clearPreAuthUrl();
          });
        }
        return <Redirect to="/" />;
      }}
    />
    <ListenerThatClosesPointersOnPathnameChange />
  </div>
);

LogRocket.init(Config.logrocket_id);
const environment = process.env.NODE_ENV || ""; // "development" or "production"
LogRocket.track(environment);

class App extends React.Component {
  public render() {
    return (
      <ApolloProvider client={client}>
        <Provider store={store}>
          <BrowserRouter>
            <Layout>
              <Routes />
            </Layout>
          </BrowserRouter>
        </Provider>
      </ApolloProvider>
    );
  }
}

export { App };
