import { AppChain, TestingAppChain } from '@proto-kit/sdk';
import { Field, PrivateKey, PublicKey, UInt64 } from 'o1js';
import { log } from '@proto-kit/common';
import { Pickles } from 'o1js/dist/node/snarky';
import { dummyBase64Proof } from 'o1js/dist/node/lib/proof_system';
import {
  Balances,
  GameInfo,
  POKER_DECK_SIZE,
  PermutationMatrix,
  Poker,
} from '../src';
import {
  ShuffleProof,
  ShuffleProofPublicInput,
  shuffle,
} from '../src/poker/ShuffleProof';
import {
  InitialOpen,
  InitialOpenProof,
  InitialOpenPublicInput,
  PublicOpenProof,
  PublicOpenPublicInput,
  proveInitialOpen,
  provePublicOpen,
} from '../src/poker/DecryptProof';
import { Runtime } from '@proto-kit/module';

log.setLevel('ERROR');

const chunkenize = (arr: any[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size),
  );

export async function mockProof<I, O, P>(
  publicOutput: O,
  ProofType: new ({
    proof,
    publicInput,
    publicOutput,
    maxProofsVerified,
  }: {
    proof: unknown;
    publicInput: I;
    publicOutput: any;
    maxProofsVerified: 0 | 2 | 1;
  }) => P,
  publicInput: I,
): Promise<P> {
  const [, proof] = Pickles.proofOfBase64(await dummyBase64Proof(), 2);
  return new ProofType({
    proof: proof,
    maxProofsVerified: 2,
    publicInput,
    publicOutput,
  });
}

/*
class PokerHelper {
  appChain: TestingAppChain<any, any>;
  poker: Poker;
  constructor(appChain: TestingAppChain<{ Poker: Poker }, any>, poker: Poker) {
    this.appChain = appChain;
    this.poker = poker;
  }

  sendShuffle() {}

  async getGameInfo(gameId: GameInfo): Promise<GameInfo> {
    let game = await this.appChain.query.runtime.Poker.games.get(gameId);

    if (!game) {
      throw Error('No game found');
    }

    return game;
  }
}
*/

// const getGame = async (appChain: AppChain, gameId: UInt64)

const sendShuffle = async (
  appChain: TestingAppChain<any, any>,
  poker: Poker,
  game: GameInfo,
  permutation: PermutationMatrix,
  senderPrivateKey: PrivateKey,
) => {
  appChain.setSigner(senderPrivateKey);
  let sender = senderPrivateKey.toPublicKey();
  let shuffleInput = new ShuffleProofPublicInput({
    initialDeck: game.deck,
    agrigatedPubKey: game.agrigatedPubKey,
  });

  let noises = [...Array(POKER_DECK_SIZE)].map(() => Field.from(1));
  let shuffleOutput = shuffle(shuffleInput, permutation, noises);

  let shuffleProof = await mockProof(shuffleOutput, ShuffleProof, shuffleInput);

  {
    const tx = await appChain.transaction(sender, () => {
      poker.setup(game.meta.id, shuffleProof);
    });
    await tx.sign();
    await tx.send();
  }

  await appChain.produceBlock();
};

const sendBid = async (
  appChain: TestingAppChain<any, any>,
  poker: Poker,
  game: GameInfo,
  senderPrivateKey: PrivateKey,
  amount: UInt64,
) => {
  appChain.setSigner(senderPrivateKey);
  let sender = senderPrivateKey.toPublicKey();
  const tx = await appChain.transaction(sender, () => {
    poker.bid(game.meta.id, amount);
  });
  await tx.sign();
  await tx.send();

  await appChain.produceBlock();
};

const sendInitialOpen = async (
  appChain: TestingAppChain<any, any>,
  poker: Poker,
  game: GameInfo,
  senderPrivateKey: PrivateKey,
  playerIndex: UInt64,
) => {
  appChain.setSigner(senderPrivateKey);
  let sender = senderPrivateKey.toPublicKey();
  let publicInput = new InitialOpenPublicInput({
    deck: game.deck,
    playerIndex,
  });
  let publicOutput = proveInitialOpen(publicInput, senderPrivateKey);
  let proof = await mockProof(publicOutput, InitialOpenProof, publicInput);

  {
    const tx = await appChain.transaction(sender, () => {
      poker.initialOpen(game.meta.id, proof);
    });
    await tx.sign();
    await tx.send();
  }

  await appChain.produceBlock();
};

const sendNextOpen = async (
  appChain: TestingAppChain<any, any>,
  poker: Poker,
  game: GameInfo,
  senderPrivateKey: PrivateKey,
  round: UInt64,
) => {
  appChain.setSigner(senderPrivateKey);
  let sender = senderPrivateKey.toPublicKey();
  let publicInput = new PublicOpenPublicInput({
    deck: game.deck,
    round,
  });
  let publicOutput = provePublicOpen(publicInput, senderPrivateKey);
  let proof = await mockProof(publicOutput, PublicOpenProof, publicInput);

  {
    const tx = await appChain.transaction(sender, () => {
      poker.openNext(game.meta.id, proof);
    });
    await tx.sign();
    await tx.send();
  }

  await appChain.produceBlock();
};

describe('game hub', () => {
  it.skip('Log proof', async () => {
    console.log(await dummyBase64Proof());
  });
  it('Two players basic case', async () => {
    const appChain = TestingAppChain.fromRuntime({
      modules: {
        Poker,
        Balances,
      },
    });

    appChain.configurePartial({
      Runtime: {
        Poker: {},
        Balances: {},
      },
    });

    const alicePrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();

    const bobPrivateKey = PrivateKey.random();
    const bob = bobPrivateKey.toPublicKey();

    await appChain.start();

    const poker = appChain.runtime.resolve('Poker');

    console.log('Finding match');
    // Find match
    {
      appChain.setSigner(alicePrivateKey);
      const tx1 = await appChain.transaction(alice, () => {
        poker.register(alice, UInt64.zero);
      });
      await tx1.sign();
      await tx1.send();

      appChain.setSigner(bobPrivateKey);
      const tx2 = await appChain.transaction(bob, () => {
        poker.register(bob, UInt64.zero);
      });
      await tx2.sign();
      await tx2.send();
    }

    await appChain.produceBlock();

    const gameId = UInt64.from(1);
    const aliceGameId =
      await appChain.query.runtime.Poker.activeGameId.get(alice);
    const bobGameId = await appChain.query.runtime.Poker.activeGameId.get(bob);

    expect(aliceGameId!.equals(bobGameId!).toBoolean()).toBeTruthy();
    expect(aliceGameId!.equals(gameId).toBoolean()).toBeTruthy();

    const getGame = async (): Promise<GameInfo> => {
      return (await appChain.query.runtime.Poker.games.get(gameId))!;
    };

    console.log('Setup');
    // Setup
    let game = await getGame();

    let alicePermutation = PermutationMatrix.getZeroMatrix();
    await sendShuffle(appChain, poker, game, alicePermutation, alicePrivateKey);

    game = await getGame();

    let bobPermutation = PermutationMatrix.getZeroMatrix();
    await sendShuffle(appChain, poker, game, bobPermutation, bobPrivateKey);

    console.log('First turn');
    // Fist turn

    // First turn open
    game = await getGame();
    await sendInitialOpen(appChain, poker, game, alicePrivateKey, UInt64.zero);
    game = await getGame();
    await sendInitialOpen(appChain, poker, game, bobPrivateKey, UInt64.from(1));
    game = await getGame();

    expect(game.inBid().toBoolean()).toBeTruthy();

    // First turn bid
    await sendBid(appChain, poker, game, alicePrivateKey, UInt64.from(1));
    await sendBid(appChain, poker, game, bobPrivateKey, UInt64.from(1));

    game = await getGame();
    expect(game.round.bank.equals(UInt64.from(2)).toBoolean()).toBeTruthy();
    expect(game.round.index.equals(UInt64.from(1)).toBoolean()).toBeTruthy();

    // Second turn - Fourth turns

    // for (let i = 1; i < 3; i++) {s
    for (let i = 1; i < 4; i++) {
      let round = UInt64.from(i);
      game = await getGame();
      expect(game.round.index.equals(round)).toBeTruthy();
      expect(game.inReveal().toBoolean()).toBeTruthy();
      await sendNextOpen(appChain, poker, game, alicePrivateKey, round);
      game = await getGame();
      expect(game.round.decLeft.equals(UInt64.from(1))).toBeTruthy();
      await sendNextOpen(appChain, poker, game, bobPrivateKey, round);

      game = await getGame();
      expect(game.round.index.equals(round)).toBeTruthy();
      expect(game.round.decLeft.equals(UInt64.from(2))).toBeTruthy();
      expect(game.inBid().toBoolean()).toBeTruthy();
      await sendBid(appChain, poker, game, alicePrivateKey, UInt64.from(1));
      game = await getGame();
      await sendBid(appChain, poker, game, bobPrivateKey, UInt64.from(1));
    }

    game = await getGame();
    // Wining
  }, 100000);
});
