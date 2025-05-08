export function Card({ className = "", children, ...props }) {
    return (
      <div className={`bg-white rounded-xl shadow-md p-4 ${className}`} {...props}>
        {children}
      </div>
    );
  }
  
  export function CardContent({ className = "", children, ...props }) {
    return (
      <div className={`p-4 ${className}`} {...props}>
        {children}
      </div>
    );
  }
  