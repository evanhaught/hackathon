import React from 'react';
import { Student, Department } from '../types';
import { StudentCard } from './StudentCard';
import { Users } from 'lucide-react';

interface ColumnProps {
  department: Department;
  students: Student[];
  onHelp: (id: string) => void;
  color: string;
  isAdvisorLoggedIn: boolean;
}

export const Column: React.FC<ColumnProps> = ({ department, students, onHelp, color, isAdvisorLoggedIn }) => {
  return (
    <div className="flex flex-col h-full min-w-[300px] w-full md:w-1/4 bg-gray-50/50 rounded-xl border border-gray-200/60 overflow-hidden flex-shrink-0">
      {/* Column Header */}
      <div className={`p-4 border-b border-gray-200 bg-white sticky top-0 z-10 border-t-4 ${color}`}>
        <div className="flex justify-between items-center mb-1">
          <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider">{department}</h2>
          <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full flex items-center">
            <Users className="w-3 h-3 mr-1" />
            {students.length}
          </span>
        </div>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide">
        {students.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg m-2">
            <p>No students waiting</p>
          </div>
        ) : (
          students.map((student) => (
            <StudentCard 
              key={student.id} 
              student={student} 
              onHelp={onHelp} 
              isAdvisorLoggedIn={isAdvisorLoggedIn}
            />
          ))
        )}
      </div>
    </div>
  );
};