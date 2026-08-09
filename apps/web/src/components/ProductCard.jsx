import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ImagePlaceholder from './ImagePlaceholder.jsx';

function ProductCard({ title, description, image, link = '/contact' }) {
  return (
    <div className="card-base group transition-all duration-300 hover:shadow-lg">
      <ImagePlaceholder aspectRatio="4/3" className="mb-6 rounded" />
      <p className="product-title mb-3">{title}</p>
      <p className="text-secondary mb-6 leading-relaxed">{description}</p>
      <Link 
        to={link}
        className="inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-all duration-200 hover:gap-3"
      >
        Lees meer
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export default ProductCard;