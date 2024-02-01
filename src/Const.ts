const STATIC_URL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:${process.env.REACT_APP_PORT}`
    : './';

const SERVER_URL =
  process.env.NODE_ENV === 'development' ? `http://localhost:8002` : './';

const DATA_URL = 'txgnn_data_v2';

export { STATIC_URL, SERVER_URL, DATA_URL };
