import { getConfig, ghlFetch } from './client'
import { fetchPage, type PageResult } from './paginate'

export interface GhlContact {
  id: string
  locationId?: string
  firstName?: string
  lastName?: string
  contactName?: string
  email?: string
  phone?: string
  tags?: string[]
  source?: string
  country?: string
  timezone?: string
  assignedTo?: string
  dnd?: boolean
  customFields?: Array<{ id?: string; key?: string; value?: unknown; field_value?: unknown }>
  dateAdded?: string
  dateUpdated?: string
  [k: string]: unknown
}

export interface SearchContactsParams {
  query?: string
  pageLimit?: number
  startAfterId?: string | null
  filters?: Record<string, unknown>
}

export async function searchContactsPage(params: SearchContactsParams = {}): Promise<PageResult<GhlContact>> {
  const { locationId } = getConfig()
  return fetchPage<GhlContact>({
    basePath: `/contacts/`,
    arrayKey: 'contacts',
    cursorParam: 'startAfterId',
    cursorKey: 'lastId',
    pageSize: params.pageLimit ?? 100,
    cursor: params.startAfterId,
    searchParams: {
      locationId,
      query: params.query,
    },
  })
}

export async function getContact(id: string): Promise<GhlContact | null> {
  try {
    const data = await ghlFetch<{ contact?: GhlContact } & GhlContact>(`/contacts/${id}`)
    return (data.contact ?? data) as GhlContact
  } catch (err) {
    if ((err as { status?: number }).status === 404) return null
    throw err
  }
}

export interface UpdateContactInput {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  tags?: string[]
  source?: string
  country?: string
  timezone?: string
  customFields?: Array<{ id?: string; key?: string; field_value: string | number | boolean }>
}

export async function updateContact(id: string, input: UpdateContactInput): Promise<GhlContact> {
  const data = await ghlFetch<{ contact?: GhlContact } & GhlContact>(`/contacts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
  return (data.contact ?? data) as GhlContact
}

export async function deleteContact(id: string): Promise<void> {
  await ghlFetch(`/contacts/${id}`, { method: 'DELETE' })
}

export interface CustomFieldDef {
  id: string
  name: string
  fieldKey?: string
  dataType?: string
  position?: number
  picklistOptions?: string[]
}

export async function listCustomFields(): Promise<CustomFieldDef[]> {
  const { locationId } = getConfig()
  const data = await ghlFetch<{ customFields?: CustomFieldDef[] }>(
    `/locations/${locationId}/customFields`
  )
  return data.customFields ?? []
}
