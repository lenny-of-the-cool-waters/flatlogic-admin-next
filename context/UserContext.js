import React from "react";
import { useRouter } from 'next/router';
import apiClient from "../apiClient";
import useStorage from "../hooks/useStorage";

const { getItem, setItem, removeItem } = useStorage();

let UserStateContext = React.createContext();
let UserDispatchContext = React.createContext();

function userReducer(state, action) {
    switch(action.type) {
        case "LOGIN_SUCCESS":
            return { ...state, isAuthenticated: true };
        case "SIGN_OUT_SUCCESS":
            return { ...state, isAuthenticated: false };
        default: {
            return { ...state, isAuthenticated: false}
        }
    }
}

function UserProvider({ children }) {
    let [state, dispatch] = React.useReducer(userReducer, {
        isAuthenticated: !!getLoginToken()
    })

    return (
        <UserStateContext.Provider value={state}>
            <UserDispatchContext.Provider value={dispatch}>
                { children }
            </UserDispatchContext.Provider>
        </UserStateContext.Provider>
    )
}

function useUserState() {
    let context = React.useContext(UserStateContext);
    if(context === undefined) {
        throw new Error("useUserState must be used within a UserProvider");
    }
    return context;
}

function useUserDispatch() {
    let context = React.useContext(UserDispatchContext);
    if(context === undefined) {
        throw new Error("useUserDispatch must eb used within a UserProvider");
    }

    return context;
}

/* ################################# */
/* Authentication and Authorization functions */
function getLoginToken() {
    let stringValue = getItem("id_token");
    if(stringValue !== null) {
        let value = JSON.parse(stringValue);
        let expirationDate = new Date(value.expirationDate);
        if(expirationDate > newDate()) {
            return value.value;
        } else {
            removeItem("id_token");
        }
    }
    return null;
}

function loginUser(dispatch, login, password, setIsLoading, setError, setErrorMessage) {
    setError(false);
    setIsLoading(true);

    let data = {
        username: login,
        password: password
    }

    if(!!login && !!password) {
        apiClient.post("/auth/login", data).then((response) => {
            if(response.data.error) {
                setError(true);
                setIsLoading(false);
                setErrorMessage(response.data.error);
            } else {
                let expirationInHours = 24;
                // 24 hours into MS
                let expirationInMs = 60 * 60 * 1000 * expirationInHours;
                let expirationDate = new Date(new Date().getTime() + expirationInMs);
                let id_token = {
                    value: response.data.accessToken,
                    expirationDate: expirationDate.toISOString()
                };

                setItem("id_token", JSON.stringify(id_token));
                setError(null);
                setIsLoading(false);
                dispatch({ type: "LOGIN_SUCCESS" });
                router.push({ pathname: '/'});
            }
        })
    }
}

function signOut(dispatch) {
    apiClient.get("/auth/logout")
    .then(() => {
        removeItem("id_token");
        dispatch({type: "SIGN_OUT_SUCCESS"});
        router.push({ pathname: '/login' });
    })
}

function resetPassword(dispatch, login, password, confirmPassword, setIsLoading, setError, setErrorMessage) {
    setError(false);
    setIsLoading(true);

    let data = {
        username: login,
        newPassword: password
    };

    if(password !== confirmPassword) {
        setError(true);
        setIsLoading(false);
        setErrorMessage("Passwords do not match");
    }

    if(!!login && !!password) {
        apiClient.post("/auth/reset", data)
        .then((response) => {
            if(response.data.error) {
                setError(true);
                setIsLoading(false);
                setErrorMessage(response.data.error);
            } else {
                setError(null);
                setIsLoading(false);
                router.push({ path: "/login"});
            }
        })
    }
}

export { UserProvider, useUserState, useUserDispatch, loginUser, resetPassword, signOut };