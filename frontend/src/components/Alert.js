import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, XCircle, Loader } from "lucide-react";

const Alert = ({
  type = "info",
  title,
  message,
  onClose,
  autoClose = true,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const config = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: CheckCircle,
      color: "text-green-700",
      iconColor: "text-green-500",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: XCircle,
      color: "text-red-700",
      iconColor: "text-red-500",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      icon: AlertCircle,
      color: "text-yellow-700",
      iconColor: "text-yellow-500",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: AlertCircle,
      color: "text-blue-700",
      iconColor: "text-blue-500",
    },
  };

  const current = config[type];
  const IconComponent = current.icon;

  if (!isVisible) return null;

  return (
    <div
      className={`${current.bg} border ${current.border} rounded-lg p-4 flex items-start space-x-3 transition-opacity`}
    >
      <IconComponent
        className={`w-5 h-5 flex-shrink-0 ${current.iconColor}`}
      />
      <div className="flex-1">
        {title && (
          <h3 className={`font-semibold ${current.color}`}>{title}</h3>
        )}
        {message && <p className={`text-sm ${current.color}`}>{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <Loader className="w-8 h-8 text-primary-500 animate-spin" />
  </div>
);

export { Alert, LoadingSpinner };
