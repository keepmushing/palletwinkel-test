import React from 'react';
import { Helmet } from 'react-helmet';
import { ArrowRight, Award, Users, Wrench, Leaf } from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import ImagePlaceholder from '../components/ImagePlaceholder.jsx';

function OverOnsPage() {
  const timeline = [
    { year: '2004', event: "Oprichting van 't Palletje als familiebedrijf in Wingene" },
    { year: '2008', event: 'Uitbreiding atelier en aanschaf eerste professionele machines' },
    { year: '2012', event: 'ISPM15 certificering voor export buiten Europa' },
    { year: '2016', event: 'Eigen transportvloot voor Benelux en Frankrijk' },
    { year: '2021', event: 'Nieuwe productielijn voor maatwerk meubels en statafels' },
    { year: '2026', event: 'Meer dan 2.800 tevreden klanten in industrie en logistiek' },
  ];

  const values = [
    {
      icon: Award,
      title: 'Kwaliteit',
      description: 'Vakmanschap en oog voor detail in elk product dat ons atelier verlaat.',
    },
    {
      icon: Users,
      title: 'Persoonlijk',
      description: 'Als familiebedrijf kennen wij onze klanten en hun specifieke behoeften.',
    },
    {
      icon: Wrench,
      title: 'Flexibel',
      description: 'Van kleine opdrachten tot grote projecten. Wij denken mee en leveren maatwerk.',
    },
    {
      icon: Leaf,
      title: 'Duurzaam',
      description: 'Verantwoord gebruik van hout en minimaal afval in ons productieproces.',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Over ons - Familiebedrijf sinds 2004 | 't Palletje</title>
        <meta name="description" content="Leer 't Palletje kennen: familiebedrijf sinds 2004 in Wingene. Vakmanschap, persoonlijke service en kwaliteit in palletten en kisten op maat." />
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-background py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="eyebrow mb-4">OVER ONS</p>
              <h1 className="text-balance mb-6">
                Familiebedrijf met passie voor vakmanschap
              </h1>
              <p className="text-xl text-secondary leading-relaxed">
                Sinds 2004 maken wij in ons atelier in Wingene palletten, kisten en kratten op maat. Met vakmanschap, persoonlijke service en oog voor kwaliteit.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="bg-muted py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <ImagePlaceholder aspectRatio="4/3" className="rounded-lg" />
              </div>
              <div>
                <h2 className="mb-6">Ons verhaal</h2>
                <div className="space-y-4 text-secondary leading-relaxed">
                  <p>
                    't Palletje werd in 2004 opgericht als klein familiebedrijf in Wingene, West-Vlaanderen. Wat begon met het maken van enkele palletten per week, groeide uit tot een professioneel atelier met moderne machines en een ervaren ploeg.
                  </p>
                  <p>
                    Vandaag de dag maken wij maatwerk verpakkingen voor bedrijven in de hele Benelux en Frankrijk. Van kleine kratten tot grote exportkisten, van standaard palletten tot complexe projecten. Elk product wordt met zorg gemaakt in ons eigen atelier.
                  </p>
                  <p>
                    Onze kracht ligt in persoonlijke service en flexibiliteit. Als familiebedrijf kennen wij onze klanten en hun specifieke behoeften. Wij denken mee, leveren snel en staan garant voor kwaliteit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="bg-background py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="eyebrow mb-4">ONZE GESCHIEDENIS</p>
              <h2 className="text-balance">Meer dan 20 jaar ervaring</h2>
            </div>
            <div className="space-y-8">
              {timeline.map((item, index) => (
                <div key={index} className="flex gap-8 items-start">
                  <div className="flex-shrink-0 w-20">
                    <span className="text-2xl font-bold text-primary" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {item.year}
                    </span>
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-foreground leading-relaxed">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-muted py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="eyebrow mb-4">ONZE WAARDEN</p>
              <h2 className="text-balance">Waar wij voor staan</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div key={index} className="text-center">
                    <Icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                    <p className="text-secondary leading-relaxed">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Certifications Section */}
        <section className="bg-background py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="card-base text-center">
              <Award className="w-16 h-16 mx-auto mb-6 text-primary" />
              <h2 className="mb-4">ISPM15 gecertificeerd</h2>
              <p className="text-secondary leading-relaxed max-w-2xl mx-auto">
                Wij zijn gecertificeerd volgens de ISPM15 norm voor export van houten verpakkingen buiten Europa. Dit betekent dat onze kisten en palletten voldoen aan internationale fytosanitaire eisen en zonder problemen de grens over kunnen.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-muted py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-balance mb-6">Kennismaken?</h2>
            <p className="text-xl text-secondary mb-10 leading-relaxed max-w-2xl mx-auto">
              Kom gerust langs in ons atelier in Wingene of neem contact op voor een vrijblijvend gesprek.
            </p>
            <a href="https://configurator.palletje.be/" className="btn-primary">
              Neem contact op
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default OverOnsPage;