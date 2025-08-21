import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon, PlusIcon, StarIcon, ClockIcon, MoreHorizontalIcon } from 'lucide-react';
import { BracketText } from '../Common/BracketText';
import { Button } from '../Common/Button';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
import { storage } from '../../services/StorageService';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
export const TaskTemplateScreen = ({
  onBack,
  onCreateTask
}) => {
  const {
    preferences
  } = useUserPreferences();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  // Load templates from storage on component mount
  useEffect(() => {
    const savedTemplates = storage.get('task_templates', defaultTemplates);
    setTemplates(savedTemplates);
  }, []);
  const handleSelectTemplate = template => {
    setSelectedTemplate(template);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'template_selected',
      template_id: template.id,
      template_name: template.name
    });
  };
  const handleUseTemplate = () => {
    if (!selectedTemplate) return;
    // Pre-populate the task creation form with template data
    onCreateTask({
      title: selectedTemplate.title,
      description: selectedTemplate.description,
      priority: selectedTemplate.priority || preferences.tasks.defaultPriority,
      assignedTo: selectedTemplate.assignedTo || preferences.tasks.defaultAssignee,
      isTemplate: true,
      templateId: selectedTemplate.id
    });
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'template_used',
      template_id: selectedTemplate.id,
      template_name: selectedTemplate.name
    });
  };
  return <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center border-b border-gray-200">
        <button onClick={onBack} className="mr-4" aria-label="Go back">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold">Task Templates</h1>
      </div>
      {/* Content */}
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        <p className="text-gray-600 mb-6">
          Choose a template to quickly create common tasks
        </p>
        {/* Template Categories */}
        <div className="space-y-6">
          {/* Favorite Templates */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">Favorites</h2>
              <StarIcon className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="space-y-3">
              {templates.filter(template => template.favorite).map(template => <TemplateCard key={template.id} template={template} isSelected={selectedTemplate?.id === template.id} onSelect={() => handleSelectTemplate(template)} />)}
              {templates.filter(template => template.favorite).length === 0 && <p className="text-sm text-gray-500 italic py-2">
                  No favorite templates yet
                </p>}
            </div>
          </div>
          {/* Recent Templates */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">Recently Used</h2>
              <ClockIcon className="w-5 h-5 text-gray-500" />
            </div>
            <div className="space-y-3">
              {templates.filter(template => template.lastUsed).sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed)).slice(0, 3).map(template => <TemplateCard key={template.id} template={template} isSelected={selectedTemplate?.id === template.id} onSelect={() => handleSelectTemplate(template)} />)}
              {templates.filter(template => template.lastUsed).length === 0 && <p className="text-sm text-gray-500 italic py-2">
                  No recently used templates
                </p>}
            </div>
          </div>
          {/* All Templates */}
          <div>
            <h2 className="text-base font-semibold mb-3">All Templates</h2>
            <div className="space-y-3">
              {templates.map(template => <TemplateCard key={template.id} template={template} isSelected={selectedTemplate?.id === template.id} onSelect={() => handleSelectTemplate(template)} />)}
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200">
        <Button onClick={handleUseTemplate} disabled={!selectedTemplate} className="w-full">
          Use Template
        </Button>
        <button className="w-full mt-3 py-2 text-blue-600 font-medium flex items-center justify-center" onClick={() => {
        analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
          feature_name: 'create_new_template_clicked'
        });
        // In a real app, this would navigate to a template creation screen
        console.log('Create new template clicked');
      }}>
          <PlusIcon className="w-4 h-4 mr-1" />
          <BracketText active={true}>Create New Template</BracketText>
        </button>
      </div>
    </div>;
};
// Template card component
const TemplateCard = ({
  template,
  isSelected,
  onSelect
}) => {
  const getPriorityColor = priority => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-orange-600 bg-orange-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };
  return <button className={`w-full p-4 rounded-xl border ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'} flex items-start text-left`} onClick={onSelect}>
      <div className="flex-1">
        <div className="flex items-center">
          <h3 className="font-medium">{template.name}</h3>
          {template.favorite && <StarIcon className="w-4 h-4 text-yellow-500 ml-2" />}
        </div>
        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
        <div className="flex items-center mt-2">
          {template.priority && <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(template.priority)} mr-2`}>
              {template.priority.charAt(0).toUpperCase() + template.priority.slice(1)}
            </span>}
          {template.assignedTo && <span className="text-xs text-gray-500">
              Assigned to: {template.assignedTo}
            </span>}
        </div>
      </div>
      <div>
        <MoreHorizontalIcon className="w-5 h-5 text-gray-400" />
      </div>
    </button>;
};
// Default templates
const defaultTemplates = [{
  id: 'template-1',
  name: 'Medication Reminder',
  description: 'Remind to take daily medications',
  title: 'Take morning medications',
  priority: 'high',
  assignedTo: null,
  favorite: true,
  lastUsed: new Date(Date.now() - 86400000).toISOString() // 1 day ago
}, {
  id: 'template-2',
  name: 'Doctor Appointment',
  description: 'Schedule a doctor appointment',
  title: 'Schedule appointment with Dr. Smith',
  priority: 'medium',
  assignedTo: 'james',
  favorite: true,
  lastUsed: new Date(Date.now() - 172800000).toISOString() // 2 days ago
}, {
  id: 'template-3',
  name: 'Grocery Shopping',
  description: 'Buy groceries and essentials',
  title: 'Pick up groceries from the store',
  priority: 'medium',
  assignedTo: 'maria',
  favorite: false,
  lastUsed: new Date(Date.now() - 432000000).toISOString() // 5 days ago
}, {
  id: 'template-4',
  name: 'Vitals Check',
  description: 'Record blood pressure and heart rate',
  title: 'Check and record blood pressure',
  priority: 'medium',
  assignedTo: null,
  favorite: false,
  lastUsed: null
}, {
  id: 'template-5',
  name: 'Physical Therapy',
  description: 'Assist with daily exercises',
  title: 'Help with physical therapy exercises',
  priority: 'medium',
  assignedTo: 'linda',
  favorite: false,
  lastUsed: null
}];