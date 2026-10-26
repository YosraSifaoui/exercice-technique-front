import { useEffect, useMemo, useState } from 'react';
import { Col, Flex, Pagination, Row, Typography } from 'antd';
import { useDraft } from '../lib/draftStore';
import { useAudiencesQuery, useHeadsetsQuery, useJobsQuery, useVideosQuery } from '../lib/queries';
import { getErrorMessage } from '../lib/api';
import { VideoCard } from './VideoCard';
import { FiltersBar, type FiltersValue } from './FiltersBar';
import { EmptyState, ErrorState, LoadingSpinner } from './States';
import type { Video } from '../lib/types';

const PER_PAGE = 12;

export function CataloguePage() {
  const [filters, setFilters] = useState<FiltersValue>({ query: '', job: undefined, headset: undefined, audience: undefined });
  const [page, setPage] = useState(1);

  // Debounce the search so we don't fire a request per keystroke.
  const [search, setSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setSearch(filters.query.trim()), 300);
    return () => clearTimeout(t);
  }, [filters.query]);

  // Reset to page 1 when any filter changes.
  useEffect(() => setPage(1), [filters.query, filters.job, filters.headset, filters.audience]);

  const jobsQuery = useJobsQuery();
  const headsetsQuery = useHeadsetsQuery();
  const audiencesQuery = useAudiencesQuery();

  const videosQuery = useVideosQuery({
    q: search || undefined,
    job: filters.job,
    headset: filters.headset,
    audience: filters.audience,
    page,
    per_page: PER_PAGE,
  });

  const { add, remove, items } = useDraft();
  const selectedIds = useMemo(() => new Set(items.map((i) => i.id)), [items]);
  const atLimit = items.length >= 30;

  const toggle = (video: Video) => {
    if (selectedIds.has(video.id)) {
      remove(video.id);
    } else if (items.length < 30) {
      add({
        id: video.id,
        title: video.title,
        duration_seconds: video.duration_seconds,
        thumbnail_url: video.thumbnail_url,
      });
    }
  };

  const meta = videosQuery.data?.meta;
  const total = meta?.total ?? 0;

  return (
    <Flex vertical gap="middle">
      <FiltersBar value={filters} onChange={setFilters} jobs={jobsQuery.data?.data} headsets={headsetsQuery.data?.data} audiences={audiencesQuery.data?.data} />

      {videosQuery.isFetching ? (
        <LoadingSpinner label="Chargement des vidéos…" />
      ) : videosQuery.error && !videosQuery.data ? (
        <ErrorState message={getErrorMessage(videosQuery.error, 'Impossible de charger les vidéos.')} onRetry={() => videosQuery.refetch()} />
      ) : videosQuery.data && videosQuery.data.data.length === 0 ? (
        <EmptyState title="Aucune vidéo ne correspond" description="Essayez de modifier ou de retirer un filtre." />
      ) : (
        <>
          <Typography.Text type="secondary">
            {total} vidéo{total > 1 ? 's' : ''} trouvée{total > 1 ? 's' : ''}
          </Typography.Text>
          <Row gutter={[16, 16]}>
            {videosQuery.data?.data.map((video) => (
              <Col key={video.id} xs={24} sm={12} lg={8} xl={6}>
                <VideoCard
                  video={video}
                  selected={selectedIds.has(video.id)}
                  onToggle={toggle}
                  disabled={atLimit && !selectedIds.has(video.id)}
                />
              </Col>
            ))}
          </Row>
          {meta && meta.total_pages > 1 && (
            <Flex justify="center">
              <Pagination
                current={meta.page}
                pageSize={meta.per_page}
                total={meta.total}
                onChange={setPage}
                showSizeChanger={false}
                aria-label="Pagination des vidéos"
              />
            </Flex>
          )}
        </>
      )}
    </Flex>
  );
}
