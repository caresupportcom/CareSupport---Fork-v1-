# CareSupport Schedule Page - Wireframes and Visual Design

## Design Philosophy

The refactored Schedule page follows a **gap-first, action-oriented** design philosophy:
- **Coverage gaps are the primary focus** - they're what coordinators need to solve
- **Availability input is streamlined** - minimal friction for caregivers
- **Actions are contextual** - relevant options appear when and where needed

## Page Layout Structure

### Desktop Layout (1024px+)
```
┌─────────────────────────────────────────────────────────────┐
│ Header: Schedule | [Today] [Week] [Month] [Settings]        │
├─────────────────────────────────────────────────────────────┤
│ ┌─Coverage Overview─────┐ ┌─Quick Actions──────────────────┐ │
│ │ ● 3 Critical Gaps     │ │ [Request Coverage]             │ │
│ │ ● 12/16 Hours Covered │ │ [Assign Open Shifts]           │ │
│ │ ● Next Gap: Today 2PM │ │ [Send Team Update]             │ │
│ └───────────────────────┘ └────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─Today's Coverage─────────────────────────────────────────┐ │
│ │ 6AM  [Maria - Confirmed] ──────────────── 2PM            │ │
│ │ 2PM  [⚠️ COVERAGE GAP] ────────────────── 6PM            │ │
│ │ 6PM  [James - Tentative] ─────────────── 10PM           │ │
│ │ 10PM [Linda - Confirmed] ─────────────── 6AM            │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─My Availability──────┐ ┌─Team Status────────────────────┐ │
│ │ Status: Available    │ │ ● Maria: Available             │ │
│ │ [Quick Toggle]       │ │ ● James: Tentative             │ │
│ │ [Set Calendar]       │ │ ● Linda: Available             │ │
│ └─────────────────────┘ │ ● Robert: Unavailable          │ │
│                         └────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Layout (320px-768px)
```
┌─────────────────────────────┐
│ Schedule        [⚙️] [📅]    │
├─────────────────────────────┤
│ ⚠️ 3 Critical Coverage Gaps │
│ [View Gaps] [Request Help]  │
├─────────────────────────────┤
│ Today's Coverage            │
│ ┌─6AM-2PM─────────────────┐ │
│ │ ✅ Maria (Confirmed)    │ │
│ └─────────────────────────┘ │
│ ┌─2PM-6PM─────────────────┐ │
│ │ ⚠️ COVERAGE GAP        │ │
│ │ [Find Coverage]         │ │
│ └─────────────────────────┘ │
│ ┌─6PM-10PM────────────────┐ │
│ │ ⏳ James (Tentative)   │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ My Status: Available ✅     │
│ [Change Status]             │
├─────────────────────────────┤
│ [Set My Availability]       │
│ [View Full Schedule]        │
└─────────────────────────────┘
```

## Key Component Designs

### 1. Coverage Gap Alert (Priority Component)
```
┌─────────────────────────────────────────────────────┐
│ ⚠️ CRITICAL COVERAGE GAP                           │
│ Today, 2:00 PM - 6:00 PM (4 hours)                │
│                                                     │
│ Available Team Members:                             │
│ ┌─Robert──────┐ ┌─Sarah───────┐ ┌─Michael─────┐    │
│ │ ✅ Can Help │ │ ⏳ Maybe   │ │ ❌ Busy    │    │
│ │ [Request]   │ │ [Request]   │ │ [Notify]    │    │
│ └─────────────┘ └─────────────┘ └─────────────┘    │
│                                                     │
│ [Send Team Alert] [Create Open Shift] [Skip]       │
└─────────────────────────────────────────────────────┘
```

### 2. Simplified Availability Input
```
┌─────────────────────────────────────┐
│ My Availability                     │
│                                     │
│ Current Status:                     │
│ ┌─Available─┐ ┌─Maybe─┐ ┌─Busy─┐   │
│ │     ✅    │ │   ⏳  │ │  ❌  │   │
│ │ [Active]  │ │       │ │      │   │
│ └───────────┘ └───────┘ └──────┘   │
│                                     │
│ This Week:                          │
│ Mon Tue Wed Thu Fri Sat Sun         │
│  ✅  ✅  ❌  ✅  ✅  ⏳  ❌         │
│                                     │
│ [Set Recurring Pattern]             │
│ [Calendar View]                     │
└─────────────────────────────────────┘
```

### 3. Action-Oriented Coverage Calendar
```
┌─────────────────────────────────────────────────────────┐
│ Week of March 15-21, 2024                              │
│                                                         │
│        Mon    Tue    Wed    Thu    Fri    Sat    Sun   │
│ 6AM   [Maria] [Gap!] [Linda] [James] [Maria] [Gap] [--] │
│ 2PM   [James] [Gap!] [Maria] [Gap!] [Linda] [--] [Gap] │
│ 10PM  [Linda] [Linda] [James] [Maria] [James] [--] [--] │
│                                                         │
│ Legend: [Name] = Confirmed, [Gap!] = Needs Coverage    │
│         [Gap] = Minor Gap, [--] = Not Needed           │
│                                                         │
│ 🔴 3 Critical Gaps  🟡 2 Minor Gaps  ✅ 85% Covered   │
└─────────────────────────────────────────────────────────┘
```

## Implementation Strategy

### Phase 1: Core Infrastructure (Days 1-3)
**Files to Modify:**
- `src/components/Schedule/ScheduleScreen.tsx`
- `src/components/Schedule/ScheduleDashboard.tsx`
- `src/services/AvailabilityService.ts`
- `src/types/ScheduleTypes.ts`

**Key Changes:**
1. Simplify the main Schedule screen to focus on coverage overview
2. Reduce tab complexity from 3 tabs to 2 primary views
3. Implement real-time availability status tracking
4. Create unified data models for availability and coverage

### Phase 2: Availability Input Redesign (Days 4-6)
**Files to Create/Modify:**
- `src/components/Schedule/Availability/QuickStatusToggle.tsx` (New)
- `src/components/Schedule/Availability/SimplifiedCalendar.tsx` (New)
- `src/components/Schedule/Availability/AvailabilityView.tsx` (Refactor)

**Key Features:**
1. **Quick Status Toggle**: Large, accessible buttons for Available/Tentative/Unavailable
2. **Simplified Calendar**: One-click date selection with clear visual states
3. **Recurring Patterns**: Drag-to-select weekly patterns with visual confirmation

### Phase 3: Coverage Visualization (Days 7-9)
**Files to Create/Modify:**
- `src/components/Schedule/Coverage/CoverageOverview.tsx` (New)
- `src/components/Schedule/Coverage/GapAlert.tsx` (New)
- `src/components/Schedule/Coverage/TeamStatus.tsx` (New)
- `src/components/Schedule/ShiftsView/ShiftsView.tsx` (Refactor)

**Key Features:**
1. **Gap-First Design**: Critical gaps prominently displayed at top
2. **Visual Coverage Map**: Clear timeline showing confirmed/unconfirmed coverage
3. **Team Availability Panel**: Real-time status of all team members

### Phase 4: Coordination Tools (Days 10-12)
**Files to Create/Modify:**
- `src/components/Schedule/Coordination/RequestCoverage.tsx` (New)
- `src/components/Schedule/Coordination/QuickAssign.tsx` (New)
- `src/components/Schedule/Coordination/TeamNotifications.tsx` (New)

**Key Features:**
1. **One-Click Requests**: Send availability requests directly from gap alerts
2. **Smart Assignment**: Suggest available team members for open shifts
3. **Bulk Operations**: Handle multiple gaps or assignments simultaneously

### Phase 5: Mobile Optimization (Days 13-15)
**Files to Modify:**
- All Schedule components for responsive design
- `src/styles/accessibility.css` for touch targets
- Navigation components for mobile-first approach

**Key Features:**
1. **Mobile-First Layout**: Stack components vertically on small screens
2. **Touch-Friendly Controls**: Minimum 44px touch targets
3. **Simplified Navigation**: Reduce cognitive load on mobile

## Accessibility Implementation Checklist

### Keyboard Navigation
- [ ] Tab order follows logical flow
- [ ] Arrow keys navigate calendar grids
- [ ] Escape closes modals and dropdowns
- [ ] Enter/Space activates buttons and toggles

### Screen Reader Support
- [ ] All interactive elements have accessible names
- [ ] Status changes announced via live regions
- [ ] Complex UI patterns have proper ARIA markup
- [ ] Alternative text for visual-only information

### Visual Accessibility
- [ ] Color contrast meets WCAG AA standards
- [ ] Information not conveyed by color alone
- [ ] Focus indicators clearly visible
- [ ] Text scales up to 200% without horizontal scrolling

### Motor Accessibility
- [ ] Touch targets minimum 44px
- [ ] Click areas larger than visual elements
- [ ] Drag operations have click alternatives
- [ ] Undo functionality for destructive actions

## Testing Strategy

### Automated Testing
1. **Unit Tests**: Component behavior and accessibility
2. **Integration Tests**: User workflows and data flow
3. **Visual Regression Tests**: UI consistency across changes
4. **Performance Tests**: Load times and responsiveness

### Manual Testing
1. **Keyboard-Only Navigation**: Complete workflows without mouse
2. **Screen Reader Testing**: NVDA, JAWS, VoiceOver compatibility
3. **Mobile Device Testing**: iOS and Android across screen sizes
4. **High Contrast Mode**: Windows and macOS high contrast support

### User Testing
1. **Caregiver Usability**: Availability input efficiency
2. **Coordinator Workflow**: Gap identification and resolution
3. **Accessibility Testing**: Users with disabilities
4. **Mobile Usability**: Touch interaction patterns

## Success Criteria

### Functional Requirements
- [ ] Caregivers can update availability in under 30 seconds
- [ ] Coordinators can identify coverage gaps within 5 seconds
- [ ] Gap resolution workflow completes in under 2 minutes
- [ ] All features work on mobile devices

### Accessibility Requirements
- [ ] WCAG 2.1 AA compliance across all components
- [ ] Screen reader compatibility verified
- [ ] Keyboard navigation fully functional
- [ ] High contrast mode supported

### Performance Requirements
- [ ] Initial page load under 3 seconds
- [ ] Availability updates reflect immediately
- [ ] Works offline for basic viewing
- [ ] Smooth animations on 60fps devices

## Next Steps

1. **Stakeholder Review**: Present wireframes and get feedback
2. **Technical Planning**: Finalize component architecture
3. **Design System Updates**: Integrate OKLCH colors
4. **Development Kickoff**: Begin Phase 1 implementation

This plan provides a clear roadmap for transforming the Schedule page into a focused, accessible, and efficient tool for care coordination.