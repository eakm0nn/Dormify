import { useState } from 'react';
import { useApiResource } from './useApiResource';
import api from '../services/api';
interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  snapshot: number;
  hasNext: boolean;
}
export function useHistoryResource<T>(name: string, fallback: string, query = '', enabled = true) {
  const [paging, setPaging] = useState({
    page: 0,
    size: 10,
    query,
    snapshot: undefined as number | undefined,
    revision: 0,
  });
  const current =
    paging.query === query ? paging : { ...paging, page: 0, query, snapshot: undefined };
  const makeUrl = (page: number, size: number, snapshot?: number) => {
    const params = new URLSearchParams(query.replace(/^\?/, ''));
    params.set('page', String(page));
    params.set('limit', String(size));
    if (snapshot !== undefined) params.set('snapshot', String(snapshot));
    params.set('revision', String(current.revision));
    return '/api/operations/history/' + name + '?' + params;
  };
  const resource = useApiResource<Page<T>>(
    enabled ? makeUrl(current.page, current.size, current.snapshot) : null,
    fallback,
  );
  const snapshot = resource.data?.snapshot ?? current.snapshot;
  const exportAll = async () => {
    const rows: T[] = [];
    let page = 0,
      cutoff = snapshot,
      hasNext = true;
    while (hasNext) {
      const { data } = await api.get<Page<T>>(makeUrl(page, 500, cutoff));
      cutoff = data.snapshot;
      rows.push(...data.items);
      hasNext = data.hasNext;
      page++;
    }
    return rows;
  };
  const refresh = async () =>
    setPaging({ ...current, page: 0, snapshot: undefined, revision: current.revision + 1 });
  return {
    data: resource.data?.items ?? null,
    loading: resource.loading,
    error: resource.error,
    refresh,
    remote: {
      page: current.page,
      pageSize: current.size,
      total: resource.data?.total ?? 0,
      onPageChange: (page: number) => setPaging({ ...current, page, snapshot }),
      onPageSizeChange: (size: number) => setPaging({ ...current, page: 0, size, snapshot }),
      exportAll,
    },
  };
}
