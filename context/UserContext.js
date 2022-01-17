import { createContext, useContext, useReducer } from 'react';
import { Router } from 'next/router';
import {
  GetSessionItem,
  SetSessionItem,
  RemoveSessionItem,
} from '@hooks/useSessionStorage';

import apiClient from './apiClient';

// Creating context objects
let UserContext = createContext();
let UserDispatchContext = createContext();

// userReducer dispatches login actions and updates state appropriately
const userReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { ...state, isAuthenticated: true };
    case 'SIGN_OUT_SUCCESS':
      return { ...state, isAuthenticated: false };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
      return { ...state, isAuthenticated: false };
  }
};

// UserProvider shall be used to wrap root element to pass context state
export const UserProvider = ({ children }) => {
  let [state, dispatch] = useReducer(userReducer, {
    isAuthenticated: !!getLoginToken(),
  });

  return (
    <UserContext.Provider value={state}>
      <UserDispatchContext.Provider value={dispatch}>
        {children}
      </UserDispatchContext.Provider>
    </UserContext.Provider>
  );
};

/* export const userContextProvider = ({ children }) => {
  return <UserContext.Provider>{children}</UserContext.Provider>;
}; */

export const useUserContext = () => {
  let context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserState must be used within a UserContext Provider');
  }

  return context;
};

export const useUserDispatchContext = () => {
  let context = useContext(UserDispatchContext);
  if (context === undefined) {
    throw new Error(
      'useUserDispatchContext must to used within a UserDispatchContext Provider'
    );
  }

  return context;
};

/* Authentication Utility functions */
const getLoginToken = () => {
  let stringValue = GetSessionItem('id_token');
  if (stringValue !== null) {
    let value = JSON.parse(stringValue);
    let expirationDate = newDate(value.expirationDate);
    if (expirationDate > new Date()) {
      return value.value;
    } else {
      RemoveSessionItem('id_token');
    }
  }
  return null;
};

export const loginUser = (
  dispatch,
  username,
  password,
  history,
  setIsLoading,
  setError,
  setErrorMessage
) => {
  setError(false);
  setIsLoading(true);

  let data = {
    username: username,
    password: password,
  };

  if (!!login && !!password) {
    apiClient.post('/auth/login', data).then((response) => {
      if (response.data.error) {
        setError(true);
        setIsLoading(false);
        setErrorMessage(response.data.error);
      } else {
        // 24hours converted into minutes -> seconds -> MS
        let expirationInMS = 1000 * 60 * 60 * 24;
        let expirationDate = new Date(new Date().getTime() + expirationInMS);
        let id_token = {
          value: response.data.accessToken,
          expirationDate: expirationDate.toISOstring(),
        };

        SetSessionItem('id_token', JSON.stringify(id_token));
        setError(false);
        dispatch({ type: 'LOGIN_SUCCESS' });
        Router.push('/app/dashboard');
      }
    });
  }
};
