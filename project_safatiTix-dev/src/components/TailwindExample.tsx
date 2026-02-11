import React from 'react';

export default function TailwindExample() {
  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md max-w-md mx-auto">
      <h3 className="text-2xl font-montserrat text-primary mb-3">Tailwind setup verified</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4">If you see this styled card, Tailwind is active.</p>
      <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary/90">Primary action</button>
    </div>
  );
}
