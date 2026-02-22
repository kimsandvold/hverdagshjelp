import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import subscriptions from '../../data/subscriptions.json';
import SEO from '../../components/SEO';

const steps = [
  {
    num: '1',
    title: 'Opprett profil',
    text: 'Registrer deg, beskriv hva du tilbyr og sett dine priser.',
  },
  {
    num: '2',
    title: 'Bli synlig',
    text: 'Kunder i ditt nærområde finner deg gjennom søk på plattformen.',
  },
  {
    num: '3',
    title: 'Tjen penger',
    text: 'Bli kontaktet direkte, avtal jobb og få betalt for arbeidet ditt.',
  },
];

const expectations = [
  {
    title: 'Vær pålitelig',
    text: 'Møt opp til avtalt tid, og gi beskjed i god tid hvis noe endrer seg.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    title: 'Kommuniser tydelig',
    text: 'Svar på henvendelser og avklar forventninger med kunden på forhånd.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
      </svg>
    ),
  },
  {
    title: 'Gjør ærlig arbeid',
    text: 'Lever det du har lovet, og si fra hvis noe er utenfor ditt kompetanseområde.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    title: 'Behandle kundene godt',
    text: 'Vær hyggelig, respektfull og profesjonell i all kontakt.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
      </svg>
    ),
  },
];

export default function BliHjelper() {
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();

  return (
    <div>
      <SEO
        title="Bli hjelper"
        description="Tjen penger på det du er god på — registrer deg som hjelper på Hverdagshjelp."
        url="https://hverdagshjelp.no/bli-hjelper"
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary-500 px-4 pb-20 pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(245,158,11,0.12)_0%,_transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
            Gjør en forskjell i ditt nabolag
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Bli hjelper på Hverdagshjelp
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/75">
            Mange trenger hjelp med hverdagslige oppgaver — men vet ikke hvem de
            skal spørre. Som hjelper gjør du en reell forskjell for folk i
            nærmiljøet ditt, samtidig som du tjener penger på det du allerede
            kan. Kom i gang gratis.
          </p>
        </div>
      </section>

      {/* Slik fungerer det — 3 steps */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Slik fungerer det
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-gray-500">
            Tre enkle steg for å komme i gang som hjelper.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.num} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-lg font-bold text-white">
                  {step.num}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hva forventes av deg — card grid */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Hva forventes av deg?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-gray-500">
            Som hjelper representerer du Hverdagshjelp. Her er det viktigste.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {expectations.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-gray-100 bg-gray-50 p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10 text-primary-500">
                  {item.icon}
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hvorfor bli hjelper — community angle */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Hvorfor bli hjelper?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-gray-500">
            Det handler om mer enn bare penger.
          </p>
          <div className="mt-12 space-y-12">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Styrk lokalsamfunnet ditt
              </h3>
              <p className="mt-3 leading-relaxed text-gray-600">
                Mange eldre, familier og travle folk sliter med å finne noen de
                stoler på for hverdagslige oppgaver. Ved å tilby hjelpen din
                lokalt bygger du tillit i nabolaget og bidrar til et tryggere,
                mer sammensveiset fellesskap. Du er ikke bare en tjenesteleverandør
                — du er en ressurs for menneskene rundt deg.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Ærlighet og kvalitet
              </h3>
              <p className="mt-3 leading-relaxed text-gray-600">
                Profilen din er det første kunder ser. Det er viktig at
                informasjonen du oppgir — erfaring, bilder, priser og beskrivelser
                — er ærlig og oppdatert. Misvisende profiler skader tilliten på
                plattformen og kan føre til at kontoen din blir fjernet.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Betaling og ansvar
              </h3>
              <p className="mt-3 leading-relaxed text-gray-600">
                Som hjelper er du selv ansvarlig for hvordan du mottar betaling fra
                kunden. Hverdagshjelp håndterer ikke betaling mellom deg og kunden
                — dere avtaler dette direkte seg imellom.
              </p>
              <p className="mt-3 leading-relaxed text-gray-600">
                Hvis du planlegger å bruke plattformen til å tjene penger
                regelmessig, anbefaler vi at du oppretter et{' '}
                <strong>enkeltpersonforetak (ENK)</strong>. Da kan du fakturere
                kunder, trekke fra utgifter og drive virksomheten din ryddig og
                lovlig. Det tar bare noen minutter og er helt gratis å registrere
                på{' '}
                <a
                  href="https://www.brreg.no"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary-500 underline hover:text-primary-600"
                >
                  Brønnøysundregistrene
                </a>
                . Du er ikke pålagt å ha foretak for å bruke plattformen, men det
                gir deg en tryggere og mer profesjonell ramme.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Godt omdømme gir flere oppdrag
              </h3>
              <p className="mt-3 leading-relaxed text-gray-600">
                Fornøyde kunder anbefaler deg videre til venner, naboer og familie
                — og jungeltelegrafen er den viktigste kanalen for å få flere
                oppdrag. Gode anmeldelser på profilen din gjør at nye kunder
                velger akkurat deg. Vær alltid vennlig, imøtekommende og
                profesjonell.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Priser */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Priser
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-gray-500">
            Kom i gang gratis — du velger eventuell oppgradering etter at du har
            registrert deg og satt opp profilen din.
          </p>

          <div className="mx-auto mt-8 max-w-xl rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-center">
            <p className="text-sm font-medium text-green-800">
              Alle hjelpere får <strong>Premium gratis</strong> frem til <strong>1. juni 2026</strong>.
              Etter dette vil du automatisk bli satt over på gratisplanen, med mulighet til å oppgradere.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 items-start gap-6 sm:grid-cols-3">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className={`relative rounded-2xl p-6 transition-shadow ${
                  sub.highlighted
                    ? 'border-2 border-accent-500 bg-white shadow-lg ring-1 ring-accent-500/20'
                    : 'border border-gray-200 bg-white'
                }`}
              >
                {sub.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-500 px-3 py-0.5 text-xs font-bold text-white">
                    Mest populær
                  </span>
                )}
                  <h3 className="text-lg font-bold text-gray-900">{sub.name}</h3>
                  <div className="mt-3">
                    {sub.price === 0 ? (
                      <span className="text-3xl font-bold text-gray-900">
                        Gratis
                      </span>
                    ) : (
                      <span>
                        <span className="text-3xl font-bold text-gray-900">
                          {sub.price} kr
                        </span>
                        <span className="text-sm text-gray-500">
                          /{sub.period}
                        </span>
                      </span>
                    )}
                  </div>
                  <ul className="mt-6 space-y-3">
                    {sub.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-sm text-gray-600"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* Terms + CTA */}
      <section className="border-t border-gray-200 bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-gray-900">Klar til å starte?</h2>
          <p className="mt-2 text-gray-500">
            Les gjennom og bekreft at du har forstått forventningene.
          </p>
          <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left transition-colors hover:border-primary-300">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 h-5 w-5 accent-primary-500"
            />
            <span className="text-sm leading-relaxed text-gray-600">
              Jeg har lest og forstått informasjonen over, og forplikter meg til
              å opptre ærlig og profesjonelt som hjelper på Hverdagshjelp.
            </span>
          </label>
          <div className="mt-6">
            <Button
              size="lg"
              disabled={!accepted}
              onClick={() => navigate('/registrer')}
            >
              Gå til registrering
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
