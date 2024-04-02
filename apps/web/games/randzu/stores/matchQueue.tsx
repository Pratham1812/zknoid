import { PublicKey, UInt64 } from 'o1js';
import { useContext, useEffect } from 'react';
import { useProtokitChainStore } from '@/lib/stores/protokitChain';
import { useNetworkStore } from '@/lib/stores/network';
import AppChainClientContext from '@/lib/contexts/AppChainClientContext';
import { randzuConfig } from '../config';
import { ClientAppChain } from '@proto-kit/sdk';
import { useMatchQueueStore } from '@/lib/stores/matchQueue';

export const useObserveRandzuMatchQueue = () => {
  const chain = useProtokitChainStore();
  const network = useNetworkStore();
  const matchQueue = useMatchQueueStore();
  const client = useContext<
    ClientAppChain<typeof randzuConfig.runtimeModules, any, any, any> | undefined
  >(AppChainClientContext);

  useEffect(() => {
    if (!network.walletConnected) {
      return;
    }

    if (!client) {
      throw Error('Context app chain client is not set');
    }

    matchQueue.loadMatchQueue(client.query.runtime.RandzuLogic, parseInt(chain.block?.height ?? '0'));
    matchQueue.loadActiveGame(
      client.query.runtime.RandzuLogic,
      parseInt(chain.block?.height ?? '0'),
      PublicKey.fromBase58(network.address!)
    );
  }, [chain.block?.height, network.walletConnected, network.address]);
};

