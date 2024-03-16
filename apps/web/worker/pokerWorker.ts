import 'reflect-metadata';

import { dummyProofBase64 } from '@/app/constants/dummyProofBase64';
import { BRIDGE_CACHE } from '@/constants/bridge_cache';
import { WebFileSystem, fetchCache } from '@/lib/cache';
import { mockProof } from '@/lib/utils';
import { GetServerSideProps } from 'next';
import { Mina } from 'o1js016';

import { Field as Field014, PrivateKey, PublicKey, UInt64 } from 'o1js';
import {
  checkMapGeneration,
  checkGameRecord,
  Bricks,
  GameInputs,
  GameRecord,
  MapGenerationProof,
  initGameProcess,
  GameProcessProof,
  processTicks,
  GameRecordProof,
  client,
  EncryptedDeck,
  EncryptedCard,
  PermutationMatrix,
  POKER_DECK_SIZE,
} from 'zknoid-chain-dev';
import { DummyBridge } from 'zknoidcontractsl1';
import {
  ShuffleProof,
  ShuffleProofPublicInput,
  shuffle,
} from 'zknoid-chain-dev/dist/src/poker/ShuffleProof';
import {
  DecryptProof,
  DecryptProofPublicInput,
  InitialOpenProof,
  InitialOpenPublicInput,
  proveDecrypt,
  proveInitialOpen,
} from 'zknoid-chain-dev/dist/src/poker/DecryptProof';
import { randomBytes } from 'crypto';

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

const state = {
  gameRecord: null as null | typeof GameRecord,
  dummyBridge: null as null | typeof DummyBridge,
  dummyBridgeApp: null as null | DummyBridge,
  transaction: null as null | Transaction,
};

// ---------------------------------------------------------------------------------------

const functions = {
  // loadContracts: async (args: {}) => {
  //   console.log('[Worker] loading contracts');
  //   state.gameRecord = GameRecord;
  //   state.dummyBridge = DummyBridge;
  // },
  // compileContracts: async (args: {}) => {
  //   console.log('[Worker] compiling contracts');
  //   const fetchedCache = await fetchCache(BRIDGE_CACHE);
  //   await DummyBridge.compile({
  //     cache: WebFileSystem(fetchedCache),
  //   });
  //   console.log('[Worker] compiling contracts ended');
  // },
  // initZkappInstance: async (args: { bridgePublicKey58: string }) => {
  //   const publicKey = PublicKey.fromBase58(args.bridgePublicKey58);
  //   state.dummyBridgeApp = new state.dummyBridge!(publicKey);
  // },
  // bridge: async (amount: UInt64) => {
  //   // const transaction = await Mina.transaction(() => {
  //   //   state.dummyBridgeApp!.bridge(amount);
  //   // });
  //   // state.transaction = transaction;
  // },
  // proveBridgeTransaction: async (args: {}) => {
  //   await state.transaction!.prove();
  // },
  // getBridgeTransactionJSON: async (args: {}) => {
  //   return state.transaction!.toJSON();
  // },
  // proveGameRecord: async (args: { seedJson: any; inputs: any; debug: any }) => {
  //   let seed = Field014.fromJSON(args.seedJson);
  //   let userInputs = (<string[]>JSON.parse(args.inputs)).map((elem) =>
  //     GameInputs.fromJSON(elem),
  //   );
  //   console.log('[Worker] proof checking');
  //   console.log('Generating map proof');
  //   let gameContext = checkMapGeneration(seed);
  //   const mapGenerationProof = await mockProof(gameContext, MapGenerationProof);
  //   console.log('Generating gameProcess proof');
  //   let currentGameState = initGameProcess(gameContext);
  //   let currentGameStateProof = await mockProof(
  //     currentGameState,
  //     GameProcessProof,
  //   );
  //   for (let i = 0; i < userInputs.length; i++) {
  //     currentGameState = processTicks(
  //       currentGameStateProof,
  //       userInputs[i] as GameInputs,
  //     );
  //     currentGameStateProof = await mockProof(
  //       currentGameState,
  //       GameProcessProof,
  //     );
  //   }
  //   console.log('Generating game proof');
  //   const gameProof = await mockProof(
  //     checkGameRecord(mapGenerationProof, currentGameStateProof),
  //     GameRecordProof,
  //   );
  //   console.log('Proof generated', gameProof);
  //   gameProof.verify();
  //   console.log('Proof verified');
  //   console.log('Proof generated json', gameProof.toJSON());
  //   return gameProof.toJSON();
  // },

  proveShuffle: async (args: { deckJSON: any; agrigatedPkBase58: any }) => {
    console.log('Prove shuffle started');

    let deck = EncryptedDeck.fromJSONString(args.deckJSON);

    let agrigatedPubKey: PublicKey = PublicKey.fromBase58(
      args.agrigatedPkBase58
    );

    // @ts-ignore
    let publicInput: ShuffleProofPublicInput = new ShuffleProofPublicInput({
      initialDeck: deck,
      agrigatedPubKey: agrigatedPubKey,
    });
    let permutationMatrix = PermutationMatrix.getRandomMatrix();

    let noise = [...Array(POKER_DECK_SIZE)].map(() =>
      Field014.from('0x' + randomBytes(253).toString('hex'))
    );

    let publicOutput = shuffle(publicInput, permutationMatrix, noise);
    const shuffleProof = await mockProof(
      publicOutput,
      ShuffleProof,
      publicInput
    );

    return shuffleProof.toJSON();
  },

  proveDecrypt: async (args: { cardJSON: any; pkBase58: any }) => {
    console.log('Prove decode started');
    let card = EncryptedCard.fromJSONString(args.cardJSON);
    let privateKey: PrivateKey = PrivateKey.fromBase58(args.pkBase58);

    // @ts-ignore
    let publicInput = new DecryptProofPublicInput({
      m0: card.value[0],
    });

    let publicOutput = proveDecrypt(publicInput, privateKey);
    const decryptProof = await mockProof(
      publicOutput,
      DecryptProof,
      publicInput
    );

    return decryptProof.toJSON();
  },

  proveInitial: async (args: {
    deckJSON: any;
    pkBase58: any;
    playerIndex: any;
  }) => {
    console.log('Prove initial started');
    let deck = EncryptedDeck.fromJSONString(args.deckJSON);
    let privateKey: PrivateKey = PrivateKey.fromBase58(args.pkBase58);
    let playerIndex = UInt64.from(args.playerIndex);

    // @ts-ignore
    let publicInput = new InitialOpenPublicInput({
      deck,
      playerIndex,
    });

    let publicOutput = proveInitialOpen(publicInput, privateKey);
    const initalOpenProve = await mockProof(
      publicOutput,
      InitialOpenProof,
      publicInput
    );

    return initalOpenProve.toJSON();
  },
};

// ---------------------------------------------------------------------------------------

export type WorkerFunctions = keyof typeof functions;

export type PokerWorkerRequest = {
  id: number;
  fn: WorkerFunctions;
  args: any;
};

export type PokerWorkerReponse = {
  id: number;
  data: any;
};

if (typeof window !== 'undefined') {
  addEventListener(
    'message',
    async (event: MessageEvent<PokerWorkerRequest>) => {
      const returnData = await functions[event.data.fn](event.data.args);

      const message: PokerWorkerReponse = {
        id: event.data.id,
        data: returnData,
      };
      postMessage(message);
    }
  );
}

console.log('Web Worker Successfully Initialized.');

const message: PokerWorkerReponse = {
  id: 0,
  data: {},
};

postMessage(message);
