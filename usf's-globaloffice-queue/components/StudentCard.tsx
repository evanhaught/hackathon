import React, { useEffect, useState } from 'react';
import { Student } from '../types';
import { Clock, Tag, UserCircle, Trash2, AlertCircle } from 'lucide-react';

interface StudentCardProps {
  student: Student;
  onHelp: (id: string) => void;
  onRemove: (id: string) => void;
  isAdvisorLoggedIn: boolean;
  borderColor: string; // e.g. "border-blue-500"
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, onHelp, onRemove, isAdvisorLoggedIn, borderColor }) => {
  const [waited, setWaited] = useState<string>('0m');

  useEffect(() => {
    const updateWaitTime = () => {
      const diff = new Date().getTime() - new Date(student.checkInTime).getTime();
      const minutes = Math.floor(diff / 60000);
      setWaited(`${minutes}m`);
    };

    updateWaitTime();
    const interval = setInterval(updateWaitTime, 60000);
    return () => clearInterval(interval);
  }, [student.checkInTime]);

  // Safely construct the left border class
  const leftBorderClass = borderColor.replace('border-', 'border-l-');

  return (
    <div className={`bg-white p-4 rounded-r-lg rounded-l-sm shadow-sm border border-gray-200 border-l-[6px] ${leftBorderClass} hover:shadow-md transition-shadow duration-200 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 relative group`}>
      
      {/* Header: Name & Wait Time */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-900">{student.name}</h3>
          <p className="text-xs text-gray-500 font-mono">ID: {student.universityId}</p>
        </div>
        <div className={`flex items-center px-2 py-1 rounded-full text-xs font-bold ${parseInt(waited) > 15 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
          <Clock className="w-3 h-3 mr-1" />
          {waited}
        </div>
      </div>

      {/* Issue Summary & Tags */}
      <div className="space-y-2">
        <div className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
           {student.problem}
        </div>
        
        {/* Tags Section (Only user selected category) */}
        {student.tags && student.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
             {student.tags.map((tag, idx) => (
               <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 flex items-center">
                 <Tag className="w-2 h-2 mr-1 opacity-50"/> {tag}
               </span>
             ))}
          </div>
        )}
      </div>

      {/* Actions & Status */}
      <div className="pt-3 border-t border-gray-100 mt-auto flex items-center justify-between gap-2">
        
        {/* Help Button */}
        <button
          onClick={() => onHelp(student.id)}
          disabled={!isAdvisorLoggedIn}
          className={`flex-1 flex items-center justify-center text-sm py-1.5 px-3 rounded-md transition-colors font-bold ${
            isAdvisorLoggedIn 
              ? 'bg-[#006747] hover:bg-[#005036] text-white shadow-sm' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          title={!isAdvisorLoggedIn ? "Advisor login required" : "Help this student"}
        >
          {isAdvisorLoggedIn ? (
            <>Help Student</>
          ) : (
            <span className="flex items-center">
              <UserCircle className="w-4 h-4 mr-1.5" />
              Waiting
            </span>
          )}
        </button>

        {/* Leave/Discharge Button */}
        <button
           onClick={(e) => {
             e.stopPropagation();
             onRemove(student.id);
           }}
           className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
           title={isAdvisorLoggedIn ? "Discharge Student (Wrong Dept)" : "Leave Queue"}
        >
           {isAdvisorLoggedIn ? <AlertCircle className="w-5 h-5" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};