export function digitsOnly(value) {
  return String(value ?? '').replace(/\D/g, '')
}

export function formatBangladeshMobile(value) {
  return digitsOnly(value).slice(0, 11)
}

export function formatCardNumber(value) {
  return digitsOnly(value).slice(0, 19).replace(/(.{4})/g, '$1 ').trim()
}

export function formatExpiry(value) {
  const digits = digitsOnly(value).slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits
}

export function isValidBangladeshMobile(value) {
  return /^01[3-9]\d{8}$/.test(digitsOnly(value))
}

export function isValidCardNumber(value) {
  const digits = digitsOnly(value)
  if (digits.length < 13 || digits.length > 19 || /^(\d)\1+$/.test(digits)) return false

  let sum = 0
  let doubleNext = false
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index])
    if (doubleNext) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    doubleNext = !doubleNext
  }
  return sum % 10 === 0
}

export function isValidExpiry(value, now = new Date()) {
  const digits = digitsOnly(value)
  if (digits.length !== 4) return false
  const month = Number(digits.slice(0, 2))
  const year = 2000 + Number(digits.slice(2))
  if (month < 1 || month > 12) return false
  const expiryEnd = new Date(year, month, 0, 23, 59, 59, 999)
  return expiryEnd >= now
}

export function paymentErrorKey(method, details, now = new Date()) {
  if (method === 'bkash' || method === 'nagad') {
    return isValidBangladeshMobile(details.mobile) ? null : 'auth.pay.invalidMobile'
  }

  if (!isValidCardNumber(details.cardNumber)) return 'auth.pay.invalidCard'
  if (!isValidExpiry(details.expiry, now)) return 'auth.pay.invalidExpiry'
  if (!/^\d{3,4}$/.test(digitsOnly(details.cvc))) return 'auth.pay.invalidCvc'
  if (String(details.cardName ?? '').trim().length < 2) return 'auth.pay.invalidName'
  return null
}
