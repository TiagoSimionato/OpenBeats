type SpinnerSize = 'lg' | 'md' | 'sm' | 'xl' | 'xs';

type SpinnerProps = Readonly<{
  className?: string;
  color?: string;
  size?: SpinnerSize;
}>;

const sizeClasses: Record<SpinnerSize, string> = {
  lg: 'h-6 w-6 border-2',
  md: 'h-5 w-5 border-2',
  sm: 'h-4 w-4 border-2',
  xl: 'h-8 w-8 border-[3px]',
  xs: 'h-3 w-3 border-[1.5px]',
};

export const Spinner = ({
  className = '',
  color = 'text-primary',
  size = 'md',
}: SpinnerProps) => (
  <span
    aria-label="Loading"
    className={`inline-block animate-spin rounded-full border-solid border-current border-t-transparent ${sizeClasses[size]} ${color} ${className}`.trim()}
  />
);
