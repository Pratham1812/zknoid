import { ArkanoidGameHub } from './arkanoid/ArkanoidGameHub';
import { Poker } from './poker/Poker';
import { Balances } from './framework/balances';
import { RandzuLogic } from './randzu/RandzuLogic';

export default {
    modules: {
        ArkanoidGameHub,
        Balances,
        RandzuLogic,
        Poker,
    },
    config: {
        ArkanoidGameHub: {},
        Balances: {},
        RandzuLogic: {},
        Poker: {},
    },
};
