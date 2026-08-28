'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext({
  width: 256,
  isCollapsed: false,
  isDragging: false,
  toggleCollapse: () => {},
  setWidth: () => {},
  setIsDragging: () => {},
});

export function SidebarProvider({ children }) {
  const [width, setWidthState] = useState(256);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    try {
      const savedWidth = localStorage.getItem('paysynapse_sidebar_width');
      const savedCollapsed = localStorage.getItem('paysynapse_sidebar_collapsed');
      if (savedWidth) {
        const parsed = parseInt(savedWidth, 10);
        if (parsed >= 68 && parsed <= 400) {
          setWidthState(parsed);
          if (parsed <= 80) setIsCollapsed(true);
        }
      }
      if (savedCollapsed === 'true') {
        setIsCollapsed(true);
      }
    } catch (e) {}
  }, []);

  const setWidth = (newWidth) => {
    const clamped = Math.max(68, Math.min(380, newWidth));
    setWidthState(clamped);
    if (clamped <= 90) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
    try {
      localStorage.setItem('paysynapse_sidebar_width', clamped.toString());
      localStorage.setItem('paysynapse_sidebar_collapsed', (clamped <= 90).toString());
    } catch (e) {}
  };

  const toggleCollapse = () => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setWidth(256);
    } else {
      setIsCollapsed(true);
      setWidth(68);
    }
  };

  return (
    <SidebarContext.Provider
      value={{
        width: isCollapsed ? 68 : width,
        isCollapsed,
        isDragging,
        toggleCollapse,
        setWidth,
        setIsDragging,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
