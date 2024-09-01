'use client';

import 'reflect-metadata';
import Footer from '@/components/widgets/Footer/Footer';
import MainSection from '@/components/pages/MainSection';
import Header from '@/components/widgets/Header';
import ZkNoidGameContext from '@/lib/contexts/ZkNoidGameContext';
import { BorderBeam } from '@/components/ui/BorderBeam';
import { RotatingCards } from '@/components/rotatingcards';
import { TextHoverEffect } from '@/components/ui/text-hover-effect';
import HyperText from '@/components/magicui/hyper-text';
import Particles from '@/components/magicui/particles';

export default function Home() {
  return (
    <ZkNoidGameContext.Provider
      value={{
        client: undefined,
        appchainSupported: false,
        buildLocalClient: true,
      }}
    >
      <BorderBeam />
      {/* <Particles
        className="absolute inset-0"
        quantity={100}
        ease={80}
        color={'#ffffff'}
        refresh
      /> */}
      <div className="flex min-h-screen flex-col">
        <Header />

<<<<<<< HEAD
        <MainSection />
=======
        <main className="flex flex-col px-5">
          <div className="flex h-screen w-screen flex-col-reverse items-center justify-end lg:flex-row  lg:justify-between">
            <div className="flex w-full flex-col items-center md:w-2/5">
              <RotatingCards />
              {/* <Link
                href={'/poker'}
                className="w-96 bg-red-400 !px-3 !py-2 text-black"
              >
                Play Now!!! asdf s
              </Link> */}
            </div>
            <div className="flex w-full flex-col items-center lg:w-3/5">
              <TextHoverEffect text="ZKasino" />
              <HyperText
                text="Spin, Deal, Prove - The Future of Fair Play"
                className="md:text-3xl"
              />
              <HyperText
                text="Where Every Bet is Verified, Every Win is Certain"
                className="md:text-2xl"
              />
            </div>
          </div>
          <MainSection games={games} />
        </main>
>>>>>>> c4f8dc20451c2d88c0f2a4d7692ca436c206adf3

        <Footer />
      </div>
    </ZkNoidGameContext.Provider>
  );
}
