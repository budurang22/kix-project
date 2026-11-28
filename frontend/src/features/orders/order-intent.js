// One intent owns one immutable request and key, including retries after uncertain failures.
export function createOrderIntent(
  input,
  createKey = () => crypto.randomUUID(),
) {
  const request = Object.freeze({ ...input });
  const key = createKey();
  let pending = null;
  let result = null;
  return {
    request,
    execute(submit) {
      if (result) return Promise.resolve(result);
      if (pending) return pending;
      pending = Promise.resolve()
        .then(() => submit({ input: request, idempotencyKey: key }))
        .then((response) => {
          result = response;
          return response;
        })
        .finally(() => {
          pending = null;
        });
      return pending;
    },
  };
}
