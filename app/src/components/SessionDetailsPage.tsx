import { ArrowLeftOutlined, AppstoreOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Button, Card, Col, Empty, Flex, Row, Tag, Typography } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { useHeadsetsQuery, useSessionQuery, useSessionVideosQuery } from '../lib/queries';
import { formatDate, formatDuration } from '../lib/format';
import { Thumbnail } from './Thumbnail';
import { ErrorState, LoadingSpinner } from './States';

const orderBadge: React.CSSProperties = {
  position: 'absolute',
  top: 6,
  left: 6,
  background: '#1d4ed8',
  color: '#fff',
  borderRadius: '50%',
  width: 24,
  height: 24,
  fontSize: 12,
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export function SessionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const sessionQuery = useSessionQuery(id);
  const videosQuery = useSessionVideosQuery(sessionQuery.data?.video_ids);
  const headsetsQuery = useHeadsetsQuery();

  if (sessionQuery.isFetching || videosQuery.isFetching) return <LoadingSpinner label="Chargement de la séance…" />;
  if (sessionQuery.error || !sessionQuery.data) {
    return <ErrorState message="Séance introuvable." onRetry={() => sessionQuery.refetch()} />;
  }

  const session = sessionQuery.data;
  const headset = headsetsQuery.data?.data.find((h) => h.id === session.headset_id);
  const videos = videosQuery.data ?? [];

  return (
    <Flex vertical gap="middle">
      <Link to="/sessions">
        <Button type="link" icon={<ArrowLeftOutlined />} style={{ padding: 0 }}>Retour aux séances</Button>
      </Link>

      <Card>
        <Flex justify="space-between" align="flex-start" gap="small" wrap>
          <Flex vertical gap={4}>
            <Typography.Title level={3} style={{ margin: 0 }}>{session.name}</Typography.Title>
            <Flex gap="middle" wrap>
              <Typography.Text type="secondary">
                <ClockCircleOutlined style={{ marginRight: 6 }} aria-hidden />
                <time dateTime={session.created_at}>{formatDate(session.created_at)}</time>
              </Typography.Text>
              <Typography.Text type="secondary">
                <AppstoreOutlined style={{ marginRight: 6 }} aria-hidden />
                {session.video_ids.length} vidéo{session.video_ids.length > 1 ? 's' : ''}
              </Typography.Text>
              {headset && <Tag color="geekblue">{headset.name}</Tag>}
            </Flex>
          </Flex>
          <Card size="small" type="inner">
            <Typography.Text type="secondary">Durée totale</Typography.Text>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {formatDuration(session.total_duration_seconds)}
            </Typography.Title>
          </Card>
        </Flex>
      </Card>

      <Typography.Title level={4} style={{ margin: 0 }}>Vidéos de la séance</Typography.Title>

      {videosQuery.error && (
        <ErrorState message="Certaines vidéos n'ont pas pu être chargées." onRetry={() => videosQuery.refetch()} />
      )}

      {videos.length === 0 ? (
        <Empty description="Aucune vidéo dans cette séance." />
      ) : (
        <Row gutter={[16, 16]}>
          {videos.map((video, idx) => (
            <Col key={video.id} xs={24} sm={12} lg={8} xl={6}>
              <Card
                size="small"
                styles={{ body: { padding: 12 } }}
                cover={
                  <div style={{ position: 'relative' }}>
                    <Thumbnail url={video.thumbnail_url} duration={video.duration_seconds} />
                    <span aria-hidden style={orderBadge}>{idx + 1}</span>
                  </div>
                }
              >
                <Typography.Text strong ellipsis={{ tooltip: video.title }} style={{ fontSize: 14 }}>
                  {video.title}
                </Typography.Text>
                <Typography.Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ margin: '4px 0 0', fontSize: 12 }}>
                  {video.description}
                </Typography.Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Flex>
  );
}
