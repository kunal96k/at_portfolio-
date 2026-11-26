import { useEffect, useState } from 'react';
import {
  COURSES_STORAGE_KEY,
  COURSES_UPDATED_EVENT,
  fetchPublicCoursesAsync,
  loadPublicCoursesFromStorage,
  type CourseDomain,
} from '../services/coursesService';

/**
 * Dynamically subscribes public pages (HomePage 10 Core Domains, ItServicesPage)
 * and Batch track selectors to Published Course / Domain records managed via Backend & Admin Dashboard.
 */
export function usePublicCourses() {
  const [courses, setCourses] = useState<CourseDomain[]>(() =>
    loadPublicCoursesFromStorage()
  );

  useEffect(() => {
    let active = true;

    const refreshFromBackend = () => {
      void fetchPublicCoursesAsync().then((list) => {
        if (active) setCourses(list);
      });
    };

    const syncLocal = () => {
      if (!active) return;
      setCourses(loadPublicCoursesFromStorage());
      refreshFromBackend();
    };

    refreshFromBackend();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === COURSES_STORAGE_KEY) {
        syncLocal();
      }
    };

    window.addEventListener(COURSES_UPDATED_EVENT, syncLocal);
    window.addEventListener('storage', handleStorage);
    return () => {
      active = false;
      window.removeEventListener(COURSES_UPDATED_EVENT, syncLocal);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return { courses };
}
