const timestamp = () => new Date().toLocaleString();

const logger = {
  info: (message: string) => console.log(`ℹ️  [${timestamp()}] ${message}`),
  success: (message: string) => console.log(`✅ [${timestamp()}] ${message}`),
  warn: (message: string) => console.warn(`⚠️  [${timestamp()}] ${message}`),
  error: (message: string, error?: unknown) =>
    console.error(`❌ [${timestamp()}] ${message}`, error ?? ''),
};

export default logger;
