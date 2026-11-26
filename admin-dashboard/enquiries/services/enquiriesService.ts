import {
  createManualEnquiryBackend,
  deleteEnquiryBackend,
  fetchAdminEnquiriesPageBackend,
  updateEnquiryAdminBackend,
  updateEnquiryStatusBackend,
  type ContactEnquiryItem,
  type EnquiryPageResult,
  type EnquirySearchParams,
  type EnquiryStatus,
  type ManualEnquiryPayload,
} from '../../../src/services/enquiryApi';

export const enquiriesAdminService = {
  searchPage(
    params: EnquirySearchParams,
    signal?: AbortSignal
  ): Promise<EnquiryPageResult> {
    return fetchAdminEnquiriesPageBackend(params, signal);
  },

  createManual(payload: ManualEnquiryPayload): Promise<ContactEnquiryItem> {
    return createManualEnquiryBackend(payload);
  },

  updateAdmin(
    id: string,
    payload: { status?: EnquiryStatus; adminNotes?: string }
  ): Promise<ContactEnquiryItem> {
    return updateEnquiryAdminBackend(id, payload);
  },

  updateStatus(id: string, status: EnquiryStatus): Promise<ContactEnquiryItem> {
    return updateEnquiryStatusBackend(id, status);
  },

  deleteItem(id: string): Promise<void> {
    return deleteEnquiryBackend(id);
  },
};
