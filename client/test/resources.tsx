import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { useApiResource } from '../src/hooks/useApiResource';
import api from '../src/services/api';

// Browser-only regression harness, served by Vite during UI tests and never
// imported by the application. Responses are deliberately delivered out of order.
export async function runResourceChecks() {
  type Data = { label: string };
  const pending: {
    config: InternalAxiosRequestConfig;
    resolve: (response: AxiosResponse<Data>) => void;
  }[] = [];
  const previousAdapter = api.defaults.adapter;
  api.defaults.adapter = (config) =>
    new Promise<AxiosResponse<Data>>((resolve) => {
      pending.push({ config, resolve });
    });
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  let snapshot: ReturnType<typeof useApiResource<Data>> | undefined;
  const currentLabel = () => snapshot?.data?.label;
  const Probe = ({ url }: { url: string }) => {
    snapshot = useApiResource<Data>(url, 'Test request failed');
    return null;
  };
  const until = async (condition: () => boolean) => {
    for (let i = 0; i < 100; i++) {
      if (condition()) return;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    throw new Error('Resource regression check timed out');
  };
  const respond = (index: number, label: string) =>
    pending[index].resolve({
      data: { label },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: pending[index].config,
    });
  try {
    flushSync(() => root.render(<Probe url="/test-resource/first" />));
    await until(() => pending.length === 1);
    flushSync(() => root.render(<Probe url="/test-resource/second" />));
    await until(() => pending.length === 2);
    respond(1, 'latest');
    await until(() => snapshot?.data?.label === 'latest');
    respond(0, 'stale');
    await new Promise((resolve) => setTimeout(resolve, 20));
    if (currentLabel() !== 'latest') throw new Error('Stale data overwrote the current URL');

    if (!snapshot) throw new Error('Resource hook did not render');
    const firstRefresh = snapshot.refresh();
    await until(() => pending.length === 3);
    const mutationRefresh = snapshot.refresh();
    await until(() => pending.length === 4);
    respond(3, 'after mutation');
    await mutationRefresh;
    await until(() => snapshot?.data?.label === 'after mutation');
    respond(2, 'before mutation');
    await firstRefresh;
    if (currentLabel() !== 'after mutation') throw new Error('Refresh reused an obsolete response');

    const leaving = snapshot.refresh();
    await until(() => pending.length === 5);
    flushSync(() => root.unmount());
    if (!pending[4].config.signal?.aborted) throw new Error('Unmount did not cancel the request');
    respond(4, 'unmounted');
    await leaving;
    await snapshot.refresh();
    if (pending.length !== 5) throw new Error('A late save restarted a request after unmount');
    return [
      'URL changes ignore stale data',
      'Mutation refresh starts a new request',
      'Unmount cancels requests',
    ];
  } finally {
    if (host.isConnected) {
      // Calling unmount twice is harmless and covers failures before the check.
      root.unmount();
      host.remove();
    }
    api.defaults.adapter = previousAdapter;
  }
}
