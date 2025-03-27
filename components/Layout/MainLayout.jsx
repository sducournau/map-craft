import React, { useState, useEffect } from 'react';
import { useThemeStore } from '@/hooks/useThemeState';

const MainLayout = ({ children, sidebarContent }) => {
  const { theme } = useThemeStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth < 992) {
        setSidebarOpen(false);
      }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <div className={`app-container ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="navbar-fixed">
        <nav className={theme === 'dark' ? 'blue-grey darken-3' : 'blue'}>
          <div className="nav-wrapper">
            <a href="#!" className="brand-logo center hide-on-med-and-up">MapCraft</a>
            <ul className="left">
              <li>
                <a 
                  href="#!" 
                  onClick={(e) => {
                    e.preventDefault();
                    setSidebarOpen(!sidebarOpen);
                  }}
                >
                  <i className="material-icons">{sidebarOpen ? 'menu_open' : 'menu'}</i>
                </a>
              </li>
              <li className="hide-on-small-only">
                <a href="#!" className="brand-logo">MapCraft</a>
              </li>
            </ul>
            <ul className="right">
              <li>
                <a href="#!" className="dropdown-trigger" data-target="export-dropdown">
                  <i className="material-icons">file_download</i>
                </a>
              </li>
              <li>
                <a href="#!" className="dropdown-trigger" data-target="settings-dropdown">
                  <i className="material-icons">settings</i>
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Dropdowns */}
      <ul id="export-dropdown" className="dropdown-content">
        <li><a href="#!"><i className="material-icons">image</i>Image</a></li>
        <li><a href="#!"><i className="material-icons">map</i>GeoJSON</a></li>
        <li className="divider"></li>
        <li><a href="#!"><i className="material-icons">share</i>Partager</a></li>
      </ul>

      <ul id="settings-dropdown" className="dropdown-content">
        <li><a href="#!"><i className="material-icons">brightness_4</i>Thème</a></li>
        <li><a href="#!"><i className="material-icons">language</i>Langue</a></li>
        <li className="divider"></li>
        <li><a href="#!"><i className="material-icons">help</i>Aide</a></li>
      </ul>

      <div className="main-content-container">
        <div 
          className={`sidebar-container ${sidebarOpen ? 'open' : 'closed'}`}
          style={{
            width: sidebarOpen ? '300px' : '0',
            transition: 'width 0.3s ease',
            overflow: 'hidden'
          }}
        >
          {sidebarOpen && sidebarContent}
        </div>

        <div 
          className="content-container"
          style={{
            marginLeft: sidebarOpen && !isMobile ? '300px' : '0',
            transition: 'margin-left 0.3s ease',
            width: '100%',
            height: 'calc(100vh - 64px)',
            position: 'relative'
          }}
        >
          {children}
        </div>
      </div>

      <style jsx>{`
        .app-container {
          width: 100%;
          height: 100vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        .app-container.dark {
          background-color: #263238;
          color: #eceff1;
        }
        
        .main-content-container {
          display: flex;
          height: calc(100vh - 64px);
          position: relative;
        }
        
        .sidebar-container {
          height: 100%;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
          z-index: 900;
          position: fixed;
          top: 64px;
          left: 0;
          background-color: white;
        }
        
        .app-container.dark .sidebar-container {
          background-color: #37474f;
        }
        
        @media only screen and (max-width: 992px) {
          .main-content-container {
            height: calc(100vh - 56px);
          }
          
          .sidebar-container {
            top: 56px;
          }
        }
      `}</style>
    </div>
  );
};

export default MainLayout;