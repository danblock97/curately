import React from 'react'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from '../error-boundary'

// Mock console.error to avoid cluttering test output
const originalError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalError
})

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('should render error fallback when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('We apologize for the inconvenience. Please try refreshing the page.')).toBeInTheDocument()
  })

  it('should render custom fallback when provided', () => {
    const CustomFallback = ({ error }: { error: Error }) => (
      <div>Custom error: {error.message}</div>
    )
    
    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Custom error: Test error')).toBeInTheDocument()
  })

  it('should have a reset button that clears the error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    const resetButton = screen.getByText('Try again')
    expect(resetButton).toBeInTheDocument()
    
    // Click the reset button
    resetButton.click()
    
    // The error should be cleared and component should try to render again
    // Since we're still throwing an error, it should catch it again
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('should log error to console', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.any(Error),
      expect.any(Object)
    )
    
    consoleSpy.mockRestore()
  })

  it('should display error details when showDetails is true', () => {
    render(
      <ErrorBoundary showDetails={true}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Error Details:')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()
  })

  it('should not display error details when showDetails is false', () => {
    render(
      <ErrorBoundary showDetails={false}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.queryByText('Error Details:')).not.toBeInTheDocument()
    expect(screen.queryByText('Test error')).not.toBeInTheDocument()
  })

  it('should call onError callback when error occurs', () => {
    const onErrorMock = jest.fn()
    
    render(
      <ErrorBoundary onError={onErrorMock}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(onErrorMock).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    )
  })

  it('should display custom error message', () => {
    const customMessage = 'Custom error message'
    
    render(
      <ErrorBoundary errorMessage={customMessage}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText(customMessage)).toBeInTheDocument()
  })

  it('should use default error message when none provided', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })
})