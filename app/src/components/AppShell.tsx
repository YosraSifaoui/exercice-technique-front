import { useState } from 'react';
import { Badge, Button, Layout, Menu, Tooltip } from 'antd';
import { VideoCameraOutlined } from '@ant-design/icons';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useDraft } from '../lib/draftStore';
import { SessionDrawer } from './SessionDrawer';

const { Header, Content } = Layout;

export function AppShell() {
  const count = useDraft().items.length;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // Active route: '/sessions' (and any sub-path) selects the Sessions entry.
  const selectedKey = location.pathname.startsWith('/sessions') ? '/sessions' : '/';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <a href="#main-content" className="skip-link">Aller au contenu</a>

      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          background: '#fff',
          padding: '0 16px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0f172a', flexShrink: 0 }}>
          <VideoCameraOutlined style={{ color: '#1d4ed8', fontSize: 18 }} />
          <span style={{ fontWeight: 600, fontSize: 16 }}>Métiers 360</span>
        </Link>

        <Menu
          mode="horizontal"
          selectedKeys={[selectedKey]}
          style={{ flex: 1, minWidth: 0, background: 'transparent', borderBottom: 'none' }}
          items={[
            { key: '/', label: <Link to="/">Catalogue</Link> },
            { key: '/sessions', label: <Link to="/sessions">Mes séances</Link> },
          ]}
        />

        <Tooltip title="Ouvrir la séance en cours de composition">
          <Badge count={count} overflowCount={30}>
            <Button
              type="primary"
              onClick={() => setDrawerOpen(true)}
              icon={<VideoCameraOutlined />}
              aria-label={`Ouvrir ma séance, ${count} vidéo${count > 1 ? 's' : ''} sélectionnée${count > 1 ? 's' : ''}`}
            >
              Ma séance
            </Button>
          </Badge>
        </Tooltip>
      </Header>

      <Content style={{ background: '#f8fafc', padding: '16px' }}>
        <div id="main-content" style={{ maxWidth: 1280, margin: '0 auto' }}>
          <Outlet />
        </div>
      </Content>

      <SessionDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </Layout>
  );
}
