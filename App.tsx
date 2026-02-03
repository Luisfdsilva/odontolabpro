
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ServicesList from './components/ServicesList';
import FinanceModule from './components/FinanceModule';
import TasksBoard from './components/TasksBoard';
import ClientsList from './components/ClientsList';
import CompanySettings from './components/CompanySettings';
import ServiceCatalog from './components/ServiceCatalog';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="servicos" element={<ServicesList />} />
          <Route path="catalogo" element={<ServiceCatalog />} />
          <Route path="financeiro" element={<FinanceModule />} />
          <Route path="tarefas" element={<TasksBoard />} />
          <Route path="clientes" element={<ClientsList />} />
          <Route path="configuracoes" element={<CompanySettings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
