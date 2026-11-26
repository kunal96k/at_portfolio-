import {
  createBatchBackend,
  deleteBatchBackend,
  fetchAdminBatchesPageBackend,
  fetchAllBatchesFromApiOrStorage,
  fetchNextBatchCodeBackend,
  patchBatchFeaturedBackend,
  patchBatchStatusBackend,
  updateBatchBackend,
  type BatchPageResult,
  type BatchSearchParams,
} from '../../../src/services/batchesService';
import type { Batch, BatchFormValues, BatchStatus } from '../types/batch';

export const batchService = {
  async searchPage(
    params: BatchSearchParams,
    signal?: AbortSignal
  ): Promise<BatchPageResult> {
    return fetchAdminBatchesPageBackend(params, signal);
  },

  async listBatches(): Promise<Batch[]> {
    const res = await fetchAllBatchesFromApiOrStorage();
    return res.items;
  },

  async getNextBatchCode(): Promise<string> {
    try {
      return await fetchNextBatchCodeBackend();
    } catch {
      return 'BATCH-001';
    }
  },

  async createBatch(values: BatchFormValues): Promise<Batch> {
    return createBatchBackend({
      batchCode: values.batchCode,
      title: values.title,
      slug: values.slug,
      shortDescription: values.shortDescription,
      detailedContent: values.detailedContent,
      category: values.category,
      relatedCourse: values.relatedCourse,
      batchDate: values.batchDate,
      batchTime: values.batchTime,
      mode: values.mode,
      seatsTotal: values.seatsTotal,
      location: values.location,
      coverImage: values.coverImage,
      coverImageName: values.coverImageName,
      tags: values.tags,
      learningLevel: values.learningLevel,
      attachments: values.attachments,
      displayOrder: values.displayOrder,
      featured: values.featured,
      status: values.status,
    });
  },

  async updateBatch(id: string, values: BatchFormValues): Promise<Batch> {
    return updateBatchBackend(id, {
      batchCode: values.batchCode,
      title: values.title,
      slug: values.slug,
      shortDescription: values.shortDescription,
      detailedContent: values.detailedContent,
      category: values.category,
      relatedCourse: values.relatedCourse,
      batchDate: values.batchDate,
      batchTime: values.batchTime,
      mode: values.mode,
      seatsTotal: values.seatsTotal,
      location: values.location,
      coverImage: values.coverImage,
      coverImageName: values.coverImageName,
      tags: values.tags,
      learningLevel: values.learningLevel,
      attachments: values.attachments,
      displayOrder: values.displayOrder,
      featured: values.featured,
      status: values.status,
    });
  },

  async toggleStatus(id: string, nextStatus: BatchStatus): Promise<Batch> {
    return patchBatchStatusBackend(id, nextStatus);
  },

  async toggleFeatured(id: string, featured: boolean): Promise<Batch> {
    return patchBatchFeaturedBackend(id, featured);
  },

  async deleteBatch(id: string): Promise<void> {
    return deleteBatchBackend(id);
  },
};
