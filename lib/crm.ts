import { getAuthHeaders } from './auth';
import { API_BASE_URL } from './api'; // Import the base URL to avoid re-defining it

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Represents the structure of a Real Customer object received from the API.
 * The fields are based on the SQL query in your FastAPI backend.
 */
export interface RealCustomer {
  id: number;
  customer_name: string;
  mobile_number: string;
  whatsapp_number?: string; // Optional field
  address?: string;          // Optional field
  requirements?: string;     // Optional field
  status: string; // e.g., 'active', 'inactive', 'converted'
  created_by: number;
  created_on: string; // ISO 8601 date string (e.g., "2023-10-27T10:00:00")
  updated_on?: string; // Optional ISO 8601 date string
  
  // This field comes from the JOIN in the backend query
  created_by_staff_name: string; 
}

/**
 * Defines the shape of the data required for updating a Real Customer.
 * It allows for partial updates, so all fields are optional.
 */
export type RealCustomerUpdateData = Partial<Pick<
  RealCustomer, 
  'customer_name' | 'mobile_number' | 'whatsapp_number' | 'address' | 'requirements' | 'status'
>>;


// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Fetches a list of all real customers from the API.
 * Corresponds to: GET /real_customers
 * 
 * @returns A promise that resolves to an array of RealCustomer objects.
 * @throws Will throw an error if the API request fails.
 */
export const getRealCustomers = async (): Promise<RealCustomer[]> => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/crm/real_customers`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      // Throw an error with status to be handled by the caller
      throw new Error(`Failed to fetch real customers: ${response.status} ${response.statusText}`);
    }

    const data: RealCustomer[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error in getRealCustomers:", error);
    // Re-throw the error so the calling component can handle it (e.g., show an error message)
    throw error;
  }
};

/**
 * Fetches a single real customer by their ID.
 * Corresponds to: GET /real_customers/{real_customer_id}
 * 
 * @param realCustomerId The unique identifier of the customer to fetch.
 * @returns A promise that resolves to a single RealCustomer object.
 * @throws Will throw an error if the customer is not found (404) or if the request fails.
 */
export const getRealCustomerById = async (realCustomerId: number): Promise<RealCustomer> => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/crm/real_customers/${realCustomerId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Real customer not found.');
        }
      throw new Error(`Failed to fetch real customer: ${response.status} ${response.statusText}`);
    }

    const data: RealCustomer = await response.json();
    return data;
  } catch (error) {
    console.error(`Error in getRealCustomerById for ID ${realCustomerId}:`, error);
    throw error;
  }
};

/**
 * Updates a real customer's details.
 * Corresponds to: PUT /real_customers/{real_customer_id}
 * 
 * @param realCustomerId The ID of the customer to update.
 * @param updateData An object containing the fields to update.
 * @returns A promise that resolves to the updated RealCustomer object.
 * @throws Will throw an error if the customer is not found (404), data is invalid (400), or the request fails.
 */
export const updateRealCustomer = async (
  realCustomerId: number, 
  updateData: RealCustomerUpdateData
): Promise<RealCustomer> => {
  try {
    const headers = {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    };
    
    const response = await fetch(`${API_BASE_URL}/crm/real_customers/${realCustomerId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Real customer not found.');
        }
        if (response.status === 400) {
            const errorData = await response.json();
            throw new Error(`Failed to update: ${errorData.detail || 'Invalid data provided.'}`);
        }
      throw new Error(`Failed to update real customer: ${response.status} ${response.statusText}`);
    }

    const data: RealCustomer = await response.json();
    return data;
  } catch (error) {
    console.error(`Error in updateRealCustomer for ID ${realCustomerId}:`, error);
    throw error;
  }
};




export interface StaffUser {
  id: number;
  staff_name: string;
  role: string; // e.g., 'sales', 'crm'
}

export const getStaffByRoles = async (): Promise<StaffUser[]> => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/crm/staff_by_roles`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch staff by roles: ${response.status} ${response.statusText}`);
    }

    const data: StaffUser[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error in getStaffByRoles:", error);
    throw error;
  }
};


// ============================================================================
// NEW: Order Image TYPE DEFINITIONS
// ============================================================================

// /**
//  * Represents the structure of an Order Image object received from the API.
//  * Based on the backend schema and queries.
//  */
//  export interface OrderImage {
//   id: number;
//   order_id: number;
//   image_url: string;
//   status: string; // e.g., 'active', 'inactive'
//   created_at: string; // ISO 8601 date string
//   description?: string; // Optional field
//   uploaded_by: number;
// }

// /**
//  * Defines the shape of the data required for updating an Order Image.
//  * Allows partial updates for description and status.
//  */
// export type OrderImageUpdateData = Partial<Pick<OrderImage, 'description' | 'status'>>;

// /**
//  * Uploads an image for a specific order.
//  * Corresponds to: POST /orders/images/{order_id}
//  * 
//  * @param orderId The ID of the order to associate the image with.
//  * @param file The image file to upload (File object from input).
//  * @param description Optional description for the image.
//  * @returns A promise that resolves to the created OrderImage object.
//  * @throws Will throw an error if the upload fails (e.g., invalid file, 400/500).
//  */
//  export const uploadOrderImage = async (
//   orderId: number,
//   file: File,
//   description?: string
// ): Promise<OrderImage> => {
//   try {
//     // 🧩 Validate file type
//     if (!file.type.startsWith('image/')) {
//       throw new Error('Selected file must be an image.');
//     }

//     // 🧱 Prepare multipart form data
//     const formData = new FormData();
//     formData.append('file', file);

//     // ✅ Send description explicitly as plain text (optional)
//     if (description) {
//       formData.append('description', description);
//     }

//     // 🧾 Log FormData for debugging
//     console.log('📦 FormData contents:');
//     for (const [key, value] of formData.entries()) {
//       if (value instanceof File) {
//         console.log(`${key}: File - name: ${value.name}, size: ${value.size} bytes, type: ${value.type}`);
//       } else {
//         console.log(`${key}: ${value}`);
//       }
//     }

//     // 🛡️ Include only non-content headers (like Authorization)
//     const headers = {
//       ...getAuthHeaders(),
//       // ❌ Do NOT set 'Content-Type'; browser sets it automatically with boundary
//     };

//     // 🚀 Send POST request
//     const response = await fetch(`${API_BASE_URL}/crm/orders/images/${orderId}`, {
//       method: 'POST',
//       headers,
//       body: formData,
//     });

//     // ⚠️ Handle response errors
//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(`Failed to upload image: ${errorData.detail || response.statusText}`);
//     }

//     // ✅ Parse and return uploaded image data
//     const data: OrderImage = await response.json();
//     return data;

//   } catch (error) {
//     console.error(`❌ Error in uploadOrderImage (order ${orderId}):`, error);
//     throw error;
//   }
// };

// --- MOCK/PLACEHOLDER DEFINITIONS ---
// Assume these are defined globally or imported from a config file
// declare const API_BASE_URL: string;
// declare function getAuthHeaders(): Record<string, string>;

// Configuration must be secure! Never expose API secret publicly.
const CLOUDINARY_CLOUD_NAME = "dxkx8durf"; 
// 🛑 IMPORTANT: Replace 'amaze_unsigned_uploads' with the name of the 
// unsigned upload preset you configure in your Cloudinary settings.
const CLOUDINARY_UPLOAD_PRESET = "amaze_preset"; 

// --- CORE INTERFACES AND TYPES ---
export interface OrderImage {
  id: number;
  order_id: number;
  image_url: string;
  status: string;
  created_at: string;
  description?: string;
  uploaded_by: number;
}
export type OrderImageUpdateData = Partial<Pick<OrderImage, 'description' | 'status'>>;


/**
 * Uploads an image in a two-step process:
 * 1. Upload file directly to Cloudinary.
 * 2. Submit the resulting URL and description to the backend via JSON.
 */
 export const uploadOrderImage = async (
  orderId: number,
  file: File,
  description?: string
): Promise<OrderImage> => {
  let image_url = '';
  
  try {
    // 🧩 1. Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Selected file must be an image.');
    }

    // ------------------------------------------
    // STEP 1: Upload to Cloudinary (Client-Side)
    // ------------------------------------------
    console.log('📦 Starting Cloudinary upload with preset...');
    
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    // 🛑 FIX: Include the required unsigned upload preset
    cloudinaryFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET); 
    
    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    );

    if (!cloudinaryResponse.ok) {
        const errorData = await cloudinaryResponse.json().catch(() => ({}));
        // Improved error message to capture Cloudinary detail
        throw new Error(`Cloudinary upload failed: ${errorData.error?.message || cloudinaryResponse.statusText}`);
    }

    const cloudinaryResult = await cloudinaryResponse.json();
    image_url = cloudinaryResult.secure_url;
    console.log(`✅ Cloudinary URL obtained: ${image_url}`);

    // ------------------------------------------
    // STEP 2: Submit URL and Description to FastAPI (JSON)
    // ------------------------------------------
    
    const payload = {
      image_url: image_url,
      // Use null for missing description, which Pydantic/FastAPI handles well
      description: description || null, 
    };

    console.log('🚀 Submitting URL payload to FastAPI:', payload);

    const headers = {
      ...getAuthHeaders(),
      'Content-Type': 'application/json', // CRITICAL: Now sending JSON
    };

    const response = await fetch(`${API_BASE_URL}/crm/orders/images/${orderId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    // ⚠️ Handle backend response errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = response.statusText;

      if (response.status === 422 && Array.isArray(errorData.detail)) {
        const validationErrors = errorData.detail.map(
          (err: any) => `${err.loc.join('.')}: ${err.msg}`
        ).join('; ');
        errorMessage = `Validation failed: ${validationErrors}`;
      } else if (errorData.detail && typeof errorData.detail === 'string') {
        errorMessage = errorData.detail;
      }
      
      throw new Error(`Failed to save image record: ${errorMessage}`);
    }

    // ✅ Parse and return uploaded image data
    const data: OrderImage = await response.json();
    return data;

  } catch (error) {
    console.error(`❌ Error in uploadOrderImage (order ${orderId}):`, error);
    throw error;
  }
};


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
    const response = await fetch(`${API_BASE_URL}/crm/orders/images/${orderId}`, {
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
 * Updates an order image's details (e.g., description or status).
 * Corresponds to: PUT /orders/images/{image_id}
 * 
 * @param imageId The ID of the image to update.
 * @param updateData An object containing the fields to update.
 * @returns A promise that resolves to the updated OrderImage object.
 * @throws Will throw an error if the image is not found (404), data is invalid (400), or the request fails.
 */
export const updateOrderImage = async (
  imageId: number,
  updateData: OrderImageUpdateData
): Promise<OrderImage> => {
  try {
    if (!Object.keys(updateData).length) {
      throw new Error('No fields provided to update.');
    }

    const headers = {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${API_BASE_URL}/crm/orders/images/${imageId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Order image not found.');
      }
      if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to update: ${errorData.detail || 'Invalid data provided.'}`);
      }
      throw new Error(`Failed to update order image: ${response.status} ${response.statusText}`);
    }

    const data: OrderImage = await response.json();
    return data;
  } catch (error) {
    console.error(`Error in updateOrderImage for ID ${imageId}:`, error);
    throw error;
  }
};

/**
 * Deletes an order image.
 * Corresponds to: DELETE /orders/images/{image_id}
 * 
 * @param imageId The ID of the image to delete.
 * @returns A promise that resolves to void (success with 204).
 * @throws Will throw an error if the image is not found (404) or the request fails.
 */
export const deleteOrderImage = async (imageId: number): Promise<void> => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/crm/orders/images/${imageId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Order image not found.');
      }
      throw new Error(`Failed to delete order image: ${response.status} ${response.statusText}`);
    }

    // No body in 204 response
    return;
  } catch (error) {
    console.error(`Error in deleteOrderImage for ID ${imageId}:`, error);
    throw error;
  }
};