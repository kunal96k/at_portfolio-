import {
  createCourseBackend,
  deleteCourseBackend,
  fetchAdminCoursesPageBackend,
  fetchAllCoursesBackend,
  fetchNextDomainCodeBackend,
  loadAllCoursesFromStorage,
  patchCourseStatusBackend,
  saveCoursesToStorage,
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
      'Unable to reach Spring Boot backend at http://localhost:8080/api/courses. Start the backend server so DataInitializer can manage Course / Domains.'
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
      const created = await createCourseBackend(values);
      const existing = loadAllCoursesFromStorage().filter(
        (c) => !String(c.id).startsWith('default-')
      );
      saveCoursesToStorage([created, ...existing]);
      return created;
    } catch (err) {
      throw formatConnectionError(err);
    }
  },

  async updateCourse(
    id: string,
    values: CourseDomainFormPayload
  ): Promise<CourseDomain> {
    try {
      const updated = await updateCourseBackend(id, values);
      const existing = loadAllCoursesFromStorage();
      saveCoursesToStorage(
        existing.map((c) => (c.id === id ? updated : c))
      );
      return updated;
    } catch (err) {
      throw formatConnectionError(err);
    }
  },

  async patchStatus(
    id: string,
    status: CourseDomainStatus
  ): Promise<CourseDomain> {
    try {
      const updated = await patchCourseStatusBackend(id, status);
      const existing = loadAllCoursesFromStorage();
      saveCoursesToStorage(
        existing.map((c) => (c.id === id ? updated : c))
      );
      return updated;
    } catch (err) {
      throw formatConnectionError(err);
    }
  },

  async deleteCourse(id: string): Promise<void> {
    try {
      await deleteCourseBackend(id);
      const existing = loadAllCoursesFromStorage();
      saveCoursesToStorage(existing.filter((c) => c.id !== id));
    } catch (err) {
      throw formatConnectionError(err);
    }
  },
};
