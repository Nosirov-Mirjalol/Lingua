import { apiClient } from '../../client';
import { type Group } from '../teacher/group.type';

export interface AdminGroupCreatePayload {
  name: string;
  course: number;
  teacher: number;
  start_date: string;
  start_time: string;
  end_time: string;
  week_days: string;
  week_days_type: 'ODD' | 'EVEN' | 'CUSTOM';
  status: 'active' | 'completed';
}

export type AdminGroupUpdatePayload = Partial<AdminGroupCreatePayload>;

export const getAdminGroups = async (): Promise<Group[]> => {
  return await apiClient.get<Group[]>('/api/groups/list-admin/');
};

const DEFAULT_WEEK_DAYS: Record<AdminGroupCreatePayload['week_days_type'], string> = {
  ODD: 'Mon,Wed,Fri',
  EVEN: 'Tue,Thu,Sat',
  CUSTOM: '',
};

const normalizeWeekDaysType = (
  value: AdminGroupCreatePayload['week_days_type'],
  format: 'lower' | 'upper'
) => (format === 'lower' ? value.toLowerCase() : value);

const isWeekDaysTypeError = (error: unknown) => {
  const data = (error as { data?: unknown; response?: { data?: unknown }; message?: string })?.data
    ?? (error as { response?: { data?: unknown } })?.response?.data
    ?? (error as { message?: string })?.message
    ?? error;

  return JSON.stringify(data).includes('week_days_type');
};

export const createAdminGroup = async (payload: AdminGroupCreatePayload): Promise<Group> => {
  const ensureSeconds = (t: string) => (t.split(':').length === 2 ? `${t}:00` : t);

  const buildPayload = (weekDaysTypeFormat: 'lower' | 'upper') => ({
    name: payload.name,
    course: Number(payload.course),
    teacher: Number(payload.teacher),
    start_date: payload.start_date,
    start_time: ensureSeconds(payload.start_time),
    end_time: ensureSeconds(payload.end_time),
    week_days: payload.week_days || DEFAULT_WEEK_DAYS[payload.week_days_type],
    week_days_type: normalizeWeekDaysType(payload.week_days_type, weekDaysTypeFormat),
    status: payload.status
  });

  try {
    return await apiClient.post<Group>('/api/groups/create-admin/', buildPayload('lower'));
  } catch (error) {
    if (!isWeekDaysTypeError(error)) throw error;
    return await apiClient.post<Group>('/api/groups/create-admin/', buildPayload('upper'));
  }
};

export const updateAdminGroup = async (id: number, payload: Partial<AdminGroupCreatePayload>): Promise<Group> => {
  return await apiClient.patch<Group>(`/api/groups/update-delete-admin/${id}/`, payload);
};

export const deleteAdminGroup = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/groups/update-delete-admin/${id}/`);
};

export const adminGroupService = {
  getGroups: getAdminGroups,
  createGroup: createAdminGroup,
  updateGroup: updateAdminGroup,
  deleteGroup: deleteAdminGroup
};
