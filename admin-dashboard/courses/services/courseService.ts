import { getApiBaseUrl } from '../../../src/config/api';
import {
  createCourseBackend,
  deleteCourseBackend,
  fetchAdminCoursesPageBackend,
  fetchAllCoursesBackend,
  fetchNextDomainCodeBackend,
  patchCourseStatusBackend,
  updateCourseBackend,
  type CourseDomainPage,
  type CourseSearchParams,
} from '../../../src/services/coursesService';
import type {
  CourseDomain,
  CourseDomainFormPayload,
  CourseDomainStatus,
} from '../types/course';

function formatConnectionError(err: unknown): Error {
  if (err instanceof TypeError) {
    return new Error(
      `Unable to reach backend server (${getApiBaseUrl() || 'same-origin'}/api/courses). Please verify the backend service is running.`
    );
  }
  return err instanceof Error ? err : new Error('Request failed.');
}

export const courseService = {
  async searchPage(
    params: CourseSearchParams,
    signal?: AbortSignal
  ): Promise<CourseDomainPage> {
    try {
      return await fetchAdminCoursesPageBackend(params, signal);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw err;
      }
      throw formatConnectionError(err);
    }
  },

  async listCourses(): Promise<CourseDomain[]> {
    try {
      return await fetchAllCoursesBackend();
    } catch (err) {
      throw formatConnectionError(err);
    }
  },

  async getNextDomainCode(): Promise<string | null> {
    try {
      return await fetchNextDomainCodeBackend();
    } catch {
      return null;
    }
  },

  async createCourse(values: CourseDomainFormPayload): Promise<CourseDomain> {
    try {
      return await createCourseBackend(values);
    } catch (err) {
      throw formatConnectionError(err);
    }
  },

  async updateCourse(
    id: string,
    values: CourseDomainFormPayload
  ): Promise<CourseDomain> {
    try {
      return await updateCourseBackend(id, values);
    } catch (err) {
      throw formatConnectionError(err);
    }
  },

  async patchStatus(
    id: string,
    status: CourseDomainStatus
  ): Promise<CourseDomain> {
    try {
      return await patchCourseStatusBackend(id, status);
    } catch (err) {
      throw formatConnectionError(err);
    }
  },

  async deleteCourse(id: string): Promise<void> {
    try {
      await deleteCourseBackend(id);
    } catch (err) {
      throw formatConnectionError(err);
    }
  },
};
