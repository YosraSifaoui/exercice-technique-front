import { AutoComplete, Col, Input, Row, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { Audience, Headset, Job } from '../lib/types';

export interface FiltersValue {
  query: string;
  job: string | undefined;
  headset: string | undefined;
  audience: string | undefined;
}

interface FiltersBarProps {
  value: FiltersValue;
  onChange: (next: FiltersValue) => void;
  jobs: Job[] | undefined;
  headsets: Headset[] | undefined;
  audiences: Audience[] | undefined;
}

export function FiltersBar({ value, onChange, jobs, headsets, audiences }: FiltersBarProps) {
  return (
    <Row gutter={[12, 12]}>
      <Col xs={24} md={10}>
        <label htmlFor="video-search" className="sr-only">Rechercher par titre</label>
        <Input
          id="video-search"
          allowClear
          prefix={<SearchOutlined aria-hidden />}
          placeholder="Rechercher par titre…"
          value={value.query}
          onChange={(e) => onChange({ ...value, query: e.target.value })}
        />
      </Col>
      <Col xs={24} sm={8} md={4}>
        <label htmlFor="filter-job" className="sr-only">Filtrer par métier</label>
        <AutoComplete
          id="filter-job"
          style={{ width: '100%' }}
          placeholder="Métier (ROME)"
          allowClear
          value={value.job ?? ''}
          options={(jobs ?? []).map((j) => ({ value: j.code, label: `${j.label} (${j.code})` }))}
          filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          onChange={(val) => onChange({ ...value, job: val || undefined })}
        />
      </Col>
      <Col xs={12} sm={8} md={5}>
        <label htmlFor="filter-headset" className="sr-only">Filtrer par casque</label>
        <Select
          id="filter-headset"
          style={{ width: '100%' }}
          allowClear
          placeholder="Casque disponible"
          value={value.headset}
          onChange={(val) => onChange({ ...value, headset: val ?? undefined })}
          options={(headsets ?? []).map((h) => ({ value: h.id, label: h.name }))}
          notFoundContent="—"
        />
      </Col>
      <Col xs={12} sm={8} md={5}>
        <label htmlFor="filter-audience" className="sr-only">Filtrer par public</label>
        <Select
          id="filter-audience"
          style={{ width: '100%' }}
          allowClear
          placeholder="Public"
          value={value.audience}
          onChange={(val) => onChange({ ...value, audience: val ?? undefined })}
          options={(audiences ?? []).map((a) => ({ value: a.id, label: a.label }))}
          notFoundContent="—"
        />
      </Col>
    </Row>
  );
}
