import React from "react";

function Button({ className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${className}`}
      {...props}
    />
  );
}

export { Button };
