import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { clsx } from 'clsx';

export const Accordion = ({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);

  return (
    <div
      className={
        'relative flex h-full w-full cursor-pointer flex-col items-center justify-center p-4 max-[2000px]:min-h-[80px] min-[2000px]:min-h-[110px]'
      }
      onClick={() => setIsOpen(!isOpen)}
    >
      <div
        className={clsx('w-full text-left text-headline-2 font-medium', {
          'pb-2': isOpen,
        })}
      >
        {title}
      </div>
      <AnimatePresence initial={false} mode={'wait'}>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
            className={
              'flex items-center justify-start overflow-hidden pr-4 text-main'
            }
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute left-0 top-0 -z-10 flex h-full w-full flex-col">
        <svg
          width="713.5"
          height="60"
          viewBox="0 0 713.5 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-auto w-full"
        >
          <path
            d="M1 59V16C1 8.26801 7.26801 2 15 2H656.863C660.573 2 664.131 3.47262 666.756 6.09437L707.393 46.681C710.023 49.307 711.5 52.8706 711.5 56.5866V59C711.5 66.732 705.232 73 697.5 73H15C7.26803 73 1 66.732 1 59Z"
            stroke="#D2FF00"
            strokeWidth="2"
          />
          <path
            d="M710.5 1H675.412C673.618 1 672.731 3.17836 674.015 4.43115L709.103 38.6838C710.37 39.9204 712.5 39.0229 712.5 37.2527V3C712.5 1.89543 711.605 1 710.5 1Z"
            stroke="#D2FF00"
            strokeWidth="2"
            fill={isOpen ? '#D2FF00' : 'none'}
          />

          {isOpen ? (
            <>
              <rect
                x="694.775"
                y="5"
                width="20"
                height="2"
                transform="rotate(45 696.775 6.89062)"
                fill="#252525"
              />
              <rect
                x="701"
                y="7.5"
                width="20"
                height="2"
                transform="rotate(135 705.924 8.30469)"
                fill="#252525"
              />
            </>
          ) : (
            <>
              <rect
                x="692.775"
                y="-0.5"
                width="17"
                height="2"
                transform="rotate(90 695.775 6.89062)"
                fill="#D2FF00"
              />
              <rect
                x="711.924"
                y="4.30469"
                width="17"
                height="2"
                transform="rotate(-180 710.924 8.30469)"
                fill="#D2FF00"
              />
            </>
          )}
        </svg>

        <div className="flex flex-grow rounded-b-2xl border-left-accent max-[2000px]:mr-[1.5px] max-[2000px]:border-x-2 max-[2000px]:border-b-2 min-[2000px]:mr-[1.7px] min-[2000px]:border-x-[3px] min-[2000px]:border-b-[3px]"></div>
      </div>
    </div>
  );
};
