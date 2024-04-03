import { TestingAppChain } from '@proto-kit/sdk';
import { Field, PrivateKey, UInt64 } from 'o1js';
import { log } from '@proto-kit/common';
import { Pickles } from 'o1js/dist/node/snarky';
import { dummyBase64Proof } from 'o1js/dist/node/lib/proof_system';
import { RuntimeModule } from '@proto-kit/module';

import {
  BiggerCard,
  Game,
  GameStatuses,
} from '../src/examples/BiggerCard/BiggerCards';
import {
  DecryptProofPublicInput,
  PokerDecryptProof,
  PokerPermutationMatrix,
  PokerShuffleProof,
  ShuffleProofPublicInput,
  initialEnctyptedPokerDeck,
  proveDecrypt,
  shuffle,
} from '../src/engine/cards/DefaultCards';

log.setLevel('ERROR');

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

const sendShuffle = async (
  appChain: TestingAppChain<any, any, any, any>,
  biggerCard: BiggerCard,
  game: Game,
  permutation: PokerPermutationMatrix,
  senderPrivateKey: PrivateKey,
) => {
  appChain.setSigner(senderPrivateKey);
  let sender = senderPrivateKey.toPublicKey();
  let initialDeck = game.encryptedDeck.cards[0].numOfEncryption
    .equals(UInt64.zero)
    .toBoolean()
    ? (game.encryptedDeck = initialEnctyptedPokerDeck)
    : game.encryptedDeck;
  let shuffleInput = new ShuffleProofPublicInput({
    initialDeck,
    agrigatedPubKey: game.agrigatedPublicKey,
  });

  let noises = [...Array(52)].map(() => Field.from(1));
  let shuffleOutput = shuffle(shuffleInput, permutation, noises);

  let shuffleProof = await mockProof(
    shuffleOutput,
    PokerShuffleProof,
    shuffleInput,
  );

  {
    const tx = await appChain.transaction(sender, () => {
      biggerCard.shuffle(game.id, shuffleProof);
    });
    await tx.sign();
    await tx.send();
  }

  let block = await appChain.produceBlock();
  expect(block?.transactions[0].status.toBoolean()).toBeTruthy();
};

const openCards = async (
  appChain: TestingAppChain<any, any, any, any>,
  biggerCard: BiggerCard,
  game: Game,
  senderPrivateKey: PrivateKey,
) => {
  appChain.setSigner(senderPrivateKey);
  let sender = senderPrivateKey.toPublicKey();
  let openInput1 = new DecryptProofPublicInput({
    m0: game.encryptedDeck.cards[0].value[0],
  });

  let openInput2 = new DecryptProofPublicInput({
    m0: game.encryptedDeck.cards[1].value[0],
  });

  let openOutput1 = proveDecrypt(openInput1, senderPrivateKey);
  let openOutput2 = proveDecrypt(openInput2, senderPrivateKey);

  let openProof1 = await mockProof(openOutput1, PokerDecryptProof, openInput1);
  let openProof2 = await mockProof(openOutput2, PokerDecryptProof, openInput2);

  {
    const tx = await appChain.transaction(sender, () => {
      biggerCard.openCardsFirstTwo(game.id, openProof1, openProof2);
    });
    await tx.sign();
    await tx.send();
  }

  let block = await appChain.produceBlock();
  expect(block?.transactions[0].status.toBoolean()).toBeTruthy();
};

describe('bigger card', () => {
  it('Check if cheet codes works', async () => {
    const appChain = TestingAppChain.fromRuntime({
      BiggerCard,
    });

    appChain.configurePartial({
      Runtime: {
        BiggerCard: {},
        Balances: {},
      },
    });

    const alicePrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();
    const bobPrivateKey = PrivateKey.random();
    const bob = bobPrivateKey.toPublicKey();

    await appChain.start();
    appChain.setSigner(alicePrivateKey);
    const biggerCard = appChain.runtime.resolve('BiggerCard');

    const gameId = UInt64.from(1);
    appChain.setSigner(alicePrivateKey);
    let tx = await appChain.transaction(alice, () => {
      biggerCard.participate(gameId);
    });

    await tx.sign();
    await tx.send();

    let block = await appChain.produceBlock();
    let game = await appChain.query.runtime.BiggerCard.games.get(gameId);
    expect(block!.transactions[0].status.toBoolean()).toBeTruthy();
    expect(game!.id.equals(gameId).toBoolean()).toBeTruthy();
    expect(game!.firstPlayer.toBase58()).toBe(alice.toBase58());

    appChain.setSigner(bobPrivateKey);
    tx = await appChain.transaction(bob, () => {
      biggerCard.participate(gameId);
    });

    await tx.sign();
    await tx.send();

    block = await appChain.produceBlock();
    expect(block?.transactions[0].status.toBoolean()).toBeTruthy();

    game = await appChain.query.runtime.BiggerCard.games.get(gameId);

    expect(game?.secondPlayer.toBase58()).toBe(bob.toBase58());

    expect(game?.status.equals(GameStatuses.INIT)).toBeTruthy();

    await sendShuffle(
      appChain,
      biggerCard,
      game!,
      PokerPermutationMatrix.getZeroMatrix().swap(0, 51),
      alicePrivateKey,
    );

    game = await appChain.query.runtime.BiggerCard.games.get(gameId);

    await sendShuffle(
      appChain,
      biggerCard,
      game!,
      PokerPermutationMatrix.getZeroMatrix(),
      bobPrivateKey,
    );

    game = await appChain.query.runtime.BiggerCard.games.get(gameId);

    await openCards(appChain, biggerCard, game!, alicePrivateKey);

    game = await appChain.query.runtime.BiggerCard.games.get(gameId);

    await openCards(appChain, biggerCard, game!, bobPrivateKey);

    game = await appChain.query.runtime.BiggerCard.games.get(gameId);

    console.log(game?.encryptedDeck.cards[0].toCard().toString());
    console.log(game?.encryptedDeck.cards[1].toCard().toString());

    appChain.setSigner(alicePrivateKey);
    tx = await appChain.transaction(alice, () => {
      biggerCard.pickWinner(gameId);
    });

    await tx.sign();
    await tx.send();

    block = await appChain.produceBlock();
    expect(block!.transactions[0].status.toBoolean()).toBeTruthy();

    game = await appChain.query.runtime.BiggerCard.games.get(gameId);

    expect(game!.winner.equals(alice).toBoolean()).toBeTruthy();
  }, 100000);
});
