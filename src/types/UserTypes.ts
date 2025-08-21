// User Relationship Types
export type RelationshipType =
// Family options
'care_recipient' | 'spouse_partner' | 'adult_child' | 'parent' | 'sibling' | 'other_family'
// Professional options
| 'professional_caregiver' | 'nurse_medical' | 'agency_coordinator' | 'healthcare_provider'
// Community options
| 'close_friend' | 'neighbor' | 'community_volunteer' | 'other_helper';

// User Circle Type - for the three-tier model
export type UserCircle = 'core' | 'extended' | 'recipient';

// Responsibility Areas
export interface UserResponsibilities {
  // Administrative
  scheduling: boolean;
  coordinating: boolean;
  managing_medications: boolean;
  communicating: boolean;
  // Direct Care
  personal_care: boolean;
  medication_administration: boolean;
  health_monitoring: boolean;
  meal_preparation: boolean;
  // Backup Support
  emergency_coverage: boolean;
  occasional_help: boolean;
  specific_tasks: boolean;
  companionship: boolean;
}

// Availability Patterns
export type AvailabilityPattern = 'scheduled_shifts' | 'business_hours' | 'evenings_weekends' | 'emergency_only' | 'as_needed';

// Support Preferences for Extended Network
export interface SupportPreferences {
  taskCategories: string[];
  preferredDays?: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  preferredTimes?: {
    start: string;
    end: string;
  };
  notificationPreferences: {
    newTasks: boolean;
    preferredTaskTypes: string[];
  };
}

// Contribution History
export interface ContributionHistory {
  tasksCompleted: number;
  lastContribution: string | null; // ISO date
  preferredCategories: Record<string, number>; // Category ID to count
}

// Enhanced User Profile
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  // Relationship + Responsibility Framework
  relationship: RelationshipType;
  responsibilities: UserResponsibilities;
  availabilityPattern: AvailabilityPattern;
  // Three-tier model classification
  circleType: UserCircle;
  // Additional fields
  specificQualifications?: string[];
  availabilityDetails?: {
    scheduledDays?: string[];
    scheduledHours?: {
      start: string;
      end: string;
    };
  };
  // For extended network members
  supportPreferences?: SupportPreferences;
  // Track contribution history
  contributionHistory?: ContributionHistory;
}

// Default empty responsibilities
export const emptyResponsibilities: UserResponsibilities = {
  // Administrative
  scheduling: false,
  coordinating: false,
  managing_medications: false,
  communicating: false,
  // Direct Care
  personal_care: false,
  medication_administration: false,
  health_monitoring: false,
  meal_preparation: false,
  // Backup Support
  emergency_coverage: false,
  occasional_help: false,
  specific_tasks: false,
  companionship: false
};

// Default support preferences
export const defaultSupportPreferences: SupportPreferences = {
  taskCategories: [],
  preferredDays: {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false
  },
  preferredTimes: {
    start: '09:00',
    end: '17:00'
  },
  notificationPreferences: {
    newTasks: true,
    preferredTaskTypes: []
  }
};

// Default contribution history
export const defaultContributionHistory: ContributionHistory = {
  tasksCompleted: 0,
  lastContribution: null,
  preferredCategories: {}
};

// Helper function to get relationship category
export function getRelationshipCategory(relationship: RelationshipType): 'family' | 'professional' | 'community' {
  if (['spouse_partner', 'adult_child', 'parent', 'sibling', 'other_family'].includes(relationship)) {
    return 'family';
  } else if (['professional_caregiver', 'nurse_medical', 'agency_coordinator', 'healthcare_provider'].includes(relationship)) {
    return 'professional';
  } else {
    return 'community';
  }
}

// Helper function to determine user circle type based on relationship
export function getUserCircleType(relationship: RelationshipType): UserCircle {
  if (relationship === 'care_recipient') {
    return 'recipient';
  } else if (['professional_caregiver', 'nurse_medical', 'spouse_partner', 'adult_child'].includes(relationship)) {
    return 'core';
  } else {
    return 'extended';
  }
}

// Helper function to get formatted relationship display name
export function getRelationshipDisplayName(relationship: RelationshipType): string {
  const displayNames = {
    care_recipient: 'Care Recipient',
    spouse_partner: 'Spouse/Partner',
    adult_child: 'Adult Child',
    parent: 'Parent',
    sibling: 'Sibling',
    other_family: 'Other Family Member',
    professional_caregiver: 'Professional Caregiver',
    nurse_medical: 'Nurse/Medical Professional',
    agency_coordinator: 'Agency Coordinator',
    healthcare_provider: 'Healthcare Provider',
    close_friend: 'Close Friend',
    neighbor: 'Neighbor',
    community_volunteer: 'Community Volunteer',
    other_helper: 'Other Helper'
  };
  return displayNames[relationship] || 'Unknown Relationship';
}