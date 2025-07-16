import { Loader2, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'primary' | 'secondary'
}

export function LoadingSpinner({ 
  className, 
  size = 'md', 
  variant = 'default' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const variantClasses = {
    default: 'text-gray-500',
    primary: 'text-blue-500',
    secondary: 'text-gray-400'
  }

  return (
    <Loader2 
      role="status"
      aria-hidden="true"
      className={cn(
        'animate-spin',
        sizeClasses[size],
        variantClasses[variant],
        className
      )} 
    />
  )
}

interface LoadingButtonProps {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
  icon?: React.ReactNode
  className?: string
}

export function LoadingButton({ 
  isLoading, 
  children, 
  loadingText = 'Loading...',
  icon,
  className 
}: LoadingButtonProps) {
  return (
    <span className={cn('flex items-center space-x-2', className)}>
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" />
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </span>
  )
}

interface LoadingCardProps {
  title?: string
  description?: string
  className?: string
}

export function LoadingCard({ 
  title = 'Loading...',
  description = 'Please wait while we process your request',
  className 
}: LoadingCardProps) {
  return (
    <Card className={cn('bg-gray-800 border-gray-700', className)}>
      <CardContent className="p-8 text-center">
        <LoadingSpinner size="lg" variant="primary" className="mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </CardContent>
    </Card>
  )
}

export function LoadingPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <LoadingCard 
        title="Loading your dashboard..."
        description="Setting up your personalized experience"
        className="max-w-md w-full"
      />
    </div>
  )
}

export function LoadingOverlay({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" variant="primary" />
        <p className="text-white font-medium">Processing...</p>
      </div>
    </div>
  )
}

interface LoadingTableProps {
  rows?: number
  columns?: number
  className?: string
}

export function LoadingTable({ 
  rows = 5, 
  columns = 3, 
  className 
}: LoadingTableProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, j) => (
            <div 
              key={j} 
              className="h-8 bg-gray-700 rounded animate-pulse flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function LoadingList({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-700 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-700 rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function LoadingForm() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="h-4 bg-gray-700 rounded animate-pulse w-24" />
        <div className="h-10 bg-gray-700 rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-700 rounded animate-pulse w-16" />
        <div className="h-10 bg-gray-700 rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-700 rounded animate-pulse w-20" />
        <div className="h-24 bg-gray-700 rounded animate-pulse" />
      </div>
      <div className="flex space-x-2">
        <div className="h-10 bg-gray-700 rounded animate-pulse w-24" />
        <div className="h-10 bg-gray-700 rounded animate-pulse w-20" />
      </div>
    </div>
  )
}

export function LoadingChart() {
  return (
    <div className="space-y-4">
      <div className="h-6 bg-gray-700 rounded animate-pulse w-48" />
      <div className="h-64 bg-gray-700 rounded animate-pulse" />
      <div className="flex space-x-4">
        <div className="h-4 bg-gray-700 rounded animate-pulse w-16" />
        <div className="h-4 bg-gray-700 rounded animate-pulse w-20" />
        <div className="h-4 bg-gray-700 rounded animate-pulse w-24" />
      </div>
    </div>
  )
}

export function LoadingProfile() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-20 h-20 bg-gray-700 rounded-full animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 bg-gray-700 rounded animate-pulse w-32" />
          <div className="h-4 bg-gray-700 rounded animate-pulse w-24" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-700 rounded animate-pulse w-full" />
        <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-700 rounded animate-pulse w-1/2" />
      </div>
    </div>
  )
}

interface LoadingDotsProps {
  className?: string
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  )
}

export function LoadingText({ 
  text = 'Loading',
  className 
}: { 
  text?: string
  className?: string 
}) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <span className="text-gray-400">{text}</span>
      <LoadingDots />
    </div>
  )
}

// Refresh button with loading state
export function RefreshButton({ 
  onRefresh, 
  isLoading 
}: { 
  onRefresh: () => void
  isLoading: boolean 
}) {
  return (
    <button
      onClick={onRefresh}
      disabled={isLoading}
      className="p-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
    >
      <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
    </button>
  )
}

// Progress bar for file uploads or processing
export function ProgressBar({ 
  progress, 
  className 
}: { 
  progress: number
  className?: string 
}) {
  return (
    <div className={cn('w-full bg-gray-700 rounded-full h-2', className)}>
      <div 
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  )
}