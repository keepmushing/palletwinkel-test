import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { toast } from 'sonner';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

function ContactPage() {
  const [formData, setFormData] = useState({
    bedrijfsnaam: '',
    contactpersoon: '',
    email: '',
    telefoonnummer: '',
    bericht: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast.success('Bedankt voor uw bericht. Wij nemen zo snel mogelijk contact met u op.');
      setFormData({
        bedrijfsnaam: '',
        contactpersoon: '',
        email: '',
        telefoonnummer: '',
        bericht: '',
      });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <>
      <Helmet>
        <title>Contact - Neem contact op voor een offerte | 't Palletje</title>
        <meta name="description" content="Neem contact op met 't Palletje voor een vrijblijvende offerte. Bel 0499 19 68 02 of vul het contactformulier in. Atelier in Wingene, West-Vlaanderen." />
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-background py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="eyebrow mb-4">CONTACT</p>
              <h1 className="text-balance mb-6">
                Neem contact op voor een vrijblijvende offerte
              </h1>
              <p className="text-xl text-secondary leading-relaxed">
                Heeft u vragen of wilt u een offerte aanvragen? Vul het formulier in of neem direct contact op. Wij helpen u graag verder.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-muted py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="card-base">
                <h2 className="text-2xl font-bold mb-6">Stuur ons een bericht</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="bedrijfsnaam" className="text-sm font-semibold text-foreground mb-2 block">
                      Bedrijfsnaam *
                    </Label>
                    <Input
                      id="bedrijfsnaam"
                      name="bedrijfsnaam"
                      type="text"
                      required
                      value={formData.bedrijfsnaam}
                      onChange={handleChange}
                      className="w-full text-foreground"
                      placeholder="Uw bedrijfsnaam"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactpersoon" className="text-sm font-semibold text-foreground mb-2 block">
                      Contactpersoon *
                    </Label>
                    <Input
                      id="contactpersoon"
                      name="contactpersoon"
                      type="text"
                      required
                      value={formData.contactpersoon}
                      onChange={handleChange}
                      className="w-full text-foreground"
                      placeholder="Uw naam"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-semibold text-foreground mb-2 block">
                      E-mailadres *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full text-foreground"
                      placeholder="uw.email@bedrijf.be"
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefoonnummer" className="text-sm font-semibold text-foreground mb-2 block">
                      Telefoonnummer
                    </Label>
                    <Input
                      id="telefoonnummer"
                      name="telefoonnummer"
                      type="tel"
                      value={formData.telefoonnummer}
                      onChange={handleChange}
                      className="w-full text-foreground"
                      placeholder="0499 19 68 02"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bericht" className="text-sm font-semibold text-foreground mb-2 block">
                      Bericht *
                    </Label>
                    <Textarea
                      id="bericht"
                      name="bericht"
                      required
                      value={formData.bericht}
                      onChange={handleChange}
                      rows={6}
                      className="w-full text-foreground"
                      placeholder="Vertel ons over uw project of vraag..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary justify-center"
                  >
                    {isSubmitting ? 'Verzenden...' : 'Verstuur bericht'}
                  </Button>
                </form>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <div className="card-base">
                  <h2 className="text-2xl font-bold mb-6">Contactgegevens</h2>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold mb-1">Atelier</p>
                        <p className="text-secondary">Waregemseweg 156</p>
                        <p className="text-secondary">8750 Wingene</p>
                        <p className="text-secondary">West-Vlaanderen, België</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Phone className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold mb-1">Telefoon</p>
                        <a href="tel:+32499196802" className="text-secondary hover:text-primary transition-colors duration-200">
                          0499 19 68 02
                        </a>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold mb-1">E-mail</p>
                        <a href="mailto:info@tpalletje.be" className="text-secondary hover:text-primary transition-colors duration-200">
                          info@tpalletje.be
                        </a>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Clock className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold mb-1">Openingsuren</p>
                        <p className="text-secondary">Maandag - Vrijdag: 8:00 - 17:00</p>
                        <p className="text-secondary">Zaterdag: Op afspraak</p>
                        <p className="text-secondary">Zondag: Gesloten</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map Placeholder */}
                <div className="card-base">
                  <h3 className="text-xl font-bold mb-4">Locatie</h3>
                  <div className="bg-muted rounded aspect-video flex items-center justify-center">
                    <p className="text-secondary text-sm">Kaart van Wingene, West-Vlaanderen</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default ContactPage;