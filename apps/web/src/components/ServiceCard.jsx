import React from 'react';

function ServiceCard({ title, description }) {
  return (
    <div className="card-base transition-all duration-300 hover:shadow-md">
      <h3 className="text-xl font-bold mb-3 text-foreground">{title}</h3>
      <p className="text-secondary leading-relaxed">{description}</p>
    </div>
  );
}

export default ServiceCard;