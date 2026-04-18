import { DocumentStatus } from '../types';
import { STATUS_COLORS } from '../constants';
import { cn } from '../lib/utils';

export function StatusBadge({ status, className }: { status: DocumentStatus; className?: string }) {
  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-medium border",
      STATUS_COLORS[status],
      className
    )}>
      {status}
    </span>
  );
}
