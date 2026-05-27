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
    color: 'text-status-created-text',
    bg: 'bg-status-created-bg',
    textKey: 'timeline.mfg',
  },
  SOLD: {
    icon: ShoppingBagIcon,
    color: 'text-status-sold-text',
    bg: 'bg-status-sold-bg',
    textKey: 'timeline.sold',
  },
  IN_TRANSIT: {
    icon: TruckIcon,
    color: 'text-status-intransit-text',
    bg: 'bg-status-intransit-bg',
    textKey: 'timeline.transit',
  },
  RECEIVED: {
    icon: InboxArrowDownIcon,
    color: 'text-status-received-text',
    bg: 'bg-status-received-bg',
    textKey: 'timeline.received',
  },
  DELAYED: {
    icon: ExclamationCircleIcon,
    color: 'text-status-lost-text',
    bg: 'bg-status-lost-bg',
    textKey: 'timeline.delayed',
  },
  INVESTIGATING: {
    icon: QuestionMarkCircleIcon,
    color: 'text-status-discarded-text',
    bg: 'bg-status-discarded-bg',
    textKey: 'timeline.investigating',
  },
  LOST: {
    icon: XCircleIcon,
    color: 'text-status-lost-text',
    bg: 'bg-status-lost-bg',
    textKey: 'timeline.lost',
  },
  DISCARDED: {
    icon: XCircleIcon,
    color: 'text-status-discarded-text',
    bg: 'bg-status-discarded-bg',
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
            <div className="h-7 w-7 rounded-full bg-muted" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 w-1/3 rounded bg-muted" />
              <div className="h-4 w-3/4 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="py-6 text-center text-text-muted text-[13px]">
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
                    className="absolute left-3.5 top-3.5 -ml-px h-full w-[1px] bg-border"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3.5">
                  <div>
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-surface ${config.bg} ${config.color}`}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1">
                    <div>
                      <p className="text-[13px] font-semibold text-text-primary">
                        {t(config.textKey, config.textKey)}
                      </p>
                      
                      {event.node && (
                        <p className="mt-0.5 text-2xs text-text-muted">
                          {t('timeline.point')}:{' '}
                          <span className="font-medium text-text-secondary">
                            {event.node.name}
                          </span>
                        </p>
                      )}

                      {event.notes && (
                        <p className="mt-1 text-[13px] text-text-secondary">
                          {event.notes}
                        </p>
                      )}

                      {event.actor && (
                        <p className="mt-1 text-2xs text-text-muted">
                          {t('timeline.doneBy')}: {event.actor.fullName} ({event.actor.email})
                        </p>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-2xs text-text-muted">
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
