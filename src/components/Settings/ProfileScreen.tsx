import React, { useEffect, useState } from 'react';
import { ChevronLeftIcon, UserIcon, EditIcon, SaveIcon, XIcon } from 'lucide-react';
import { storage } from '../../services/StorageService';
import { dataService } from '../../services/DataService';
import { findCategoryById } from '../../services/CareTaskTaxonomy';
import { Button } from '../Common/Button';
import { ContributionBadge } from '../Recognition/ContributionBadge';
import { defaultContributionHistory } from '../../types/UserTypes';
export const ProfileScreen = ({
  onBack
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  // Get contribution history
  const userId = storage.get('user_id', '');
  const history = storage.get(`contribution_history_${userId}`, defaultContributionHistory);
  useEffect(() => {
    // Load user data from storage
    setName(storage.get('user_name', 'James Wilson'));
    setEmail(storage.get('user_email', 'james.wilson@example.com'));
    setPhone(storage.get('user_phone', '(555) 123-4567'));
    setRole(storage.get('user_role', 'Nurse'));
  }, []);
  const handleSave = () => {
    // Save updated user data
    storage.save('user_name', name);
    storage.save('user_email', email);
    storage.save('user_phone', phone);
    storage.save('user_role', role);
    setIsEditing(false);
  };
  const formatDate = dateStr => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  return <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-200">
        <div className="flex items-center mb-2">
          <button onClick={onBack} className="mr-4" aria-label="Go back">
            <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold flex-1">Profile</h1>
          <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} aria-label={isEditing ? 'Save profile' : 'Edit profile'} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            {isEditing ? <SaveIcon className="w-5 h-5 text-blue-600" /> : <EditIcon className="w-5 h-5 text-gray-600" />}
          </button>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-3">
            <UserIcon className="w-12 h-12 text-blue-500" />
          </div>
          <ContributionBadge userId={userId} />
        </div>
        {/* Profile Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          {isEditing ? <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select value={role} onChange={e => setRole(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white">
                  <option value="Nurse">Nurse</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Family Caregiver">Family Caregiver</option>
                  <option value="Professional Caregiver">
                    Professional Caregiver
                  </option>
                  <option value="Friend">Friend</option>
                  <option value="Neighbor">Neighbor</option>
                  <option value="Volunteer">Volunteer</option>
                </select>
              </div>
            </div> : <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Name</span>
                <span className="font-medium">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="font-medium">{email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone</span>
                <span className="font-medium">{phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Role</span>
                <span className="font-medium">{role}</span>
              </div>
            </div>}
        </div>
        {/* Contribution History */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-medium mb-3">Your Contributions</h2>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">Tasks Completed</span>
            <span className="font-medium">{history.tasksCompleted}</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">Last Contribution</span>
            <span className="font-medium">
              {formatDate(history.lastContribution)}
            </span>
          </div>
          {Object.keys(history.preferredCategories).length > 0 && <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">
                Most Active Categories
              </h3>
              <div className="space-y-2">
                {Object.entries(history.preferredCategories).sort(([, countA], [, countB]) => countB - countA).slice(0, 3).map(([categoryId, count]) => {
              const category = findCategoryById(categoryId);
              return <div key={categoryId} className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          {category?.name || categoryId}
                        </span>
                        <span className="text-sm font-medium">
                          {count} tasks
                        </span>
                      </div>;
            })}
              </div>
            </div>}
        </div>
        {/* Account Actions */}
        <div className="space-y-3">
          <Button variant="secondary" className="w-full">
            Change Password
          </Button>
          <Button variant="danger" className="w-full">
            Sign Out
          </Button>
        </div>
      </div>
    </div>;
};