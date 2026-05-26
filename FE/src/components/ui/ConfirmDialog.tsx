import { Fragment } from 'react';
import { Dialog, Transition, TransitionChild, DialogTitle, DialogPanel } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  loading = false,
}: ConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/35 backdrop-blur-[1px] transition-opacity dark:bg-gray-950/50" />
        </TransitionChild>

        <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white p-5 text-left border border-gray-100 dark:border-gray-800 shadow-lg transition-all sm:my-8 w-full max-w-sm dark:bg-gray-900">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-8 sm:w-8 dark:bg-red-950/30">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <DialogTitle as="h3" className="text-[14px] font-semibold leading-6 text-gray-900 dark:text-gray-100">
                      {title}
                    </DialogTitle>
                    <div className="mt-1">
                      <p className="text-[13px] text-gray-500 dark:text-gray-400">
                        {message}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="btn-secondary py-1.5"
                  >
                    {cancelText || t('common.cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={onConfirm}
                    disabled={loading}
                    className="btn-danger py-1.5"
                  >
                    {loading ? t('common.loading') : confirmText || t('common.confirm')}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
