import { useCallback, useEffect, useMemo, useState } from 'react';
import { filterAndSortTopics } from '../../utils/adminLogic';
import { topicService } from '../services/topicService';
import type {
  Topic,
  TopicFormValues,
  TopicQueryState,
} from '../types/topic';

const DEFAULT_QUERY: TopicQueryState = {
  search: '',
  status: 'All',
  level: 'All',
  course: 'All',
  featuredOnly: false,
  sortBy: 'displayOrder',
  sortDir: 'asc',
  page: 1,
  pageSize: 5,
};

export function useTopics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState<TopicQueryState>(DEFAULT_QUERY);

  const loadTopics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await topicService.listTopics();
      setTopics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load topics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTopics();
  }, [loadTopics]);

  const updateQuery = useCallback((patch: Partial<TopicQueryState>) => {
    setQuery((prev) => ({
      ...prev,
      ...patch,
      page: patch.page !== undefined ? patch.page : 1,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setQuery(DEFAULT_QUERY);
  }, []);

  const paginated = useMemo(
    () => filterAndSortTopics(topics, query),
    [topics, query]
  );

  const stats = useMemo(() => {
    const published = topics.filter((t) => t.status === 'Published').length;
    const drafts = topics.filter((t) => t.status === 'Draft').length;
    const featured = topics.filter((t) => t.featured).length;
    const resources = topics.reduce((sum, t) => sum + t.attachments.length, 0);
    return {
      total: topics.length,
      published,
      drafts,
      featured,
      resources,
    };
  }, [topics]);

  const existingSlugs = useMemo(() => topics.map((t) => t.slug), [topics]);

  const nextDisplayOrder = useMemo(() => {
    if (topics.length === 0) return 1;
    return Math.max(...topics.map((t) => t.displayOrder)) + 1;
  }, [topics]);

  const createTopic = useCallback(
    async (values: TopicFormValues): Promise<Topic> => {
      if (submitting) {
        throw new Error('Submission already in progress.');
      }
      setSubmitting(true);
      try {
        const created = await topicService.createTopic(values);
        setTopics((prev) => [created, ...prev]);
        setQuery((prev) => ({
          ...prev,
          search: '',
          status: 'All',
          level: 'All',
          course: 'All',
          featuredOnly: false,
          sortBy: 'updatedAt',
          sortDir: 'desc',
          page: 1,
        }));
        return created;
      } finally {
        setSubmitting(false);
      }
    },
    [submitting]
  );

  const updateTopic = useCallback(
    async (id: string, values: TopicFormValues): Promise<Topic> => {
      if (submitting) {
        throw new Error('Submission already in progress.');
      }
      setSubmitting(true);
      try {
        const updated = await topicService.updateTopic(id, values);
        setTopics((prev) => prev.map((t) => (t.id === id ? updated : t)));
        return updated;
      } finally {
        setSubmitting(false);
      }
    },
    [submitting]
  );

  const toggleFeatured = useCallback(async (topic: Topic): Promise<Topic> => {
    const updated = await topicService.patchTopic(topic.id, {
      featured: !topic.featured,
    });
    setTopics((prev) => prev.map((t) => (t.id === topic.id ? updated : t)));
    return updated;
  }, []);

  const toggleStatus = useCallback(async (topic: Topic): Promise<Topic> => {
    const nextStatus = topic.status === 'Published' ? 'Draft' : 'Published';
    const updated = await topicService.patchTopic(topic.id, {
      status: nextStatus,
    });
    setTopics((prev) => prev.map((t) => (t.id === topic.id ? updated : t)));
    return updated;
  }, []);

  const deleteTopic = useCallback(async (id: string): Promise<void> => {
    await topicService.deleteTopic(id);
    setTopics((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    topics,
    paginated,
    stats,
    query,
    loading,
    error,
    submitting,
    existingSlugs,
    nextDisplayOrder,
    updateQuery,
    resetFilters,
    reload: loadTopics,
    createTopic,
    updateTopic,
    toggleFeatured,
    toggleStatus,
    deleteTopic,
  };
}
