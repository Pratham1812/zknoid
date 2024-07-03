import { cn } from '@/lib/helpers';
import TicketCard from './ui/TicketCard';
import BuyInfoCard from './ui/BuyInfoCard';
import { useEffect, useState } from 'react';
import GetMoreTicketsButton from './ui/GetMoreTicketsButton';
import OwnedTickets from './OwnedTickets';
import { useWorkerClientStore } from '@/lib/stores/workerClient';
import { BLOCK_PER_ROUND } from 'l1-lottery-contracts';
import { useChainStore } from '@/lib/stores/minaChain';
import { AnimatePresence } from 'framer-motion';
import { useNetworkStore } from '@/lib/stores/network';
import PreviousRounds from '@/games/lottery/ui/TicketsSection/PreviousRounds';
import Skeleton from '@/components/shared/Skeleton';

interface TicketInfo {
  amount: number;
  numbers: number[];
}

export default function TicketsSection() {
  const ROUNDS_PER_PAGE = 2;
  const workerClientStore = useWorkerClientStore();
  const chainStore = useChainStore();
  const networkStore = useNetworkStore();
  const lotteryStore = useWorkerClientStore();
  const emptyTicket: TicketInfo = { numbers: [0, 0, 0, 0, 0, 0], amount: 0 };

  const [page, setPage] = useState<number>(1);
  const [tickets, _setTickets] = useState<TicketInfo[]>([emptyTicket]);
  const [roundInfos, setRoundInfos] = useState<
    | {
        id: number;
        bank: bigint;
        tickets: {
          amount: bigint;
          numbers: number[];
          owner: string;
          claimed: boolean;
        }[];
        winningCombination: number[] | undefined;
      }[]
    | undefined
  >(undefined);

  useEffect(() => {
    if (!lotteryStore.stateM) return;

    const roundsToShow = Array.from(
      { length: ROUNDS_PER_PAGE },
      (_, i) => lotteryStore.lotteryRoundId - i - page * ROUNDS_PER_PAGE
    ).filter((x) => x >= 0);

    (async () => {
      console.log('Tickets fetching');
      const roundInfos = await lotteryStore.getRoundsInfo(roundsToShow);
      console.log('Fetched round infos', roundInfos, Object.values(roundInfos));

      console.log('Round infos', Object.values(roundInfos));
      setRoundInfos(Object.values(roundInfos));
    })();
  }, [page, lotteryStore.stateM]);

  return (
    <div
      className={cn(
        'relative rounded-[0.67vw] border border-left-accent',
        'flex flex-col gap-[6vw] px-[2vw] py-[2.67vw]'
      )}
    >
      <div className="">
        <div className="grid grid-cols-2 gap-[2vw]">
          <OwnedTickets roundId={workerClientStore.lotteryRoundId} />
          <div className={'flex flex-col'}>
            <div className="mb-[1.33vw] text-[2.13vw]">Buy tickets</div>
            <div className={'flex flex-row gap-[1.33vw]'}>
              <div className={'flex flex-col gap-0'}>
                <AnimatePresence>
                  {tickets.map((_, index) => (
                    <TicketCard
                      key={index}
                      index={index}
                      ticketsAmount={tickets.length}
                      addTicket={(ticket) => {
                        tickets[index] = ticket;
                      }}
                      removeTicket={() => tickets.pop()}
                    />
                  ))}
                </AnimatePresence>
              </div>
              <div className={'flex flex-col gap-[1.33vw]'}>
                <BuyInfoCard
                  buttonActive={
                    workerClientStore.status === 'Lottery initialized' &&
                    tickets.length > 0 &&
                    tickets[0].amount != 0
                  }
                  ticketsInfo={tickets}
                  loaderActive={
                    workerClientStore.status !== 'Lottery initialized'
                  }
                />
                <GetMoreTicketsButton
                  disabled={tickets[tickets.length - 1].amount == 0}
                  onClick={() => {
                    tickets.push(emptyTicket);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="">
        <div className="mb-[1.33vw] text-[2.13vw]">Previous Lotteries</div>
        <div className={'flex w-full flex-row gap-[1.042vw]'}>
          {!!roundInfos ? (
            <PreviousRounds
              page={page}
              setPage={setPage}
              ROUNDS_PER_PAGE={ROUNDS_PER_PAGE}
              roundInfos={roundInfos}
              roundId={workerClientStore.lotteryRoundId}
            />
          ) : (
            <div className={'grid w-full grid-cols-2 gap-[1.042vw] p-4'}>
              <Skeleton
                isLoading={!roundInfos}
                className={'h-[15vw] w-full rounded-[0.67vw]'}
              >
                <div />
              </Skeleton>
              <Skeleton
                isLoading={!roundInfos}
                className={'h-[15vw] w-full rounded-[0.67vw]'}
              >
                <div />
              </Skeleton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
