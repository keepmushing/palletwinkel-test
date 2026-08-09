import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowRight, Factory, MapPin, Truck, Award, CheckCircle2 } from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import ProductCard from '../components/ProductCard.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import ProductGallery from '../components/ProductGallery.jsx';

function HomePage() {
  const products = [
    {
      title: 'PALLETTEN OP MAAT',
      description: 'Sterke, duurzame palletten in elke gewenste afmeting. Geschikt voor industrie, export en logistiek.',
    },
    {
      title: 'KISTEN',
      description: 'Houten transportkisten op maat voor veilig vervoer van uw goederen. ISPM15 gecertificeerd voor export.',
    },
    {
      title: 'KRATTEN',
      description: 'Stevige kratten voor opslag en transport. Van kleine kratten tot grote industriële oplossingen.',
    },
    {
      title: 'OPZETRANDEN & SKIDS',
      description: 'Verhoog uw palletten met opzetranden of kies voor praktische skids voor uw productie.',
    },
    {
      title: 'HOUT & PLANKEN',
      description: 'Kwaliteitshout en planken voor al uw projecten. Gezaagd op maat in ons eigen atelier.',
    },
    {
      title: 'MEUBELS & STATAFELS',
      description: 'Handgemaakte houten meubels en statafels voor evenementen. Ook beschikbaar voor verhuur.',
    },
  ];

  const services = [
    {
      title: 'VERPAKKEN IN ATELIER',
      description: 'Wij verpakken uw goederen professioneel in ons atelier in Wingene. Veilig en volgens uw specificaties.',
    },
    {
      title: 'VERPAKKEN OP LOCATIE',
      description: 'Onze ploeg komt naar uw bedrijf om ter plaatse te verpakken. Flexibel en efficiënt.',
    },
    {
      title: 'VERPAKKEN & LEVEREN',
      description: 'Complete service van verpakking tot levering. Eigen transport voor Benelux en Frankrijk.',
    },
    {
      title: 'OPTIMALE HOUTEN VERPAKKINGEN',
      description: 'Wij helpen u bij het ontwerpen van de optimale houten verpakking voor uw product.',
    },
  ];

  return (
    <>
      <Helmet>
        <title>{'t Palletje - Pallets en kisten op maat | Wingene, West-Vlaanderen'}</title>
        <meta name="description" content="Familiebedrijf sinds 2004 gespecialiseerd in palletten, kisten en kratten op maat. ISPM15 gecertificeerd. Eigen atelier in Wingene, West-Vlaanderen." />
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-background py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <h1 className="text-balance mb-6">
                Pallets en kisten op maat. Voor industrie, export en logistiek.
              </h1>
              <p className="text-xl text-secondary mb-10 leading-relaxed max-w-2xl">
                Familiebedrijf sinds 2004 met eigen atelier in Wingene. Wij maken sterke, duurzame houten verpakkingen op maat voor uw bedrijf.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="https://configurator.palletje.be/" className="btn-primary">
                  Vraag een offerte
                  <ArrowRight className="w-4 h-4" />
                </a>
                <Link to="/realisaties" className="btn-secondary">
                  Bekijk realisaties
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Strip */}
        <section className="bg-muted py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <Factory className="w-10 h-10 mx-auto mb-3 text-primary" />
                <p className="text-3xl font-bold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>houten verpakkingen op maat</p>
                <p className="eyebrow">2004</p>
              </div>
              <div className="text-center">
                <MapPin className="w-10 h-10 mx-auto mb-3 text-primary" />
                <p className="text-3xl font-bold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>locale productie</p>
                <p className="eyebrow">WINGENE WEST-VLAANDEREN</p>
              </div>
              <div className="text-center">
                <Truck className="w-10 h-10 mx-auto mb-3 text-primary" />
                <p className="text-3xl font-bold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>eigen transport</p>
                <p className="eyebrow">AFHALEN MOGELIJK</p>
              </div>
              <div className="text-center">
                <Award className="w-10 h-10 mx-auto mb-3 text-primary" />
                <p className="text-3xl font-bold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>ISPM15</p>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <p className="eyebrow">LEVERING BUITEN DE EU</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Gallery Section */}
        <section className="bg-background py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
            <div className="text-center mb-16">
              <p className="eyebrow mb-4">ONZE PRODUCTEN</p>
              <h2 className="text-balance">Houten verpakkingen voor elke toepassing</h2>
            </div>
          </div>
          <ProductGallery />
        </section>

        {/* Products Section */}
        <section className="bg-muted py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="eyebrow mb-4">WAT WIJ MAKEN</p>
              <h2 className="text-balance">Allerhande maatwerk voor uw bedrijf</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, index) => (
                <ProductCard
                  key={index}
                  title={product.title}
                  description={product.description}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="bg-background py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="eyebrow mb-4">ONZE DIENSTEN</p>
              <h2 className="text-balance">Meer dan produceren alleen</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <ServiceCard
                  key={index}
                  title={service.title}
                  description={service.description}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-muted py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-balance mb-6">Klaar voor maatwerk?</h2>
            <p className="text-xl text-secondary mb-10 leading-relaxed max-w-2xl mx-auto">
              Neem contact op voor een vrijblijvende offerte. Wij denken graag mee over de beste oplossing voor uw project.
            </p>
            <a href="https://configurator.palletje.be/" className="btn-primary">
              Vraag een offerte
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default HomePage;