import test from 'node:test'
import assert from 'node:assert/strict'
import {
  formatBangladeshMobile, formatCardNumber, formatExpiry,
  isValidBangladeshMobile, isValidCardNumber, isValidExpiry, paymentErrorKey,
} from './paymentForm.js'

test('formats payment fields without keeping unsafe characters', () => {
  assert.equal(formatBangladeshMobile('+880 1712-345678'), '88017123456')
  assert.equal(formatCardNumber('4242-4242-4242-4242'), '4242 4242 4242 4242')
  assert.equal(formatExpiry('12/30'), '12 / 30')
})

test('accepts a valid Bangladesh mobile number', () => {
  assert.equal(isValidBangladeshMobile('01712345678'), true)
  assert.equal(isValidBangladeshMobile('01212345678'), false)
  assert.equal(isValidBangladeshMobile('0171234567'), false)
})

test('checks card numbers using the Luhn algorithm', () => {
  assert.equal(isValidCardNumber('4242 4242 4242 4242'), true)
  assert.equal(isValidCardNumber('4242 4242 4242 4241'), false)
  assert.equal(isValidCardNumber('0000 0000 0000 0000'), false)
})

test('rejects expired or malformed expiry dates', () => {
  const now = new Date(2026, 8, 30)
  assert.equal(isValidExpiry('09 / 26', now), true)
  assert.equal(isValidExpiry('08 / 26', now), false)
  assert.equal(isValidExpiry('13 / 30', now), false)
})

test('returns the first field error for the chosen method', () => {
  assert.equal(paymentErrorKey('bkash', { mobile: '' }), 'auth.pay.invalidMobile')
  assert.equal(paymentErrorKey('card', {
    cardNumber: '4242 4242 4242 4242', expiry: '12 / 30', cvc: '123', cardName: 'Manuth Gamage',
  }, new Date(2026, 8, 30)), null)
})
