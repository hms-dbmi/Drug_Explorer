const STATIC_URL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:${process.env.REACT_APP_PORT}`
    : './';

const SERVER_URL =
  process.env.NODE_ENV === 'development' ? `http://localhost:8000` : './';

export { STATIC_URL, SERVER_URL };
