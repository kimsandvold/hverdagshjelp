import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import SearchBar from '../../components/ui/SearchBar';
import CategoryGrid from '../../components/CategoryGrid';
import SEO from '../../components/SEO';
import MinioAd from '../../components/MinioAd';

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
    name: 'Hverdagshjelp.no',
    url: 'https://hverdagshjelp.no',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://hverdagshjelp.no/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div>
      <SEO
        title="Finn hjelp til hverdagen"
        description="Rengjøring, hagearbeid, småjobber, besøksvenn og mer — finn pålitelig hjelp nær deg."
        url="https://hverdagshjelp.no/"
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
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-5xl px-4">
        <hr className="border-gray-200" />
      </div>

      {/* CTA section */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-3 text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Tjen penger på det du allerede kan
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-lg text-gray-500">
            Registrer deg som hjelper, bestem dine egne priser og timer — og bli synlig for folk i nærheten som trenger akkurat din kompetanse.
          </p>
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
                  <h3 className="text-xl font-semibold text-gray-900">
                    {variant.heading}
                  </h3>
                  <p className="mx-auto mt-3 max-w-xl text-base text-gray-600">
                    {variant.text}
                  </p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Benefits */}
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-2xl font-bold text-primary-500">Du bestemmer</p>
              <p className="mt-1 text-sm text-gray-500">Egne priser, egne timer</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-2xl font-bold text-primary-500">Gratis start</p>
              <p className="mt-1 text-sm text-gray-500">Kom i gang uten kostnad</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-2xl font-bold text-primary-500">Lokalt</p>
              <p className="mt-1 text-sm text-gray-500">Kunder rett i nærheten</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/bli-hjelper"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-8 py-4 text-lg font-bold text-white shadow-md transition-all hover:bg-primary-600 hover:shadow-lg"
            >
              Bli hjelper i dag
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
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
