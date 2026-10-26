import { AppstoreOutlined, RightOutlined } from '@ant-design/icons';
import { Card, Flex, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useSessionsQuery } from '../lib/queries';
import { getErrorMessage } from '../lib/api';
import { formatDate, formatDuration } from '../lib/format';
import { EmptyState, ErrorState, LoadingSpinner } from './States';

export function SessionsPage() {
  const sessionsQuery = useSessionsQuery();

  if (sessionsQuery.isFetching) return <LoadingSpinner label="Chargement des séances…" />;
  if (sessionsQuery.error) {
    return <ErrorState message={getErrorMessage(sessionsQuery.error, 'Impossible de charger les séances.')} onRetry={() => sessionsQuery.refetch()} />;
  }

  const sessions = sessionsQuery.data?.data ?? [];
  if (sessions.length === 0) {
    return (
      <EmptyState
        title="Aucune séance enregistrée"
        description="Les séances que vous enregistrez apparaîtront ici. Elles sont conservées le temps de vie du serveur."
      />
    );
  }

  return (
    <Flex vertical gap="small">
      <Typography.Text type="secondary">
        {sessions.length} séance{sessions.length > 1 ? 's' : ''} enregistrée{sessions.length > 1 ? 's' : ''} (ordre du plus récent au plus ancien).
      </Typography.Text>
      {sessions.map((s) => (
        <Link key={s.id} to={`/sessions/${s.id}`} style={{ display: 'block' }}>
          <Card size="small" hoverable>
            <Flex justify="space-between" align="center" gap="small">
              <Flex vertical gap={4} style={{ minWidth: 0 }}>
                <Typography.Text strong ellipsis>{s.name}</Typography.Text>
                <Typography.Text type="secondary">
                  <AppstoreOutlined style={{ marginRight: 6 }} aria-hidden />
                  {s.video_ids.length} vidéo{s.video_ids.length > 1 ? 's' : ''} · Durée totale : {formatDuration(s.total_duration_seconds)}
                </Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {formatDate(s.created_at)} · {s.id}
                </Typography.Text>
              </Flex>
              <RightOutlined style={{ color: '#94a3b8' }} aria-hidden />
            </Flex>
          </Card>
        </Link>
      ))}
    </Flex>
  );
}
