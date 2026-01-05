#!/bin/bash
# Frontend 로그 정리 스크립트
# 사용법: ./scripts/cleanup-logs.sh

LOG_DIR="$(dirname "$0")/../logs"

if [ ! -d "$LOG_DIR" ]; then
  echo "Log directory not found: $LOG_DIR"
  exit 0
fi

cd "$LOG_DIR" || exit 1

# 현재 로그 크기 확인
echo "Current log directory size:"
du -sh .

# 백업 파일 삭제 (2개 초과)
for base in app.log error.log; do
  backups=$(ls -1 "${base}."*".bak" 2>/dev/null | sort -r)
  count=0
  for f in $backups; do
    count=$((count + 1))
    if [ $count -gt 2 ]; then
      echo "Removing old backup: $f"
      rm -f "$f"
    fi
  done
done

# 7일 이상 된 백업 파일 삭제
find . -name "*.bak" -mtime +7 -exec rm -f {} \; -print 2>/dev/null

# 현재 로그 파일이 10MB 초과 시 truncate
for logfile in app.log error.log; do
  if [ -f "$logfile" ]; then
    size=$(stat -f%z "$logfile" 2>/dev/null || stat -c%s "$logfile" 2>/dev/null)
    if [ "$size" -gt 10485760 ]; then
      echo "Truncating $logfile (size: $size bytes)"
      # 마지막 1000줄만 유지
      tail -1000 "$logfile" > "${logfile}.tmp"
      mv "${logfile}.tmp" "$logfile"
    fi
  fi
done

echo ""
echo "After cleanup:"
du -sh .
ls -la
