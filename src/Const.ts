const STATIC_URL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:${process.env.REACT_APP_PORT}`
    : process.env.REACT_APP_PUBLIC_URL;

const SERVER_URL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:7777`
    : process.env.REACT_APP_PUBLIC_URL;

export { STATIC_URL, SERVER_URL };
