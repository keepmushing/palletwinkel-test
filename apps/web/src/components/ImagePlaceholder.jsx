import React from 'react';

function ImagePlaceholder({ aspectRatio = '4/3', className = '' }) {
  return (
    <div 
      className={`bg-muted ${className}`}
      style={{ aspectRatio }}
    />
  );
}

export default ImagePlaceholder;