// hr.ts
// API client for interacting with Human Resources (HR) endpoints
import { getAuthHeaders } from './auth'; // Assuming this utility exists
import { API_BASE_URL } from './api'; // Assuming this constant exists

// --- Generic Interfaces ---

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// --- Staff Endpoints ---

/**
 * Interface for active staff members, typically used in dropdowns/selection lists.
 * Corresponds to the response structure of GET /hr/staffs/active.
 */
export interface ActiveStaff {
  id: number;
  name: string;
  role: string;
}

/**
 * Fetches all active staff members.
 * Corresponds to: GET /hr/staffs/active
 */
export async function getActiveStaffs(): Promise<ApiResponse<ActiveStaff[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/hr/staffs/active`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch active staffs');
    }

    const result: { message: string; staffs: ActiveStaff[] } = await response.json();
    return { data: result.staffs };
  } catch (error: any) {
    console.error('Error fetching active staffs:', error.message);
    return { error: error.message };
  }
}

// --- Attendance Endpoints ---

/**
 * Interface for a detailed attendance record, including joined staff details.
 * Note: Dates and DateTimes are handled as ISO 8601 strings in TypeScript.
 */
export interface Attendance {
  id: number;
  staff_id: number | null;
  date: string | null; // Date string (YYYY-MM-DD)
  checkin_time: string | null; // DateTime string (ISO 8601)
  checkout_time: string | null; // DateTime string (ISO 8601)
  status: string | null; // e.g., 'present', 'absent', 'late'
  updated_by: number | null;

  // Joined fields
  staff_name: string | null;
  staff_role: string | null;
  updated_by_name: string | null;
  updated_by_role: string | null;
}

/**
 * Payload for creating a new attendance record.
 * staff_id and date are mandatory based on the FastAPI definition.
 */
export interface AttendanceCreatePayload {
  staff_id: number;
  date: string; // YYYY-MM-DD
  checkin_time?: string | null; // Optional ISO 8601
  checkout_time?: string | null; // Optional ISO 8601
  status?: string | null;
}

/**
 * Payload for partially updating an attendance record.
 * All fields are optional.
 */
export interface AttendanceUpdatePayload {
  staff_id?: number;
  date?: string; // YYYY-MM-DD
  checkin_time?: string | null; // ISO 8601
  checkout_time?: string | null; // ISO 8601
  status?: string | null;
}

/**
 * Fetches all attendance records with detailed staff information.
 * Corresponds to: GET /hr/attendance
 */
export async function getAllAttendance(): Promise<ApiResponse<Attendance[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/hr/attendance`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch all attendance records');
    }

    const data: Attendance[] = await response.json();
    return { data };
  } catch (error: any) {
    console.error('Error fetching all attendance:', error.message);
    return { error: error.message };
  }
}

/**
 * Fetches a single attendance record by ID.
 * Corresponds to: GET /hr/attendance/{id}
 */
export async function getAttendanceById(id: number): Promise<ApiResponse<Attendance>> {
  try {
    const response = await fetch(`${API_BASE_URL}/hr/attendance/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Failed to fetch attendance record ${id}`);
    }

    const data: Attendance = await response.json();
    return { data };
  } catch (error: any) {
    console.error(`Error fetching attendance ${id}:`, error.message);
    return { error: error.message };
  }
}

/**
 * Creates a new attendance record.
 * Corresponds to: POST /hr/attendance
 */
export async function createAttendance(
  payload: AttendanceCreatePayload,
): Promise<ApiResponse<{ message: string; attendance: Attendance }>> {
  try {
    console.log(payload);
    
    const response = await fetch(`${API_BASE_URL}/hr/attendance`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create attendance record');
    }

    const data: { message: string; attendance: Attendance } = await response.json();
    return { data };
  } catch (error: any) {
    console.error('Error creating attendance:', error.message);
    return { error: error.message };
  }
}

/**
 * Updates an existing attendance record.
 * Corresponds to: PATCH /hr/attendance/{id}
 */
export async function updateAttendance(
  id: number,
  payload: AttendanceUpdatePayload,
): Promise<ApiResponse<{ message: string; attendance: Attendance }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/hr/attendance/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Failed to update attendance record ${id}`);
    }

    const data: { message: string; attendance: Attendance } = await response.json();
    return { data };
  } catch (error: any) {
    console.error(`Error updating attendance ${id}:`, error.message);
    return { error: error.message };
  }
}

/**
 * Deletes an attendance record by ID.
 * Corresponds to: DELETE /hr/attendance/{id}
 */
export async function deleteAttendance(
  id: number,
): Promise<ApiResponse<{ message: string; id: number }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/hr/attendance/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Failed to delete attendance record ${id}`);
    }

    const data: { message: string; id: number } = await response.json();
    return { data };
  } catch (error: any) {
    console.error(`Error deleting attendance ${id}:`, error.message);
    return { error: error.message };
  }
}


export async function checkoutAttendance(
  staff_id: number,
  date: string,
  checkout_time: string,
  status?: string
): Promise<ApiResponse<{ message: string; attendance: Attendance }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/hr/attendance/checkout`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ staff_id, date, checkout_time, status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to update checkout");
    }

    const data: { message: string; attendance: Attendance } = await response.json();
    return { data };
  } catch (error: any) {
    console.error("Error during checkout:", error.message);
    return { error: error.message };
  }
}