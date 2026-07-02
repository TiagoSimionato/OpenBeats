const originalLog = console.log;

console.log = (...args) => {
  const timestamp = new Date().toISOString().substring(0, 19).replace('T', ' ');
  originalLog.apply(console, [`[${timestamp}]`, ...args]);
};

export {};
