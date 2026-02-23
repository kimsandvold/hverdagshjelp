import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import SearchBar from '../../components/ui/SearchBar';
import CategoryGrid from '../../components/CategoryGrid';
import SEO from '../../components/SEO';
import MinioAd from '../../components/MinioAd';
import ShareButtons from '../../components/ui/ShareButtons';

const ctaVariants = [
  {
    categoryId: 'rengjoring',
    heading: 'Er du god med kosten?',
    text: 'Mange trenger hjelp med rengjøring, men finner ikke noen de stoler på. Kanskje er du den rette.',
  },
  {
    categoryId: 'hage-og-utearbeid',
    heading: 'Liker du å se ting gro?',
    text: 'Hage, snørydding og utearbeid — mange trenger en ekstra hånd utendørs. Din innsats kan gjøre en stor forskjell.',
  },
  {
    categoryId: 'smajobber',
    heading: 'Flink til å fikse ting?',
    text: 'En løs hylle, et bilde som skal henges opp, en dør som knirker. Småjobber som betyr mye for noen.',
  },
  {
    categoryId: 'flyttehjelp',
    heading: 'Sterk rygg og ledig lørdag?',
    text: 'Flytting er stressende nok som det er. Med litt ekstra muskelkraft kan du gjøre dagen enklere for noen.',
  },
  {
    categoryId: 'kjoring-og-folge',
    heading: 'Ledig bil og litt tid?',
    text: 'Mange trenger skyss til legen, butikken eller en avtale — og setter pris på litt selskap underveis.',
  },
  {
    categoryId: 'dyrepass',
    heading: 'Glad i dyr?',
    text: 'Noen ganger trenger en hund en ekstra tur, eller en katt pass mens eieren er bortreist. Kanskje er det akkurat det du kan tilby.',
  },
  {
    categoryId: 'besoksvenn',
    heading: 'Har du tid til en kaffe?',
    text: 'Noen trenger bare noen å prate med. Et besøk, en kaffekopp, litt selskap. Det kan bety alt.',
  },
  {
    categoryId: 'matlaging',
    heading: 'Glad i å lage mat?',
    text: 'Et hjemmelaget måltid kan lyse opp hverdagen for noen som ikke klarer det selv. Del matgleden din.',
  },
  {
    categoryId: 'motivator',
    heading: 'Er du en som heier?',
    text: 'Noen trenger en treningspartner, en vanebygger eller bare et daglig dytt i riktig retning. Kanskje er du den personen.',
  },
];

const shuffled = [...ctaVariants].sort(() => Math.random() - 0.5);

const highlights = [
  { title: 'Hjem og hage', items: ['Rengjøring', 'Hage og utearbeid', 'Småjobber og vedlikehold', 'Rydding og organisering'] },
  { title: 'Praktisk hjelp', items: ['Handlehjelp og ærend', 'Flytting og bærehjelp', 'Kjøring og følge', 'Matlaging og måltider'] },
  { title: 'Omsorg og selskap', items: ['Besøksvenn og selskap', 'Turfølge og aktiviteter', 'Barnepass', 'Dyrepass'] },
  { title: 'Læring og utvikling', items: ['Digital hjelp', 'Leksehjelp og språkhjelp', 'Kurs og opplæring', 'Motivator'] },
];

export default function Forside() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Din Helt',
    url: 'https://dinhelt.no',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://dinhelt.no/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div>
      <SEO
        title="Finn hjelp til hverdagen"
        description="Rengjøring, hagearbeid, småjobber, besøksvenn og mer — finn pålitelig hjelp nær deg."
        url="https://dinhelt.no/"
        jsonLd={jsonLd}
      />
      {/* Hero section with search and categories */}
      <section className="bg-primary-500 px-4 pb-16 pt-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            {'Finn pålitelig hjelp til hverdagen'}
          </h1>
          <p className="mt-4 text-lg text-white/80">
            {'Praktisk hjelp, selskap og læring — nær deg.'}
          </p>
          <div className="mt-8">
            <SearchBar variant="large" />
          </div>
          <div className="mt-10">
            <CategoryGrid variant="compact" />
          </div>
        </div>
      </section>

      {/* What you can get help with */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-3 text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Hva kan du få hjelp med?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-lg text-gray-500">
            Alt fra praktiske oppgaver i hjemmet til selskap og transport — vi kobler deg med hjelpere i nærheten.
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((group) => (
              <div key={group.title}>
                <h3 className="mb-3 text-lg font-semibold text-gray-900">
                  {group.title}
                </h3>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li key={item} className="text-base text-gray-600">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <p className="mb-4 text-sm font-medium text-gray-500">
              Kjenner du noen som trenger hjelp — eller noen som kan hjelpe? Del siden.
            </p>
            <div className="flex justify-center">
              <ShareButtons
                title="Din Helt — Finn pålitelig hjelp til hverdagen"
                text="Finn hjelp til hverdagen, eller meld deg som hjelper:"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-primary-500 px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">
            Tjen penger på det du allerede kan
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-base text-white/70">
            Registrer deg som hjelper, bestem dine egne priser og timer — og bli synlig for folk i nærheten som trenger akkurat din kompetanse.
          </p>

          {/* Swiper in a card */}
          <div className="mx-auto mt-10 max-w-2xl rounded-2xl bg-white/10 px-8 py-8 backdrop-blur-sm">
            <Swiper
              modules={[Autoplay, EffectFade]}
              effect="fade"
              fadeEffect={{ crossFade: true }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              loop
              speed={800}
            >
              {shuffled.map((variant) => (
                <SwiperSlide key={variant.categoryId}>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-white">
                      {variant.heading}
                    </h3>
                    <p className="mx-auto mt-2 max-w-lg text-base text-white/70">
                      {variant.text}
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Benefits row */}
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-accent-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-white">Du bestemmer</p>
              <p className="text-xs text-white/60">Egne priser, egne timer</p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-accent-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-white">Gratis start</p>
              <p className="text-xs text-white/60">Kom i gang uten kostnad</p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-accent-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-white">Lokalt</p>
              <p className="text-xs text-white/60">Kunder rett i nærheten</p>
            </div>
          </div>

          {/* Audience tags */}
          <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-2">
            <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70">Studenter</span>
            <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70">Arbeidssøkende</span>
            <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70">Ekstra inntekt</span>
            <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70">Gjøre noe for andre</span>
          </div>

          {/* CTA button */}
          <div className="mt-10 text-center">
            <Link
              to="/bli-hjelper"
              className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-accent-600 hover:shadow-xl"
            >
              Bli hjelper i dag
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Ad — Minio.no */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <MinioAd />
        </div>
      </section>
    </div>
  );
}
