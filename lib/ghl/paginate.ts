import { ghlFetch } from './client'

export interface PaginateParams {
  basePath: string
  searchParams?: Record<string, string | number | boolean | undefined>
  pageSize?: number
  arrayKey: string
  cursorKey?: string
  cursorParam?: string
}

export interface PageResult<T> {
  items: T[]
  nextCursor: string | null
  total: number | null
}

export async function fetchPage<T>(params: PaginateParams & { cursor?: string | null }): Promise<PageResult<T>> {
  const qs = new URLSearchParams()
  if (params.pageSize) qs.set('limit', String(params.pageSize))
  if (params.cursor && params.cursorParam) qs.set(params.cursorParam, params.cursor)
  if (params.searchParams) {
    for (const [k, v] of Object.entries(params.searchParams)) {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
    }
  }
  const path = `${params.basePath}${params.basePath.includes('?') ? '&' : '?'}${qs.toString()}`
  const data = await ghlFetch<Record<string, unknown>>(path)
  const items = (data[params.arrayKey] as T[]) ?? []
  const meta = (data['meta'] as Record<string, unknown> | undefined) ?? undefined
  let nextCursor: string | null = null
  if (params.cursorKey) {
    nextCursor = (data[params.cursorKey] as string | undefined) ?? null
  }
  if (!nextCursor && meta && typeof meta.nextPageUrl === 'string') {
    const url = new URL(meta.nextPageUrl)
    nextCursor =
      (params.cursorParam && url.searchParams.get(params.cursorParam)) ||
      url.searchParams.get('startAfterId') ||
      url.searchParams.get('startAfter') ||
      null
  }
  const total =
    typeof (meta?.total as number | undefined) === 'number'
      ? (meta!.total as number)
      : typeof (data['total'] as number | undefined) === 'number'
        ? (data['total'] as number)
        : null
  return { items, nextCursor, total }
}
