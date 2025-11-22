import React from 'react';
import { Student, Department } from '../types';
import { StudentCard } from './StudentCard';
import { Users } from 'lucide-react';

interface ColumnProps {
  department: Department;
  students: Student[];
  onHelp: (id: string) => void;
  onRemove: (id: string) => void;
  styles: {
    headerBg: string;
    headerText: string;
    borderColor: string;
  };
  isAdvisorLoggedIn: boolean;
}

export const Column: React.FC<ColumnProps> = ({ department, students, onHelp, onRemove, styles, isAdvisorLoggedIn }) => {
  return (
    <div className="flex flex-col h-full min-w-[300px] w-full md:w-1/4 bg-gray-50/50 rounded-xl border border-gray-200/60 overflow-hidden flex-shrink-0 shadow-sm">
      {/* Column Header */}
      <div className={`p-3 ${styles.headerBg} ${styles.headerText} shadow-sm sticky top-0 z-10 flex justify-between items-center`}>
        <h2 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
          {department}
        </h2>
        <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center backdrop-blur-sm">
          <Users className="w-3 h-3 mr-1" />
          {students.length}
        </span>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide bg-gray-100/50">
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
              onRemove={onRemove}
              isAdvisorLoggedIn={isAdvisorLoggedIn}
              borderColor={styles.borderColor}
            />
          ))
        )}
      </div>
    </div>
  );
};