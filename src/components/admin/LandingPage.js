import React from 'react';
import { Link } from 'react-router-dom';

const LocationButtons = () => {
  const locations = ['Koyembedu', 'Anna Nagar', 'Vadapalani', 'Adayar'];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-2 gap-6">
        {locations.map((location) => (
          <Link to='stats' className="flex items-center justify-center gap-3 p-6 text-xl font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">
          {location}
            </Link>
        ))}
      </div>
    </div>
  );
};

export default LocationButtons;