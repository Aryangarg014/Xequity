export const getImageUrl = (path) => {
    return new URL(`/assets/${path}`, import.meta.url).href;
  };

  

// Authentication utilities
export const saveAuthData = (userData) => {
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('userData', JSON.stringify(userData));
  localStorage.setItem('authTimestamp', Date.now().toString());
};


export const clearAuthData = () => {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userData');
  localStorage.removeItem('authTimestamp');
};


export const getAuthData = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userDataStr = localStorage.getItem('userData');
  const authTimestamp = localStorage.getItem('authTimestamp');
  const userData = userDataStr ? JSON.parse(userDataStr) : null;
 
  // Check if authentication is still valid (24 hours)
  const isValid = authTimestamp && (Date.now() - parseInt(authTimestamp)) < 24 * 60 * 60 * 1000;
 
  if (!isValid && isLoggedIn) {
    // Clear expired authentication
    clearAuthData();
    return { isLoggedIn: false, userData: null };
  }
 
  return { isLoggedIn: isValid && isLoggedIn, userData };
};

