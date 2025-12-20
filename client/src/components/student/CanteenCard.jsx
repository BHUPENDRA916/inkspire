import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';

const CanteenCard = ({ canteen }) => {
  return (
    <Link
      to={`/canteen/${canteen._id}`}
      className="block bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:shadow-lg hover:-translate-y-1"
    >
      <img
        src={canteen.imageUrl}
        alt={canteen.name}
        className="w-full h-40 object-cover"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = `https://placehold.co/600x400/FF7043/white?text=${canteen.name.replace(
            /\s/g,
            '+'
          )}`;
        }}
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800">{canteen.name}</h3>
        <div className="flex items-center gap-2 mt-2 text-gray-600">
          <MapPin size={16} />
          <span className="text-sm">{canteen.location}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Clock size={16} className={canteen.isOpen ? 'text-green-500' : 'text-red-500'} />
          <span
            className={`text-sm font-medium ${
              canteen.isOpen ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {canteen.isOpen ? 'Open Now' : 'Closed'}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CanteenCard;