// Layout — main app shell wrapping all authenticated pages
// Mobile: TopHeader + page content + BottomNavigation
// Desktop: Sidebar + main content area

import TopHeader from './TopHeader';
import Sidebar from './Sidebar';
import BottomNavigation from './BottomNavigation';

export default function Layout({ children, title, showBack = false, rightElement }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main content column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header — visible on both mobile and desktop */}
        <TopHeader title={title} showBack={showBack} rightElement={rightElement} />

        {/* Page body */}
        <main className="flex-1 page-content">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNavigation />
    </div>
  );
}
