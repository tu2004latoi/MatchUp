import Cookies from "js-cookie";

import type { Reducer } from "react";

export type MyUserState = Record<string, unknown> | null;

export type MyUserAction =
  | { type: "login"; payload: Record<string, unknown> }
  | { type: "logout"; payload?: unknown };

const MyUserReducer: Reducer<MyUserState, MyUserAction> = (current, action) => {
  switch (action.type) {
    case "login":
      return { ...action.payload };
    case "logout":
      Cookies.remove("token");
      return null;
    default:
      return current;
  }
};

export default MyUserReducer;