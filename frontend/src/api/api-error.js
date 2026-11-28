export function toApiError(error) {
  const status = error.response?.status ?? 0;
  const messages = {
    400: '입력값을 확인해 주세요.',
    401: '로그인이 필요하거나 인증 정보가 올바르지 않습니다.',
    403: '접근 권한이 없습니다.',
    404: '요청한 정보를 찾을 수 없습니다.',
    409: '요청이 충돌했습니다. 현재 상태를 확인해 주세요.',
    429: '잠시 후 다시 시도해 주세요.',
  };
  const result = new Error(
    error.response?.data?.detail ||
      messages[status] ||
      (status
        ? '서버 오류가 발생했습니다.'
        : '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.'),
  );
  result.status = status;
  return result;
}
