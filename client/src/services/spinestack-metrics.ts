import { isAxiosError } from 'axios'
import { api } from '@/modules/api'
import type { Metric, Tag } from '@/types/spinestack-metrics'
import { type ErrorResponse, SpineStackApiError } from '@/types/spinestack-response'

export type MetricKey = 'disk.free' | 'disk.total' | 'system.cpu.count' |
'system.cpu.usage' | 'spinestack.books' | 'spinestack.books.covers' |
'spinestack.libraries' | 'spinestack.users.avatars' | 'jvm.info' |
'application.ready.time' | 'application.started.time' | 'spinestack.users' |
'process.uptime' | 'spinestack.tasks.execution'

export interface GetMetricParams {
  metric: MetricKey
  tags?: Tag[]
}

export async function getMetric({ metric, tags }: GetMetricParams): Promise<Metric> {
  try {
    const { data } = await api.get<Metric>(`actuator/metrics/${metric}`, {
      params: {
        tag: tags?.map(t => `${t.key}:${t.value}`),
      },
      paramsSerializer: { indexes: null },
    })

    return data
  } catch (e) {
    if (isAxiosError<ErrorResponse>(e) && e.response?.data) {
      throw new SpineStackApiError(e.response.data)
    }

    throw e
  }
}
