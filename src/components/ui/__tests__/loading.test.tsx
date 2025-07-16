import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  LoadingSpinner,
  LoadingButton,
  LoadingCard,
  LoadingPage,
  LoadingOverlay,
  LoadingTable,
  LoadingList,
  LoadingForm,
  LoadingChart,
  LoadingProfile,
  LoadingDots,
  LoadingText,
  RefreshButton,
  ProgressBar,
} from '../loading'

describe('Loading Components', () => {
  describe('LoadingSpinner', () => {
    it('should render with default props', () => {
      render(<LoadingSpinner />)
      const spinner = screen.getByRole('status', { hidden: true })
      expect(spinner).toBeInTheDocument()
    })

    it('should render with custom size', () => {
      render(<LoadingSpinner size="lg" />)
      const spinner = screen.getByRole('status', { hidden: true })
      expect(spinner).toHaveClass('w-8', 'h-8')
    })

    it('should render with custom variant', () => {
      render(<LoadingSpinner variant="primary" />)
      const spinner = screen.getByRole('status', { hidden: true })
      expect(spinner).toHaveClass('text-blue-500')
    })
  })

  describe('LoadingButton', () => {
    it('should render children when not loading', () => {
      render(
        <LoadingButton isLoading={false}>
          Click me
        </LoadingButton>
      )
      
      expect(screen.getByText('Click me')).toBeInTheDocument()
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    it('should render loading state when loading', () => {
      render(
        <LoadingButton isLoading={true}>
          Click me
        </LoadingButton>
      )
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.queryByText('Click me')).not.toBeInTheDocument()
    })

    it('should render custom loading text', () => {
      render(
        <LoadingButton isLoading={true} loadingText="Processing...">
          Click me
        </LoadingButton>
      )
      
      expect(screen.getByText('Processing...')).toBeInTheDocument()
    })

    it('should render icon when not loading', () => {
      const icon = <span data-testid="icon">icon</span>
      render(
        <LoadingButton isLoading={false} icon={icon}>
          Click me
        </LoadingButton>
      )
      
      expect(screen.getByTestId('icon')).toBeInTheDocument()
      expect(screen.getByText('Click me')).toBeInTheDocument()
    })
  })

  describe('LoadingCard', () => {
    it('should render with default props', () => {
      render(<LoadingCard />)
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.getByText('Please wait while we process your request')).toBeInTheDocument()
    })

    it('should render with custom title and description', () => {
      render(
        <LoadingCard 
          title="Custom Title" 
          description="Custom Description" 
        />
      )
      
      expect(screen.getByText('Custom Title')).toBeInTheDocument()
      expect(screen.getByText('Custom Description')).toBeInTheDocument()
    })
  })

  describe('LoadingPage', () => {
    it('should render loading page', () => {
      render(<LoadingPage />)
      
      expect(screen.getByText('Loading your dashboard...')).toBeInTheDocument()
      expect(screen.getByText('Setting up your personalized experience')).toBeInTheDocument()
    })
  })

  describe('LoadingOverlay', () => {
    it('should render when visible', () => {
      render(<LoadingOverlay isVisible={true} />)
      
      expect(screen.getByText('Processing...')).toBeInTheDocument()
    })

    it('should not render when not visible', () => {
      render(<LoadingOverlay isVisible={false} />)
      
      expect(screen.queryByText('Processing...')).not.toBeInTheDocument()
    })
  })

  describe('LoadingTable', () => {
    it('should render with default props', () => {
      render(<LoadingTable />)
      
      // Should render 5 rows by default
      const rows = screen.getAllByRole('generic')
      expect(rows).toHaveLength(5)
    })

    it('should render with custom rows and columns', () => {
      render(<LoadingTable rows={3} columns={4} />)
      
      // Should render 3 rows with 4 columns each
      const rows = screen.getAllByRole('generic')
      expect(rows).toHaveLength(3)
    })
  })

  describe('LoadingList', () => {
    it('should render with default props', () => {
      render(<LoadingList />)
      
      // Should render 3 items by default
      const items = screen.getAllByRole('generic')
      expect(items).toHaveLength(3)
    })

    it('should render with custom number of items', () => {
      render(<LoadingList items={5} />)
      
      // Should render 5 items
      const items = screen.getAllByRole('generic')
      expect(items).toHaveLength(5)
    })
  })

  describe('LoadingForm', () => {
    it('should render form skeleton', () => {
      render(<LoadingForm />)
      
      // Should render form elements
      const container = screen.getByRole('generic')
      expect(container).toBeInTheDocument()
    })
  })

  describe('LoadingChart', () => {
    it('should render chart skeleton', () => {
      render(<LoadingChart />)
      
      // Should render chart elements
      const container = screen.getByRole('generic')
      expect(container).toBeInTheDocument()
    })
  })

  describe('LoadingProfile', () => {
    it('should render profile skeleton', () => {
      render(<LoadingProfile />)
      
      // Should render profile elements
      const container = screen.getByRole('generic')
      expect(container).toBeInTheDocument()
    })
  })

  describe('LoadingDots', () => {
    it('should render loading dots', () => {
      render(<LoadingDots />)
      
      // Should render 3 dots
      const dots = screen.getAllByRole('generic')
      expect(dots).toHaveLength(3)
    })
  })

  describe('LoadingText', () => {
    it('should render with default text', () => {
      render(<LoadingText />)
      
      expect(screen.getByText('Loading')).toBeInTheDocument()
    })

    it('should render with custom text', () => {
      render(<LoadingText text="Custom Loading" />)
      
      expect(screen.getByText('Custom Loading')).toBeInTheDocument()
    })
  })

  describe('RefreshButton', () => {
    it('should render refresh button', () => {
      const onRefresh = jest.fn()
      render(<RefreshButton onRefresh={onRefresh} isLoading={false} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      
      button.click()
      expect(onRefresh).toHaveBeenCalledTimes(1)
    })

    it('should be disabled when loading', () => {
      const onRefresh = jest.fn()
      render(<RefreshButton onRefresh={onRefresh} isLoading={true} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('ProgressBar', () => {
    it('should render progress bar with correct width', () => {
      render(<ProgressBar progress={50} />)
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toBeInTheDocument()
      expect(progressBar).toHaveStyle('width: 50%')
    })

    it('should handle progress values over 100', () => {
      render(<ProgressBar progress={150} />)
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveStyle('width: 100%')
    })

    it('should handle negative progress values', () => {
      render(<ProgressBar progress={-10} />)
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveStyle('width: 0%')
    })
  })
})