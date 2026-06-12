const BLOCKED_DESTINATION_MESSAGE = "Destination URL is blocked";

export function assertUrlAllowed(destinationUrl: string): void {
  let url: URL;
  try {
    url = new URL(destinationUrl);
  } catch {
    return;
  }

  const hostname = url.hostname.toLowerCase();
  if (isBlockedHostname(hostname) || isPrivateIpv4(hostname)) {
    throw new Error(BLOCKED_DESTINATION_MESSAGE);
  }
}

function isBlockedHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0"
  );
}

function isPrivateIpv4(hostname: string): boolean {
  const octets = hostname.split(".");
  if (octets.length !== 4) {
    return false;
  }

  const numbers = octets.map((octet) => Number(octet));
  if (
    numbers.some(
      (octet, index) =>
        !Number.isInteger(octet) ||
        octet < 0 ||
        octet > 255 ||
        octets[index] !== String(octet),
    )
  ) {
    return false;
  }

  const [first, second] = numbers;
  return (
    first === 10 ||
    (first === 192 && second === 168) ||
    (first === 172 && second >= 16 && second <= 31)
  );
}
