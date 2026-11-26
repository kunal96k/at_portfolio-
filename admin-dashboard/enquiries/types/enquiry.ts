import type {
  ContactEnquiryItem,
  EnquiryPageResult,
  EnquirySearchParams,
  EnquiryStats,
  EnquiryStatus,
  ManualEnquiryPayload,
} from '../../../src/services/enquiryApi';

export type {
  ContactEnquiryItem,
  EnquiryPageResult,
  EnquirySearchParams,
  EnquiryStats,
  EnquiryStatus,
  ManualEnquiryPayload,
};

export type EnquirySortField =
  | 'createdAt'
  | 'updatedAt'
  | 'name'
  | 'status'
  | 'channel'
  | 'service';

export interface EnquiryQueryState {
  search: string;
  status: 'All' | EnquiryStatus;
  channel: string;
  service: string;
  sortBy: EnquirySortField;
  sortDir: 'asc' | 'desc';
  page: number;
  pageSize: number;
}
