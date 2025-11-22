import React from 'react';
import { Student } from '../types';
import { CheckCircle, Clock, Undo2 } from 'lucide-react';

interface HelpedListProps {
  students: Student[];
  onRetract: (id: string) => void;
  isAdvisorLoggedIn: boolean;
}

export const HelpedList: React.FC<HelpedListProps> = ({ students, onRetract, isAdvisorLoggedIn }) => {
  // Sort by most recently helped
  const sortedStudents = [...students].sort((a, b) => 
    (b.helpedAt?.getTime() || 0) - (a.helpedAt?.getTime() || 0)
  );

  if (sortedStudents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-400">
        <CheckCircle className="w-16 h-16 mb-4 opacity-20" />
        <h3 className="text-xl font-semibold">No students have been helped yet.</h3>
        <p>Start clearing the queue to see history here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-300">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Issue & Category</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Helped By</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Time Completed</th>
              {isAdvisorLoggedIn && (
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                   <span className="px-2 py-1 inline-flex text-xs leading-5 font-bold rounded bg-green-100 text-green-800 uppercase tracking-wide">
                    Helped
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{student.name}</span>
                    <span className="text-xs text-gray-500 font-mono">{student.universityId}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-700">
                    {student.department}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate" title={student.problem}>
                    {student.problem}
                  </div>
                  <div className="flex gap-1 mt-1">
                    {student.tags?.map(tag => (
                        <span key={tag} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 rounded border border-blue-200 font-medium">
                            {tag}
                        </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-6 w-6 bg-[#006747] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                        {student.helpedBy?.charAt(0) || 'A'}
                    </div>
                    <div className="ml-2">
                      <div className="text-sm font-medium text-gray-900">{student.helpedBy}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                    {student.helpedAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                {isAdvisorLoggedIn && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => onRetract(student.id)}
                      className="text-amber-600 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-md transition-colors inline-flex items-center text-xs font-bold border border-amber-200"
                      title="Mistake? Send back to waiting queue"
                    >
                      <Undo2 className="w-3 h-3 mr-1" />
                      Retract to Queue
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};