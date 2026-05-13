import { useState } from 'react';

export default function StarRating({ value, onChange, readonly = false }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button" className={`star ${star <= (hover || value) ? 'filled' : ''}`}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          disabled={readonly}>
          ★
        </button>
      ))}
    </div>
  );
}
