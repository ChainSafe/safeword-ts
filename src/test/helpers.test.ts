import { BN } from 'bn.js'
import {
	floatingPointCheck,
	constructBN,
	bitLengthCheck,
	negativeCheck,
	constructInteger,
	safeUintConstructor,
	loudlyExtractSafeNumber,
	extractSafeNumber
} from '../lib/helpers'
import {
	just,
	wordsError,
	Int,
	Uint,
	WordsEnum,
	Uint8,
	Uint16,
	Uint32,
	Uint64,
	Uint128,
	Uint256
} from '../lib/types'
import {
	FloatingPointNotSupportedError,
	InvalidSizeError,
	NegativeUnsignedError,
	UnconstructableInteger
} from '../lib/error'

const wordsToValidNumberMap = {
	8: '255',
	16: '65535',
	32: '4294967295',
	64: '18446744073709551615',
	128: '340282366920938463463374607431768211455',
	256: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
	257: '115792089237316195423570985008687907853269984665640564039457584007913129639936'
}
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
	const wordsEnum = [8, 16, 32, 64, 128, 256] as WordsEnum[]
	const wordsEnumWrong = [7, 15, 31, 63, 127, 255]
	const constructInt = constructInteger<Int>(true)
	const constructUint = constructInteger<Uint>(false)

	//  Success Cases
	it('should be able to constructInteger for all possible integer types', () => {
		wordsEnum.forEach((words) => {
			const bigNumber = new BN(wordsToValidNumberMap[words])
			expect(bigNumber.bitLength() <= words).toBe(true)

			const int = constructInt(words)(bigNumber)
			const uint = constructUint(words)(bigNumber)
			expect(int).toEqual(just({ words, signed: true, value: bigNumber }))
			expect(uint).toEqual(just({ words, signed: false, value: bigNumber }))
		})
	})
	// Failure Cases
	it('should error out when trying to construct with invalid words amount', () => {
		wordsEnumWrong.forEach((words) => {
			const bigNumber = new BN(wordsToValidNumberMap[words + 1])
			expect(bigNumber.bitLength() <= words + 1).toBe(true)

			// NOTE: this error requires type coercion, that the type system would otherwise catch
			const int = constructInt(words as WordsEnum)(bigNumber)
			const uint = constructUint(words as WordsEnum)(bigNumber)
			expect(int).toEqual(
				wordsError(
					new UnconstructableInteger(words, true, bigNumber.toString(10))
				)
			)
			expect(uint).toEqual(
				wordsError(
					new UnconstructableInteger(words, false, bigNumber.toString(10))
				)
			)
		})
	})
})

/**
 * @section Safe Constructors
 */
describe('safeUintConstructor()', () => {
	const wordsEnum = [8, 16, 32, 64, 128, 256] as WordsEnum[]
	// Success Cases
	it('should safely constructs Uints when constructed with strings', () => {
		wordsEnum.forEach((words) => {
			const numberAsString = wordsToValidNumberMap[words]
			const bn = new BN(numberAsString)
			expect(safeUintConstructor<Uint>(words)(numberAsString)).toEqual(
				just({ words, signed: false, value: bn })
			)
		})
	})
	it('should safely constructs Uints when constructed with number (below 2^53)', () => {
		const belowJSPercisionLimit = [8, 16, 32] as WordsEnum[]
		belowJSPercisionLimit.forEach((words) => {
			const number = parseInt(wordsToValidNumberMap[words])
			const bn = new BN(number)
			expect(safeUintConstructor<Uint>(words)(number)).toEqual(
				just({ words, signed: false, value: bn })
			)
		})
	})
	it('should safely constructs Uints when constructed with BN', () => {
		wordsEnum.forEach((words) => {
			const numberAsString = wordsToValidNumberMap[words]
			const bn = new BN(numberAsString)
			expect(safeUintConstructor<Uint>(words)(bn)).toEqual(
				just({ words, signed: false, value: bn })
			)
		})
	})
	// Failure Cases
	it('should propagate FloatingPointNotSupportedError when given floating points', () => {
		wordsEnum.forEach((words) => {
			const numberAsString = `${wordsToValidNumberMap[words]}.88`
			expect(safeUintConstructor<Uint>(words)(numberAsString)).toEqual(
				wordsError(new FloatingPointNotSupportedError())
			)
		})
	})
	it('should propagate InvalidSizeError when given a number that is greater than the number of words', () => {
		wordsEnum.forEach((words) => {
			const bn =
				words === 256
					? new BN(wordsToValidNumberMap[words + 1])
					: new BN(wordsToValidNumberMap[words * 2])
			expect(safeUintConstructor<Uint>(words)(bn)).toEqual(
				wordsError(new InvalidSizeError(words, bn.bitLength()))
			)
		})
	})
	it('should propagate InvalidSizeError when given a negative number', () => {
		wordsEnum.forEach((words) => {
			expect(safeUintConstructor<Uint>(words)(-1)).toEqual(
				wordsError(new NegativeUnsignedError())
			)
		})
	})
})

/**
 * @section Typing Functions and Extractors
 */
describe('loudlyExtractSafeNumber()', () => {
	const id = <T>() => (x: T): T => x
	it('should return the value wrapped in Just when given id() and just<Integer>', () => {
		const value = new BN(200)
		const uint8 = { words: 8, signed: false, value } as Uint8
		const integer = just<Uint8>(uint8)
		expect(loudlyExtractSafeNumber<Uint8>(id<Uint8>())(integer)).toEqual(uint8)
	})
	it('should throw when SafeNumber resolves to an error', () => {
		const floatingError = new FloatingPointNotSupportedError()
		const error = wordsError(floatingError)
		try {
			loudlyExtractSafeNumber<Uint8>(id<Uint8>())(error)
		} catch (e) {
			expect(e).toEqual(floatingError)
			return
		}
		throw new Error('test should have thrown, but it did not')
	})
})
describe('extractSafeNumber()', () => {
	const successMock = jest.fn()
	const failureMock = jest.fn()
	const successCase = successMock
	const failureCase = failureMock
	const value = new BN(200)
	const uint8 = { words: 8, signed: false, value } as Uint8
	const justUint8 = just<Uint8>(uint8)
	const floatingError = new FloatingPointNotSupportedError()
	const error = wordsError(floatingError)

	it('should call succes mock with integer', () => {
		extractSafeNumber<void, void>(failureCase)(successCase)(justUint8)
		expect(successMock).toHaveBeenCalledTimes(1)
		expect(failureMock).toHaveBeenCalledTimes(0)
		expect(successMock).toHaveBeenCalledWith(uint8)
	})
	it('should throw when SafeNumber resolves to an error', () => {
		extractSafeNumber<void, void>(failureCase)(successCase)(error)
		expect(successMock).toHaveBeenCalledTimes(0)
		expect(failureMock).toHaveBeenCalledTimes(1)
		expect(failureMock).toHaveBeenCalledWith(floatingError)
	})
})
