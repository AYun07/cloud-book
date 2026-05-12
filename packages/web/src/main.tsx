import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CloudBookProvider } from './context/CloudBookContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CloudBookProvider>
      <App />
    </CloudBookProvider>
  </React.StrictMode>
);
