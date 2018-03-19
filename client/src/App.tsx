import * as React from 'react';
import Store from './store';
import './App.css';

interface AppProps {
  store: Store;
}

class App extends React.Component<AppProps> {

  constructor(props: AppProps) {
    super(props);
  }
  
  render() {
    return (
      <div className="App">
        <pre>{JSON.stringify(this.props.store, null, 2)}</pre>
      </div>
    );
  }
}

export default App;
