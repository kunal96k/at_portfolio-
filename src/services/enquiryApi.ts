/**
 * API service for submitting public contact and enquiry forms to the backend database.
 */

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'http://localhost:8080';

export interface SubmitEnquiryPayload {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message?: string;
  sourcePage?: string;
  channel?: string;
  honeypot?: string;
}

export interface EnquiryApiResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    service?: string;
    message?: string;
    sourcePage?: string;
    channel?: string;
    status: string;
    createdAt: string;
  };
}

export async function submitContactEnquiry(
  payload: SubmitEnquiryPayload
): Promise<EnquiryApiResponse> {
  const endpoint = `${API_BASE_URL.replace(/\/+$/, '')}/api/contact/submit`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as EnquiryApiResponse;

  if (!response.ok) {
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}
