import { useEffect, useState } from 'react';
import { Alert, App, Badge, Button, Drawer, Empty, Flex, Input, Select, Space, Spin, Tooltip, Typography } from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { validateDraft, useDraft, type DraftItem } from '../lib/draftStore';
import { useCreateSession, useHeadsetsQuery } from '../lib/queries';
import { formatDuration } from '../lib/format';
import { ApiError, getErrorMessage } from '../lib/api';

interface SessionDrawerProps {
  open: boolean;
  onClose: () => void;
}

const numberBadge: React.CSSProperties = {
  flexShrink: 0,
  width: 24,
  height: 24,
  borderRadius: '50%',
  background: '#1d4ed8',
  color: '#fff',
  fontSize: 12,
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export function SessionDrawer({ open, onClose }: SessionDrawerProps) {
  const draft = useDraft();
  const headsetsQuery = useHeadsetsQuery();
  const headsets = headsetsQuery.data?.data ?? [];
  const createSession = useCreateSession();
  const { message } = App.useApp();
  const [touched, setTouched] = useState(false);
  const submitting = createSession.isPending;

  // Toast on success. Depend only on the boolean so the effect doesn't refire.
  useEffect(() => {
    if (!createSession.isSuccess) return;
    message.success('Séance enregistrée avec succès.');
    setTouched(false);
    const t = setTimeout(() => createSession.reset(), 2500);
    return () => clearTimeout(t);
  }, [createSession.isSuccess, createSession, message]);

  const errors = validateDraft(draft, headsets);
  const nameErr = errors.find((e) => e.field === 'name')?.message;
  const vidsErr = errors.find((e) => e.field === 'video_ids')?.message;

  const save = () => {
    setTouched(true);
    if (errors.length) return;
    createSession.mutate({
      name: draft.name.trim(),
      video_ids: draft.items.map((i) => i.id),
      headset_id: draft.headset_id,
    });
  };

  return (
    <Drawer
      title={
        <Space size={8}>
          <span>Ma séance</span>
          <Badge count={draft.items.length} overflowCount={30} color="#1d4ed8" />
        </Space>
      }
      open={open}
      onClose={onClose}
      width={Math.min(460, typeof window !== 'undefined' ? window.innerWidth - 24 : 460)}
      maskClosable={!submitting}
      footer={
        <Flex align="center" justify="space-between" gap="middle">
          <Typography.Text>
            Durée totale : <Typography.Text strong>{formatDuration(draft.totalDuration)}</Typography.Text>
            <Typography.Text type="secondary" style={{ marginLeft: 8 }}>/ 30 max</Typography.Text>
          </Typography.Text>
          <Space>
            <Button onClick={onClose} disabled={submitting}>Fermer</Button>
            <Button type="primary" icon={<SaveOutlined />} loading={submitting} onClick={save}>
              Enregistrer
            </Button>
          </Space>
        </Flex>
      }
    >
      {submitting && (
        <Flex align="center" gap={8} role="status" aria-live="polite" style={{ marginBottom: 12, padding: '8px 12px', background: '#eff6ff', borderRadius: 6 }}>
          <Spin size="small" />
          <Typography.Text style={{ color: '#1d4ed8' }}>Enregistrement de la séance…</Typography.Text>
        </Flex>
      )}

      <Flex vertical gap="middle">
        <div>
          <label htmlFor="session-name" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            Nom de la séance
          </label>
          <Input
            id="session-name"
            value={draft.name}
            onChange={(e) => draft.setName(e.target.value)}
            maxLength={120}
            showCount
            disabled={submitting}
            placeholder="Ex. Atelier découverte — 2nde C"
            aria-invalid={touched && !!nameErr}
            aria-describedby={touched && nameErr ? 'session-name-err' : undefined}
            status={touched && nameErr ? 'error' : ''}
          />
          {touched && nameErr && (
            <Typography.Text type="danger" id="session-name-err" role="alert" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
              {nameErr}
            </Typography.Text>
          )}
        </div>

        <div>
          <label htmlFor="session-headset" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            Casque <Typography.Text type="secondary">(facultatif)</Typography.Text>
          </label>
          <Select
            id="session-headset"
            style={{ width: '100%' }}
            allowClear
            disabled={submitting}
            placeholder="Aucun / à définir"
            value={draft.headset_id ?? undefined}
            onChange={(val) => draft.setHeadset(val ?? null)}
            options={headsets.map((h) => ({ value: h.id, label: h.name }))}
          />
        </div>

        <div>
          <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
            Vidéos de la séance ({draft.items.length})
          </Typography.Text>
          <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
            L'icône crayon renomme l'étiquette locale de la vidéo dans cette séance (le catalogue n'est pas modifié).
          </Typography.Text>

          {touched && vidsErr && (
            <Alert type="error" message={vidsErr} role="alert" style={{ marginBottom: 8 }} showIcon />
          )}

          {draft.items.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucune vidéo sélectionnée. Parcourez le catalogue et ajoutez-en." />
          ) : (
            <Flex vertical gap={8}>
              {draft.items.map((item, idx) => (
                <DraftRow
                  key={item.id}
                  item={item}
                  index={idx}
                  total={draft.items.length}
                  disabled={submitting}
                  onMove={(dir) => draft.move(item.id, dir)}
                  onRemove={() => draft.remove(item.id)}
                  onRename={(title) => draft.rename(item.id, title)}
                />
              ))}
            </Flex>
          )}
        </div>

        {createSession.error && (
          <Alert
            type="error"
            showIcon
            role="alert"
            message="L'enregistrement a échoué"
            description={
              <Flex vertical gap={4}>
                <Typography.Text>{getErrorMessage(createSession.error, 'Veuillez réessayer.')}</Typography.Text>
                {(createSession.error as ApiError).body?.details?.length ? (
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12 }}>
                    {(createSession.error as ApiError).body!.details!.map((d, i) => (
                      <li key={i}>{d.message}</li>
                    ))}
                  </ul>
                ) : null}
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>Le brouillon est conservé.</Typography.Text>
              </Flex>
            }
          />
        )}

        {draft.items.length > 0 && (
          <Button danger type="text" block disabled={submitting} onClick={() => { draft.clear(); setTouched(false); }}>
            Vider la séance
          </Button>
        )}
      </Flex>
    </Drawer>
  );
}

function DraftRow({
  item,
  index,
  total,
  disabled,
  onMove,
  onRemove,
  onRename,
}: {
  item: DraftItem;
  index: number;
  total: number;
  disabled: boolean;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onRename: (title: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);

  useEffect(() => {
    if (!editing) setTitle(item.title);
  }, [item.title, editing]);

  const commit = () => {
    const next = title.trim();
    onRename(next || item.title);
    setEditing(false);
  };
  const cancel = () => {
    setTitle(item.title);
    setEditing(false);
  };

  return (
    <Flex align="center" gap={8} style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: 8, background: '#fff' }}>
      <span aria-hidden style={numberBadge}>{index + 1}</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        {editing ? (
          <Input
            size="small"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onPressEnter={commit}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                cancel();
              }
            }}
            onBlur={commit}
            maxLength={200}
            aria-label={`Renommer « ${item.title} »`}
          />
        ) : (
          <>
            <Typography.Text ellipsis={{ tooltip: item.title }} style={{ display: 'block', fontSize: 14, fontWeight: 500 }}>
              {item.title}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {formatDuration(item.duration_seconds)}
            </Typography.Text>
          </>
        )}
      </div>

      <Space size={2}>
        {editing ? (
          <Tooltip title="Valider">
            <Button size="small" type="text" icon={<CheckOutlined />} onClick={commit} aria-label="Valider le nouveau titre" />
          </Tooltip>
        ) : (
          <>
            <Tooltip title="Renommer">
              <Button size="small" type="text" icon={<EditOutlined />} disabled={disabled} onClick={() => setEditing(true)} aria-label={`Renommer « ${item.title} »`} />
            </Tooltip>
            <Tooltip title="Monter">
              <Button size="small" type="text" icon={<ArrowUpOutlined />} disabled={disabled || index === 0} onClick={() => onMove(-1)} aria-label={`Déplacer « ${item.title} » vers le haut`} />
            </Tooltip>
            <Tooltip title="Descendre">
              <Button size="small" type="text" icon={<ArrowDownOutlined />} disabled={disabled || index === total - 1} onClick={() => onMove(1)} aria-label={`Déplacer « ${item.title} » vers le bas`} />
            </Tooltip>
          </>
        )}
        <Tooltip title="Retirer">
          <Button size="small" type="text" danger icon={<DeleteOutlined />} disabled={disabled} onClick={onRemove} aria-label={`Retirer « ${item.title} » de la séance`} />
        </Tooltip>
      </Space>
    </Flex>
  );
}
