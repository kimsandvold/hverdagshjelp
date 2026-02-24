import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import ShareButtons from '../../components/ui/ShareButtons';

const steps = [
  {
    num: '1',
    title: 'Flere hjelpere',
    text: 'Når flere melder seg, dekker vi flere kategorier og områder. Det gjør plattformen nyttig for flere.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
  },
  {
    num: '2',
    title: 'Flere kunder finner oss',
    text: 'Et bredere tilbud betyr at flere søker og finner hjelp hos oss — istedenfor å lete andre steder.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
  },
  {
    num: '3',
    title: 'Flere oppdrag til alle',
    text: 'Mer trafikk betyr flere forespørsler. Hver hjelper som melder seg løfter hele nettverket.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
      </svg>
    ),
  },
];

export default function VoksSammen() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Voks sammen med oss — Din Helt',
    description: 'Jo flere hjelpere som melder seg, jo bedre blir Din Helt for alle. Les hvordan du kan bidra til å bygge Norges største hjelpernettverk.',
    url: 'https://dinhelt.no/voks-sammen',
    publisher: { '@type': 'Organization', name: 'Din Helt', url: 'https://dinhelt.no' },
  };

  return (
    <div>
      <SEO
        title="Voks sammen med oss"
        description="Jo flere hjelpere som melder seg, jo bedre blir Din Helt for alle. Les hvordan du kan bidra til å bygge Norges største hjelpernettverk."
        url="https://dinhelt.no/voks-sammen"
        type="article"
        jsonLd={jsonLd}
      />

      {/* Hero */}
      <section className="bg-primary-500 px-4 pb-16 pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-accent-300">
            Sammen er vi sterkere
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Din Helt vokser med deg
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/75">
            Vi er i starten av noe stort — og akkurat nå betyr hver eneste hjelper som melder seg enormt mye.
          </p>
        </div>
      </section>

      {/* The network effect — explained simply */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Hvorfor flere hjelpere betyr mer for deg
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed text-gray-600">
            <p>
              Tenk på det slik: en plattform med to hjelpere er ikke spesielt nyttig for noen. Men en plattform med hundrevis av hjelpere, spredt over hele landet, med alt fra rengjøring til leksehjelp? Det er en plattform folk forteller vennene sine om.
            </p>
            <p>
              Jo flere som melder seg, jo flere kategorier og områder dekker vi. Det gjør at flere kunder finner oss — og flere kunder betyr flere oppdrag. Ikke bare for de nye hjelperne, men for <strong>alle</strong> som er med.
            </p>
            <p>
              Det handler om en enkel sirkel som forsterker seg selv:
            </p>
          </div>

          {/* Cycle visualization */}
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-500/10 text-primary-500">
                    {step.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{step.text}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-6 w-6 items-center justify-center rounded-full bg-accent-500 text-white">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Looping arrow back */}
          <div className="mt-4 hidden sm:flex justify-center">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
              </svg>
              Sirkelen gjentar seg — og forsterkes over tid
            </div>
          </div>
        </div>
      </section>

      {/* What you can do */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Slik kan du bidra
          </h2>
          <p className="mt-3 text-base text-gray-500">
            Du trenger ikke gjøre alt. Men hver av disse tingene hjelper:
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-4 rounded-xl bg-white p-5 shadow-sm">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Registrer deg som hjelper</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  Det viktigste steget. Opprett profilen din, legg til tjenestene dine og bli synlig. Det tar bare noen minutter.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl bg-white p-5 shadow-sm">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Fortell noen om oss</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  Kjenner du noen som er flink med hage, matlaging eller bare liker å hjelpe? Send dem en lenke. Muntlig anbefaling er det sterkeste vi har.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl bg-white p-5 shadow-sm">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Gjør en god jobb</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  Fornøyde kunder kommer tilbake — og de forteller andre. Gode anmeldelser bygger tillit for hele plattformen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Honest transparency block */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-primary-100 bg-primary-50 px-6 py-8 sm:px-10">
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Vi er tidlig — og det er en fordel for deg
            </h2>
            <div className="mt-4 space-y-4 text-base leading-relaxed text-gray-600">
              <p>
                Din Helt er en ny plattform. Det betyr at vi ikke har tusenvis av hjelpere ennå — men det betyr også at <strong>du kan bli den som setter standarden</strong> i ditt område.
              </p>
              <p>
                De som melder seg tidlig får en fordel: færre konkurrenter, bedre synlighet, og muligheten til å bygge omdømme og anmeldelser før markedet fylles opp.
              </p>
              <p>
                Basis er gratis frem til 1. juni 2026, så du risikerer ingenting ved å prøve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Share */}
      <section className="bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium text-gray-500">
            Kjenner du noen som burde lese dette? Del artikkelen.
          </p>
          <div className="flex justify-center">
            <ShareButtons
              title="Din Helt vokser med deg — bli med i nettverket"
              text="Jo flere hjelpere som melder seg, jo bedre blir plattformen for alle. Les mer:"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary-500 px-4 py-16">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Klar til å bli med?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-white/70">
            Registrer deg som hjelper i dag — det er gratis, tar noen minutter, og gjør plattformen bedre for alle.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/bli-hjelper"
              className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-accent-600 hover:shadow-xl"
            >
              Bli hjelper
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
