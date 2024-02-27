import { createConfig } from '@/lib/createConfig';
import { arkanoidConfig } from './arkanoid/config';
import { randzuConfig } from './randzu/config';
import { pokerConfig } from './poker/config';

export const zkNoidConfig = createConfig({
  games: [arkanoidConfig, randzuConfig, pokerConfig],
});
