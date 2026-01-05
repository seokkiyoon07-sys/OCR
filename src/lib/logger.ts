/**
 * Frontend Logging Utility
 * 에러 로그를 파일로 저장하는 유틸리티
 * - 로그 로테이션: 5MB 초과 시 로테이션, 백업 2개 유지
 * - 중복 에러 방지: 동일 에러 1분 내 재발 시 무시
 * - EIO 에러 필터링: 빌드 시 발생하는 노이즈 에러 무시
 */

import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const ERROR_LOG_FILE = path.join(LOG_DIR, 'error.log');
const APP_LOG_FILE = path.join(LOG_DIR, 'app.log');

// 로그 파일 크기 제한 (5MB)
const MAX_LOG_SIZE = 5 * 1024 * 1024;
// 백업 파일 유지 개수
const MAX_BACKUP_COUNT = 2;
// 중복 에러 방지 시간 (1분)
const DUPLICATE_SUPPRESS_MS = 60 * 1000;

// 무시할 에러 패턴 (빌드 시 발생하는 노이즈 에러들)
const IGNORED_ERROR_PATTERNS = [
  'write EIO',
  'write EPIPE',
  'ENOENT',
  'console-exit.js',
];

// 최근 에러 기록 (중복 방지용)
const recentErrors: Map<string, number> = new Map();

// 에러 필터링 체크
function shouldIgnoreError(message: string, error?: unknown): boolean {
  const errorStr = error instanceof Error 
    ? `${error.message} ${error.stack || ''}`
    : String(error || '');
  const fullMessage = `${message} ${errorStr}`;
  
  return IGNORED_ERROR_PATTERNS.some(pattern => fullMessage.includes(pattern));
}

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

// 중복 에러 체크
function isDuplicateError(message: string): boolean {
  const now = Date.now();
  const lastTime = recentErrors.get(message);
  
  if (lastTime && (now - lastTime) < DUPLICATE_SUPPRESS_MS) {
    return true;
  }
  
  recentErrors.set(message, now);
  
  // 오래된 항목 정리 (100개 초과 시)
  if (recentErrors.size > 100) {
    const cutoff = now - DUPLICATE_SUPPRESS_MS;
    for (const [key, time] of recentErrors) {
      if (time < cutoff) {
        recentErrors.delete(key);
      }
    }
  }
  
  return false;
}

// 로그 파일에 기록
function appendToLog(filePath: string, message: string) {
  ensureLogDir();
  const logMessage = `${getTimestamp()} | ${message}\n`;
  fs.appendFileSync(filePath, logMessage, 'utf-8');
}

// 로그 파일 크기 체크 및 로테이션
function rotateIfNeeded(filePath: string) {
  try {
    const stats = fs.statSync(filePath);
    if (stats.size > MAX_LOG_SIZE) {
      const rotatedPath = `${filePath}.${Date.now()}.bak`;
      fs.renameSync(filePath, rotatedPath);
      
      // 오래된 백업 파일 정리
      cleanupOldBackups(filePath);
    }
  } catch {
    // 파일이 없으면 무시
  }
}

// 오래된 백업 파일 정리
function cleanupOldBackups(filePath: string) {
  try {
    const dir = path.dirname(filePath);
    const baseName = path.basename(filePath);
    const backups = fs.readdirSync(dir)
      .filter(f => f.startsWith(baseName) && f.endsWith('.bak'))
      .sort()
      .reverse();
    
    // 최대 백업 개수 초과 시 삭제
    backups.slice(MAX_BACKUP_COUNT).forEach(backup => {
      try {
        fs.unlinkSync(path.join(dir, backup));
      } catch {
        // 삭제 실패 무시
      }
    });
  } catch {
    // 오류 무시
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
    // 빌드 노이즈 에러 필터링 (EIO, EPIPE 등)
    if (shouldIgnoreError(message, error)) {
      return;
    }
    
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
    
    // 중복 에러 체크 (파일 로깅만 방지, 콘솔 출력은 유지)
    const errorKey = `${message}:${error instanceof Error ? error.message : String(error)}`;
    const shouldLogToFile = !isDuplicateError(errorKey);
    
    console.error(`[${getTimestamp()}] ${fullMessage}`);
    
    if (typeof window === 'undefined' && shouldLogToFile) {
      // 서버 사이드에서만 파일에 기록 (중복 아닌 경우만)
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
