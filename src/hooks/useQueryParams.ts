import React from "react";

/**
 * Retrieve and listen to query params
 */
export default function useQueryParams<
  QueryParams extends { [key: string]: string | number | undefined }
>({ defaults }: { defaults?: Partial<QueryParams> } = {}) {
  const [queryParams, setQueryParams] = React.useState<Partial<QueryParams>>(
    defaults || {}
  );

  React.useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries()) as QueryParams;

    setQueryParams({
      ...defaults,
      ...params,
    });
  }, [defaults]);

  const setQueryParam = React.useCallback(
    <K extends keyof QueryParams & string>(key: K, value: QueryParams[K]) => {
      const urlSearchParams = new URLSearchParams(window.location.search);
      urlSearchParams.set(key, value as string);

      const newRelativePathQuery =
        window.location.pathname + "?" + urlSearchParams.toString();

      window.history.replaceState(null, "", newRelativePathQuery);

      setQueryParams((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  return [queryParams, setQueryParam] as const;
}
