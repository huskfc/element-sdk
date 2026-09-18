# @defai/element-react

React hooks and components for building DEFAI elements.

## Installation

```bash
npm install @defai/element-react @defai/element-sdk react
```

## Quick Start

```tsx
import React from 'react';
import { 
  useElementState,
  useElementEvents,
  useElementSize,
  useElementTheme
} from '@defai/element-react';

function MyElementComponent() {
  const [state, setState] = useElementState({ counter: 0 });
  
  const handleIncrement = () => {
    setState({ counter: state.counter + 1 });
  };
  
  return (
    <div>
      <h1>Count: {state.counter}</h1>
      <button onClick={handleIncrement}>Increment</button>
    </div>
  );
}
```

## Hooks

### `useElementState<T>(initialState)`

Manage element state with React hooks.

```tsx
const [state, setState] = useElementState({
  isLoading: false,
  data: null,
  error: null
});

// Update state
setState({ isLoading: true });

// Partial updates
setState({ data: newData });
```

### `useElementEvents()`

Handle element events easily.

```tsx
const { emit, on } = useElementEvents();

// Emit events
const handleClick = () => {
  emit('button-clicked', { timestamp: Date.now() });
};

// Listen to events
useEffect(() => {
  const unsubscribe = on('external-data', (data) => {
    console.log('Received:', data);
  });
  
  return unsubscribe;
}, []);
```

### `useElementSize()`

Responsive design based on element size.

```tsx
const { width, height } = useElementSize();

return (
  <div style={{ width, height }}>
    {width < 500 ? <CompactLayout /> : <FullLayout />}
  </div>
);
```

### `useElementTheme()`

Access and respond to theme changes with legacy browser support.

```tsx
const theme = useElementTheme();

return (
  <div className={theme === 'dark' ? 'dark-mode' : 'light-mode'}>
    {/* Your content */}
  </div>
);
```

## TypeScript Support

Full TypeScript support with type inference:

```tsx
interface MyElementState {
  counter: number;
  items: string[];
  settings: {
    theme: 'light' | 'dark';
    refreshRate: number;
  };
}

const [state, setState] = useElementState<MyElementState>({
  counter: 0,
  items: [],
  settings: {
    theme: 'dark',
    refreshRate: 5000
  }
});
```

## Re-exported Types

The following types are re-exported from `@defai/element-sdk`:

- `ElementContext`
- `ElementState`
- `ElementAPI`
- `ElementMetadata`
- `ElementPermissions`

## Best Practices

1. **Clean up subscriptions** in useEffect returns
2. **Memoize expensive computations** with useMemo
6. **Optimize re-renders** with React.memo

## License

MIT
