import React, { useEffect, useState } from 'react';
import { XIcon, FilterIcon, CheckIcon } from 'lucide-react';
import { useCalendar } from '../../contexts/CalendarContext';
interface EventFiltersProps {
  isOpen: boolean;
  onClose: () => void;
}
export const EventFilters: React.FC<EventFiltersProps> = ({
  isOpen,
  onClose
}) => {
  const {
    filters,
    toggleCategoryFilter,
    toggleAssigneeFilter,
    clearFilters
  } = useCalendar();
  // Available categories
  const categories = [{
    id: 'medication',
    name: 'Medication',
    color: 'blue'
  }, {
    id: 'appointment',
    name: 'Appointments',
    color: 'purple'
  }, {
    id: 'therapy',
    name: 'Therapy',
    color: 'green'
  }, {
    id: 'meal',
    name: 'Meals',
    color: 'yellow'
  }];
  // Available team members
  const teamMembers = [{
    id: 'james',
    name: 'James',
    color: 'blue'
  }, {
    id: 'maria',
    name: 'Maria',
    color: 'green'
  }, {
    id: 'linda',
    name: 'Linda',
    color: 'purple'
  }];
  // Handle clear all filters
  const handleClearFilters = () => {
    clearFilters();
  };
  // Handle background click to close the modal
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={handleBackgroundClick}>
      <div className="bg-white rounded-xl w-full max-w-md shadow-lg" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-semibold text-lg flex items-center">
            <FilterIcon className="w-5 h-5 mr-2 text-blue-500" />
            Filter Events
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <XIcon className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="p-4">
          {/* Categories */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">Event Type</h4>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(category => <button key={category.id} className={`p-3 rounded-lg border flex items-center ${filters.categories?.includes(category.id) ? `border-${category.color}-500 bg-${category.color}-50` : 'border-gray-200'}`} onClick={() => toggleCategoryFilter(category.id)}>
                  <div className={`w-4 h-4 rounded-full mr-2 ${filters.categories?.includes(category.id) ? `bg-${category.color}-500` : 'bg-gray-200'}`}>
                    {filters.categories?.includes(category.id) && <CheckIcon className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm">{category.name}</span>
                </button>)}
            </div>
          </div>
          {/* Assigned To */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">Assigned To</h4>
            <div className="space-y-2">
              {teamMembers.map(member => <button key={member.id} className={`w-full p-3 rounded-lg border flex items-center ${filters.assignedTo?.includes(member.id) ? `border-${member.color}-500 bg-${member.color}-50` : 'border-gray-200'}`} onClick={() => toggleAssigneeFilter(member.id)}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${filters.assignedTo?.includes(member.id) ? `bg-${member.color}-100 text-${member.color}-600` : 'bg-gray-100 text-gray-600'}`}>
                    <span className="text-sm font-medium">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <span>{member.name}</span>
                  {filters.assignedTo?.includes(member.id) && <CheckIcon className={`w-5 h-5 ml-auto text-${member.color}-500`} />}
                </button>)}
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-100">
            <button onClick={handleClearFilters} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700">
              Clear All Filters
            </button>
            <button onClick={onClose} className="flex-1 py-2 bg-blue-500 text-white rounded-lg">
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>;
};