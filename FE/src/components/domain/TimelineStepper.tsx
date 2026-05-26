import type { TimelineEvent } from '../../types/batch.types';
import { useTranslation } from 'react-i18next';
import {
  PlusCircleIcon,
  ShoppingBagIcon,
  TruckIcon,
  InboxArrowDownIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';

interface TimelineStepperProps {
  events: TimelineEvent[] | undefined;
  loading?: boolean;
}

const EVENT_CONFIG: Record<
  string,
  { icon: React.ComponentType<any>; color: string; bg: string; textKey: string }
> = {
  CREATED: {
    icon: PlusCircleIcon,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/20',
    textKey: 'timeline.mfg',
  },
  SOLD: {
    icon: ShoppingBagIcon,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    textKey: 'timeline.sold',
  },
  IN_TRANSIT: {
    icon: TruckIcon,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    textKey: 'timeline.transit',
  },
  RECEIVED: {
    icon: InboxArrowDownIcon,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    textKey: 'timeline.received',
  },
  DELAYED: {
    icon: ExclamationCircleIcon,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    textKey: 'timeline.delayed',
  },
  INVESTIGATING: {
    icon: QuestionMarkCircleIcon,
    color: 'text-red-500 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/20',
    textKey: 'timeline.investigating',
  },
  LOST: {
    icon: XCircleIcon,
    color: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-100/70 dark:bg-red-950/40',
    textKey: 'timeline.lost',
  },
  DISCARDED: {
    icon: XCircleIcon,
    color: 'text-gray-500 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-800/40',
    textKey: 'timeline.discarded',
  },
};

export default function TimelineStepper({ events, loading = false }: TimelineStepperProps) {
  const { t, i18n } = useTranslation();

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse py-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="flex gap-4">
            <div className="h-7 w-7 rounded-full bg-gray-200 dark:bg-gray-800" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="py-6 text-center text-gray-500 text-[13px]">
        {t('timeline.noEvents')}
      </div>
    );
  }

  return (
    <div className="flow-root py-2">
      <ul role="list" className="-mb-8">
        {events.map((event, eventIdx) => {
          const config = EVENT_CONFIG[event.eventType] || {
            icon: QuestionMarkCircleIcon,
            color: 'text-zinc-500',
            bg: 'bg-zinc-50 dark:bg-zinc-900/40',
            textKey: event.eventType,
          };
          const Icon = config.icon;

          return (
            <li key={event.id}>
              <div className="relative pb-8">
                {eventIdx !== events.length - 1 ? (
                  <span
                    className="absolute left-3.5 top-3.5 -ml-px h-full w-[1px] bg-zinc-200 dark:bg-zinc-800"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3.5">
                  <div>
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-white dark:ring-zinc-950 ${config.bg} ${config.color}`}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1">
                    <div>
                      <p className="text-[13px] font-semibold text-zinc-950 dark:text-zinc-50">
                        {t(config.textKey, config.textKey)}
                      </p>
                      
                      {event.node && (
                        <p className="mt-0.5 text-2xs text-zinc-400 dark:text-zinc-500">
                          {t('timeline.point')}:{' '}
                          <span className="font-medium text-zinc-700 dark:text-zinc-350">
                            {event.node.name}
                          </span>
                        </p>
                      )}

                      {event.notes && (
                        <p className="mt-1 text-[13px] text-zinc-650 dark:text-zinc-300">
                          {event.notes}
                        </p>
                      )}

                      {event.actor && (
                        <p className="mt-1 text-2xs text-zinc-400 dark:text-zinc-500">
                          {t('timeline.doneBy')}: {event.actor.fullName} ({event.actor.email})
                        </p>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-2xs text-zinc-400 dark:text-zinc-600">
                      <time dateTime={event.occurredAt}>{formatDate(event.occurredAt)}</time>
                      {event.quantityDelta !== null && event.quantityDelta !== 0 && (
                        <div
                          className={`mt-1 font-mono text-[11px] font-semibold ${
                            event.quantityDelta > 0 ? 'text-emerald-600' : 'text-red-500'
                          }`}
                        >
                          {event.quantityDelta > 0 ? `+${event.quantityDelta}` : event.quantityDelta}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
