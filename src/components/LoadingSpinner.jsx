const LoadingSpinner = ({ fullScreen = false, size = 'md', text = '' }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizes[size]} rounded-full border-gray-700 border-t-violet-500 animate-spin`}
      />
      {text && <p className="text-gray-400 text-sm animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
