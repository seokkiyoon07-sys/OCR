/**
 * Frontend Logging Utility
 * 에러 로그를 파일로 저장하는 유틸리티
 */

import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const ERROR_LOG_FILE = path.join(LOG_DIR, 'error.log');
const APP_LOG_FILE = path.join(LOG_DIR, 'app.log');

// 로그 디렉토리 생성
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

// 타임스탬프 생성
function getTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

// 로그 파일에 기록
function appendToLog(filePath: string, message: string) {
  ensureLogDir();
  const logMessage = `${getTimestamp()} | ${message}\n`;
  fs.appendFileSync(filePath, logMessage, 'utf-8');
}

// 로그 파일 크기 체크 및 로테이션 (10MB)
function rotateIfNeeded(filePath: string) {
  try {
    const stats = fs.statSync(filePath);
    if (stats.size > 10 * 1024 * 1024) {  // 10MB
      const rotatedPath = `${filePath}.${Date.now()}.bak`;
      fs.renameSync(filePath, rotatedPath);
      
      // 오래된 백업 파일 정리 (5개 유지)
      const dir = path.dirname(filePath);
      const baseName = path.basename(filePath);
      const backups = fs.readdirSync(dir)
        .filter(f => f.startsWith(baseName) && f.endsWith('.bak'))
        .sort()
        .reverse();
      
      backups.slice(5).forEach(backup => {
        fs.unlinkSync(path.join(dir, backup));
      });
    }
  } catch {
    // 파일이 없으면 무시
  }
}

export const logger = {
  info(message: string, ...args: unknown[]) {
    const fullMessage = `INFO | ${message} ${args.length ? JSON.stringify(args) : ''}`;
    console.log(`[${getTimestamp()}] ${fullMessage}`);
    if (typeof window === 'undefined') {
      // 서버 사이드에서만 파일에 기록
      rotateIfNeeded(APP_LOG_FILE);
      appendToLog(APP_LOG_FILE, fullMessage);
    }
  },

  warn(message: string, ...args: unknown[]) {
    const fullMessage = `WARN | ${message} ${args.length ? JSON.stringify(args) : ''}`;
    console.warn(`[${getTimestamp()}] ${fullMessage}`);
    if (typeof window === 'undefined') {
      rotateIfNeeded(APP_LOG_FILE);
      appendToLog(APP_LOG_FILE, fullMessage);
    }
  },

  error(message: string, error?: unknown, ...args: unknown[]) {
    let errorDetails = '';
    if (error instanceof Error) {
      errorDetails = ` | ${error.name}: ${error.message}`;
      if (error.stack) {
        errorDetails += `\n  Stack: ${error.stack}`;
      }
    } else if (error) {
      errorDetails = ` | ${JSON.stringify(error)}`;
    }
    
    const fullMessage = `ERROR | ${message}${errorDetails} ${args.length ? JSON.stringify(args) : ''}`;
    console.error(`[${getTimestamp()}] ${fullMessage}`);
    
    if (typeof window === 'undefined') {
      // 서버 사이드에서만 파일에 기록
      rotateIfNeeded(ERROR_LOG_FILE);
      appendToLog(ERROR_LOG_FILE, fullMessage);
      rotateIfNeeded(APP_LOG_FILE);
      appendToLog(APP_LOG_FILE, fullMessage);
    }
  },

  debug(message: string, ...args: unknown[]) {
    if (process.env.NODE_ENV === 'development') {
      const fullMessage = `DEBUG | ${message} ${args.length ? JSON.stringify(args) : ''}`;
      console.debug(`[${getTimestamp()}] ${fullMessage}`);
    }
  }
};

export default logger;
