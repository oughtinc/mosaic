import * as React from "react";
import { BrowserRouter, Route, Link } from "react-router-dom";
import ApolloClient from "apollo-client";
import { ApolloProvider } from "react-apollo";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { EpisodeShowPage } from "./pages/EpisodeShowPage";
import { RootWorkspacePage } from "./pages/RootWorkspacePage";
import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import { Provider } from "react-redux";
import { blockReducer } from "./modules/blocks/reducer";

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

const LandingPage = () => (
  <div>
    hi there!
  </div>
);

const Routes = () => (
  <div>
    <Route exact={true} path="/" component={RootWorkspacePage} />
    <Route exact={true} path="/workspaces/:workspaceId" component={EpisodeShowPage} />
  </div>
);

const reduxDevtoolsMiddleware =
  (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__();

let middleware = false;

if (!!reduxDevtoolsMiddleware) {
  middleware = reduxDevtoolsMiddleware;
}

const store = createStore(
  combineReducers(
    {
      blocks: blockReducer,
    } as any
  ),
  middleware
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
