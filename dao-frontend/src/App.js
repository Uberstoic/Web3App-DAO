import React from 'react';
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import DAOInterface from './components/DAOInterface';
import './App.css';

function getLibrary(provider) {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <div className="App">
        <header className="App-header">
          <h1>DAO Governance Portal</h1>
        </header>
        <main>
          <DAOInterface />
        </main>
      </div>
    </Web3ReactProvider>
  );
}

export default App;
