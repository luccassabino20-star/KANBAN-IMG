import { createContext, useContext, useEffect, useReducer, useRef } from "react";
import { reducer } from "./reducer.js";
import { syncAction } from "./sync.js";
import { getWorkspace } from "./api.js";

const BoardStateContext = createContext(null);
const BoardDispatchContext = createContext(null);
const BoardRefetchContext = createContext(() => {});

export function BoardProvider({ children }) {
  const [state, dispatchRaw] = useReducer(reducer, { boards: [], hydrated: false });
  const pendingRef = useRef([]);

  async function refetch() {
    const data = await getWorkspace();
    dispatchRaw({ type: "HYDRATE", boards: data.boards });
  }

  useEffect(() => {
    refetch();
  }, []);

  function dispatch(action) {
    pendingRef.current.push(action);
    dispatchRaw(action);
  }

  useEffect(() => {
    if (pendingRef.current.length === 0) return;
    const actions = pendingRef.current;
    pendingRef.current = [];
    actions.forEach((action) => syncAction(action, state));
  }, [state]);

  return (
    <BoardStateContext.Provider value={state}>
      <BoardDispatchContext.Provider value={dispatch}>
        <BoardRefetchContext.Provider value={refetch}>{children}</BoardRefetchContext.Provider>
      </BoardDispatchContext.Provider>
    </BoardStateContext.Provider>
  );
}

export function useBoardState() {
  return useContext(BoardStateContext);
}
export function useBoardDispatch() {
  return useContext(BoardDispatchContext);
}
export function useBoardRefetch() {
  return useContext(BoardRefetchContext);
}
