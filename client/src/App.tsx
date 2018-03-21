import * as React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import ApolloClient from "apollo-client";
import { ApolloProvider } from "react-apollo";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import "bootstrap/dist/css/bootstrap.min.css";
import { EpisodeShowPage } from "./pages/EpisodeShowPage";
import { RootWorkspacePage } from "./pages/RootWorkspacePage";
import { applyMiddleware, combineReducers, createStore } from "redux";
import { Provider } from "react-redux";
import { blockReducer } from "./modules/blocks/reducer";
import { blockEditorReducer } from "./modules/blockEditor/reducer";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";

const { SERVER_URL } = process.env;

const client: any = new ApolloClient({
  link: new HttpLink({ uri: SERVER_URL || "http://localhost:8080/graphql" }),
  cache: new InMemoryCache(),
});

export class Layout extends React.Component {
  public render() {
    return (
      <div className="container-fluid">
        <div className="app-content">{this.props.children}</div>
      </div>
    );
  }
}

const Routes = () => (
  <div>
    <Route exact={true} path="/" component={RootWorkspacePage} />
    <Route path="/workspaces/:workspaceId" render={(props) => (
      <EpisodeShowPage
        {...props}
        key={props.match.params.workspaceId}
      />
    )}
    />
  </div>
);

const store = createStore(
  combineReducers(
    {
      blocks: blockReducer,
      blockEditor: blockEditorReducer,
    } as any
  ),
  composeWithDevTools(applyMiddleware(thunk))
);

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
