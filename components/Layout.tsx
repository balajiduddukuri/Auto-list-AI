import React from 'react';
import { LayoutDashboard, Settings, Layers, Menu, Hexagon } from 'lucide-react';
import { AppView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const NavItem = ({ view, icon: Icon, label }: { view: AppView; icon: any; label: string }) => (
    <button
      onClick={() => {
        onNavigate(view);
        setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        currentView === view
          ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center gap-2 border-b border-slate-50">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold">
              <Hexagon size={20} />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              AutoList AI
            </span>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-4 mt-2">Platform</div>
            <NavItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="Trend Discovery" />
            <NavItem view={AppView.STUDIO} icon={Layers} label="Product Studio" />
          </nav>

          <div className="p-4 border-t border-slate-50">
            <button 
                onClick={() => onNavigate(AppView.SETTINGS)}
                className={`flex items-center gap-3 px-4 py-3 w-full transition-colors rounded-lg ${currentView === AppView.SETTINGS ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Settings size={20} />
              <span className="font-medium">Settings</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full w-full relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:hidden">
            <div className="flex items-center gap-2 font-bold text-slate-700">
             <Hexagon size={20} className="text-slate-900"/> AutoList AI
            </div>
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600">
              <Menu />
            </button>
        </header>
        <div className="flex-1 overflow-auto p-4 lg:p-6 bg-slate-50/50">
          <div className="max-w-[1600px] mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;