# Testing Guide for Curately

This document provides comprehensive information about testing in the Curately application.

## Overview

The Curately application uses Jest and React Testing Library for testing. The test suite covers:

- **Unit Tests**: Individual functions and utilities
- **Component Tests**: React components and their behavior
- **Integration Tests**: API routes and database interactions
- **Security Tests**: Security utilities and middleware

## Test Structure

```
src/
├── lib/
│   ├── __tests__/
│   │   ├── validation.test.ts
│   │   ├── security.test.ts
│   │   ├── error-handler.test.ts
│   │   └── ...
├── components/
│   ├── __tests__/
│   │   ├── error-boundary.test.tsx
│   │   └── ...
│   └── ui/
│       └── __tests__/
│           ├── loading.test.tsx
│           └── ...
└── app/
    └── api/
        └── __tests__/
            ├── deeplink.test.ts
            └── ...
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### Test Coverage

The test configuration includes coverage collection for:
- All TypeScript/JavaScript files in `src/`
- Excludes type definitions, stories, and test files
- Generates HTML, LCOV, and text reports

Coverage thresholds are set to ensure quality:
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

## Test Categories

### 1. Validation Tests (`src/lib/__tests__/validation.test.ts`)

Tests for form validation schemas and functions:
- Username validation
- URL validation
- Input sanitization
- Form data validation
- Security validation rules

```typescript
describe('usernameSchema', () => {
  it('should validate correct usernames', () => {
    expect(usernameSchema.safeParse('john_doe').success).toBe(true)
  })
})
```

### 2. Security Tests (`src/lib/__tests__/security.test.ts`)

Tests for security utilities:
- Input sanitization
- URL validation
- Token generation
- CSRF protection
- Origin validation
- Suspicious activity detection

```typescript
describe('sanitizeInput', () => {
  it('should sanitize malicious input', () => {
    expect(sanitizeInput('<script>alert("xss")</script>'))
      .toBe('scriptalert("xss")/script')
  })
})
```

### 3. Error Handler Tests (`src/lib/__tests__/error-handler.test.ts`)

Tests for error handling:
- Custom error classes
- Error response creation
- Error logging
- Client-side error handling
- Error boundary integration

```typescript
describe('AppError', () => {
  it('should create AppError with correct properties', () => {
    const error = new AppError('Test error', 400, true, 'TEST_ERROR')
    expect(error.statusCode).toBe(400)
  })
})
```

### 4. Component Tests

#### Error Boundary (`src/components/__tests__/error-boundary.test.tsx`)

Tests for the error boundary component:
- Error catching and display
- Custom fallback rendering
- Error logging
- Reset functionality

```typescript
describe('ErrorBoundary', () => {
  it('should render error fallback when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })
})
```

#### Loading Components (`src/components/ui/__tests__/loading.test.tsx`)

Tests for loading components:
- Loading states
- Progress indicators
- Skeleton loaders
- Loading overlays

```typescript
describe('LoadingButton', () => {
  it('should render loading state when loading', () => {
    render(<LoadingButton isLoading={true}>Click me</LoadingButton>)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
```

### 5. API Tests (`src/app/api/__tests__/deeplink.test.ts`)

Tests for API routes:
- Request handling
- Authentication
- Rate limiting
- Data validation
- Error responses
- Database operations

```typescript
describe('/api/links/deeplink', () => {
  it('should create a deeplink successfully', async () => {
    const response = await POST(request)
    expect(response.status).toBe(200)
  })
})
```

## Test Setup and Configuration

### Jest Configuration (`jest.config.js`)

The Jest configuration includes:
- Next.js integration
- TypeScript support
- JSX support
- Module aliases
- Coverage configuration
- Test environment setup

### Test Setup (`jest.setup.js`)

The test setup file includes:
- DOM testing utilities
- Next.js router mocks
- Supabase client mocks
- Toast notification mocks
- Global object mocks (crypto, localStorage, etc.)

## Mocking Strategy

### External Dependencies

1. **Supabase Client**: Mocked to return predictable responses
2. **Next.js Router**: Mocked with common router methods
3. **External Libraries**: Mocked to avoid external dependencies
4. **Environment Variables**: Mocked for consistent testing

### Custom Mocks

```typescript
// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: null } })),
    },
  })),
}))
```

## Best Practices

### 1. Test Structure

- **Arrange**: Set up test data and mocks
- **Act**: Execute the code being tested
- **Assert**: Verify the expected behavior

### 2. Naming Conventions

- Test files: `*.test.ts` or `*.test.tsx`
- Test descriptions: Use clear, descriptive names
- Test groups: Group related tests using `describe`

### 3. Test Data

- Use realistic test data
- Create test utilities for common data
- Avoid hardcoded values when possible

### 4. Mocking

- Mock external dependencies
- Mock database calls
- Mock API responses
- Keep mocks simple and focused

### 5. Assertions

- Use specific assertions
- Test both success and failure cases
- Verify side effects (logging, database calls)

## Common Test Patterns

### Testing React Components

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('MyComponent', () => {
  it('should handle user interaction', async () => {
    const user = userEvent.setup()
    render(<MyComponent />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(screen.getByText('Success')).toBeInTheDocument()
  })
})
```

### Testing API Routes

```typescript
import { NextRequest } from 'next/server'
import { POST } from '../route'

describe('/api/endpoint', () => {
  it('should handle POST request', async () => {
    const request = new NextRequest('http://localhost/api/endpoint', {
      method: 'POST',
      body: JSON.stringify({ data: 'test' }),
    })
    
    const response = await POST(request)
    expect(response.status).toBe(200)
  })
})
```

### Testing Utility Functions

```typescript
describe('utilityFunction', () => {
  it('should return expected result', () => {
    const result = utilityFunction('input')
    expect(result).toBe('expected')
  })
  
  it('should handle edge cases', () => {
    expect(utilityFunction('')).toBe('')
    expect(utilityFunction(null)).toBe(null)
  })
})
```

## Debugging Tests

### Common Issues

1. **Mock not working**: Check mock implementation and file paths
2. **Async tests failing**: Ensure proper async/await usage
3. **DOM not updating**: Check for async updates and wait for changes
4. **Import errors**: Verify module aliases and imports

### Debug Tools

```typescript
// Debug component output
screen.debug()

// Debug specific element
screen.debug(screen.getByTestId('test-id'))

// Console log in tests
console.log('Debug info:', result)
```

## Continuous Integration

The test suite is configured for CI environments:
- Uses `--ci` flag for CI optimizations
- Generates coverage reports
- Runs without watch mode
- Fails on coverage below thresholds

## Security Testing

Special attention is given to security testing:
- Input sanitization
- XSS prevention
- CSRF protection
- Rate limiting
- Authentication checks

## Performance Testing

While not included in the current setup, consider adding:
- Load testing for API endpoints
- Performance benchmarks
- Memory usage monitoring
- Bundle size analysis

## Contributing

When adding new features:
1. Write tests for new functionality
2. Maintain or improve coverage
3. Follow existing test patterns
4. Update this documentation if needed

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)