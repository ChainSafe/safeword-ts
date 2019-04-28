import { BN } from 'bn.js'
import {
	floatingPointCheck,
	constructBN,
	bitLengthCheck,
	negativeCheck,
	constructInteger
} from '../lib/helpers'
import { just, wordsError } from '../lib/types'
import {
	FloatingPointNotSupportedError,
	InvalidSizeError,
	NegativeUnsignedError
} from '../lib/error'

/**
 * @section Validator Functions
 */
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
describe('constructBN()', () => {
	//  Success Cases
	it('should allow construction of BN from string', () => {
		const seventyTwo = '72'
		expect(constructBN(seventyTwo)).toEqual(new BN(seventyTwo))
	})
	it('should allow construction of BN from number', () => {
		const eightHundered = 800
		expect(constructBN(800)).toEqual(new BN(eightHundered))
	})
	it('should pass an existing BN through', () => {
		const bn = new BN(766)
		expect(constructBN(bn)).toEqual(bn)
	})
	// Failure Cases
	it('should pass null values through', () => {
		expect(constructBN(null)).toEqual(null)
	})
})
describe('bitLengthCheck()', () => {
	const arrayToFiftyThree = Array.from(new Array(52), (_, i) => i + 1)
	const bitLengthNumbers = arrayToFiftyThree.map((e) => new BN(2 ** e - 1))
	const bitLengthNumbersPlusOne = arrayToFiftyThree.map((e) => new BN(2 ** e))
	//  Success Cases
	it('should pass BN through with no error if it is below the allotted word number', () => {
		const bitLengthChecks = bitLengthNumbers.map((e, i) =>
			bitLengthCheck(i + 1)(e)
		)
		bitLengthChecks.forEach((safeNumber, i) => {
			const number = 2 ** (i + 1) - 1
			expect(safeNumber).toEqual(just(new BN(number)))
		})
	})
	// Failure Cases
	it('should error when bit length of number is greater than the words passed to it', () => {
		const bitLengthChecks = bitLengthNumbersPlusOne.map((e, i) =>
			bitLengthCheck(i + 1)(e)
		)

		bitLengthChecks.forEach((safeNumber, i) => {
			const words = i + 1
			const number = 2 ** words
			expect(safeNumber).toEqual(
				wordsError(new InvalidSizeError(words, new BN(number).bitLength()))
			)
		})
	})
})
describe('negativeCheck()', () => {
	//  Success Cases
	it('should pass BN through with no error if it is positive', () => {
		expect(negativeCheck(new BN(1))).toEqual(just(new BN(1)))
	})
	it('should pass BN through with no error if it is 0', () => {
		expect(negativeCheck(new BN(0))).toEqual(just(new BN(0)))
	})
	// Failure Cases
	it('should error when passed a negative number', () => {
		expect(negativeCheck(new BN(-1))).toEqual(
			wordsError(new NegativeUnsignedError())
		)
	})
})
describe('constructInteger()', () => {
	//  Success Cases
	it('should', () => {})
	// Failure Cases
	it('should', () => {})
})
