# Refactoring Breakdown Plan

## Overview

This document outlines the systematic breakdown of large components to improve maintainability and reduce code duplication.

## Current State

### Large Files
- `Prof.jsx`: ~8,519 lines (down from 8,836 after initial fixes)
- `AddStudentModal.jsx`: 1,568 lines
- `Student.jsx`: ~4,200 lines

### Completed Refactoring ✅
1. ✅ Extracted `fileToDataUrl` to shared utility (`imageHelpers.js`)
2. ✅ Removed duplicate `handleProfileSave` from `Prof.jsx`
3. ✅ Created `useModal` hook for modal state management
4. ✅ Reduced excessive console logging

## Refactoring Strategy

### Phase 1: Break Down AddStudentModal (Priority: High) 🔴

**Current**: Single 1,568-line component with 3 tabs

**Target**: Split into separate tab components

#### 1.1 CSV Import Tab Component
- **File**: `client/src/pages/Prof/components/AddStudentModal/CSVImportTab.jsx`
- **Lines**: ~500 lines extracted
- **Props**: CSV import state, handlers, subjects, enrolls
- **Status**: ⏳ To Do

#### 1.2 Archived Students Tab Component  
- **File**: `client/src/pages/Prof/components/AddStudentModal/RestoreStudentTab.jsx`
- **Lines**: ~600 lines extracted
- **Props**: Archived students, selection state, restore handlers
- **Status**: ⏳ To Do

#### 1.3 Create Student Tab Component
- **File**: `client/src/pages/Prof/components/AddStudentModal/CreateStudentTab.jsx`
- **Lines**: ~300 lines extracted
- **Props**: New student form, subject selection
- **Status**: ⏳ To Do

#### 1.4 Refactored AddStudentModal
- **File**: `client/src/pages/Prof/components/AddStudentModal.jsx`
- **Lines**: ~200 lines (tab navigation + orchestration)
- **Status**: ⏳ To Do

**Impact**: Reduces AddStudentModal from 1,568 → ~200 lines

### Phase 2: Extract Notification System (Priority: Medium) 🟡

**Current**: Notification logic embedded in `Prof.jsx` (~300 lines)

**Target**: Extract to custom hook

#### 2.1 Notification Hook
- **File**: `client/src/hooks/useNotifications.js`
- **Lines**: ~300 lines extracted
- **Features**: 
  - Notification parsing
  - Formatting functions
  - Categorization logic
- **Status**: ⏳ To Do

**Impact**: Reduces Prof.jsx by ~300 lines

### Phase 3: Extract Quick Grade Component (Priority: Medium) 🟡

**Current**: Quick grade logic in `Prof.jsx` and `GradesTab.jsx`

**Target**: Standalone component

#### 3.1 QuickGrade Component
- **File**: `client/src/pages/Prof/components/QuickGrade.jsx`
- **Lines**: ~400 lines extracted
- **Features**: Quick grade entry form and grid
- **Status**: ⏳ To Do

**Impact**: Reduces Prof.jsx by ~400 lines

### Phase 4: Extract Subject Management Logic (Priority: Low) 🟢

**Current**: Subject CRUD operations in `Prof.jsx`

**Target**: Extract handlers to custom hook

#### 4.1 Subject Management Hook
- **File**: `client/src/hooks/useSubjectManagement.js`
- **Lines**: ~500 lines extracted
- **Features**: Archive, restore, delete, permanent delete handlers
- **Status**: ⏳ To Do

**Impact**: Reduces Prof.jsx by ~500 lines

### Phase 5: Consolidate Modal States (Priority: Low) 🟢

**Current**: Multiple `useState` hooks for modals

**Target**: Use `useModals` hook

#### 5.1 Apply useModals Hook
- **File**: `client/src/pages/Prof/Prof.jsx`
- **Change**: Replace individual modal states with `useModals`
- **Impact**: Reduces state variables, cleaner code
- **Status**: ⏳ To Do

## Implementation Order

1. **Week 1**: Phase 1 (Break Down AddStudentModal)
   - Extract CSV Import Tab
   - Extract Restore Student Tab
   - Extract Create Student Tab
   - Refactor main modal

2. **Week 2**: Phase 2 (Notification System)
   - Extract notification hook
   - Update Prof.jsx to use hook

3. **Week 3**: Phase 3 (Quick Grade)
   - Extract QuickGrade component
   - Update GradesTab

4. **Week 4**: Phase 4 & 5 (Subject Management & Modals)
   - Extract subject management hook
   - Apply useModals hook

## Expected Results

### After All Phases

| File | Current | Target | Reduction |
|------|---------|--------|-----------|
| Prof.jsx | 8,519 | ~6,500 | -2,019 lines (-24%) |
| AddStudentModal.jsx | 1,568 | ~200 | -1,368 lines (-87%) |
| Total | 10,087 | ~6,700 | -3,387 lines (-34%) |

### Code Quality Improvements

- ✅ Better separation of concerns
- ✅ Easier to test individual components
- ✅ Reduced cognitive load
- ✅ Fewer merge conflicts
- ✅ Better reusability

## Testing Strategy

After each phase:
1. Run linter to check for errors
2. Test affected functionality manually
3. Verify no regressions
4. Update documentation

## Notes

- All refactoring maintains backward compatibility
- No breaking changes to APIs
- Functionality preserved throughout
- Incremental approach allows for testing at each step


