import { ExpressZodAPIClient, Implementation } from "./generated";

export const exampleImplementation: Implementation = async (
  method,
  path,
  params
) => {
  const hasBody = !["get", "delete"].includes(method);
  const searchParams = hasBody ? "" : `?${new URLSearchParams(params)}`;
  const response = await fetch(
    `${import.meta.env.VITE_APP_API_URL}${path}${searchParams}`,
    {
      method: method.toUpperCase(),
      headers: hasBody ? { "Content-Type": "application/json" } : undefined,
      body: hasBody ? JSON.stringify(params) : undefined,
    }
  );
  // if (`${method} ${path}` in jsonEndpoints) {
  return response.json();
  // }
  // return response.text();
};

export const client = new ExpressZodAPIClient(exampleImplementation);
