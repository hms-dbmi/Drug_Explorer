const URL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:${process.env.REACT_APP_PORT}`
    : process.env.REACT_APP_PUBLIC_URL;

export { URL };
