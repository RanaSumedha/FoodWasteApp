import StarRating from './StarRating';

export default function RatingDisplay({ averageRating, ratingCount, completedPickups }) {
  if (completedPickups < 3) {
    return <p className="rating-pending">Rating available after 3 completed pickups ({completedPickups}/3)</p>;
  }
  return (
    <div className="rating-display">
      <StarRating value={Math.round(averageRating)} readonly />
      <span className="rating-avg">{averageRating?.toFixed(1)}</span>
      <span className="rating-count">({ratingCount} reviews)</span>
    </div>
  );
}
