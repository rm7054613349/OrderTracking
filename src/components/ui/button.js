export function Button({ children, onClick, className = "", variant = "default", size = "md", ...props }) {
    const baseStyles = "rounded-lg font-medium transition-colors duration-200";
    const variants = {
      default: "bg-indigo-600 text-white hover:bg-indigo-700",
      outline: "border border-indigo-600 text-indigo-600 hover:bg-indigo-100",
      secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
    };
    const sizes = {
      sm: "px-3 py-1 text-sm",
      md: "px-4 py-2",
    };
  
    return (
      <button
        onClick={onClick}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
  