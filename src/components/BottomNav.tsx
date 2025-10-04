
import { NavLink } from 'react-router-dom';

export default function BottomNav() {
  const navigationItems = [
    {
      to: '/',
      label: 'Home',
      icon: (
        <svg className="bottom-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
        </svg>
      )
    },
    {
      to: '/search',
      label: 'Search',
      icon: (
        <svg className="bottom-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      )
    },
    {
      to: '/library',
      label: 'Library',
      icon: (
        <svg className="bottom-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      to: '/queue',
      label: 'Queue',
      icon: (
        <svg className="bottom-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 19V6l12-3v13" />
          <path d="m9 12 12-3" />
          <circle cx="6" cy="19" r="3" />
          <path d="M9 16V6l12-3v7" />
        </svg>
      )
    }
  ];

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Bottom navigation">
      {navigationItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `bottom-nav-link ${isActive ? 'active' : ''}`
          }
          aria-label={item.label}
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
