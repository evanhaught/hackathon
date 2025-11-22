import React, { useState } from 'react';
import { Header } from './components/Header';
import { Column } from './components/Column';
import { HelpedList } from './components/HelpedList';
import { NotificationToast } from './components/NotificationToast';
import { Student, Department, Advisor } from './types';
import { generateMockStudent, analyzeTicket } from './services/geminiService';
import { CheckCircle2, X, LogIn, GraduationCap } from 'lucide-react';

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
  
  // Notification
  const [notification, setNotification] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  // Manual Entry State
  const [manualName, setManualName] = useState('');
  const [manualId, setManualId] = useState('');
  const [manualDept, setManualDept] = useState<Department>(Department.INTL_ADMISSIONS);
  const [manualProblem, setManualProblem] = useState('');
  const [isAnalyzingManual, setIsAnalyzingManual] = useState(false);

  // Login State
  const [loginName, setLoginName] = useState('');
  const [loginDept, setLoginDept] = useState<Department>(Department.EDUCATION_ABROAD);

  // --- Actions ---

  const showNotification = (message: string) => {
    setNotification({ message, visible: true });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginName.trim()) {
      setAdvisor({
        name: loginName,
        department: loginDept
      });
      setShowLoginModal(false);
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
    };

    setStudents(prev => [...prev, newStudent]);

    if (newStudent.problem) {
      const analysis = await analyzeTicket(newStudent.problem);
      if (analysis) {
        setStudents(prev => prev.map(s => 
          s.id === newStudent.id 
            ? { ...s, tags: analysis.tags, priority: analysis.priority, aiSummary: analysis.summary }
            : s
        ));
      }
    }
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
    setIsAnalyzingManual(true);
    await addStudent({
      name: manualName,
      universityId: manualId,
      department: manualDept,
      problem: manualProblem
    });
    setIsAnalyzingManual(false);
    setShowAddModal(false);
    setManualName('');
    setManualId('');
    setManualProblem('');
  };

  const handleHelpStudent = (id: string) => {
    if (!advisor) {
      setShowLoginModal(true);
      return;
    }

    const studentToHelp = students.find(s => s.id === id);
    if (!studentToHelp) return;

    // 1. Show Notification Pop-up
    showNotification(`${advisor.name} from ${advisor.department} is going to help ${studentToHelp.name} in a minute`);

    // 2. Update status locally first (for visual feedback if we kept them on board, but we move them)
    
    const updatedStudent: Student = {
      ...studentToHelp,
      status: 'completed',
      helpedBy: advisor.name,
      helpedAt: new Date()
    };

    // 3. Move from queue to history
    setStudents(prev => prev.filter(s => s.id !== id));
    setHelpedStudents(prev => [updatedStudent, ...prev]);
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

  // USF Department Color Mappings (Accents)
  const deptColors: Record<Department, string> = {
    [Department.EDUCATION_ABROAD]: 'border-blue-500',
    [Department.INTL_ADMISSIONS]: 'border-emerald-500',
    [Department.GLOBAL_LEARNING]: 'border-orange-500',
    [Department.INTL_STUDENT_SUPPORT]: 'border-purple-500',
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans relative">
      
      <NotificationToast 
        message={notification.message} 
        isVisible={notification.visible} 
        onClose={() => setNotification(prev => ({ ...prev, visible: false }))}
      />

      <Header 
        onStudentCheckIn={() => setShowAddModal(true)} 
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
                color={deptColors[dept]}
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[#CFC493]">
              <h3 className="text-lg font-bold text-[#006747]">Student Check-in</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#006747] hover:bg-white/20 rounded-full p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">University ID</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={manualDept}
                  onChange={e => setManualDept(e.target.value as Department)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006747] focus:border-[#006747] outline-none transition-all bg-white"
                >
                  {Object.values(Department).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
                <textarea
                  required
                  value={manualProblem}
                  onChange={e => setManualProblem(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006747] focus:border-[#006747] outline-none transition-all"
                  placeholder="Briefly describe the issue (e.g. Dropping off transcripts)..."
                />
                <p className="text-xs text-gray-500 mt-1">AI will analyze this to set priority and category tags.</p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isAnalyzingManual}
                  className="w-full bg-[#006747] hover:bg-[#005036] text-white font-semibold py-2.5 rounded-lg transition-all flex justify-center items-center shadow-md"
                >
                  {isAnalyzingManual ? (
                     <>Checking in...</>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Confirm Check-in
                    </>
                  )}
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
    </div>
  );
};

export default App;