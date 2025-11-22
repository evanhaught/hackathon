import React, { useEffect, useState } from 'react';
import { Student } from '../types';
import { Clock, Tag, UserCircle } from 'lucide-react';

interface StudentCardProps {
  student: Student;
  onHelp: (id: string) => void;
  isAdvisorLoggedIn: boolean;
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, onHelp, isAdvisorLoggedIn }) => {
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

  const priorityColor = 
    student.priority === 'High' ? 'bg-red-100 text-red-800 border-red-200' :
    student.priority === 'Low' ? 'bg-green-100 text-green-800 border-green-200' :
    'bg-yellow-100 text-yellow-800 border-yellow-200';

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 relative group">
      
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
        
        {/* AI Insights Section */}
        {(student.aiSummary || student.tags) && (
          <div className="flex flex-wrap gap-2 mt-2">
             {student.priority && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider ${priorityColor}`}>
                  {student.priority}
                </span>
             )}
             {student.tags?.map(tag => (
               <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 flex items-center">
                 <Tag className="w-2 h-2 mr-1 opacity-50"/> {tag}
               </span>
             ))}
          </div>
        )}
      </div>

      {/* Actions & Status */}
      <div className="pt-3 border-t border-gray-100 mt-auto flex items-center justify-between gap-2">
        
        {/* Status Indicator */}
        <div className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider border ${
          student.status === 'waiting' 
            ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
            : 'bg-green-50 text-green-700 border-green-200'
        }`}>
          {student.status === 'waiting' ? 'Waiting' : 'Helped'}
        </div>

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
              Staff Only
            </span>
          )}
        </button>
      </div>
    </div>
  );
};