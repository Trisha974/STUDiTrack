# Hook Unit Tests

This directory contains unit tests for custom React hooks.

## Setup

To run these tests, you'll need to install a testing framework. Recommended options:

### Option 1: Vitest (Recommended for Vite projects)

```bash
npm install -D vitest @testing-library/react @testing-library/react-hooks
```

Add to `vite.config.js`:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
```

### Option 2: Jest + React Testing Library

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

## Running Tests

```bash
# With Vitest
npm run test

# With Jest
npm test
```

## Test Files

- `useProfUIState.test.js` - Tests for UI state management hook
- `useStudentDashboardTransform.test.js` - Tests for data transformation hook

## Writing New Tests

When creating new hooks, add corresponding test files following the same pattern:

```js
import { renderHook, act } from '@testing-library/react'
import { useYourHook } from '../useYourHook'

describe('useYourHook', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useYourHook())
    // Test initial state
  })

  it('should handle actions', () => {
    const { result } = renderHook(() => useYourHook())
    act(() => {
      // Perform action
    })
    // Assert result
  })
})
```

