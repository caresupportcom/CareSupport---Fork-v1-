import React from 'react';
// Universal caregiving task taxonomy based on MIT AgeLab research
export interface CareTaskType {
  id: string;
  name: string;
  description: string;
  category: string;
  formFields?: string[];
  defaultPriority?: 'low' | 'medium' | 'high';
  suggestedAssignee?: string;
  icon?: string;
}
export interface CareTaskCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  tasks: CareTaskType[];
}
// The universal caregiving task taxonomy
export const CARE_TASK_CATEGORIES: CareTaskCategory[] = [{
  id: 'personal_physical',
  name: 'Personal & Physical Care',
  description: 'Hands-on personal care activities',
  color: 'blue',
  icon: 'user',
  tasks: [{
    id: 'physical_movement',
    name: 'Physical Movement',
    description: 'Assisting with mobility, transfers from bed to chair, etc.',
    category: 'personal_physical',
    formFields: ['specificAssistance', 'equipmentNeeded'],
    defaultPriority: 'high'
  }, {
    id: 'dressing',
    name: 'Dressing',
    description: 'Helping the care recipient get dressed and undressed',
    category: 'personal_physical',
    formFields: ['specificClothing', 'specialInstructions'],
    defaultPriority: 'medium'
  }, {
    id: 'grooming',
    name: 'Grooming',
    description: 'Helping with personal grooming (e.g., brushing teeth, combing hair, clipping nails)',
    category: 'personal_physical',
    formFields: ['groomingType', 'specialInstructions'],
    defaultPriority: 'medium'
  }, {
    id: 'bathing',
    name: 'Bathing',
    description: 'Helping the care recipient with bathing or showering',
    category: 'personal_physical',
    formFields: ['bathType', 'assistanceLevel', 'safetyPrecautions'],
    defaultPriority: 'medium'
  }, {
    id: 'toileting',
    name: 'Toileting',
    description: 'Helping the care recipient get to and from the toilet',
    category: 'personal_physical',
    formFields: ['assistanceLevel', 'specialInstructions'],
    defaultPriority: 'high'
  }, {
    id: 'incontinence',
    name: 'Incontinence',
    description: 'Dealing with incontinence or diapers',
    category: 'personal_physical',
    formFields: ['suppliesNeeded', 'specialInstructions'],
    defaultPriority: 'high'
  }, {
    id: 'feeding',
    name: 'Feeding',
    description: 'Helping the care recipient with feeding and/or eating',
    category: 'personal_physical',
    formFields: ['foodType', 'dietaryRestrictions', 'assistanceLevel'],
    defaultPriority: 'high'
  }, {
    id: 'exercise',
    name: 'Exercise',
    description: 'Helping the care recipient do exercises or doing exercises with them',
    category: 'personal_physical',
    formFields: ['exerciseType', 'duration', 'specialInstructions'],
    defaultPriority: 'medium'
  }, {
    id: 'physical_therapy',
    name: 'Physical Therapy',
    description: 'Assisting with physical therapy exercises',
    category: 'personal_physical',
    formFields: ['exerciseType', 'repetitions', 'specialInstructions'],
    defaultPriority: 'medium'
  }]
}, {
  id: 'health_medical',
  name: 'Health & Medical Management',
  description: 'Managing medications and medical needs',
  color: 'red',
  icon: 'heart',
  tasks: [{
    id: 'managing_medications',
    name: 'Managing Medications',
    description: 'Giving or managing medications for the care recipient',
    category: 'health_medical',
    formFields: ['medicationName', 'dosage', 'timing', 'specialInstructions'],
    defaultPriority: 'high'
  }, {
    id: 'medical_device_monitoring',
    name: 'Medical Device Monitoring',
    description: 'Reading and monitoring devices for heart, diabetes, and responding as appropriate',
    category: 'health_medical',
    formFields: ['deviceType', 'readingFrequency', 'actionThresholds'],
    defaultPriority: 'high'
  }, {
    id: 'arranging_medical',
    name: 'Arranging Medical',
    description: 'Arranging medical needs or services for the care recipient',
    category: 'health_medical',
    formFields: ['serviceType', 'providerName', 'contactInfo'],
    defaultPriority: 'medium'
  }, {
    id: 'making_medical_appts',
    name: 'Making Medical Appts',
    description: 'Making medical appointments for the care recipient',
    category: 'health_medical',
    formFields: ['providerName', 'reasonForVisit', 'preferredDates', 'insuranceInfo'],
    defaultPriority: 'medium'
  }]
}, {
  id: 'household',
  name: 'Household Management',
  description: 'Managing the home environment',
  color: 'green',
  icon: 'home',
  tasks: [{
    id: 'meal_preparation',
    name: 'Meal Preparation',
    description: 'Cooking and preparing meals for the care recipient',
    category: 'household',
    formFields: ['mealType', 'dietaryRestrictions', 'specialInstructions'],
    defaultPriority: 'medium'
  }, {
    id: 'home_management',
    name: 'Home Management',
    description: 'Helping with housework and home management (e.g., doing dishes, laundry)',
    category: 'household',
    formFields: ['taskType', 'location', 'specialInstructions'],
    defaultPriority: 'low'
  }, {
    id: 'grocery_shopping',
    name: 'Grocery Shopping',
    description: 'Grocery shopping or other shopping for the care recipient',
    category: 'household',
    formFields: ['shoppingList', 'budget', 'preferredStore'],
    defaultPriority: 'medium'
  }, {
    id: 'home_safety',
    name: 'Home Safety',
    description: 'Assuring safety in the home (e.g., change light bulbs, fix rugs, assure safety bars are working)',
    category: 'household',
    formFields: ['safetyIssue', 'location', 'materialsNeeded'],
    defaultPriority: 'high'
  }, {
    id: 'pet_care',
    name: 'Pet Care',
    description: "Managing pet care for the care recipient's pet",
    category: 'household',
    formFields: ['petType', 'careNeeded', 'specialInstructions'],
    defaultPriority: 'medium'
  }]
}, {
  id: 'coordination',
  name: 'Coordination & Administration',
  description: 'Coordinating care and services',
  color: 'purple',
  icon: 'calendar',
  tasks: [{
    id: 'managing_schedule',
    name: 'Managing Schedule',
    description: "Managing the care recipient's schedule",
    category: 'coordination',
    formFields: ['eventType', 'participants', 'specialConsiderations'],
    defaultPriority: 'medium'
  }, {
    id: 'arranging_transportation',
    name: 'Arranging Transportation',
    description: 'Arranging transportation services for the care recipient',
    category: 'coordination',
    formFields: ['destination', 'pickupTime', 'returnTime', 'specialNeeds'],
    defaultPriority: 'medium'
  }, {
    id: 'driving',
    name: 'Driving',
    description: 'Driving to appointments and activities for the care recipient',
    category: 'coordination',
    formFields: ['destination', 'departureTime', 'returnTime', 'specialNeeds'],
    defaultPriority: 'medium'
  }, {
    id: 'arranging_food',
    name: 'Arranging Food',
    description: 'Arranging for food or Meals on Wheels services',
    category: 'coordination',
    formFields: ['serviceProvider', 'mealPreferences', 'deliveryInstructions'],
    defaultPriority: 'medium'
  }, {
    id: 'arranging_social',
    name: 'Arranging Social',
    description: 'Arranging social events and services for the care recipient',
    category: 'coordination',
    formFields: ['eventType', 'participants', 'location', 'specialConsiderations'],
    defaultPriority: 'low'
  }, {
    id: 'making_personal_care_appts',
    name: 'Making Personal Care Appts',
    description: 'Making personal care appointments (e.g., hair, nails)',
    category: 'coordination',
    formFields: ['serviceType', 'providerName', 'preferredDates'],
    defaultPriority: 'low'
  }, {
    id: 'making_other_appts',
    name: 'Making Other Appts',
    description: 'Making other provider appointments',
    category: 'coordination',
    formFields: ['appointmentType', 'providerName', 'preferredDates'],
    defaultPriority: 'medium'
  }, {
    id: 'providing_direction',
    name: 'Providing Direction',
    description: 'Providing general direct or instruction to the care recipient',
    category: 'coordination',
    formFields: ['instructionType', 'details'],
    defaultPriority: 'medium'
  }]
}, {
  id: 'financial',
  name: 'Financial Management',
  description: 'Managing finances and paperwork',
  color: 'yellow',
  icon: 'dollar-sign',
  tasks: [{
    id: 'paying_bills',
    name: 'Paying Bills',
    description: 'Paying bills for the care recipient',
    category: 'financial',
    formFields: ['billType', 'amount', 'dueDate', 'paymentMethod'],
    defaultPriority: 'high'
  }, {
    id: 'budgeting',
    name: 'Budgeting',
    description: 'Budgeting for the care recipient',
    category: 'financial',
    formFields: ['budgetPeriod', 'categories', 'notes'],
    defaultPriority: 'medium'
  }, {
    id: 'financial_paperwork',
    name: 'Financial Paperwork',
    description: 'Filling out financial paperwork for the care recipient (insurance claims, etc.)',
    category: 'financial',
    formFields: ['paperworkType', 'deadline', 'documentsNeeded'],
    defaultPriority: 'high'
  }, {
    id: 'financial_communication',
    name: 'Financial Communication',
    description: "Communicating with financial services on the care recipient's behalf",
    category: 'financial',
    formFields: ['serviceType', 'contactPerson', 'purpose', 'accountInfo'],
    defaultPriority: 'medium'
  }]
}, {
  id: 'emotional_social',
  name: 'Emotional & Social Support',
  description: 'Providing emotional and social care',
  color: 'pink',
  icon: 'heart',
  tasks: [{
    id: 'keeping_company',
    name: 'Keeping Company',
    description: 'Keeping the care recipient company',
    category: 'emotional_social',
    formFields: ['duration', 'activities', 'specialConsiderations'],
    defaultPriority: 'medium'
  }, {
    id: 'mental_activities',
    name: 'Mental Activities',
    description: 'Reading, learning, or other mental activities with the care recipient',
    category: 'emotional_social',
    formFields: ['activityType', 'duration', 'materials', 'goals'],
    defaultPriority: 'medium'
  }, {
    id: 'caregiver_support',
    name: 'Caregiver Support',
    description: 'Looking for support for yourself as a caregiver',
    category: 'emotional_social',
    formFields: ['supportType', 'resources', 'notes'],
    defaultPriority: 'medium'
  }]
}, {
  id: 'information_technology',
  name: 'Information & Technology',
  description: 'Managing information and technology needs',
  color: 'teal',
  icon: 'wifi',
  tasks: [{
    id: 'information_search',
    name: 'Information Search',
    description: "Information searching/researching about topics related to caregiving, the care recipient's condition, or other needs",
    category: 'information_technology',
    formFields: ['searchTopic', 'urgency', 'specificQuestions'],
    defaultPriority: 'medium'
  }, {
    id: 'technology_issues',
    name: 'Technology Issues',
    description: 'Helping solve issues with technology including WiFi, online connectivity, and video conferencing tools',
    category: 'information_technology',
    formFields: ['deviceType', 'issueDescription', 'urgency'],
    defaultPriority: 'medium'
  }, {
    id: 'translate_emails_scams',
    name: 'Translate Emails/Scams',
    description: 'Helping the care recipient understand strange emails and identifying online scams',
    category: 'information_technology',
    formFields: ['emailSource', 'contentSummary', 'concernLevel'],
    defaultPriority: 'high'
  }]
}];
// Helper function to find a task by ID across all categories
export const findTaskById = (taskId: string): CareTaskType | undefined => {
  for (const category of CARE_TASK_CATEGORIES) {
    const task = category.tasks.find(t => t.id === taskId);
    if (task) return task;
  }
  return undefined;
};
// Helper function to find a category by ID
export const findCategoryById = (categoryId: string): CareTaskCategory | undefined => {
  return CARE_TASK_CATEGORIES.find(c => c.id === categoryId);
};