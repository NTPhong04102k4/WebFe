import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface MessageDisplayProps {
  error: string;
  success: string;
}

export const MessageDisplay: React.FC<MessageDisplayProps> = ({
  error,
  success,
}) => {
  if (!error && !success) return null;

  return (
    <div className="mb-6">
      {error && (
        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <XCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
          <span className="text-green-700 text-sm">{success}</span>
        </div>
      )}
    </div>
  );
};
