import React from 'react';

const DietaryIcon = ({ type }) => {
  // Normalize type to lowercase
  const dietType = type?.toLowerCase() || 'veg';
  
  const isVeg = dietType === 'veg';
  const isEgg = dietType === 'egg';
  
  // Colors
  const green = '#166534'; // green-700
  const red = '#991b1b';   // red-800
  const yellow = '#ca8a04'; // yellow-600 (often used for egg, optional)

  if (isVeg) {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" className="flex-shrink-0" title="Vegetarian">
        <rect x="1" y="1" width="22" height="22" rx="2" stroke={green} fill="none" strokeWidth="2" />
        <circle cx="12" cy="12" r="6" fill={green} />
      </svg>
    );
  }

  // Egg (Optional distinct icon, usually treated as non-veg or yellow)
  if (isEgg) {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" className="flex-shrink-0" title="Contains Egg">
        <rect x="1" y="1" width="22" height="22" rx="2" stroke={yellow} fill="none" strokeWidth="2" />
        <circle cx="12" cy="12" r="6" fill={yellow} />
      </svg>
    );
  }

  // Non-Veg (Triangle)
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" className="flex-shrink-0" title="Non-Vegetarian">
      <rect x="1" y="1" width="22" height="22" rx="2" stroke={red} fill="none" strokeWidth="2" />
      <path d="M12 7 L6 17 L18 17 Z" fill={red} />
    </svg>
  );
};

export default DietaryIcon;