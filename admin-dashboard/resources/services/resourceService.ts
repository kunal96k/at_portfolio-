import { getApiBaseUrl } from '../../../src/config/api';
import {
  createResourceBackend,
  deleteResourceBackend,
  fetchAdminResourcesPageBackend,
  fetchNextNoteCodeBackend,
  patchResourceDownloadAccessBackend,
  patchResourceFileAttachmentBackend,
  patchResourceStatusBackend,
  updateResourceBackend,
} from '../../../src/services/resourcesService';
import type {
  ResourceSearchParams,
  StudyResourceFilePatchPayload,
} from '../../../src/services/resourcesService';
import type {
  ResourceStatus,
  StudyResourceFormPayload,
  StudyResourceNote,
  StudyResourcePage,
} from '../types/resource';

function formatConnectionError(err: unknown): Error {
  if (err instanceof TypeError) {
    return new Error(
      `Unable to reach backend server (${getApiBaseUrl() || 'same-origin'}/api/resources). Please verify the backend service is running.`
    );
  }
  return err instanceof Error ? err : new Error('Request failed.');
}

export const resourceService = {
  async searchPage(
    params: ResourceSearchParams,
    signal?: AbortSignal
  ): Promise<StudyResourcePage> {
    try {
      return await fetchAdminResourcesPageBackend(params, signal);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw err;
      }
      throw formatConnectionError(err);
    }
  },

  async getNextNoteCode(): Promise<string | null> {
    try {
      return await fetchNextNoteCodeBackend();
    } catch {
      return null;
    }
  },

  async createResource(
    values: StudyResourceFormPayload
  ): Promise<StudyResourceNote> {
    try {
      return await createResourceBackend(values);
    } catch (err) {
      throw formatConnectionError(err);
    }
  },

  async updateResource(
    id: string,
    values: StudyResourceFormPayload
  ): Promise<StudyResourceNote> {
    try {
      return await updateResourceBackend(id, values);
    } catch (err) {
      throw formatConnectionError(err);
    }
  },

  async patchStatus(
    id: string,
    status: ResourceStatus
  ): Promise<StudyResourceNote> {
    try {
      return await patchResourceStatusBackend(id, status);
    } catch (err) {
      throw formatConnectionError(err);
    }
  },

  async patchDownloadAccess(
    id: string,
    downloadEnabled: boolean
  ): Promise<StudyResourceNote> {
    try {
      return await patchResourceDownloadAccessBackend(id, downloadEnabled);
    } catch (err) {
      throw formatConnectionError(err);
    }
  },

  async patchFileAttachment(
    id: string,
    payload: StudyResourceFilePatchPayload
  ): Promise<StudyResourceNote> {
    try {
      return await patchResourceFileAttachmentBackend(id, payload);
    } catch (err) {
      throw formatConnectionError(err);
    }
  },

  async deleteResource(id: string): Promise<void> {
    try {
      await deleteResourceBackend(id);
    } catch (err) {
      throw formatConnectionError(err);
    }
  },
};
