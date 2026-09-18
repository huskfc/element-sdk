# @defai/element-types

TypeScript type definitions for DEFAI Element SDK.

## Installation

```bash
npm install @defai/element-types
```

## Usage

```typescript
import { ElementMetadata, ElementPermissions, ElementCategory, UserTier } from '@defai/element-types';

const metadata: ElementMetadata = {
  id: 'my-element',
  name: 'My Element',
  version: '1.0.0',
  author: 'Author Name',
  description: 'Element description',
  category: 'Utilities',
  tags: ['tag1', 'tag2'],
  icon: '🔧',
  screenshots: [],
  minSize: { width: 300, height: 200 },
  maxSize: { width: 800, height: 600 },
  defaultSize: { width: 400, height: 300 },
  tierRequired: 'free',
};

const permissions: ElementPermissions = {
  network: true,
  storage: true,
  notifications: false,
  clipboard: false,
  canReceiveFrom: [],
  canSendTo: [],
  portfolio: false,
  transactions: false,
  aiChat: false,
  wallet: false,
  maxMemory: 128,
  maxCpu: 50,
  maxStorageSize: 10,
};
```

## Types Included

- **Core**: `ElementSize`, `ElementPosition`, `ElementMetadata`, `ElementPermissions`
- **Context**: `ElementContext`, `ElementAPI`, `ElementState`, `ElementSettings`
- **APIs**: `StorageAPI`, `WalletAPI`, `PricesAPI`, `NetworkAPI`, `NotificationsAPI`, `AIAPI`, `AnalyticsAPI`, `CommunicationAPI`
- **Data**: `TokenBalance`, `AIImageAnalysis`, `AITokenAnalysis`, `NotificationOptions`
- **Categories**: `ElementCategory`, `UserTier`
- **Validation**: `ElementValidationResult`, `ValidationError`, `ValidationWarning`
- **Marketplace**: `ElementMarketplaceData`, `ElementReview`, `ElementTransaction`
- **Performance**: `ElementPerformanceMetrics`
- **Testing**: `ElementTestResult`
- **Lifecycle**: `ElementLifecycleEvent`
- **Base Class**: `DefaiElement`

## Build

```bash
npm run build
```

This runs `tsc --noEmit` to type-check the definitions.

## License

MIT