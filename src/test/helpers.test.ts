import { BN } from 'bn.js'
import { floatingPointCheck } from '../lib/helpers'
import { just, wordsError } from '../lib/types'
import { FloatingPointNotSupportedError } from '../lib/error'

describe('floatingPointCheck()', () => {
	//  Success Cases
	it('Should allow construction of non-decimal string', () => {
		const nonDecimalString = '64'
		expect(floatingPointCheck(nonDecimalString)).toEqual(just(nonDecimalString))
	})
	it('Should allow construction of non-decimal number', () => {
		const nonDecimalNumber = 288
		expect(floatingPointCheck(nonDecimalNumber)).toEqual(just(nonDecimalNumber))
	})
	it('Should allow construction of non-decimal BN', () => {
		const nonDecimalBN = new BN(288)
		const nonDecimalBN2 = new BN(288)
		expect(floatingPointCheck(nonDecimalBN)).toEqual(just(nonDecimalBN2))
	})
	// Failure Cases
	it('Should not allow construction of decimal string', () => {
		const decimalString = '6.4'
		expect(floatingPointCheck(decimalString)).toEqual(
			wordsError(new FloatingPointNotSupportedError())
		)
	})
	it('Should not allow construction of decimal number', () => {
		const decimalNumber = 28.8
		expect(floatingPointCheck(decimalNumber)).toEqual(
			wordsError(new FloatingPointNotSupportedError())
		)
	})
	it('Should not error on decimla BNs, which should end up rounded', () => {
		const nonDecimalBN = new BN(2.88)
		const nonDecimalBN2 = new BN(2.88)
		expect(floatingPointCheck(nonDecimalBN)).toEqual(just(nonDecimalBN2))
	})
})
