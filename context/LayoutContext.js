import React from "react";

let LayoutStateContext = React.createContext();
let LayoutDispatchContent = React.createContext();

function layoutReducer(state, action) {
    switch(action.type) {
        case "TOGGLE_SIDEBAR":
            return { ...state, isSideBarOpened: !state.isSideBarOpened };
        default: 
            throw new Error(`Unhandled action type: ${action.type}`);
    }
}

function LayoutProvider({ children }) {
    let [state, dispatch] = React.useReducer(layoutReducer, { isSideBarOpened: true });

    return (
        <LayoutStateContext.Provider value={state}>
            <LayoutDispatchContent.Provider value={dispatch}>
                { children }
            </LayoutDispatchContent.Provider>
        </LayoutStateContext.Provider>
    )
}

function useLayoutState() {
    let context = React.useContext(LayoutStateContext);
    if(context === undefined) {
        throw new Error("useLayoutState must be used within a LayoutProvider");
    }
    return context;
}

function useLayoutDispatch() {
    let context = React.useContext(LayoutDIspatchContext);
    if(context === undefined) {
        throw new Error("useLayoutDispatch must be used within a LayoutProvider");
    }
    return context;
}

/* #################################### */
// Layout functions
function toggleSidebar(dispatch) {
    dispatch({
      type: "TOGGLE_SIDEBAR",
    });
  }

/* #################################### */
// Exports
export { LayoutProvider, useLayoutState, useLayoutDispatch, toggleSidebar };