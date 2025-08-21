# Technical Specifications - Schedule Page Refactor

## Architecture Overview

### Component Hierarchy
```
SchedulePage (Container)
├── CoverageOverview (Primary View)
│   ├── CoverageMetrics
│   ├── CriticalGaps
│   └── QuickActions
├── AvailabilityInput (Secondary View)
│   ├── StatusToggle
│   ├── CalendarInput
│   └── RecurringPatterns
└── CoordinationTools (Contextual)
    ├── GapResolution
    ├── TeamRequests
    └── BulkOperations
```

### Data Models

#### Simplified Availability Model
```typescript
interface UserAvailability {
  userId: string;
  status: 'available' | 'tentative' | 'unavailable';
  dateOverrides: Record<string, AvailabilityStatus>;
  recurringPattern: WeeklyPattern;
  lastUpdated: string;
}

interface WeeklyPattern {
  [dayOfWeek: number]: TimeSlot[];
}

interface TimeSlot {
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  status: 'available' | 'tentative';
}
```

#### Coverage Gap Model
```typescript
interface CoverageGap {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  priority: 'critical' | 'moderate' | 'minor';
  suggestedCaregivers: string[];
  requestsSent: string[];
  status: 'open' | 'pending' | 'resolved';
}
```

### State Management

#### Context Structure
```typescript
interface ScheduleContextType {
  // Availability Management
  userAvailability: UserAvailability;
  updateAvailability: (updates: Partial<UserAvailability>) => void;
  
  // Coverage Management
  coverageGaps: CoverageGap[];
  shifts: CareShift[];
  refreshCoverage: () => void;
  
  // Coordination
  requestCoverage: (gapId: string, caregiverIds: string[]) => void;
  assignShift: (shiftId: string, caregiverId: string) => void;
  
  // UI State
  selectedDate: Date;
  viewMode: 'overview' | 'availability' | 'coordination';
  isLoading: boolean;
}
```

## API Design

### Availability Endpoints
```typescript
// Update user availability status
PUT /api/availability/status
{
  userId: string;
  status: 'available' | 'tentative' | 'unavailable';
  effectiveDate?: string;
}

// Set date-specific availability
PUT /api/availability/dates
{
  userId: string;
  dateOverrides: Record<string, AvailabilityStatus>;
}

// Update recurring pattern
PUT /api/availability/pattern
{
  userId: string;
  pattern: WeeklyPattern;
}
```

### Coverage Endpoints
```typescript
// Get coverage status for date range
GET /api/coverage?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
Response: {
  gaps: CoverageGap[];
  shifts: CareShift[];
  metrics: CoverageMetrics;
}

// Request coverage for gap
POST /api/coverage/request
{
  gapId: string;
  caregiverIds: string[];
  message?: string;
}
```

## Performance Optimizations

### Data Fetching Strategy
1. **Lazy Loading**: Load detailed shift data only when needed
2. **Caching**: Cache availability patterns locally
3. **Real-time Updates**: WebSocket for live coverage changes
4. **Optimistic Updates**: Immediate UI feedback for availability changes

### Rendering Optimizations
1. **Virtual Scrolling**: For large calendar views
2. **Memoization**: Expensive coverage calculations
3. **Code Splitting**: Route-based and component-based splitting
4. **Image Optimization**: Lazy load team member avatars

## Accessibility Implementation

### ARIA Patterns
```typescript
// Calendar Grid
<div
  role="grid"
  aria-label="Availability calendar"
  aria-describedby="calendar-instructions"
>
  <div role="row">
    <div
      role="gridcell"
      aria-selected={isSelected}
      aria-label={`${date}, ${availabilityStatus}`}
      tabIndex={isSelected ? 0 : -1}
    >
      {date}
    </div>
  </div>
</div>

// Status Toggle
<fieldset>
  <legend>Availability Status</legend>
  <input
    type="radio"
    id="available"
    name="status"
    value="available"
    aria-describedby="available-description"
  />
  <label htmlFor="available">Available</label>
  <div id="available-description" className="sr-only">
    You can take on new shifts and assignments
  </div>
</fieldset>
```

### Focus Management
```typescript
// Focus trap for modals
const useFocusTrap = (isOpen: boolean) => {
  const trapRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isOpen) return;
    
    const focusableElements = trapRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements?.[0] as HTMLElement;
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };
    
    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();
    
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);
  
  return trapRef;
};
```

## Mobile-First Implementation

### Responsive Breakpoints
```css
/* Mobile First Approach */
.schedule-container {
  /* Base: Mobile (320px+) */
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

@media (min-width: 768px) {
  /* Tablet */
  .schedule-container {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 2rem;
    padding: 2rem;
  }
}

@media (min-width: 1024px) {
  /* Desktop */
  .schedule-container {
    grid-template-columns: 2fr 1fr 1fr;
    gap: 2rem;
  }
}
```

### Touch Interactions
```typescript
// Enhanced touch targets
const TouchButton: React.FC<TouchButtonProps> = ({ children, ...props }) => {
  return (
    <button
      {...props}
      className={`
        min-h-[44px] min-w-[44px] 
        touch-manipulation
        active:scale-95 
        transition-transform duration-150
        ${props.className}
      `}
      style={{
        WebkitTapHighlightColor: 'transparent',
        ...props.style
      }}
    >
      {children}
    </button>
  );
};
```

## Real-Time Updates

### WebSocket Integration
```typescript
// Real-time coverage updates
const useRealTimeCoverage = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const { refreshCoverage } = useScheduleContext();
  
  useEffect(() => {
    const ws = new WebSocket(process.env.REACT_APP_WS_URL);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'AVAILABILITY_UPDATED':
          refreshCoverage();
          break;
        case 'SHIFT_ASSIGNED':
          // Update local state optimistically
          break;
        case 'COVERAGE_GAP_RESOLVED':
          // Remove gap from UI
          break;
      }
    };
    
    setSocket(ws);
    
    return () => ws.close();
  }, [refreshCoverage]);
  
  return socket;
};
```

## Error Handling and Loading States

### Graceful Degradation
```typescript
// Availability input with offline support
const AvailabilityInput: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingUpdates, setPendingUpdates] = useState<AvailabilityUpdate[]>([]);
  
  const updateAvailability = async (update: AvailabilityUpdate) => {
    if (!isOnline) {
      // Store for later sync
      setPendingUpdates(prev => [...prev, update]);
      // Update UI optimistically
      updateLocalState(update);
      return;
    }
    
    try {
      await api.updateAvailability(update);
      updateLocalState(update);
    } catch (error) {
      // Handle error gracefully
      showErrorMessage('Failed to update availability. Please try again.');
    }
  };
  
  // Sync when back online
  useEffect(() => {
    if (isOnline && pendingUpdates.length > 0) {
      syncPendingUpdates();
    }
  }, [isOnline, pendingUpdates]);
  
  return (
    <div>
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
          <p className="text-yellow-800">
            You're offline. Changes will sync when connection is restored.
          </p>
        </div>
      )}
      {/* Availability input UI */}
    </div>
  );
};
```

## Testing Strategy

### Unit Tests
```typescript
// Example test for availability toggle
describe('StatusToggle', () => {
  it('should update availability status', async () => {
    const mockUpdate = jest.fn();
    render(<StatusToggle onUpdate={mockUpdate} currentStatus="available" />);
    
    const tentativeButton = screen.getByRole('radio', { name: /tentative/i });
    fireEvent.click(tentativeButton);
    
    expect(mockUpdate).toHaveBeenCalledWith('tentative');
  });
  
  it('should be keyboard accessible', () => {
    render(<StatusToggle onUpdate={jest.fn()} currentStatus="available" />);
    
    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toBeInTheDocument();
    
    // Test arrow key navigation
    const availableRadio = screen.getByRole('radio', { name: /available/i });
    availableRadio.focus();
    fireEvent.keyDown(availableRadio, { key: 'ArrowDown' });
    
    const tentativeRadio = screen.getByRole('radio', { name: /tentative/i });
    expect(tentativeRadio).toHaveFocus();
  });
});
```

### Accessibility Tests
```typescript
// Automated accessibility testing
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Schedule Page Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<SchedulePage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('should support screen readers', () => {
    render(<SchedulePage />);
    
    // Check for proper headings
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    
    // Check for landmark regions
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    
    // Check for live regions
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
```

## Deployment Considerations

### Feature Flags
```typescript
// Gradual rollout with feature flags
const useFeatureFlag = (flagName: string) => {
  const [isEnabled, setIsEnabled] = useState(false);
  
  useEffect(() => {
    // Check feature flag service
    featureFlagService.isEnabled(flagName).then(setIsEnabled);
  }, [flagName]);
  
  return isEnabled;
};

// Usage in components
const SchedulePage: React.FC = () => {
  const useNewScheduleUI = useFeatureFlag('new-schedule-ui');
  
  if (useNewScheduleUI) {
    return <NewSchedulePage />;
  }
  
  return <LegacySchedulePage />;
};
```

### Monitoring and Analytics
```typescript
// Track accessibility usage
const trackAccessibilityUsage = (feature: string, method: string) => {
  analytics.track('accessibility_feature_used', {
    feature,
    method,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  });
};

// Usage tracking
const StatusToggle: React.FC = () => {
  const handleKeyboardActivation = () => {
    trackAccessibilityUsage('status_toggle', 'keyboard');
    // Handle activation
  };
  
  const handleMouseActivation = () => {
    trackAccessibilityUsage('status_toggle', 'mouse');
    // Handle activation
  };
  
  return (
    <button
      onClick={handleMouseActivation}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleKeyboardActivation();
        }
      }}
    >
      Toggle Status
    </button>
  );
};
```

This technical specification provides the foundation for implementing a robust, accessible, and performant Schedule page refactor that addresses the core MVP requirements while maintaining high standards for user experience and accessibility.