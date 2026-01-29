import './buffer-shim';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import WalletProviderWrapper from './providers/WalletProvider';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <WalletProviderWrapper>
      <App />
    </WalletProviderWrapper>
  </React.StrictMode>
);
