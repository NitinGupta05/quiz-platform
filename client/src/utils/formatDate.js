function isValidDate(date) {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

export function formatDate(value) {
  const date = new Date(value);
  if (!isValidDate(date)) return "N/A";
  return date.toLocaleDateString("en-GB");
}

export function formatDateDDMMYYYY(value) {
  const date = new Date(value);
  if (!isValidDate(date)) return "N/A";
  return date.toLocaleDateString("en-GB");
}

export function formatDateTimeDDMMYYYYHHMM(value) {
  const date = new Date(value);
  if (!isValidDate(date)) return "N/A";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
