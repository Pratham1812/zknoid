import Swiper from './ui/Swiper';
import CentralBlock from './ui/CentralBlock';
import Storefront from './ui/Storefront';
import { Suspense } from 'react';

export default function MainSection() {
  return (
<<<<<<< HEAD
    <main className={'px-[2.604vw]'}>
      <Swiper />

      <Suspense fallback={<p>Loading...</p>}>
        <CentralBlock />
        <Storefront />
      </Suspense>
    </main>
=======
    <>
      {/* <Swiper /> */}

      {/* <div className={'flex w-full flex-col justify-between lg:flex-row'}> */}
      {/* <MobileCentralBlock /> */}
      {/* <WidgetsSwitch page={page} setPage={setPage} /> */}
      {/* <CentralBlock page={page} setPage={setPage} /> */}
      {/* </div> */}

      <div className="relative z-0 flex flex-col rounded-b-[10px] border-x border-b border-left-accent bg-bg-dark lg:rounded-tl-[5rem] lg:border-none">
        <div className="absolute left-0 top-0 -z-10 hidden h-full w-full flex-col lg:flex">
          <svg
            viewBox="0 0 1502 200"
            fill="#212121"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M1451 2341H51C23.3858 2341 1 2318.37 1 2290.75V107V51C1 23.3857 23.3858 1 51 1H650.474C663.726 1 676.436 6.26099 685.812 15.627L723.596 53.373C732.971 62.739 745.681 68 758.933 68H1451C1478.61 68 1501 90.3857 1501 118V182V2291C1501 2318.61 1478.61 2341 1451 2341Z"
              stroke="#D2FF00"
              strokeWidth="0.160rem"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="flex-grow border-x-[0.160rem] border-left-accent bg-bg-grey" />
          <svg
            viewBox="0 2142 1502 200"
            fill="#212121"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M1451 2341H51C23.3858 2341 1 2318.37 1 2290.75V107V51C1 23.3857 23.3858 1 51 1H650.474C663.726 1 676.436 6.26099 685.812 15.627L723.596 53.373C732.971 62.739 745.681 68 758.933 68H1451C1478.61 68 1501 90.3857 1501 118V182V2291C1501 2318.61 1478.61 2341 1451 2341Z"
              stroke="#D2FF00"
              strokeWidth="0.160rem"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        {page === Pages.GameStore && <Storefront games={games} />}
        {page === Pages.FavoriteGames && <FavoriteGames games={games} />}
        {page === Pages.Support && <SupportAndFaq />}
      </div>
    </>
>>>>>>> c4f8dc20451c2d88c0f2a4d7692ca436c206adf3
  );
}
