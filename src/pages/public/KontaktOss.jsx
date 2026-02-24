import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xreaonwq';

const faqData = [
  {
    q: 'Er det gratis å bruke Din Helt?',
    a: 'Ja, det er helt gratis å søke etter og kontakte hjelpere. Hjelperne betaler et lite abonnement for å være synlige på plattformen.',
  },
  {
    q: 'Hvordan finner jeg en hjelper?',
    a: 'Bruk søkefunksjonen på forsiden. Velg kategori og sted, så får du en liste over hjelpere i nærheten. Du kan se profiler, anmeldelser og priser før du tar kontakt.',
  },
  {
    q: 'Hvordan blir jeg hjelper?',
    a: 'Registrer deg som hjelper via "Bli hjelper"-siden. Du oppretter en profil, velger hvilke tjenester du tilbyr, og setter dine egne priser. Du er synlig for kunder med en gang.',
  },
  {
    q: 'Er hjelperne kvalitetssikret?',
    a: 'Alle hjelpere har verifiserte profiler og kan samle anmeldelser fra kunder. Vi jobber kontinuerlig med å sikre kvaliteten på plattformen.',
  },
  {
    q: 'Hvordan avtaler vi pris?',
    a: 'Hjelperne setter sine egne veiledende priser. Endelig pris avtales direkte mellom deg og hjelperen basert på oppdraget.',
  },
  {
    q: 'Hva om jeg ikke er fornøyd?',
    a: 'Ta kontakt med oss via skjemaet på denne siden. Vi tar alle tilbakemeldinger på alvor og hjelper deg med å finne en løsning.',
  },
];

export default function KontaktOss() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [openFaq, setOpenFaq] = useState(null);

  const setField = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('email', form.email);
    formData.append('phone', form.phone);
    formData.append('subject', form.subject);
    formData.append('message', form.message);

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        setStatus('success');
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Kontakt Din Helt',
    description: 'Ta kontakt med Din Helt. Send oss en melding, så svarer vi innen kort tid.',
    url: 'https://dinhelt.no/kontakt',
    isPartOf: { '@type': 'WebSite', name: 'Din Helt', url: 'https://dinhelt.no' },
  };

  return (
    <div>
      <SEO
        title="Kontakt oss"
        description="Ta kontakt med Din Helt. Send oss en melding med spørsmål, tilbakemeldinger eller forslag — vi svarer innen kort tid."
        url="https://dinhelt.no/kontakt"
        jsonLd={jsonLd}
      />

      {/* Hero */}
      <section className="bg-primary-500 px-4 pb-16 pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Kontakt oss
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/75">
            Har du spørsmål, tilbakemeldinger eller forslag? Vi hører gjerne fra deg.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="mb-10 text-base leading-relaxed text-gray-600">
            Enten du lurer på noe om plattformen, har en idé til en forbedring, eller trenger hjelp med kontoen din — send oss en melding. Vi svarer vanligvis innen 24 timer.
          </p>

          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_380px]">
            {/* Form */}
            <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Send oss en melding</h2>
              <p className="mt-1 text-sm text-gray-400">Felter merket med * er obligatoriske</p>

              {status === 'success' ? (
                <div className="mt-8 flex flex-col items-center text-center">
                  <div className="text-4xl text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-12 w-12">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-gray-900">Meldingen er sendt!</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    Takk for din henvendelse. Vi svarer vanligvis innen 24 timer.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-6 rounded-lg border-2 border-gray-900 px-6 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-900 hover:text-white"
                  >
                    Send ny melding
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                  <input type="text" name="_gotcha" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Navn *"
                    required
                    value={form.name}
                    onChange={e => setField('name', e.target.value)}
                    className="rounded-lg border-2 border-gray-200 px-4 py-3 text-base transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/10"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="E-post *"
                    required
                    value={form.email}
                    onChange={e => setField('email', e.target.value)}
                    className="rounded-lg border-2 border-gray-200 px-4 py-3 text-base transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/10"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Telefon"
                    value={form.phone}
                    onChange={e => setField('phone', e.target.value)}
                    className="rounded-lg border-2 border-gray-200 px-4 py-3 text-base transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/10"
                  />
                  <input
                    type="text"
                    name="subject"
                    placeholder="Emne"
                    value={form.subject}
                    onChange={e => setField('subject', e.target.value)}
                    className="rounded-lg border-2 border-gray-200 px-4 py-3 text-base transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/10"
                  />
                  <textarea
                    name="message"
                    placeholder="Melding *"
                    required
                    value={form.message}
                    onChange={e => setField('message', e.target.value)}
                    className="min-h-[140px] resize-y rounded-lg border-2 border-gray-200 px-4 py-3 text-base transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/10"
                  />
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="flex items-center justify-center gap-2 rounded-lg bg-primary-500 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all hover:bg-primary-600 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
                  >
                    {status === 'submitting' ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sender...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                        Send melding
                      </>
                    )}
                  </button>
                  {status === 'error' && (
                    <div className="flex flex-col items-center rounded-lg bg-red-50 border border-red-200 p-4 text-center">
                      <p className="text-sm text-red-700">
                        Noe gikk galt. Vennligst prøv igjen eller send oss en e-post direkte.
                      </p>
                      <button
                        type="button"
                        onClick={() => setStatus('idle')}
                        className="mt-3 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-85"
                      >
                        Prøv igjen
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Sidebar */}
            <aside className="flex flex-col gap-5">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-gray-900">Kontaktinformasjon</h3>
                <div className="mt-5 space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Svartid</span>
                      <p className="text-sm text-gray-900">Vanligvis innen 24 timer</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Lokasjon</span>
                      <p className="text-sm text-gray-900">Norge — landsdekkende plattform</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm text-center">
                <h3 className="text-base font-bold text-gray-900">Vil du bli hjelper?</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Registrer deg som hjelper og nå kunder i ditt nærområde.
                </p>
                <Link
                  to="/bli-hjelper"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent-500 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-accent-600 hover:-translate-y-0.5"
                >
                  Bli hjelper
                </Link>
              </div>
            </aside>
          </div>

          {/* FAQ */}
          <div className="mt-16">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Vanlige spørsmål</h2>
              <p className="mt-2 text-sm text-gray-500">
                Finner du ikke svaret du leter etter? Send oss en melding via skjemaet over.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {faqData.map((item, i) => (
                <div key={i} className="overflow-hidden rounded-xl bg-white shadow-sm">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-semibold text-gray-900 transition-colors hover:text-primary-500 sm:text-base"
                  >
                    {item.q}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className={`ml-4 h-4 w-4 shrink-0 transition-transform ${openFaq === i ? 'rotate-180 text-primary-500' : 'text-gray-400'}`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  <div
                    className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                    style={{ gridTemplateRows: openFaq === i ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-5 text-sm leading-relaxed text-gray-500">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
