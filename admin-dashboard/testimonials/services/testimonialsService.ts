import {
  createTestimonialBackend,
  deleteTestimonialBackend,
  fetchAdminTestimonialsPageBackend,
  fetchAllTestimonialsBackend,
  fetchNextTestimonialCodeBackend,
  toggleTestimonialFeaturedBackend,
  toggleTestimonialStatusBackend,
  updateTestimonialBackend,
  uploadTestimonialPhotoBackend,
  type StudentTestimonial,
  type TestimonialFormPayload,
  type TestimonialPageResult,
  type TestimonialSearchParams,
  type TestimonialStatus,
} from '../../../src/services/testimonialsService';

export const testimonialsAdminService = {
  searchPage(
    params: TestimonialSearchParams,
    signal?: AbortSignal
  ): Promise<TestimonialPageResult> {
    return fetchAdminTestimonialsPageBackend(params, signal);
  },

  listAll(): Promise<StudentTestimonial[]> {
    return fetchAllTestimonialsBackend();
  },

  getNextCode(): Promise<string> {
    return fetchNextTestimonialCodeBackend();
  },

  uploadPhoto(file: File) {
    return uploadTestimonialPhotoBackend(file);
  },

  createItem(payload: TestimonialFormPayload): Promise<StudentTestimonial> {
    return createTestimonialBackend(payload);
  },

  updateItem(
    id: string,
    payload: TestimonialFormPayload
  ): Promise<StudentTestimonial> {
    return updateTestimonialBackend(id, payload);
  },

  toggleStatus(
    id: string,
    status?: TestimonialStatus
  ): Promise<StudentTestimonial> {
    return toggleTestimonialStatusBackend(id, status);
  },

  toggleFeatured(
    id: string,
    featured?: boolean
  ): Promise<StudentTestimonial> {
    return toggleTestimonialFeaturedBackend(id, featured);
  },

  deleteItem(id: string): Promise<void> {
    return deleteTestimonialBackend(id);
  },
};
