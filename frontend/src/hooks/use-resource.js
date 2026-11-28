import { useEffect, useState } from 'react';
// The caller remounts this hook's owner by resource identity (route/filter key).
export function useResource(load) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ attempt: -1, data: null, error: null });
  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(load)
      .then((data) => {
        if (active) setState({ attempt, data, error: null });
      })
      .catch((error) => {
        if (active) setState({ attempt, data: null, error });
      });
    return () => {
      active = false;
    };
  }, [load, attempt]);
  return {
    data: state.attempt === attempt ? state.data : null,
    error: state.attempt === attempt ? state.error : null,
    retry: () => setAttempt((value) => value + 1),
  };
}
