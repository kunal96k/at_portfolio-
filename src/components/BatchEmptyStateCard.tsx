import { BellRing, BookOpen, CalendarClock, MessageSquare } from 'lucide-react';
import { OutlineButton } from './OutlineButton';

interface BatchEmptyStateCardProps {
  variant?: 'all' | 'category';
  selectedCategory?: string;
  onOpenModal: () => void;
  onShowAllCategories?: () => void;
  onContactClick?: () => void;
  onNavigateResources?: () => void;
}

export function BatchEmptyStateCard({
  variant = 'all',
  selectedCategory,
  onOpenModal,
  onShowAllCategories,
  onContactClick,
  onNavigateResources,
}: BatchEmptyStateCardProps) {
  const isCategoryEmpty = variant === 'category' && selectedCategory && selectedCategory !== 'All';

  return (
    <div
      data-testid="batches-empty-state"
      className="rounded-[26px] border border-dashed border-[#D6D8E4] bg-[#F5F5F5] px-6 py-12 text-center sm:px-10 sm:py-16 dark:border-[#3A3A3E] dark:bg-[#252528]"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5E67E6]/12 text-[#5E67E6] dark:bg-[#D0FF71]/15 dark:text-[#D0FF71]">
        <CalendarClock className="h-8 w-8" aria-hidden="true" />
      </div>

      <p className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-[12px] font-semibold uppercase tracking-wider text-[#5E67E6] shadow-xs dark:bg-[#1C1C1E] dark:text-[#D0FF71]">
        {isCategoryEmpty ? `${selectedCategory} Schedule` : 'Schedule Update'}
      </p>

      <h3 className="mx-auto mt-3 max-w-[560px] font-display text-[28px] font-bold uppercase leading-[1.12] text-[#303030] sm:text-[36px] dark:text-white">
        {isCategoryEmpty
          ? `NO ${selectedCategory} BATCHES CURRENTLY LISTED`
          : 'NO UPCOMING BATCHES AVAILABLE RIGHT NOW'}
      </h3>

      <p className="mx-auto mt-3 max-w-[540px] text-[15px] leading-[1.65] font-light text-[#5C5C5C] sm:text-[16px] dark:text-white/75">
        {isCategoryEmpty
          ? `We are currently preparing the next ${selectedCategory} batch schedule. View all available domains or request priority batch notifications.`
          : 'Our upcoming training calendar is currently being updated. Request a custom batch slot, corporate training workshop, or join the waitlist to get notified first when new seats open.'}
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onOpenModal}
          className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-[#5E67E6] px-6 py-3 text-[14px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90 dark:bg-[#D0FF71] dark:text-[#1A1A1B] cursor-pointer"
        >
          <BellRing className="h-4 w-4" aria-hidden="true" />
          <span>Notify Me / Request Batch</span>
        </button>

        {isCategoryEmpty && onShowAllCategories && (
          <OutlineButton onClick={onShowAllCategories}>VIEW ALL BATCHES</OutlineButton>
        )}

        {onContactClick && (
          <button
            type="button"
            onClick={onContactClick}
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full border border-[#303030]/20 bg-white px-5 py-3 text-[14px] font-medium text-[#303030] transition-colors hover:bg-[#303030] hover:text-white dark:border-white/20 dark:bg-[#1E1E20] dark:text-white dark:hover:bg-white dark:hover:text-[#1A1A1B] cursor-pointer"
          >
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            <span>Book Consultation</span>
          </button>
        )}

        {onNavigateResources && (
          <button
            type="button"
            onClick={onNavigateResources}
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full border border-transparent px-4 py-3 text-[14px] font-medium text-[#5E67E6] hover:underline dark:text-[#D0FF71] cursor-pointer"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>Free Study Notes</span>
          </button>
        )}
      </div>
    </div>
  );
}
