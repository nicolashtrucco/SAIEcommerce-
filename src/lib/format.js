export const padIndex = (value) => String(value).padStart(2, '0')

export const truncateText = (text, maxLength) =>
  text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
