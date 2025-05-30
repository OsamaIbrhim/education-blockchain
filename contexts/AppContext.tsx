import React, { createContext, useReducer, Dispatch, ReactNode, useEffect } from 'react';
import { ExamData, ExamResult, ExamStatistics } from '../types/examManagement';
import { Institution } from '../types/institution';
import { useAuthSession, AuthApiError } from '../hooks/useAuthSession'; 

// 1. Define the State interface
export interface IAppState {
  userRole: string | null;
  account: `0x${string}` | undefined;
  isVerified: boolean;
  isInitialized: boolean | undefined;
  isCorrectNetwork: boolean | undefined;
  isAuthenticated: boolean; // Added
  exams: ExamData[];
  certificates: any[]; // Replace 'any' with a specific type if available
  institutionData: Institution | null;
  allInstitutions: Institution[];
  isLoading: boolean;
  error: string | null;
  selectedExamResults: ExamResult[];
  examStatistics: ExamStatistics | null;
}

// 2. Define Action types
export type Action =
  | { type: 'SET_USER_ROLE'; payload: string | null }
  | { type: 'SET_ACCOUNT'; payload: `0x${string}` | undefined }
  | { type: 'SET_IS_VERIFIED'; payload: boolean }
  | { type: 'SET_IS_INITIALIZED'; payload: boolean | undefined }
  | { type: 'SET_IS_CORRECT_NETWORK'; payload: boolean | undefined }
  | { type: 'SET_EXAMS'; payload: ExamData[] }
  | { type: 'SET_CERTIFICATES'; payload: any[] } // Replace 'any'
  | { type: 'SET_INSTITUTION_DATA'; payload: Institution | null }
  | { type: 'SET_ALL_INSTITUTIONS'; payload: Institution[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SELECTED_EXAM_RESULTS'; payload: ExamResult[] }
  | { type: 'SET_EXAM_STATISTICS'; payload: ExamStatistics | null }
  | { type: 'SET_IS_AUTHENTICATED'; payload: boolean } // Added
  | { type: 'LOGIN_SUCCESS'; payload: { account: `0x${string}` | undefined; role: string | null } } // Added
  | { type: 'LOGOUT_SUCCESS' } // Added
  | { type: 'RESET_STATE' };

// 3. Create an initialState object
export const initialState: IAppState = {
  userRole: null,
  account: undefined,
  isVerified: false,
  isInitialized: undefined,
  isCorrectNetwork: undefined,
  isAuthenticated: false, // Added
  exams: [],
  certificates: [],
  institutionData: null,
  allInstitutions: [],
  isLoading: true, // Usually starts with loading true
  error: null,
  selectedExamResults: [],
  examStatistics: null,
};

// 4. Implement a reducer function
export const appReducer = (state: IAppState, action: Action): IAppState => {
  switch (action.type) {
    case 'SET_USER_ROLE':
      return { ...state, userRole: action.payload };
    case 'SET_ACCOUNT':
      return { ...state, account: action.payload };
    case 'SET_IS_VERIFIED':
      return { ...state, isVerified: action.payload };
    case 'SET_IS_INITIALIZED':
      return { ...state, isInitialized: action.payload };
    case 'SET_IS_CORRECT_NETWORK':
      return { ...state, isCorrectNetwork: action.payload };
    case 'SET_EXAMS':
      return { ...state, exams: action.payload };
    case 'SET_CERTIFICATES':
      return { ...state, certificates: action.payload };
    case 'SET_INSTITUTION_DATA':
      return { ...state, institutionData: action.payload };
    case 'SET_ALL_INSTITUTIONS':
      return { ...state, allInstitutions: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_SELECTED_EXAM_RESULTS':
      return { ...state, selectedExamResults: action.payload };
    case 'SET_EXAM_STATISTICS':
      return { ...state, examStatistics: action.payload };
    case 'RESET_STATE':
      return { ...initialState, isLoading: false }; // Keep isLoading false after a full reset if needed, or true if session check runs again
    case 'SET_IS_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        account: action.payload.account,
        userRole: action.payload.role,
        isLoading: false, // Finished loading auth state
        error: null,
      };
    case 'LOGOUT_SUCCESS':
      return {
        ...initialState, // Reset to initial state but ensure loading is false
        isLoading: false,
        isInitialized: true, // Consider this true as app has initialized once
        isCorrectNetwork: state.isCorrectNetwork, // Preserve network status or reset as needed
      };
    default:
      return state;
  }
};

// 5. Create AppContext
export interface IAppContext {
  state: IAppState;
  dispatch: Dispatch<Action>;
  login: (address: string, role: string) => Promise<boolean>; 
  logout: () => Promise<boolean>; 
}

export const AppContext = createContext<IAppContext | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { 
    sessionUser, 
    isLoadingSession, 
    authError, 
    login: authSessionLogin, // Renamed to avoid conflict in context value
    logout: authSessionLogout // Renamed to avoid conflict in context value
  } = useAuthSession();

  // Effect to synchronize isLoadingSession from useAuthSession with the global isLoading state
  useEffect(() => {
    if (state.isLoading !== isLoadingSession) {
      dispatch({ type: 'SET_LOADING', payload: isLoadingSession });
    }
  }, [isLoadingSession, state.isLoading, dispatch]);

  // Effect to synchronize sessionUser from useAuthSession with the global state
  useEffect(() => {
    if (sessionUser) {
      // If useAuthSession provides a user, update global state if it's different or not authenticated
      if (
        !state.isAuthenticated ||
        state.account !== sessionUser.address ||
        state.userRole !== sessionUser.role
      ) {
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { 
            account: sessionUser.address as `0x${string}`, 
            role: sessionUser.role 
          } 
        });
        // Note: isVerified and other user-specific details might need to be fetched
        // separately after LOGIN_SUCCESS if not included in the JWT/sessionUser.
      }
    } else {
      // If useAuthSession clears the user (sessionUser is null)
      // and the global state currently thinks a user is authenticated,
      // and it's not the initial loading phase (isLoadingSession is false),
      // then dispatch LOGOUT_SUCCESS to clear the global state.
      if (state.isAuthenticated && !isLoadingSession) {
        dispatch({ type: 'LOGOUT_SUCCESS' });
      }
    }
  }, [sessionUser, state.isAuthenticated, state.account, state.userRole, isLoadingSession, dispatch]);

  // Effect to synchronize authError from useAuthSession with the global state.error
  useEffect(() => {
    if (authError) {
      const errorMessage = (authError as AuthApiError).response?.data?.message || authError.message || 'An authentication error occurred.';
      console.error("Auth Error in AppContext from useAuthSession:", errorMessage);
      
      if (state.error !== errorMessage) {
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
      }
      
      // If an auth error occurs and global state thinks user is authenticated,
      // and it's not the initial loading phase, force a logout.
      if (state.isAuthenticated && !isLoadingSession) {
         dispatch({ type: 'LOGOUT_SUCCESS' });
      }
    } else {
      // If authError becomes null (e.g., after a successful retry or navigation),
      // and the current global error was related to auth, clear it.
      // This part is optional and depends on how error clearing is desired.
      // For now, we only set errors, not explicitly clear them here based on authError becoming null.
    }
  }, [authError, state.isAuthenticated, state.error, isLoadingSession, dispatch]);

  const contextValue: IAppContext = {
    state,
    dispatch,
    login: authSessionLogin, 
    logout: authSessionLogout, 
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};