import React from 'react';
import { motion } from 'framer-motion';

function ProductGallery() {
  const showcaseImage = 'https://horizons-cdn.hostinger.com/d8e3e6cb-5ef8-41c1-8b95-f738e06bbbd7/cb8604ea155fcad1378446d63d706263.png';

  const products = [
    {
      name: 'Transportwiegen',
      description: 'Stevige houten wiegen voor veilig transport van zware goederen'
    },
    {
      name: 'Palletrand',
      description: 'Opzetranden om uw palletten te verhogen en lading te beschermen'
    },
    {
      name: 'Industriële kist',
      description: 'Robuuste kisten op maat voor industriële toepassingen'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Showcase Image */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="gallery-image-container mb-12"
      >
        <img
          src={showcaseImage}
          alt="Houten verpakkingsproducten: transportwiegen, palletrand en industriële kist"
          className="gallery-image"
          style={{ aspectRatio: '16/9' }}
        />
      </motion.div>

      {/* Product Labels Grid */}
      <div className="gallery-grid">
        {products.map((product, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            className="text-center"
          >
            <div className="bg-card border border-border rounded-xl p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
              <h3 className="gallery-product-label mb-3">{product.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default ProductGallery;