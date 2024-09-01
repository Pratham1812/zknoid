<<<<<<< HEAD
import { createConfig } from '@/lib/createConfig';
import { arkanoidConfig, arkanoidRedirectConfig } from './arkanoid/config';
import { randzuConfig, randzuRedirectConfig } from './randzu/config';
import { checkersConfig, checkersRedirectConfig } from './checkers/config';
import { thimblerigConfig, thimblerigRedirectConfig } from './thimblerig/config';
import { pokerConfig } from '@/games/poker/config';
import { tileVilleConfig } from '@/games/tileville/config';
import { lotteryConfig } from '@/games/lottery/config';
import { numberGuessingConfig } from './number_guessing/config';
=======
// import { arkanoidConfig, arkanoidRedirectConfig } from './arkanoid/config';
// import { checkersConfig, checkersRedirectConfig } from './checkers/config';
// import { thimblerigConfig, thimblerigRedirectConfig } from './thimblerig/config';
// import { tileVilleConfig } from '@/games/tileville/config';
// import { lotteryConfig } from '@/games/lottery/config';
>>>>>>> c4f8dc20451c2d88c0f2a4d7692ca436c206adf3

import { createConfig } from '@/lib/createConfig';
import { randzuConfig, randzuRedirectConfig } from './randzu/config';
import { pokerConfig } from '@/games/poker/config';
export const zkNoidConfig = createConfig({
  games: [
    // lotteryConfig,
    // tileVilleConfig,
    // checkersConfig,
    // thimblerigConfig,
    // arkanoidConfig,
    pokerConfig,
<<<<<<< HEAD
    arkanoidConfig,
    numberGuessingConfig
=======
    randzuConfig,
>>>>>>> c4f8dc20451c2d88c0f2a4d7692ca436c206adf3
  ],
});
