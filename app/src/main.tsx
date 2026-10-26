import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntdApp, ConfigProvider } from 'antd';
import frFR from 'antd/locale/fr_FR';
import { AppShell } from './components/AppShell';
import { CataloguePage } from './components/CataloguePage';
import { SessionDetailsPage } from './components/SessionDetailsPage';
import { SessionsPage } from './components/SessionsPage';
import { DraftProvider } from './lib/draftStore';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={frFR}
        theme={{
          token: {
            colorPrimary: '#1d4ed8',
            borderRadius: 8,
            fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          },
        }}
      >
        <AntdApp>
          <DraftProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<AppShell />}>
                  <Route index element={<CataloguePage />} />
                  <Route path="sessions" element={<SessionsPage />} />
                  <Route path="sessions/:id" element={<SessionDetailsPage />} />
                  <Route path="*" element={<CataloguePage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </DraftProvider>
        </AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  </StrictMode>,
);
