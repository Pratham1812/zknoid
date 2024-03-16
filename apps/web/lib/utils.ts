import { RuntimeModulesRecord } from '@proto-kit/module';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GameRecordProof } from 'zknoid-chain';
import { ClientAppChain } from 'zknoid-chain-dev';

import { dummyProofBase64 } from '@/app/constants/dummyProofBase64';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const dummy = GameRecordProof.fromJSON({
  publicInput: [],
  publicOutput: [''],
  maxProofsVerified: 2,
  proof: dummyProofBase64,
});

export async function mockProof<I, O, P>(
  publicOutput: O,
  ProofType: new ({
    proof,
    publicInput,
    publicOutput,
    maxProofsVerified,
  }: {
    proof: unknown;
    publicInput: I | undefined;
    publicOutput: any;
    maxProofsVerified: 0 | 2 | 1;
  }) => P,
  publicInput?: I
): Promise<P> {
  return new ProofType({
    proof: dummy.proof,
    maxProofsVerified: 2,
    publicInput,
    publicOutput,
  });
}

export function buildClient<
  RuntimeModules extends RuntimeModulesRecord = RuntimeModulesRecord,
>(modules: RuntimeModules) {
  const client = ClientAppChain.fromRuntime({
    modules,
  });

  client.configure({
    Runtime: {
      ArkanoidGameHub: {},
      Balances: {},
      RandzuLogic: {},
      ThimblerigLogic: {},
      Poker: {},
    },
  });

  client.configurePartial({
    GraphqlClient: {
      url:
        process.env.NEXT_PUBLIC_PROTOKIT_URL || 'http://127.0.0.1:8080/graphql',
    },
  });

  return client;
}

export function formatDecimals(value: number) {
  return value / 10 ** 9;
}
