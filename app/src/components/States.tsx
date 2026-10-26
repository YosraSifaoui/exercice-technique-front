import { Alert, Button, Empty, Flex, Spin, Typography } from 'antd';

export function LoadingSpinner({ label = 'Chargement…' }: { label?: string }) {
  return (
    <Flex justify="center" align="center" style={{ padding: 48 }} role="status" aria-live="polite">
      <Spin size="large" />
      <span className="sr-only">{label}</span>
    </Flex>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Alert
      type="error"
      showIcon
      role="alert"
      message="Une erreur est survenue"
      description={message}
      action={onRetry ? <Button size="small" onClick={onRetry}>Réessayer</Button> : undefined}
    />
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <Empty description={title}>
      {description && <Typography.Text type="secondary">{description}</Typography.Text>}
    </Empty>
  );
}
