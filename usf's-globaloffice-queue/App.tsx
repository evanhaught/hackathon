import React, { useState } from 'react';
import { Header } from './components/Header';
import { Column } from './components/Column';
import { HelpedList } from './components/HelpedList';
import { NotificationToast } from './components/NotificationToast';
import { Student, Department, Advisor } from './types';
import { generateMockStudent } from './services/geminiService';
import { CheckCircle2, X, LogIn, GraduationCap, AlertTriangle, Lock } from 'lucide-react';

// Department Categories Configuration
const DEPARTMENT_CATEGORIES: Record<Department, string[]> = {
  [Department.INTL_ADMISSIONS]: [
    "Drop off Transcripts",
    "Resolve Registration Holds", 
    "Check Application Status",
    "Submit Missing Documents",
    "Other"
  ],
  [Department.EDUCATION_ABROAD]: [
    "Program Inquiry",
    "Application Help",
    "Scholarship & Funding",
    "Course Equivalency",
    "Other"
  ],
  [Department.INTL_STUDENT_SUPPORT]: [
    "I-20 Travel Signature",
    "OPT/CPT Inquiry",
    "Visa Status Update",
    "Social Security Letter",
    "Other"
  ],
  [Department.GLOBAL_LEARNING]: [
    "Global Citizens Award",
    "Peace Corps Info",
    "GCP Portfolio Review",
    "Other"
  ]
};

const App: React.FC = () => {
  // --- State ---
  const [advisor, setAdvisor] = useState<Advisor | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [helpedStudents, setHelpedStudents] = useState<Student[]>([]);
  const [viewMode, setViewMode] = useState<'queue' | 'history'>('queue');
  
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; studentId: string | null; message: string }>({
    isOpen: false,
    studentId: null,
    message: ''
  });
  
  // Notification
  const [notification, setNotification] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  // Manual Entry State
  const [manualName, setManualName] = useState('');
  const [manualId, setManualId] = useState('');
  const [manualDept, setManualDept] = useState<Department>(Department.INTL_ADMISSIONS);
  const [manualCategory, setManualCategory] = useState('');
  const [manualDescription, setManualDescription] = useState('');

  // Login State
  const [loginName, setLoginName] = useState('');
  const [loginDept, setLoginDept] = useState<Department>(Department.EDUCATION_ABROAD);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- Actions ---

  const showNotification = (message: string) => {
    setNotification({ message, visible: true });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Password Validation: Generic password for all departments
    const expectedPassword = 'departmentname';
    
    if (loginPassword !== expectedPassword) {
      setLoginError('Incorrect password.');
      return;
    }

    if (loginName.trim()) {
      setAdvisor({
        name: loginName,
        department: loginDept
      });
      setShowLoginModal(false);
      setLoginPassword('');
      setLoginName('');
    }
  };

  const handleLogout = () => {
    setAdvisor(null);
    setViewMode('queue');
    setLoginName('');
  };

  const addStudent = async (studentData: Partial<Student>) => {
    const newStudent: Student = {
      id: Math.random().toString(36).substring(2, 11),
      checkInTime: new Date(),
      status: 'waiting',
      name: studentData.name || 'Unknown',
      universityId: studentData.universityId || '000-00-000',
      department: studentData.department || Department.INTL_ADMISSIONS,
      problem: studentData.problem || 'General Inquiry',
      tags: studentData.tags || [] 
    };

    setStudents(prev => [...prev, newStudent]);
  };

  const handleSimulate = async () => {
    setIsSimulating(true);
    const mockData = await generateMockStudent();
    if (mockData) {
      await addStudent(mockData);
    }
    setIsSimulating(false);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Construct problem string from Category + Description
    const fullProblem = manualCategory === 'Other' 
      ? manualDescription 
      : manualDescription 
        ? `${manualCategory}: ${manualDescription}` 
        : manualCategory;

    await addStudent({
      name: manualName,
      universityId: manualId,
      department: manualDept,
      problem: fullProblem,
      tags: [manualCategory] // Use selected category as the primary tag
    });

    setShowAddModal(false);
    
    // Reset form
    setManualName('');
    setManualId('');
    setManualDescription('');
    setManualCategory('');
  };

  const handleHelpStudent = (id: string) => {
    if (!advisor) {
      setShowLoginModal(true);
      return;
    }

    const studentToHelp = students.find(s => s.id === id);
    if (!studentToHelp) return;

    showNotification(`${advisor.name} from ${advisor.department} is going to help ${studentToHelp.name} in a minute`);

    const updatedStudent: Student = {
      ...studentToHelp,
      status: 'completed',
      helpedBy: advisor.name,
      helpedAt: new Date()
    };

    setStudents(prev => prev.filter(s => s.id !== id));
    setHelpedStudents(prev => [updatedStudent, ...prev]);
  };

  const handleRemoveStudent = (id: string) => {
    const student = students.find(s => s.id === id);
    if (!student) return;

    const message = advisor 
      ? `Are you sure you want to discharge ${student.name} from the queue?`
      : `Are you sure you want to leave the queue, ${student.name}?`;

    // Open custom confirmation modal instead of window.confirm
    setConfirmModal({
      isOpen: true,
      studentId: id,
      message
    });
  };

  const executeRemoval = () => {
    if (confirmModal.studentId) {
      const id = confirmModal.studentId;
      const student = students.find(s => s.id === id);
      
      if (student) {
        setStudents(prev => prev.filter(s => s.id !== id));
        showNotification(`${student.name} has left the queue.`);
      }
    }
    setConfirmModal({ isOpen: false, studentId: null, message: '' });
  };

  const handleRetractStudent = (id: string) => {
    if (!advisor) return;

    const studentToRetract = helpedStudents.find(s => s.id === id);
    if (!studentToRetract) return;

    const restoredStudent: Student = {
      ...studentToRetract,
      status: 'waiting',
      helpedBy: undefined,
      helpedAt: undefined
    };

    setHelpedStudents(prev => prev.filter(s => s.id !== id));
    setStudents(prev => [...prev, restoredStudent]);
    
    showNotification(`${studentToRetract.name} was returned to the Queue.`);
  };

  // Department Styles Configuration
  const deptStyles: Record<Department, { headerBg: string; headerText: string; borderColor: string }> = {
    [Department.EDUCATION_ABROAD]: {
      headerBg: 'bg-blue-600',
      headerText: 'text-white',
      borderColor: 'border-blue-600'
    },
    [Department.INTL_ADMISSIONS]: {
      headerBg: 'bg-emerald-600',
      headerText: 'text-white',
      borderColor: 'border-emerald-600'
    },
    [Department.GLOBAL_LEARNING]: {
      headerBg: 'bg-orange-500',
      headerText: 'text-white',
      borderColor: 'border-orange-500'
    },
    [Department.INTL_STUDENT_SUPPORT]: {
      headerBg: 'bg-purple-600',
      headerText: 'text-white',
      borderColor: 'border-purple-600'
    },
  };

  // Helper to get categories for current manual selection
  const currentCategories = DEPARTMENT_CATEGORIES[manualDept] || [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans relative">
      
      <NotificationToast 
        message={notification.message} 
        isVisible={notification.visible} 
        onClose={() => setNotification(prev => ({ ...prev, visible: false }))}
      />

      <Header 
        onStudentCheckIn={() => {
          // Reset category when opening modal based on default dept
          setManualCategory(DEPARTMENT_CATEGORIES[Department.INTL_ADMISSIONS][0]);
          setShowAddModal(true);
        }} 
        onAdvisorLogin={() => setShowLoginModal(true)}
        onSimulate={handleSimulate}
        isSimulating={isSimulating}
        viewMode={viewMode}
        setViewMode={setViewMode}
        advisor={advisor}
        onLogout={handleLogout}
      />

      <main className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col">
        {viewMode === 'queue' ? (
           /* Dashboard Grid */
          <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-x-auto pb-4">
            {Object.values(Department).map(dept => (
              <Column
                key={dept}
                department={dept}
                students={students.filter(s => s.department === dept)}
                onHelp={handleHelpStudent}
                onRemove={handleRemoveStudent}
                styles={deptStyles[dept]}
                isAdvisorLoggedIn={!!advisor}
              />
            ))}
          </div>
        ) : (
          /* Helped History View */
          <HelpedList 
            students={helpedStudents} 
            onRetract={handleRetractStudent}
            isAdvisorLoggedIn={!!advisor}
          />
        )}
      </main>

      {/* Manual Check-in Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[#CFC493] flex-shrink-0">
              <h3 className="text-lg font-bold text-[#006747]">Student Check-in</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#006747] hover:bg-white/20 rounded-full p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleManualSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input
                  required
                  type="text"
                  value={manualName}
                  onChange={e => setManualName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006747] focus:border-[#006747] outline-none transition-all"
                  placeholder="e.g. Jane Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">University ID <span className="text-red-500">*</span></label>
                <input
                  required
                  type="text"
                  value={manualId}
                  onChange={e => setManualId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006747] focus:border-[#006747] outline-none transition-all"
                  placeholder="e.g. U12345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department <span className="text-red-500">*</span></label>
                <select
                  value={manualDept}
                  onChange={e => {
                    const newDept = e.target.value as Department;
                    setManualDept(newDept);
                    setManualCategory(DEPARTMENT_CATEGORIES[newDept][0]);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006747] focus:border-[#006747] outline-none transition-all bg-white"
                >
                  {Object.values(Department).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category of Inquiry <span className="text-red-500">*</span></label>
                <select
                  value={manualCategory}
                  onChange={e => setManualCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006747] focus:border-[#006747] outline-none transition-all bg-white"
                >
                  {currentCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details <span className="text-gray-400 font-normal">(Optional)</span></label>
                <textarea
                  value={manualDescription}
                  onChange={e => setManualDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006747] focus:border-[#006747] outline-none transition-all"
                  placeholder="Any specific details..."
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#006747] hover:bg-[#005036] text-white font-semibold py-2.5 rounded-lg transition-all flex justify-center items-center shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm Check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Advisor Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border-t-8 border-[#006747]">
            <div className="p-6 relative">
               <button 
                  onClick={() => setShowLoginModal(false)} 
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
               <div className="text-center mb-6">
                 <div className="inline-flex items-center justify-center bg-[#006747] text-white p-3 rounded-full mb-3">
                    <LogIn className="w-6 h-6" />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900">Advisor Log-in</h2>
                 <p className="text-gray-500 text-sm">For Global Student Center Staff Only</p>
               </div>

               <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Your Name / Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <LogIn className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006747] focus:border-[#006747] outline-none transition-all"
                      placeholder="e.g. Dr. Rocky"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Your Department</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <select
                      value={loginDept}
                      onChange={(e) => setLoginDept(e.target.value as Department)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006747] focus:border-[#006747] outline-none transition-all bg-white appearance-none"
                    >
                      {Object.values(Department).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Department Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006747] focus:border-[#006747] outline-none transition-all"
                      placeholder="Example: departmentname"
                    />
                  </div>
                  {loginError && (
                    <p className="text-red-600 text-xs mt-1 font-semibold animate-pulse">{loginError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#CFC493] hover:bg-[#b8ae80] text-[#006747] text-lg font-bold py-3 rounded-lg transition-colors shadow-md flex items-center justify-center"
                >
                  Access Dashboard
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Trash/Discharge */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95">
              <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-100 p-2 rounded-full text-red-600">
                     <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Confirm Action</h3>
              </div>
              
              <p className="text-gray-600 mb-6 font-medium leading-relaxed">{confirmModal.message}</p>
              
              <div className="flex gap-3 justify-end">
                 <button 
                   onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                   className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={executeRemoval}
                   className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-sm transition-colors flex items-center"
                 >
                   {advisor ? "Discharge" : "Leave Queue"}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;