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
          <div className="fixed inset-0 bg-gray-900/35 backdrop-blur-[1px] transition-opacity dark:bg-gray-950/50" />
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
                className={`relative transform overflow-hidden rounded-lg bg-white p-5 text-left border border-gray-100 dark:border-gray-800 shadow-lg transition-all sm:my-8 w-full ${sizeClasses[size]} dark:bg-gray-900`}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                  <DialogTitle className="text-[14px] font-semibold text-gray-900 dark:text-gray-100">
                    {title}
                  </DialogTitle>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none dark:text-gray-500 dark:hover:text-gray-400"
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
