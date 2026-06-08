import React, { Fragment } from 'react';
import { Dialog, Transition, TransitionChild, DialogTitle, DialogPanel } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export default function FormModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: FormModalProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop overlay */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-primary-900/10 backdrop-blur-[1px] transition-opacity" />
        </TransitionChild>

        {/* Modal container */}
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
              <DialogPanel
                className={`relative transform rounded-[24px] bg-surface p-6 text-left border border-border shadow-saas-md transition-all sm:my-8 w-full ${sizeClasses[size]}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <DialogTitle className="text-[15px] font-semibold text-text-primary">
                    {title}
                  </DialogTitle>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full p-1 text-text-muted hover:text-text-primary hover:bg-muted transition-colors"
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                {/* Content */}
                <div className="mt-4 text-[13px]">{children}</div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
