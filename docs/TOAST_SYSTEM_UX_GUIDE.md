# Toast Notification System - UX Guide

## Overview

The Fleet Management System uses a centralized toast notification system built on top of Sonner (shadcn UI) to provide consistent, user-friendly feedback throughout the application.

## Key UX Principles

### 1. **Progressive Feedback**
- Show loading state immediately when action starts
- Update to success/error when completed
- Never leave users wondering if their action is processing

### 2. **Clear, Actionable Messages**
- Use specific, human-readable messages
- Include context about what succeeded/failed
- Provide retry options for failed operations

### 3. **Appropriate Duration**
- Success: 4 seconds (users read and feel confident)
- Error: 6 seconds (users have time to understand and react)
- Loading: Persistent (until operation completes)

### 4. **Visual Hierarchy**
- Success: Green with checkmark
- Error: Red with alert icon
- Warning: Yellow with warning icon
- Info: Blue with info icon
- Loading: Spinner animation

## Usage Examples

### Basic Toast Notifications

```typescript
import { toast } from '../../lib/toast';

// Success
toast.success('Vehicle created successfully');

// Error
toast.error('Failed to delete driver');

// Warning
toast.warning('License expires in 7 days');

// Info
toast.info('Server maintenance scheduled for tonight');

// Loading
const toastId = toast.loading('Processing...');
```

### Progressive Loading Pattern (Recommended)

```typescript
import { toast, formatApiError } from '../../lib/toast';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // 1. Show loading state
  const toastId = toast.loading('Creating vehicle...');
  
  try {
    // 2. Perform async operation
    await createVehicle.mutateAsync(data);
    
    // 3. Update to success
    toast.update(toastId, 'success', 'Vehicle created successfully');
    
    // 4. Clean up UI
    setDialogOpen(false);
    resetForm();
  } catch (error) {
    // 5. Update to error with formatted message
    const errorMessage = formatApiError(error, 'Failed to create vehicle');
    toast.update(toastId, 'error', errorMessage);
    
    // Keep dialog open for retry
  }
};
```

### Error Handling with Retry

```typescript
import { toastErrorWithRetry } from '../../lib/toast';

const loadData = async () => {
  try {
    await fetchData();
  } catch (error) {
    toastErrorWithRetry('Failed to load data', () => {
      loadData(); // Retry the operation
    });
  }
};
```

### Promise-based Toast

```typescript
toast.promise(
  saveData(),
  {
    loading: 'Saving changes...',
    success: 'Changes saved successfully',
    error: 'Failed to save changes',
  }
);
```

### Toast with Description

```typescript
toast.success('Vehicle deleted', {
  description: 'The vehicle and all related records have been removed',
});

toast.error('Permission denied', {
  description: 'You need admin privileges to perform this action',
});
```

### Toast with Custom Duration

```typescript
// Short duration for minor actions
toast.success('Filter applied', { duration: 2000 });

// Long duration for important messages
toast.error('Server connection lost', { duration: 8000 });
```

## API Error Formatting

The `formatApiError` helper automatically converts API errors into user-friendly messages:

```typescript
import { formatApiError } from '../../lib/toast';

try {
  await apiCall();
} catch (error) {
  // Automatically handles:
  // - HTTP status codes (401, 403, 404, 500, etc.)
  // - Response body messages
  // - Network errors
  const message = formatApiError(error, 'Operation failed');
  toast.error(message);
}
```

### Status Code Mappings

| Status | User Message |
|--------|--------------|
| 400 | Invalid request. Please check your input. |
| 401 | You are not authorized. Please log in again. |
| 403 | You do not have permission to perform this action. |
| 404 | The requested resource was not found. |
| 409 | A conflict occurred. The resource may already exist. |
| 422 | Validation failed. Please check your input. |
| 429 | Too many requests. Please try again later. |
| 500 | Server error. Please try again later. |
| 502/503 | Service temporarily unavailable. Please try again. |

## Component Integration

### Before (Bad UX)

```typescript
// ❌ Silent failure - user doesn't know what happened
try {
  await createDriver.mutateAsync(data);
  setDialogOpen(false);
} catch (error) {
  console.error('Failed', error);
  // Dialog closes, no feedback!
}
```

### After (Good UX)

```typescript
// ✅ Progressive feedback with clear messages
const toastId = toast.loading('Creating driver...');

try {
  await createDriver.mutateAsync(data);
  toast.update(toastId, 'success', 'Driver created successfully');
  setDialogOpen(false);
} catch (error) {
  const message = formatApiError(error, 'Failed to create driver');
  toast.update(toastId, 'error', message);
  // Dialog stays open for retry
}
```

## Validation Pattern

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate before showing loading
  if (!requiredField) {
    toast.warning('Please fill in all required fields');
    return;
  }
  
  const toastId = toast.loading('Saving...');
  
  try {
    await save(data);
    toast.update(toastId, 'success', 'Saved successfully');
  } catch (error) {
    toast.update(toastId, 'error', formatApiError(error));
  }
};
```

## Delete Confirmation Pattern

```typescript
const handleDelete = async (id: string) => {
  // Browser confirmation
  if (!confirm('Are you sure you want to delete this item?')) {
    return;
  }
  
  const toastId = toast.loading('Deleting...');
  
  try {
    await deleteItem.mutateAsync(id);
    toast.update(toastId, 'success', 'Item deleted successfully');
  } catch (error) {
    toast.update(toastId, 'error', formatApiError(error, 'Failed to delete item'));
  }
};
```

## Configuration

### Toast Position
Toasts appear in the **top-right** corner by default, configured in `sonner.tsx`:

```typescript
<Toaster
  position="top-right"  // Top-right is optimal for desktop apps
  expand={true}         // Expand on hover for long messages
  richColors={true}     // Use semantic colors
  closeButton={true}    // Allow manual dismissal
/>
```

### Custom Styling
Toast styles are defined in `sonner.tsx` using Tailwind CSS classes:

```typescript
toastOptions={{
  classNames: {
    toast: 'group toast group-[.toaster]:bg-background ...',
    error: 'group-[.toaster]:bg-destructive ...',
    success: 'group-[.toaster]:bg-green-600 ...',
    warning: 'group-[.toaster]:bg-yellow-600 ...',
    info: 'group-[.toaster]:bg-blue-600 ...',
  },
}}
```

## Best Practices

### DO ✅

1. **Always show loading state for async operations**
   ```typescript
   const toastId = toast.loading('Processing...');
   ```

2. **Use specific, actionable messages**
   ```typescript
   toast.success('Vehicle #1234 created and assigned to Driver Smith');
   ```

3. **Format API errors for users**
   ```typescript
   const message = formatApiError(error, 'Failed to save');
   toast.error(message);
   ```

4. **Keep dialog open on error** (allow retry)
   ```typescript
   catch (error) {
     toast.error(formatApiError(error));
     // Don't close dialog
   }
   ```

5. **Validate before showing loading**
   ```typescript
   if (!valid) {
     toast.warning('Please check your input');
     return;
   }
   const toastId = toast.loading('Saving...');
   ```

### DON'T ❌

1. **Don't use generic messages**
   ```typescript
   toast.error('Error'); // ❌ Not helpful
   toast.error('Failed to create vehicle'); // ✅ Specific
   ```

2. **Don't show loading without updating**
   ```typescript
   toast.loading('Processing...'); // ❌ Never resolves
   const id = toast.loading('Processing...'); // ✅ Can update
   ```

3. **Don't close dialogs on error**
   ```typescript
   catch (error) {
     setDialogOpen(false); // ❌ User can't retry
     toast.error(error);
   }
   ```

4. **Don't log and toast**
   ```typescript
   catch (error) {
     console.error(error); // ❌ Redundant
     toast.error(error);   // User sees this
   }
   ```

5. **Don't show success for GET requests**
   ```typescript
   const data = await fetch();
   toast.success('Data loaded'); // ❌ Annoying
   // Just show loading state, no success needed
   ```

## Accessibility

- **Keyboard Navigation**: Close button is keyboard accessible
- **Screen Readers**: Toast messages are announced via ARIA live regions
- **Color Contrast**: All toast variants meet WCAG AA standards
- **Animation**: Respects user's motion preferences

## Testing

```typescript
import { toast } from '../../lib/toast';

// Test success toast
toast.success('Test success message');

// Test error toast with retry
toast.error('Test error', {
  action: {
    label: 'Retry',
    onClick: () => console.log('Retry clicked'),
  },
});

// Test loading → success flow
const id = toast.loading('Test loading...');
setTimeout(() => {
  toast.update(id, 'success', 'Test completed');
}, 2000);
```

## Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Login | ✅ | Progressive loading + error formatting |
| Vehicles | ✅ | Create, update, delete with loading |
| Drivers | ✅ | Create, update, delete with loading |
| Assignments | ✅ | Create with validation + loading |
| Maintenance | ✅ | Log service with validation + loading |
| Dashboard | ⏳ | Needs error states for data loading |
| Financial | ⏳ | Needs error handling |

## Future Enhancements

1. **Toast Queue Management**: Limit concurrent toasts
2. **Toast Persistence**: Store dismissed toasts for history
3. **Custom Icons**: Per-action icons (truck for vehicles, user for drivers)
4. **Sound Effects**: Optional audio feedback
5. **Analytics**: Track error rates and user interactions
