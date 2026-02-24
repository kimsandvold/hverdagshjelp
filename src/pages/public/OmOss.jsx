import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

export default function OmOss() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Om Din Helt',
    description: 'Din Helt er en norsk plattform som kobler folk som trenger hjelp i hverdagen med lokale hjelpere — rengjøring, hagearbeid, småjobber og mer.',
    url: 'https://dinhelt.no/om-oss',
    isPartOf: { '@type': 'WebSite', name: 'Din Helt', url: 'https://dinhelt.no' },
  };

  return (
    <div>
      <SEO
        title="Om oss"
        description="Din Helt er en norsk plattform som kobler folk som trenger hjelp i hverdagen med lokale hjelpere — rengjøring, hagearbeid, småjobber og mer."
        url="https://dinhelt.no/om-oss"
        jsonLd={jsonLd}
      />

      {/* Hero */}
      <section className="bg-primary-500 px-4 pb-16 pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Om Din Helt
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/75">
            Vi bygger en enklere vei mellom folk som trenger hjelp og folk som kan hjelpe.
          </p>
        </div>
      </section>

      {/* Hva er Din Helt */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Hva er Din Helt?
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed text-gray-600">
            <p>
              Din Helt er en norsk plattform som kobler folk som trenger hjelp i hverdagen med lokale hjelpere som tilbyr tjenestene sine. Alt fra rengjøring og hagearbeid til leksehjelp, dyrepass og PC-support.
            </p>
            <p>
              Vi tror at det finnes tusenvis av folk der ute som har noe å tilby — men som aldri har hatt en enkel måte å nå kundene sine på. Din Helt gir dem den muligheten.
            </p>
          </div>
        </div>
      </section>

      {/* Hvorfor vi bygger dette */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Hvorfor vi bygger dette
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed text-gray-600">
            <p>
              Mange av oss har opplevd det: du trenger hjelp med noe hjemme, men vet ikke hvem du skal spørre. Kanskje du prøver en Facebook-gruppe, spør naboen, eller ender opp med å ikke gjøre noe i det hele tatt.
            </p>
            <p>
              Samtidig finnes det folk i nærheten som gjerne hadde tatt jobben — hvis de bare visste om den. Din Helt løser akkurat dette gapet.
            </p>
            <p>
              Vi ønsker å gjøre det like enkelt å finne en pålitelig hjelper som det er å bestille en pizza. Søk etter det du trenger, se hvem som er i nærheten, og ta direkte kontakt.
            </p>
          </div>
        </div>
      </section>

      {/* Verdier */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Det vi står for
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10 text-primary-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">Lokalt først</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Vi kobler deg med folk i nærheten. Korte avstander, bedre tillit og raskere hjelp.
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10 text-primary-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">Tillit og åpenhet</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Anmeldelser, tydelige profiler og direkte kommunikasjon. Du vet hvem du kontakter.
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10 text-primary-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">Rettferdig for hjelperne</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Hjelperne setter sine egne priser og avtaler direkte med kunden. Vi tar ikke provisjon av jobbene.
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10 text-primary-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">Lav terskel</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Det skal være enkelt å komme i gang — både som kunde og hjelper. Ingen kompliserte prosesser.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ambisjoner */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Hvor vi skal
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed text-gray-600">
            <p>
              Akkurat nå er Din Helt i en tidlig fase. Vi har lansert plattformen og jobber med å bygge et sterkt nettverk av hjelpere over hele Norge.
            </p>
            <p>
              Målet vårt er å bli det naturlige førstevalget når noen trenger hjelp i hverdagen — uansett om det er snakk om en flyttejobb, en lekse i matte, eller noen som kan lufte hunden.
            </p>
            <p>
              Vi utvikler plattformen kontinuerlig basert på tilbakemeldinger fra brukerne våre. Har du forslag eller ønsker? Vi vil gjerne høre fra deg.
            </p>
          </div>
        </div>
      </section>

      {/* Kontakt / CTA */}
      <section className="bg-primary-500 px-4 py-16">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-bold text-white">Bli en del av Din Helt</h2>
          <p className="mt-3 text-white/60">
            Enten du trenger hjelp eller har noe å tilby — du er velkommen.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-primary-500 shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl"
            >
              Finn hjelper
            </Link>
            <Link
              to="/bli-hjelper"
              className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-accent-600 hover:shadow-xl"
            >
              Bli hjelper
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/50">
            Spørsmål? Send oss en e-post på{' '}
            <a href="mailto:kontakt@dinhelt.no" className="font-medium text-white/70 underline hover:text-white">
              kontakt@dinhelt.no
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
