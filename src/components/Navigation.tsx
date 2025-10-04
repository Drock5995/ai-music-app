import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export default function Navigation() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const drawerRef = useRef<HTMLElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  // Close drawer when route changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [location]);

  // Focus trapping and escape key handling
  useEffect(() => {
    if (!drawerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = drawerRef.current?.querySelectorAll(
          'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Set initial focus
    const firstFocusable = drawerRef.current?.querySelector('a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])') as HTMLElement;
    firstFocusable?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      toggleButtonRef.current?.focus();
    };
  }, [drawerOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const navigationItems = [
    {
      to: '/',
      label: 'Home',
      icon: (
        <svg className="nav-drawer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
        </svg>
      )
    },
    {
      to: '/library',
      label: 'Library',
      icon: (
        <svg className="nav-drawer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      to: '/genres',
      label: 'Genres',
      icon: (
        <svg className="nav-drawer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    },
    {
      to: '/search',
      label: 'Search',
      icon: (
        <svg className="nav-drawer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      )
    },
    {
      to: '/queue',
      label: 'Queue',
      icon: (
        <svg className="nav-drawer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 19V6l12-3v13" />
          <path d="m9 12 12-3" />
          <circle cx="6" cy="19" r="3" />
          <path d="M9 16V6l12-3v7" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Navigation Toggle Button */}
      <button
        ref={toggleButtonRef}
        className="nav-toggle"
        onClick={toggleDrawer}
        aria-expanded={drawerOpen ? 'true' : 'false'}
        aria-controls="nav-drawer"
        aria-label="Toggle navigation menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          {drawerOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Drawer Backdrop */}
      <div
        className={`nav-drawer-backdrop ${drawerOpen ? 'open' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Navigation Drawer */}
      <nav
        id="nav-drawer"
        ref={drawerRef}
        className={`nav-drawer ${drawerOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="nav-drawer-header">
          <h2 className="nav-drawer-title">Music App</h2>
        </div>

        <div className="nav-drawer-links">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-drawer-link ${isActive ? 'active' : ''}`
              }
              onClick={() => setDrawerOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
