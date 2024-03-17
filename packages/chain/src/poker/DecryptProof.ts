import {
  Experimental,
  Group,
  Int64,
  PrivateKey,
  Provable,
  Struct,
  UInt64,
} from 'o1js';
import { EncryptedCard, EncryptedDeck, POKER_DECK_SIZE } from './types';
import { decrypt, decryptOne } from '../engine/ElGamal';

export class DecryptProofPublicInput extends Struct({
  m0: Group,
}) {}
export class DecryptProofPublicOutput extends Struct({
  decryptedPart: Group,
}) {}

export const proveDecrypt = (
  publicInput: DecryptProofPublicInput,
  pk: PrivateKey,
): DecryptProofPublicOutput => {
  let decryptedPart = decryptOne(pk, publicInput.m0);

  return new DecryptProofPublicOutput({
    decryptedPart,
  });
};

export const Decrypt = Experimental.ZkProgram({
  publicInput: DecryptProofPublicInput,
  publicOutput: DecryptProofPublicOutput,
  methods: {
    decrypt: {
      privateInputs: [PrivateKey],
      method: proveDecrypt,
    },
  },
});

export class DecryptProof extends Experimental.ZkProgram.Proof(Decrypt) {}

/////////////////////////////// Initial Open ////////////////////////////////////

export class InitialOpenPublicInput extends Struct({
  deck: EncryptedDeck,
  playerIndex: UInt64,
}) {}

export class InitialOpenPublicOutput extends Struct({
  decryptedValues: Provable.Array(Group, POKER_DECK_SIZE),
}) {}

export const proveInitialOpen = (
  publicInput: InitialOpenPublicInput,
  pk: PrivateKey,
): InitialOpenPublicOutput => {
  let decryptedValues: Group[] = Array(POKER_DECK_SIZE).fill(Group.zero);

  // Decrypt first two cards
  // decryptedValues[0] = decryptOne(pk, publicInput.deck.cards[0].value[0]);
  // decryptedValues[1] = decryptOne(pk, publicInput.deck.cards[1].value[0]);

  for (let i = 0; i < 2; i++) {
    // #TODOChange to max players
    let curPos = UInt64.from(i);

    // #TODO i is not constrained/ Fix it
    decryptedValues[5 + 2 * i] = Provable.if(
      curPos.equals(publicInput.playerIndex),
      Group.zero,
      decryptOne(pk, publicInput.deck.cards[5 + 2 * i].value[0]),
    );
    decryptedValues[5 + 2 * i + 1] = Provable.if(
      curPos.equals(publicInput.playerIndex),
      Group.zero,
      decryptOne(pk, publicInput.deck.cards[5 + 2 * i + 1].value[0]),
    );
  }

  return new InitialOpenPublicOutput({ decryptedValues });
};

export const InitialOpen = Experimental.ZkProgram({
  publicInput: InitialOpenPublicInput,
  publicOutput: InitialOpenPublicOutput,
  methods: {
    proveInitialOpen: {
      privateInputs: [PrivateKey],
      method: proveInitialOpen,
    },
  },
});

export class InitialOpenProof extends Experimental.ZkProgram.Proof(
  InitialOpen,
) {}

////////////////////////// Public card open ///////////////////////////

export class PublicOpenPublicInput extends Struct({
  deck: EncryptedDeck,
  indexes: Provable.Array(Int64, 3),
}) {}

export class PublicOpenPublicOutput extends Struct({
  decryptedValues: Provable.Array(Group, POKER_DECK_SIZE),
}) {}

export const publicOpen = (
  publicInput: PublicOpenPublicInput,
  pk: PrivateKey,
): PublicOpenPublicOutput => {
  let decryptedValues: Group[] = Array(POKER_DECK_SIZE).fill(Group.zero);

  for (let i = 0; i < publicInput.indexes.length; i++) {
    let index = publicInput.indexes[i];
    let val = Provable.if(index.isPositive(), index, Int64.from(0));
    let numVal = +val.toString();
    // #TODO Array access is not provable. Change to provable version
    let decrypted = decryptOne(pk, publicInput.deck.cards[numVal].value[0]);
    decryptedValues[numVal] = Provable.if(
      index.isPositive(),
      decrypted,
      Group.zero,
    );
  }

  return new InitialOpenPublicOutput({ decryptedValues });
};

export const PublicOpen = Experimental.ZkProgram({
  publicInput: PublicOpenPublicInput,
  publicOutput: PublicOpenPublicOutput,
  methods: {
    proveInitialOpen: {
      privateInputs: [PrivateKey],
      method: publicOpen,
    },
  },
});

export class PublicOpenProof extends Experimental.ZkProgram.Proof(PublicOpen) {}

/*
export class PublicOpenPublicInput extends Struct({
  deck: EncryptedDeck,
}) {}

export class PublicOpenPublicOutput extends Struct({
  decryptedValues: Provable.Array(Group, POKER_DECK_SIZE),
}) {}

// #TODO check if provable (should be ok)
export const publicInitialOpen =
  (cards: number[]) =>
  (
    publicInput: InitialOpenPublicInput,
    pk: PrivateKey,
  ): InitialOpenPublicOutput => {
    let decryptedValues: Group[] = Array(POKER_DECK_SIZE).fill(Group.zero);

    for (const card of cards) {
      // #TODO Array access is not provable. Change to provable version
      decryptedValues[card] = decryptOne(
        pk,
        publicInput.deck.cards[card].value[0],
      );
    }

    return new InitialOpenPublicOutput({ decryptedValues });
  };

export const FlopOpen = Experimental.ZkProgram({
  publicInput: InitialOpenPublicInput,
  publicOutput: InitialOpenPublicOutput,
  methods: {
    proveInitialOpen: {
      privateInputs: [PrivateKey],
      method: publicInitialOpen([0, 1, 2]),
    },
  },
});

export class FlopOpenProof extends Experimental.ZkProgram.Proof(FlopOpen) {}

export const TurnOpen = Experimental.ZkProgram({
  publicInput: InitialOpenPublicInput,
  publicOutput: InitialOpenPublicOutput,
  methods: {
    proveInitialOpen: {
      privateInputs: [PrivateKey],
      method: publicInitialOpen([3]),
    },
  },
});

export class TurnOpenProof extends Experimental.ZkProgram.Proof(TurnOpen) {}

export const RiverOpen = Experimental.ZkProgram({
  publicInput: InitialOpenPublicInput,
  publicOutput: InitialOpenPublicOutput,
  methods: {
    proveInitialOpen: {
      privateInputs: [PrivateKey],
      method: publicInitialOpen([4]),
    },
  },
});

export class RiverOpenProof extends Experimental.ZkProgram.Proof(TurnOpen) {}
*/
