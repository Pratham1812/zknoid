import { immer } from 'zustand/middleware/immer';
import { Bool, PublicKey, UInt64 } from 'o1js';
import { type ModuleQuery } from '@proto-kit/sequencer';
import { LobbyManager } from 'zknoid-chain-dev/dist/src/engine/LobbyManager';
import { ILobby } from '../types';
import { Currency } from '@/constants/currency';
import { MatchMaker } from 'zknoid-chain-dev';

export interface IMatchamkingOption {
  id: number;
  pay: number;
}

export interface LobbiesState {
  loading: boolean;
  lobbies: ILobby[];
  currentLobby?: ILobby;
  selfReady: boolean;
  activeGameId?: number;
  mathcmakingOptions: IMatchamkingOption[];
  loadLobbies(
    query: ModuleQuery<LobbyManager>,
    address: PublicKey
  ): Promise<void>;
  loadMathcmakingOptions(query: ModuleQuery<MatchMaker>): Promise<void>;
}

export const lobbyInitializer = immer<LobbiesState>((set) => ({
  loading: Boolean(false),
  lobbies: [],
  currentLobby: undefined,
  selfReady: false,
  activeGameId: undefined,
  mathcmakingOptions: [],
  async loadLobbies(query: ModuleQuery<LobbyManager>, address: PublicKey) {
    set((state) => {
      state.loading = true;
    });

    const lastLobbyId = await query.lastLobbyId.get();
    let lobbies: ILobby[] = [];

    if (!lastLobbyId) {
      console.log(`Can't get lobby info`);
      return;
    }

    const contractActiveGameId = await query.activeGameId.get(address);
    const activeGameId = contractActiveGameId
      ? +contractActiveGameId
      : contractActiveGameId;

    // console.log('Last lobby id: ', +lastLobbyId);
    for (let i = 0; i < +lastLobbyId; i++) {
      let curLobby = await query.activeLobby.get(UInt64.from(i));

      if (curLobby && curLobby.started.not().toBoolean()) {
        const players = +curLobby.curAmount;
        lobbies.push({
          id: i,
          name: curLobby.name.toString(),
          reward: 0n,
          fee: curLobby.participationFee.toBigInt(),
          maxPlayers: 2,
          players,
          playersAddresses: curLobby.players.slice(0, players),
          playersReady: curLobby.ready
            .slice(0, players)
            .map((val: Bool) => val.toBoolean()),
          privateLobby: curLobby.privateLobby.toBoolean(),
          currency: Currency.ZNAKES,
          accessKey: '',
        });
      }
    }

    const currentLobbyId = await query.currentLobby.get(address);
    let curLobby: ILobby | undefined = undefined;
    let selfReady: boolean = false;

    if (currentLobbyId) {
      curLobby = lobbies.find((lobby) => lobby.id == +currentLobbyId);

      if (curLobby) {
        for (let i = 0; i < curLobby.players; i++) {
          if (curLobby.playersAddresses![i].equals(address).toBoolean()) {
            selfReady = curLobby!.playersReady![i];
          }
        }
      }
    }

    set((state) => {
      // @ts-ignore
      state.lobbies = lobbies;
      state.loading = false;
      state.activeGameId = activeGameId;
      state.currentLobby = curLobby;
      state.selfReady = selfReady;
    });
  },

  async loadMathcmakingOptions(query: ModuleQuery<MatchMaker>) {
    let lastDefaultLobbyId = await query.lastDefaultLobby.get();
    let mathcmakingOptions: IMatchamkingOption[] = [];

    if (lastDefaultLobbyId) {
      for (let i = 1; i < +lastDefaultLobbyId; i++) {
        let curDefaultLobby = await query.defaultLobbies.get(UInt64.from(i));

        mathcmakingOptions.push({
          id: i,
          pay: +curDefaultLobby!.participationFee,
        });
      }
    }

    set((state) => {
      state.mathcmakingOptions = mathcmakingOptions;
    });
  },
}));
