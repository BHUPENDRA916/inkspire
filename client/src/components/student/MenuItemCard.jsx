import React from 'react';
import { Plus } from 'lucide-react';
import DietaryIcon from '../common/DietaryIcon';

const MenuItemCard = ({ item, onAddToCart }) => {
  // 1. Helper function to generate AI image URL
  const getImageUrl = (menuItem) => {
    if (menuItem.imageUrl && menuItem.imageUrl.trim() !== '') {
      return menuItem.imageUrl;
    }
    // Fallback: Generate AI image based on name
    // We add 'food delicious' to ensure high quality food results
    const prompt = `delicious ${menuItem.name} food close up professional photography`;
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=300&height=300&nologo=true`;
  };

  return (
    <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <img
        src={getImageUrl(item)}
        alt={item.name}
        className="w-24 h-24 object-cover rounded-md flex-shrink-0 bg-gray-100"
        onError={(e) => {
          // If the specific URL fails, fall back to the AI generation
          // This handles cases where a manager enters a broken URL
          const prompt = `delicious ${item.name} food close up`;
          const backupUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=300&height=300&nologo=true`;
          
          // Prevent infinite loops if the backup also fails
          if (e.target.src !== backupUrl) {
            e.target.onerror = null; // Reset handler
            e.target.src = backupUrl;
          } else {
             // Ultimate fallback if AI fails (rare)
             e.target.src = `https://placehold.co/300x300/4A64F0/white?text=${item.name.substring(0, 3)}`;
          }
        }}
      />
      <div className="flex-grow min-w-0">
        <div className="flex items-start gap-2">
            <div className="pt-1">
                <DietaryIcon type={item.type} />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 leading-tight">{item.name}</h4>
        </div>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
        <p className="text-md font-bold text-primary mt-2">${item.price.toFixed(2)}</p>
      </div>
      <button
        onClick={onAddToCart}
        className="flex-shrink-0 bg-primary-light/10 text-primary p-2 rounded-full hover:bg-primary-light/20 transition-colors active:scale-95"
        aria-label={`Add ${item.name} to cart`}
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default MenuItemCard;