import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { TrendingUpIcon, AwardIcon, HeartIcon, CalendarIcon } from 'lucide-react';
export const ContributionStats = ({
  userStats
}) => {
  // Sample data for the contribution chart
  const contributionData = [{
    month: 'Jan',
    tasks: 0
  }, {
    month: 'Feb',
    tasks: 2
  }, {
    month: 'Mar',
    tasks: 5
  }, {
    month: 'Apr',
    tasks: 3
  }, {
    month: 'May',
    tasks: 7
  }, {
    month: 'Jun',
    tasks: 4
  }, {
    month: 'Jul',
    tasks: userStats.tasksCompleted || 8
  }];
  // Sample data for task categories
  const categoryData = [{
    name: 'Transportation',
    count: 3,
    color: '#3b82f6'
  }, {
    name: 'Grocery Shopping',
    count: 5,
    color: '#10b981'
  }, {
    name: 'Companionship',
    count: 2,
    color: '#8b5cf6'
  }, {
    name: 'Medication',
    count: 4,
    color: '#f97316'
  }, {
    name: 'Home Help',
    count: 1,
    color: '#f59e0b'
  }];
  return <div>
      {/* Stats Cards */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
        <h2 className="text-sm font-semibold mb-3 flex items-center">
          <TrendingUpIcon className="w-4 h-4 mr-1 text-blue-500" />
          Your Contribution Summary
        </h2>
        <div className="grid grid-cols-3 gap-4 mb-2">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-blue-600">
              {userStats.tasksCompleted || 8}
            </div>
            <div className="text-xs text-blue-700">Tasks Completed</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-green-600">
              {userStats.tasksCreated || 3}
            </div>
            <div className="text-xs text-green-700">Tasks Created</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-purple-600">4</div>
            <div className="text-xs text-purple-700">Recipients Helped</div>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
          <div className="flex items-center">
            <AwardIcon className="w-3.5 h-3.5 mr-1 text-yellow-500" />
            Silver Helper Badge
          </div>
          <div className="flex items-center">
            <HeartIcon className="w-3.5 h-3.5 mr-1 text-red-500" />
            Streak: 3 weeks
          </div>
          <div className="flex items-center">
            <CalendarIcon className="w-3.5 h-3.5 mr-1 text-blue-500" />
            Member since Jan 2023
          </div>
        </div>
      </div>
      {/* Contribution Chart */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
        <h2 className="text-sm font-semibold mb-4">Monthly Contributions</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={contributionData} margin={{
            top: 5,
            right: 5,
            bottom: 20,
            left: 0
          }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{
              fontSize: 12
            }} />
              <YAxis tick={{
              fontSize: 12
            }} />
              <Tooltip contentStyle={{
              borderRadius: '8px',
              fontSize: '12px',
              padding: '8px'
            }} formatter={value => [`${value} tasks`, 'Completed']} />
              <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                {contributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={index === contributionData.length - 1 ? '#3b82f6' : '#93c5fd'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Task Categories */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h2 className="text-sm font-semibold mb-3">Your Top Categories</h2>
        <div className="space-y-3">
          {categoryData.map((category, index) => <div key={index} className="flex items-center">
              <div className="w-24 text-xs text-gray-700">{category.name}</div>
              <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{
              width: `${category.count / Math.max(...categoryData.map(c => c.count)) * 100}%`,
              backgroundColor: category.color
            }}></div>
              </div>
              <div className="w-8 text-xs text-gray-700 text-right ml-2">
                {category.count}
              </div>
            </div>)}
        </div>
      </div>
    </div>;
};