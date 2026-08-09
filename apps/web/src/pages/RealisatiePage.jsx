import React from 'react';
import { Helmet } from 'react-helmet';
import { ArrowRight } from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import ImagePlaceholder from '../components/ImagePlaceholder.jsx';

function RealisatiePage() {
  const projects = [
    {
      title: 'Exportkisten voor machinebouw',
      category: 'INDUSTRIE',
      description: 'Grote transportkisten voor zware machines. ISPM15 gecertificeerd voor export naar Azië. Inclusief verpakking en transport naar de haven.',
    },
    {
      title: 'Palletten voor voedingsindustrie',
      category: 'LOGISTIEK',
      description: 'Maatwerk palletten voor een grote voedingsproducent. Hygiënisch behandeld hout, geschikt voor contact met levensmiddelen.',
    },
    {
      title: 'Kratten voor tuinbouw',
      category: 'LANDBOUW',
      description: 'Stevige houten kratten voor transport van groenten. Duurzaam en herbruikbaar. Geleverd in grote aantallen.',
    },
    {
      title: 'Verpakking kunstwerk',
      category: 'KUNST & CULTUUR',
      description: 'Op maat gemaakte kist voor transport van waardevol kunstwerk naar museum. Extra bescherming en klimaatbestendig.',
    },
    {
      title: 'Statafels voor bedrijfsevent',
      category: 'EVENEMENTEN',
      description: 'Verhuur van 47 handgemaakte statafels voor groot bedrijfsevenement. Levering, opstelling en ophaling verzorgd.',
    },
    {
      title: 'Opzetranden voor automotive',
      category: 'AUTOMOTIVE',
      description: 'Opzetranden voor bestaande palletten in automotive sector. Verhoogde stapeling voor efficiënter transport.',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Realisaties - Projecten en referenties | 't Palletje</title>
        <meta name="description" content="Bekijk onze gerealiseerde projecten: van exportkisten tot statafels, van industrie tot evenementen. Maatwerk voor diverse sectoren." />
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-background py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="eyebrow mb-4">ONZE REALISATIES</p>
              <h1 className="text-balance mb-6">
                Projecten waar wij trots op zijn
              </h1>
              <p className="text-xl text-secondary leading-relaxed">
                Van kleine opdrachten tot grote industriële projecten. Ontdek hoe wij bedrijven helpen met maatwerk verpakkingen en diensten.
              </p>
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="bg-muted py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <div key={index} className="card-base group transition-all duration-300 hover:shadow-lg">
                  <ImagePlaceholder aspectRatio="4/3" className="mb-6 rounded" />
                  <p className="eyebrow mb-3">{project.category}</p>
                  <h3 className="text-xl font-bold mb-3">{project.title}</h3>
                  <p className="text-secondary leading-relaxed">{project.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-background py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-balance mb-6">Uw project bespreken?</h2>
            <p className="text-xl text-secondary mb-10 leading-relaxed max-w-2xl mx-auto">
              Elk project is uniek. Neem contact op om te bespreken wat wij voor u kunnen betekenen.
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

export default RealisatiePage;