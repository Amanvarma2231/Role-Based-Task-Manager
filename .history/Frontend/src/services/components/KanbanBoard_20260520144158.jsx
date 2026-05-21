// src/components/KanbanBoard.jsx
import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const KanbanBoard = ({ tasks, onStatusChange, onEditTask, onDeleteTask }) => {
  const columns = {
    todo: {
      title: 'To Do',
      color: 'bg-gray-200',
      tasks: tasks.filter(t => t.status === 'todo')
    },
    in_progress: {
      title: 'In Progress',
      color: 'bg-blue-200',
      tasks: tasks.filter(t => t.status === 'in_progress')
    },
    review: {
      title: 'Review',
      color: 'bg-yellow-200',
      tasks: tasks.filter(t => t.status === 'review')
    },
    done: {
      title: 'Done',
      color: 'bg-green-200',
      tasks: tasks.filter(t => t.status === 'done')
    }
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) return;
    
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    onStatusChange(draggableId, destination.droppableId);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'border-l-green-500',
      medium: 'border-l-yellow-500',
      high: 'border-l-orange-500',
      urgent: 'border-l-red-500'
    };
    return colors[priority] || 'border-l-gray-500';
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
        {Object.entries(columns).map(([columnId, column]) => (
          <div key={columnId} className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${column.color} px-3 py-1 rounded-full`}>
                {column.title}
              </h3>
              <span className="bg-white px-2 py-1 rounded-full text-sm">
                {column.tasks.length}
              </span>
            </div>
            
            <Droppable droppableId={columnId}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[200px] transition-colors ${
                    snapshot.isDraggingOver ? 'bg-blue-50' : ''
                  }`}
                >
                  {column.tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-white p-4 mb-3 rounded-lg shadow border-l-4 ${
                            getPriorityColor(task.priority)
                          } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900 flex-1">
                              {task.title}
                            </h4>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => onEditTask(task)}
                                className="text-gray-400 hover:text-blue-500"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => onDeleteTask(task.id)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                          
                          {task.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap gap-2 mb-2">
                            {task.tags?.map(tag => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-gray-100 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>👤 {task.assignee?.name || 'Unassigned'}</span>
                            {task.dueDate && (
                              <span>
                                📅 {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;