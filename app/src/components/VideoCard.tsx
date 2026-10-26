import { Button, Card, Flex, Tag, Typography } from 'antd';
import { CheckOutlined, PlusOutlined } from '@ant-design/icons';
import { Thumbnail } from './Thumbnail';
import type { Video } from '../lib/types';

interface VideoCardProps {
  video: Video;
  selected: boolean;
  onToggle: (video: Video) => void;
  disabled?: boolean;
}

export function VideoCard({ video, selected, onToggle, disabled }: VideoCardProps) {
  return (
    <Card
      hoverable
      size="small"
      styles={{ body: { padding: 12 } }}
      style={selected ? { borderColor: '#1d4ed8' } : undefined}
      cover={<Thumbnail url={video.thumbnail_url} duration={video.duration_seconds} />}
    >
      <Flex vertical gap={8}>
        <Typography.Paragraph strong ellipsis={{ rows: 2 }} style={{ margin: 0, fontSize: 14 }}>
          {video.title}
        </Typography.Paragraph>
        <Typography.Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ margin: 0, fontSize: 12 }}>
          {video.description}
        </Typography.Paragraph>
        <Flex align="center" justify="space-between">
          <Tag color="blue" style={{ margin: 0 }}>{video.jobs.length} métier{video.jobs.length > 1 ? 's' : ''}</Tag>
          <Button
            size="small"
            type={selected ? 'primary' : 'default'}
            disabled={disabled}
            onClick={() => onToggle(video)}
            aria-pressed={selected}
            aria-label={selected ? `Retirer « ${video.title} » de la séance` : `Ajouter « ${video.title} » à la séance`}
            icon={selected ? <CheckOutlined /> : <PlusOutlined />}
          >
            {selected ? 'Ajoutée' : 'Ajouter'}
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}
