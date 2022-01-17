import { useState, useEffect } from 'react';

export const SetSessionItem = (name, value) => {
  useEffect(() => {
    sessionStorage.setItem(name, value);
  }, []);
};

export const GetSessionItem = (name) => {
  const [item, setItem] = useState('');
  useEffect(() => {
    setItem(sessionStorage.getItem(name));
  }, []);
};

export const RemoveSessionItem = (name) => {
  const [item, setItem] = useState('');
  useEffect(() => {
    setItem(sessionStorage.removeItem(name));
  }, []);
};
