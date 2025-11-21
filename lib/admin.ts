// projectManager.ts
// API client for interacting with project manager and staff tasking endpoints
import { getAuthHeaders } from './auth';
import { API_BASE_URL } from './api';

// // --- EXISTING INTERFACES ---

// // Interface for Order data (based on OrderCreate and OrderUpdate Pydantic models)
// interface Order {
//   id?: number;
//   customer_id: number;
//   category?: string | null;
//   project_commit?: string | null;
//   start_on?: string | null;
//   completion_date?: string | null;
//   completed_on?: string | null;
//   status?: string | null;
//   amount?: number | null;
//   description?: string | null;
//   created_by_staff_name?: string | null;
//   created_by?: number | null;
//   created_on?: string | null;
//   updated_by?: number | null;
//   updated_on?: string | null;
// }

// // Interface for Order update payload (based on OrderUpdate Pydantic model)
// interface OrderUpdate {
//   customer_id?: number | null;
//   category?: string | null;
//   project_commit?: string | null;
//   start_on?: string | null;
//   completion_date?: string | null;
//   completed_on?: string | null;
//   status?: string | null;
//   amount?: number | null;
//   description?: string | null;
// }

// // Interface for API response (generic for success/error handling)
// interface ApiResponse<T> {
//   data?: T;
//   error?: string;
// }


// // --- NEW INTERFACES ---

// // ====================================================================================
// // ONLY CHANGE IS HERE: Corrected the Staff interface to match your API response.
// // - 'staff_name' was changed to 'name'.
// // - 'address' and 'status' were removed as they are not present in the staff list API call.
// // This is the only modification in the entire file.
// // ====================================================================================
// export interface Staff {
//   id: number;
//   name: string; // Was 'staff_name'
//   role: string;
// }

// // Interface for the payload to assign a task (based on the AssignTask Pydantic model)
// export interface AssignTaskPayload {
//   order_id: number;
//   staff_id: number;
//   description?: string | null;
//   estimated_completion?: string | null; // e.g., "2024-12-31T23:59:59Z"
// }

// // Interface for a Task object (based on the returned task from the /tasks/assign API)
// // This should match the columns in your 'tasks' table
// export interface Task {
//   id: number;
//   assigned_by: number;
//   assigned_to: number;
//   assigned_on: string; // Typically an ISO 8601 timestamp string
//   completion_time?: string | null;
//   order_id: number;
//   description?: string | null;
//   status: string;
// }


// // --- EXISTING FUNCTIONS ---

// // Fetch all orders
// export async function getOrders(): Promise<ApiResponse<Order[]>> {
//   try {
//     const response = await fetch(`${API_BASE_URL}/admin/orders`, {
//       method: 'GET',
//       headers: getAuthHeaders(),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || 'Failed to fetch orders');
//     }

//     const data: Order[] = await response.json();
//     return { data };
//   } catch (error: any) {
//     console.error('Error fetching orders:', error.message);
//     return { error: error.message };
//   }
// }

// // Fetch a single order by ID
// export async function getOrder(orderId: number): Promise<ApiResponse<Order>> {
//   try {
//     const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
//       method: 'GET',
//       headers: getAuthHeaders(),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || 'Failed to fetch order');
//     }

//     const data: Order = await response.json();
//     return { data };
//   } catch (error: any) {
//     console.error(`Error fetching order ${orderId}:`, error.message);
//     return { error: error.message };
//   }
// }

// // Update an order by ID
// export async function updateOrder(orderId: number, payload: OrderUpdate): Promise<ApiResponse<Order>> {
//   try {
//     const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
//       method: 'PUT',
//       headers: getAuthHeaders(),
//       body: JSON.stringify(payload),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || 'Failed to update order');
//     }

//     const data: Order = await response.json();
//     return { data };
//   } catch (error: any) {
//     console.error(`Error updating order ${orderId}:`, error.message);
//     return { error: error.message };
//   }
// }

// // Delete an order by ID
// export async function deleteOrder(orderId: number): Promise<ApiResponse<{ message: string; rows_affected: number }>> {
//   try {
//     const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
//       method: 'DELETE',
//       headers: getAuthHeaders(),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || 'Failed to delete order');
//     }

//     const data = await response.json();
//     return { data };
//   } catch (error: any) {
//     console.error(`Error deleting order ${orderId}:`, error.message);
//     return { error: error.message };
//   }
// }


// // --- NEW FUNCTIONS ---

// /**
//  * Fetches all staff members with an 'active' status.
//  * Corresponds to: GET /staffs/active
//  */
//  export interface Staff {
//   id: number;
//   name: string; // Changed from 'staff_name' to match the API
//   role: string;
// }

// export async function getActiveStaffs(): Promise<ApiResponse<{ staffs: Staff[] }>> {
//   try {
//     const response = await fetch(`${API_BASE_URL}/admin/staffs/active`, {
    
//       method: 'GET',
//       headers: getAuthHeaders(),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || 'Failed to fetch active staff');
//     }

//     const data: { message: string, staffs: Staff[] } = await response.json();
//     console.log("this is staff response data", data);
    
//     return { data };
//   } catch (error: any) {
//     console.error('Error fetching active staff:', error.message);
//     return { error: error.message };
//   }
// }

// /**
//  * Assigns a new task to a staff member for a specific order.
//  * Corresponds to: POST /tasks/assign
//  * @param payload - The data required to assign the task.
//  */
// export async function assignTask(payload: AssignTaskPayload): Promise<ApiResponse<{ task: Task }>> {
//   try {
//     console.log(payload);
    
//     const response = await fetch(`${API_BASE_URL}/admin/tasks/assign`, {
//       method: 'POST',
//       headers: getAuthHeaders(), // getAuthHeaders should include 'Content-Type': 'application/json'
//       body: JSON.stringify(payload),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || 'Failed to assign task');
//     }

//     // The API returns { message: string, task: Task }, we extract the whole object
//     const data: { message: string, task: Task } = await response.json();
//     return { data };
//   } catch (error: any) {
//     console.error('Error assigning task:', error.message);
//     return { error: error.message };
//   }
// }



// /**
//  * Interface for a detailed task object from the GET /admin/tasks endpoint.
//  * This includes nested objects for staff details.
//  */

//  export interface TaskStaffInfo {
//   id: number | null;
//   staff_name: string | null;
//   role: string | null;
// }

//  export interface DetailedTask {
//   id: number;
//   order_id: number;
//   task_description: string | null;
//   status: string;
//   assigned_on: string;
//   completion_time: string | null;
//   assigned_by: TaskStaffInfo;
//   assigned_to: TaskStaffInfo;
//   updated_by: TaskStaffInfo | null;
// }

// /**
//  * Fetches all tasks with detailed, nested information about the staff involved.
//  * Corresponds to: GET /tasks
//  */
//  export async function getAllTasks(): Promise<ApiResponse<DetailedTask[]>> {
//   try {
//     // Note: The endpoint is /admin/tasks based on the existing pattern in this file.
//     const response = await fetch(`${API_BASE_URL}/admin/tasks`, {
//       method: 'GET',
//       headers: getAuthHeaders(),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || 'Failed to fetch tasks');
//     }

//     const data: DetailedTask[] = await response.json();
//     return { data };
//   } catch (error: any) {
//     console.error('Error fetching all tasks:', error.message);
//     return { error: error.message };
//   }
// }


// export interface EditTaskPayload {
//   completion_time?: string | null; // e.g., "2024-12-31T23:59:59"
//   task_description?: string | null;
//   status?: string | null; // e.g., "in_progress", "completed"
// }

// export async function editTask(
//   taskId: number,
//   payload: EditTaskPayload
// ): Promise<ApiResponse<{ message: string; task: Task }>> {
//   try {
//     const response = await fetch(`${API_BASE_URL}/admin/tasks/${taskId}`, {
//       method: 'PATCH', // Use PATCH for partial updates
//       headers: getAuthHeaders(),
//       body: JSON.stringify(payload),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || 'Failed to update task');
//     }

//     // The API returns { message: string, task: Task }, we extract the whole object
//     const data: { message: string; task: Task } = await response.json();
//     return { data };
//   } catch (error: any) {
//     console.error(`Error updating task ${taskId}:`, error.message);
//     return { error: error.message };
//   }
// }


// ---------------------------------------------------new --------------------------------------------------------------------------------


// Interface for Order data (based on OrderCreate and OrderUpdate Pydantic models)
export interface Order {
  id: number
  customer_id: number
  category?: string
  project_committed_on?: string
  start_on?: string
  completion_date?: string
  completed_on?: string
  status?: string
  amount?: number
  description?: string
  created_on: string
  updated_on?: string
  created_by: number
  created_by_staff_name?: string

  // ✅ NEW FIELDS FROM BACKEND
  order_type?: string
  quantity?: number
  payment_status?: string
  amount_payed?: number
  payment_method?: string
  delivery_type?: string
  delivery_address?: string
  product_name?: string
  additional_amount?: number
  total_amount?: number
  account_name?: string
  generated_order_id?: string
}

export interface OrderById {
  id: number
  customer_id: number
  category?: string
  project_committed_on?: string
  start_on?: string
  completion_date?: string
  completed_on?: string
  status?: string
  amount?: number
  description?: string
  created_on: string
  updated_on?: string
  created_by: number
  created_by_staff_name?: string

  // ✅ Added customer details
  customer_name?: string
  mobile_number?: string
  whatsapp_number?: string
  address?: string

  // ✅ NEW FIELDS FROM BACKEND (include for consistency)
  order_type?: string
  quantity?: number
  payment_status?: string
  amount_payed?: number
  payment_method?: string
  delivery_type?: string
  delivery_address?: string
  product_name?: string
  additional_amount?: number
  total_amount?: number
  account_name?: string
  generated_order_id?: string
}

// Interface for Order update payload (based on OrderUpdate Pydantic model)
interface OrderUpdate {
  customer_id?: number | null;
  category?: string | null;
  project_commit?: string | null;
  start_on?: string | null;
  completion_date?: string | null;
  completed_on?: string | null;
  status?: string | null;
  amount?: number | null;
  description?: string | null;
  generated_order_id ?: string | null;
}

// Interface for API response (generic for success/error handling)
interface ApiResponse<T> {
  data?: T;
  error?: string;
}


// --- NEW INTERFACES ---

// ====================================================================================
// ONLY CHANGE IS HERE: Corrected the Staff interface to match your API response.
// - 'staff_name' was changed to 'name'.
// - 'address' and 'status' were removed as they are not present in the staff list API call.
// This is the only modification in the entire file.
// ====================================================================================
export interface Staff {
  id: number;
  name: string; // Was 'staff_name'
  role: string;
}

// Interface for the payload to assign a task (based on the AssignTask Pydantic model)
export interface AssignTaskPayload {
  order_id: number;
  staff_id: number;
  description?: string | null;
  estimated_completion?: string | null; // e.g., "2024-12-31T23:59:59Z"
}

// Interface for a Task object (based on the returned task from the /tasks/assign API)
// This should match the columns in your 'tasks' table
export interface Task {
  id: number;
  assigned_by: number;
  assigned_to: number;
  assigned_on: string; // Typically an ISO 8601 timestamp string
  completion_time?: string | null;
  order_id: number;
  description?: string | null;
  status: string;
}


// --- EXISTING FUNCTIONS ---

// Fetch all orders
export async function getOrders(): Promise<ApiResponse<Order[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/orders`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch orders');
    }

    const data: Order[] = await response.json();
    return { data };
  } catch (error: any) {
    console.error('Error fetching orders:', error.message);
    return { error: error.message };
  }
}

// Fetch a single order by ID
export async function getOrder(orderId: number): Promise<ApiResponse<Order>> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch order');
    }

    const data: Order = await response.json();
    return { data };
  } catch (error: any) {
    console.error(`Error fetching order ${orderId}:`, error.message);
    return { error: error.message };
  }
}

// Update an order by ID
export async function updateOrder(orderId: number, payload: OrderUpdate): Promise<ApiResponse<Order>> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update order');
    }

    const data: Order = await response.json();
    return { data };
  } catch (error: any) {
    console.error(`Error updating order ${orderId}:`, error.message);
    return { error: error.message };
  }
}

// Delete an order by ID
export async function deleteOrder(orderId: number): Promise<ApiResponse<{ message: string; rows_affected: number }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete order');
    }

    const data = await response.json();
    return { data };
  } catch (error: any) {
    console.error(`Error deleting order ${orderId}:`, error.message);
    return { error: error.message };
  }
}


// --- NEW FUNCTIONS ---

/**
 * Fetches all staff members with an 'active' status.
 * Corresponds to: GET /staffs/active
 */
 export interface Staff {
  id: number;
  name: string; // Changed from 'staff_name' to match the API
  role: string;
}

export async function getActiveStaffs(): Promise<ApiResponse<{ staffs: Staff[] }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/staffs/active`, {
    
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch active staff');
    }

    const data: { message: string, staffs: Staff[] } = await response.json();
    console.log("this is staff response data", data);
    
    return { data };
  } catch (error: any) {
    console.error('Error fetching active staff:', error.message);
    return { error: error.message };
  }
}

/**
 * Assigns a new task to a staff member for a specific order.
 * Corresponds to: POST /tasks/assign
 * @param payload - The data required to assign the task.
 */
export async function assignTask(payload: AssignTaskPayload): Promise<ApiResponse<{ task: Task }>> {
  try {
    console.log(payload);
    
    const response = await fetch(`${API_BASE_URL}/admin/tasks/assign`, {
      method: 'POST',
      headers: getAuthHeaders(), // getAuthHeaders should include 'Content-Type': 'application/json'
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to assign task');
    }

    // The API returns { message: string, task: Task }, we extract the whole object
    const data: { message: string, task: Task } = await response.json();
    return { data };
  } catch (error: any) {
    console.error('Error assigning task:', error.message);
    return { error: error.message };
  }
}



/**
 * Interface for a detailed task object from the GET /admin/tasks endpoint.
 * This includes nested objects for staff details.
 */

 export interface TaskStaffInfo {
  id: number | null;
  staff_name: string | null;
  role: string | null;
}

export interface CustomerInfo {
  id: number | null;
  name: string | null;
}

// 👇 New interface for order details
export interface OrderInfo {
  id: number | null;
  generated_order_id: string | null;
  product_name: string | null;
}
 export interface DetailedTask {
  id: number;
  order_id: number;
  task_description: string | null;
  status: string;
  assigned_on: string;
  completion_time: string | null;
  completed_on: string | null; // ADDED: New field for completion date
  assigned_by: TaskStaffInfo;
  assigned_to: TaskStaffInfo;

  updated_by: TaskStaffInfo | null;
  order_completion_date?: string | null;
  // 👇 NEW: customer info included in detailed task view
  customer?: CustomerInfo | null;
  order?: OrderInfo | null;
}
/**
 * Fetches all tasks with detailed, nested information about the staff involved.
 * Corresponds to: GET /tasks
 */
 export async function getAllTasks(): Promise<ApiResponse<DetailedTask[]>> {
  try {
    // Note: The endpoint is /admin/tasks based on the existing pattern in this file.
    const response = await fetch(`${API_BASE_URL}/admin/tasks`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch tasks');
    }

    const data: DetailedTask[] = await response.json();
    return { data };
  } catch (error: any) {
    console.error('Error fetching all tasks:', error.message);
    return { error: error.message };
  }
}


export interface EditTaskPayload {
  completion_time?: string | null; // e.g., "2024-12-31T23:59:59"
  task_description?: string | null;
  status?: string | null; // e.g., "in_progress", "completed"
}

export async function editTask(
  taskId: number,
  payload: EditTaskPayload
): Promise<ApiResponse<{ message: string; task: Task }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/tasks/${taskId}`, {
      method: 'PATCH', // Use PATCH for partial updates
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update task');
    }

    // The API returns { message: string, task: Task }, we extract the whole object
    const data: { message: string; task: Task } = await response.json();
    return { data };
  } catch (error: any) {
    console.error(`Error updating task ${taskId}:`, error.message);
    return { error: error.message };
  }
}


export async function getTasksByOrder(orderId: number): Promise<ApiResponse<DetailedTask[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/tasks/${orderId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Failed to fetch tasks for order ${orderId}`);
    }

    const data: DetailedTask[] = await response.json();
    console.log(`✅ Tasks for order ${orderId}:`, data);
    return { data };
  } catch (error: any) {
    console.error(`❌ Error fetching tasks for order ${orderId}:`, error.message);
    return { error: error.message };
  }
}


export interface OrderImage {
  id: number;
  order_id: number;
  image_url: string;
  status: string; // e.g., 'active', 'inactive'
  created_at: string; // ISO 8601 date string
  description?: string; // Optional field
  uploaded_by: number;
}

/**
 * Fetches all images for a specific order.
 * Corresponds to: GET /orders/images/{order_id}
 * 
 * @param orderId The ID of the order to fetch images for.
 * @returns A promise that resolves to an array of OrderImage objects.
 * @throws Will throw an error if the request fails.
 */
 export const getOrderImages = async (orderId: number): Promise<OrderImage[]> => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/admin/orders/images/${orderId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch order images: ${response.status} ${response.statusText}`);
    }

    const data: OrderImage[] = await response.json();
    return data;
  } catch (error) {
    console.error(`Error in getOrderImages for order ${orderId}:`, error);
    throw error;
  }
};



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
 * Fetches all attendance records with detailed staff information.
 * Corresponds to: GET /hr/attendance
 */
 export async function getAllAttendance(): Promise<ApiResponse<Attendance[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/attendance`, {
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



