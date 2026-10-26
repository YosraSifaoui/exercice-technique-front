import { Flex } from 'antd';
import { formatDuration } from '../lib/format';

// Shared video thumbnail with the duration overlaid. Used by the catalogue card
// and the session details page.
export function Thumbnail({
  url,
  duration,
}: {
  url: string | null;
  duration: number;
}) {
  return (
    <div style={{ position: 'relative', aspectRatio: '16 / 9', background: '#f1f5f9' }}>
      {url ? (
        <img src={url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <Flex align="center" justify="center" style={{ height: '100%', color: '#94a3b8', fontSize: 12 }}>
          Pas de vignette
        </Flex>
      )}
      <span style={durationBadge}>{formatDuration(duration)}</span>
    </div>
  );
}

const durationBadge: React.CSSProperties = {
  position: 'absolute',
  bottom: 6,
  right: 6,
  background: 'rgba(0,0,0,0.7)',
  color: '#fff',
  padding: '2px 6px',
  borderRadius: 4,
  fontSize: 12,
  fontWeight: 500,
};
