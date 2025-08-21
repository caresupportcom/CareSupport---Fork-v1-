import React, { useState } from 'react';
import { ArrowLeftIcon, CheckIcon, XIcon, AlertTriangleIcon } from 'lucide-react';
import { Button } from '../Common/Button';
import { BracketText } from '../Common/BracketText';
import { StatusBadge } from '../Common/StatusBadge';
export const ConflictResolutionScreen = ({
  task,
  onBack,
  onResolve
}) => {
  const [selectedResolution, setSelectedResolution] = useState(null);
  const [note, setNote] = useState('');
  const conflictOptions = [{
    id: 'reschedule',
    title: 'Reschedule Task',
    description: 'Move this task to a different time',
    icon: 'clock'
  }, {
    id: 'modify',
    title: 'Modify Task',
    description: 'Change the task details to resolve the conflict',
    icon: 'edit'
  }, {
    id: 'remove',
    title: 'Remove Task',
    description: 'Delete this task from the schedule',
    icon: 'trash'
  }, {
    id: 'ignore',
    title: 'Ignore Conflict',
    description: 'Keep both tasks as scheduled',
    icon: 'eye-off'
  }];
  const handleResolve = () => {
    if (!selectedResolution) return;
    onResolve({
      resolution: selectedResolution,
      note: note
    });
  };
  return <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center">
        <button onClick={onBack} className="mr-4">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold">Resolve Conflict</h1>
      </div>
      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
          <div className="flex items-start mb-3">
            <div className="bg-orange-100 p-2 rounded-full mr-3">
              <AlertTriangleIcon className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="font-medium">Conflict Detected</h2>
              <p className="text-sm text-gray-600">
                This task conflicts with another scheduled activity
              </p>
            </div>
          </div>
          <div className="border-t border-orange-200 pt-3">
            <h3 className="font-medium mb-2">Task Details</h3>
            <p className="text-sm font-medium">
              {task?.title || 'Give medication'}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              {task?.description || 'Administer 10mg of medication with food'}
            </p>
            <BracketText className="text-sm text-gray-600">
              Due: {task?.dueTime || '9:00 AM'}
            </BracketText>
          </div>
        </div>
        <h3 className="font-medium mb-3">Select Resolution</h3>
        <div className="space-y-3 mb-6">
          {conflictOptions.map(option => <button key={option.id} className={`w-full p-4 rounded-xl border-2 flex items-start ${selectedResolution === option.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`} onClick={() => setSelectedResolution(option.id)}>
              <div className="flex-1">
                <h4 className="font-medium text-left">{option.title}</h4>
                <p className="text-sm text-gray-600 text-left">
                  {option.description}
                </p>
              </div>
              {selectedResolution === option.id && <div className="ml-3 bg-blue-500 text-white p-1 rounded-full">
                  <CheckIcon className="w-4 h-4" />
                </div>}
            </button>)}
        </div>
        <h3 className="font-medium mb-3">Add Note</h3>
        <textarea className="w-full border border-gray-300 rounded-lg p-3 h-24 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Add a note about this resolution..." value={note} onChange={e => setNote(e.target.value)} />
        <Button onClick={handleResolve} disabled={!selectedResolution} className={`w-full ${!selectedResolution ? 'opacity-50' : ''}`}>
          <BracketText active={true} className="text-white">
            Apply Resolution
          </BracketText>
        </Button>
      </div>
    </div>;
};