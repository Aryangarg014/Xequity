export const hasPremiumAccess = (email) => {
  if (!email) return false;
  return localStorage.getItem(`xequity_premium_access:${email}`) === "true";
};


export const grantPremiumAccess = (email) => {
  if (!email) return;
  localStorage.setItem(`xequity_premium_access:${email}`, "true");
};




