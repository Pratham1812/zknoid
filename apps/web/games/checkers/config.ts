import { createZkNoidGameConfig } from '@/lib/createConfig';
import { CheckersLogic } from 'zknoid-chain-dev';
import RandzuPage from './components/CheckersPage';
import { ZkNoidGameFeature, ZkNoidGameGenre } from '@/lib/platform/game_tags';

export const checkersConfig = createZkNoidGameConfig({
  id: 'checkers',
  name: 'Checkers game',
  description:
    'Two players take turns placing pieces on the board attempting to create lines of 5 of their own color',
  image: '/image/games/randzu.svg',
  genre: ZkNoidGameGenre.BoardGames,
  features: [ZkNoidGameFeature.Multiplayer],
  isReleased: true,
  releaseDate: new Date(2024, 0, 1),
  popularity: 50,
  author: 'ZkNoid Team',
  runtimeModules: {
    CheckersLogic,
  },
  page: RandzuPage,
});
