const LoadingSkeleton = ({ type = 'card' }) => {
  if (type === 'text') {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-dark-700 rounded w-3/4"></div>
        <div className="h-4 bg-dark-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (type === 'map') {
    return (
      <div className="animate-pulse w-full h-full bg-dark-800 rounded-xl flex items-center justify-center">
        <div className="h-16 w-16 text-dark-700">
           <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        </div>
      </div>
    );
  }

  // Default card
  return (
    <div className="animate-pulse glass-card p-6 rounded-xl">
      <div className="h-6 bg-dark-700 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-dark-700 rounded w-3/4"></div>
        <div className="h-4 bg-dark-700 rounded w-5/6"></div>
      </div>
      <div className="mt-6 flex justify-between">
        <div className="h-8 bg-dark-700 rounded w-1/4"></div>
        <div className="h-8 bg-dark-700 rounded w-1/4"></div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
