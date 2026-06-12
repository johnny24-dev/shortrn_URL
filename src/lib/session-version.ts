type SessionVersionInput = Date | string | null | undefined;

function toTime(value: SessionVersionInput): number | null {
  if (value == null) {
    return null;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  const time = parsed.getTime();

  return Number.isNaN(time) ? null : time;
}

export function isJwtSessionFresh(
  tokenPasswordChangedAt: SessionVersionInput,
  currentPasswordChangedAt: SessionVersionInput,
): boolean {
  const tokenTime = toTime(tokenPasswordChangedAt);
  const currentTime = toTime(currentPasswordChangedAt);

  if (currentTime == null) {
    return tokenTime == null;
  }

  if (tokenTime == null) {
    return false;
  }

  return tokenTime >= currentTime;
}
