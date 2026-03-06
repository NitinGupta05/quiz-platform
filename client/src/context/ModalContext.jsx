import { createContext, useState, useContext } from "react";

export const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [afterLogin, setAfterLogin] = useState(null);

  const openLogin = (afterAction = null) => {
    setAfterLogin(afterAction);
    setShowLogin(true);
    setShowRegister(false);
  };

  const closeLogin = () => {
    setShowLogin(false);
    setAfterLogin(null);
  };

  const openRegister = () => {
    setShowRegister(true);
    setShowLogin(false);
  };

  const closeRegister = () => {
    setShowRegister(false);
  };

  const switchToLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  const switchToRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  return (
    <ModalContext.Provider
      value={{
        showLogin,
        showRegister,
        afterLogin,
        openLogin,
        closeLogin,
        openRegister,
        closeRegister,
        switchToLogin,
        switchToRegister,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

