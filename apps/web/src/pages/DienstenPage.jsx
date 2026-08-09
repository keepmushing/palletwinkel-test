import React from 'react';
import { Helmet } from 'react-helmet';
import { ArrowRight, Package, MapPin, Truck, Lightbulb } from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

function DienstenPage() {
  const services = [
    {
      icon: Package,
      title: 'Verpakken in atelier',
      description: 'Wij verpakken uw goederen professioneel in ons atelier in Wingene. Veilig en volgens uw specificaties.',
      benefits: [
        'Professionele verpakking door ervaren medewerkers',
        'Veilige opslag in ons atelier',
        'Kwaliteitscontrole voor verzending',
        'ISPM15 certificering indien nodig',
      ],
    },
    {
      icon: MapPin,
      title: 'Verpakken op locatie',
      description: 'Onze ploeg komt naar uw bedrijf om ter plaatse te verpakken. Flexibel en efficiënt.',
      benefits: [
        'Geen transport van goederen nodig',
        'Verpakken direct bij uw productie',
        'Flexibele planning',
        'Minimale verstoring van uw werkzaamheden',
      ],
    },
    {
      icon: Truck,
      title: 'Verpakken & leveren',
      description: 'Complete service van verpakking tot levering. Eigen transport voor Benelux en Frankrijk.',
      benefits: [
        'Alles uit één hand',
        'Eigen transportvloot',
        'Levering in Benelux en Frankrijk',
        'Tracking en planning',
      ],
    },
    {
      icon: Lightbulb,
      title: 'Optimale houten verpakkingen',
      description: 'Wij helpen u bij het ontwerpen van de optimale houten verpakking voor uw product.',
      benefits: [
        'Advies van ervaren vakmannen',
        'Prototyping en testen',
        'Kostenoptimalisatie',
        'Duurzame oplossingen',
      ],
    },
  ];

  return (
    <>
      <Helmet>
        <title>Diensten - Verpakken, transport en ondersteuning | 't Palletje</title>
        <meta name="description" content="Meer dan alleen produceren: verpakken in atelier of op locatie, transport naar Benelux en Frankrijk, ondersteuning bij verpakkingsontwikkeling. Complete service." />
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-background py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="eyebrow mb-4">ONZE DIENSTEN</p>
              <h1 className="text-balance mb-6">
                Meer dan produceren alleen
              </h1>
              <p className="text-xl text-secondary leading-relaxed">
                Naast het maken van palletten en kisten bieden wij een complete service: van verpakken tot leveren. Alles om uw logistiek zo soepel mogelijk te laten verlopen.
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="bg-muted py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <div key={index} className="card-base">
                    <Icon className="w-12 h-12 text-primary mb-6" />
                    <h2 className="text-2xl font-bold mb-4">{service.title}</h2>
                    <p className="text-secondary mb-6 leading-relaxed">{service.description}</p>
                    <ul className="space-y-3 mb-8">
                      {service.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <ArrowRight className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-background py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-balance mb-6">Interesse in onze diensten?</h2>
            <p className="text-xl text-secondary mb-10 leading-relaxed max-w-2xl mx-auto">
              Neem contact op om te bespreken hoe wij u kunnen helpen met verpakking, transport of ondersteuning bij verpakkingsontwikkeling.
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

export default DienstenPage;