
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Clear any initial loading content from the root element
rootElement.innerHTML = '';

const root = ReactDOM.createRoot(rootElement);

try {
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </AuthProvider>
    </React.StrictMode>
  );
} catch (error) {
  console.error("Failed to render React application:", error);
  // Display a fallback message if React rendering fails
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; color: red;">
      <h1>Erro ao carregar o aplicativo</h1>
      <p>Ocorreu um erro inesperado ao iniciar o sistema. Por favor, tente novamente mais tarde.</p>
      <p>Detalhes: ${error instanceof Error ? error.message : String(error)}</p>
    </div>
  `;
}
