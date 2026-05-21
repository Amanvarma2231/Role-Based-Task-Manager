// src/components/AdvancedFilter.jsx
import React, { useState } from 'react';
import { format } from 'date-fns';

const AdvancedFilter = ({ filters, onFilterChange, onClearFilters }) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value, page: 1 });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <select
          value={filters.status}
          onChange={(e) => handleChange('status', e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="todo">📝 To Do</option>
          <option value="in_progress">🔄 In Progress</option>
          <option value="review">👀 Review</option>
          <option value="done">✅ Done</option>
        </select>

        <select
          value={filters.priority}
          onChange={(e) => handleChange('priority', e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Priority</option>
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🟠 High</option>
          <option value="urgent">🔴 Urgent</option>
        </select>

        <button
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
        >
          {isAdvancedOpen ? 'Hide' : 'Show'} Advanced Filters
        </button>

        <button
          onClick={onClearFilters}
          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
        >
          Clear Filters
        </button>
      </div>

      {isAdvancedOpen && (
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="createdAt">Created Date</option>
                <option value="updatedAt">Updated Date</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleChange('sortOrder', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="DESC">Descending</option>
                <option value="ASC">Ascending</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Items per page
              </label>
              <select
                value={filters.limit}
                onChange={(e) => handleChange('limit', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {['bug', 'feature', 'enhancement', 'urgent', 'documentation'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      const tags = filters.tags || [];
                      const newTags = tags.includes(tag)
                        ? tags.filter(t => t !== tag)
                        : [...tags, tag];
                      handleChange('tags', newTags);
                    }}
                    className={`px-3 py-1 rounded-full text-sm ${
                      (filters.tags || []).includes(tag)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilter;