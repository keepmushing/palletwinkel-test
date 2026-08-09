import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import ProductCard from '../components/ProductCard.jsx';

function ProductenPage() {
  const products = [
    {
      title: 'PALLETTEN OP MAAT',
      description: 'Sterke, duurzame palletten in elke gewenste afmeting. Geschikt voor industrie, export en logistiek. Wij maken palletten volgens uw specificaties, van standaard formaten tot volledig maatwerk. ISPM15 gecertificeerd voor export buiten Europa.',
    },
    {
      title: 'KISTEN',
      description: 'Houten transportkisten op maat voor veilig vervoer van uw goederen. Van kleine verpakkingskisten tot grote industriële transportkisten. Alle kisten worden vakkundig gemaakt in ons atelier en kunnen voorzien worden van ISPM15 certificering.',
    },
    {
      title: 'KRATTEN',
      description: 'Stevige kratten voor opslag en transport. Van kleine kratten voor groenten en fruit tot grote industriële kratten voor zware goederen. Gemaakt van kwaliteitshout en gebouwd om lang mee te gaan.',
    },
    {
      title: 'OPZETRANDEN & SKIDS',
      description: 'Verhoog uw palletten met stevige opzetranden of kies voor praktische skids voor uw productie. Opzetranden maken het mogelijk om goederen hoger te stapelen. Skids zijn ideaal voor transport binnen uw bedrijf.',
    },
    {
      title: 'HOUT & PLANKEN',
      description: 'Kwaliteitshout en planken voor al uw projecten. Gezaagd op maat in ons eigen atelier. Wij leveren verschillende houtsoorten en diktes, geschikt voor bouw, verpakking en andere toepassingen.',
    },
    {
      title: 'MEUBELS & STATAFELS',
      description: 'Handgemaakte houten meubels en statafels voor evenementen, beurzen en recepties. Robuust en stijlvol. Ook beschikbaar voor verhuur. Elk stuk wordt met zorg gemaakt in ons atelier.',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Producten - Palletten, kisten en kratten op maat | 't Palletje</title>
        <meta name="description" content="Ontdek ons assortiment: palletten op maat, transportkisten, kratten, opzetranden, skids en meer. ISPM15 gecertificeerd. Eigen productie in Wingene." />
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-background py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="eyebrow mb-4">ONZE PRODUCTEN</p>
              <h1 className="text-balance mb-6">
                Maatwerk in hout voor industrie en logistiek
              </h1>
              <p className="text-xl text-secondary leading-relaxed">
                Van standaard palletten tot complexe verpakkingsoplossingen. Alles wordt met vakmanschap gemaakt in ons eigen atelier in Wingene.
              </p>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="bg-muted py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
      </main>

      <Footer />
    </>
  );
}

export default ProductenPage;