import React from 'react';
import { LayoutDashboard, UserPlus, Sparkles, History, LogOut, ShieldCheck } from 'lucide-react';
import { Advisor } from '../types';

interface HeaderProps {
  onStudentCheckIn: () => void;
  onAdvisorLogin: () => void;
  onSimulate: () => void;
  isSimulating: boolean;
  viewMode: 'queue' | 'history';
  setViewMode: (mode: 'queue' | 'history') => void;
  advisor: Advisor | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onStudentCheckIn, 
  onAdvisorLogin,
  onSimulate, 
  isSimulating, 
  viewMode, 
  setViewMode,
  advisor,
  onLogout
}) => {
  return (
    <header className="bg-[#006747] shadow-lg sticky top-0 z-50 border-b-4 border-[#CFC493]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap gap-4 justify-between items-center">
        
        {/* Logo & Title */}
        <div className="flex items-center space-x-4">
          <div className="bg-white p-1.5 rounded-lg shadow-sm hidden sm:block">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/thumb/3/30/University_of_South_Florida_Bull_logo.svg/286px-University_of_South_Florida_Bull_logo.svg.png" 
              alt="USF Bull" 
              className="h-10 w-auto"
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white leading-none font-serif tracking-wide">Global Student Center</h1>
            <p className="text-[10px] sm:text-xs text-[#CFC493] mt-1 font-medium uppercase tracking-wider">University of South Florida</p>
          </div>
        </div>

        {/* Center Controls - View Switcher (Only visible if Advisor logged in) */}
        {advisor && (
          <div className="hidden lg:flex bg-[#005036] p-1 rounded-lg border border-[#00402b]">
            <button
              onClick={() => setViewMode('queue')}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'queue' 
                  ? 'bg-white text-[#006747] shadow-sm' 
                  : 'text-[#CFC493] hover:bg-[#006042]'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Live Queue</span>
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'history' 
                  ? 'bg-white text-[#006747] shadow-sm' 
                  : 'text-[#CFC493] hover:bg-[#006042]'
              }`}
            >
              <History className="h-4 w-4" />
              <span>Helped History</span>
            </button>
          </div>
        )}

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {advisor ? (
            <>
               <div className="text-right hidden md:block mr-2">
                <p className="text-sm text-white font-semibold">Hi, {advisor.name}</p>
                <p className="text-[10px] text-[#CFC493] uppercase tracking-wider">{advisor.department}</p>
              </div>
              
              {viewMode === 'queue' && (
                <button
                  onClick={onSimulate}
                  disabled={isSimulating}
                  className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border
                    ${isSimulating 
                      ? 'bg-[#005036] text-gray-300 border-[#005036] cursor-not-allowed' 
                      : 'bg-transparent text-[#CFC493] hover:bg-[#005036] border-[#CFC493]'}`}
                >
                  <Sparkles className={`h-3 w-3 ${isSimulating ? 'animate-spin' : ''}`} />
                  <span>{isSimulating ? 'Simulating...' : 'Demo Sim'}</span>
                </button>
              )}

              <button 
                onClick={onLogout}
                className="bg-[#005036] hover:bg-[#00402b] text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                 <LogOut className="h-4 w-4" />
                 <span className="hidden sm:inline">Log Out</span>
              </button>
            </>
          ) : (
            <>
               <button
                onClick={onAdvisorLogin}
                className="text-[#CFC493] hover:text-white px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2"
              >
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Advisor Log-in</span>
                <span className="sm:hidden">Staff</span>
              </button>

              <button
                onClick={onStudentCheckIn}
                className="bg-[#CFC493] text-[#006747] hover:bg-[#e0d5a3] px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Student Check-in</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};