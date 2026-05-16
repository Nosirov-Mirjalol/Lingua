import { apiClient } from '../../client';
import { Group } from '../teacher/group.type';

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

export const getAdminGroups = async (): Promise<Group[]> => {
  return await apiClient.get<Group[]>('/api/groups/list-admin/');
};

export const createAdminGroup = async (payload: AdminGroupCreatePayload): Promise<Group> => {
  const ensureSeconds = (t: string) => (t.split(':').length === 2 ? `${t}:00` : t);
  
  // Clean up payload to send only what is strictly necessary
  const finalPayload = {
    name: payload.name,
    course: Number(payload.course),
    teacher: Number(payload.teacher),
    start_date: payload.start_date,
    start_time: ensureSeconds(payload.start_time),
    end_time: ensureSeconds(payload.end_time),
    week_days: payload.week_days,
    week_days_type: payload.week_days_type,
    status: payload.status
  };

  return await apiClient.post<Group>('/api/groups/create-admin/', finalPayload);
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
