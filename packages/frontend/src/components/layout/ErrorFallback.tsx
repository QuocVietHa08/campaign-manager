import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';

interface ErrorFallbackProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onBack?: () => void;
  backLabel?: string;
}

export function ErrorFallback({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  onBack,
  backLabel = 'Go Back',
}: ErrorFallbackProps) {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-7 w-7 text-destructive" />
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
      <div className="mt-6 flex gap-3">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            {backLabel}
          </Button>
        )}
        {onRetry && (
          <Button onClick={onRetry}>
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
