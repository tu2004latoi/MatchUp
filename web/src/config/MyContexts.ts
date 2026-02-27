import { createContext } from "react";

import type { Dispatch } from "react";

import type { MyUserAction } from "../component/reducer/MyUserReducer";

export type MyUserContextValue = Record<string, unknown> | null;
export type MyDispatcherContextValue = Dispatch<MyUserAction>;

export const MyUserContext = createContext<MyUserContextValue>(null);
export const MyDispatcherContext = createContext<MyDispatcherContextValue>(() => undefined);
