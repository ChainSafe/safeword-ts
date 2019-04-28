import { BN } from 'bn.js'
import {
	Constructable,
	SafeNumber,
	bindSafeNumber,
	fmapSafeNumber,
	Integer,
	WordsEnum,
	Uint8,
	Uint16,
	Uint32,
	Uint64,
	Uint128,
	Uint256,
	Uint,
	Int8,
	Int16,
	Int32,
	Int64,
	Int128,
	Int256,
	Int,
	MetaInteger,
	Just,
	just,
	WordsError,
	wordsError
} from './types'
import {
	TypeNotSupportedError,
	InvalidSizeError,
	NegativeUnsignedError,
	OverflowError,
	UnderflowError,
	InconsistentSizeError,
	FloatingPointNotSupportedError,
	DivisionByZeroError,
	UnconstructableInteger,
	ErrorEnum
} from './error'

/**
 * @section Validator Functions
 */

export const floatingPointCheck = (
	num: Constructable
): SafeNumber<FloatingPointNotSupportedError, Constructable> => {
	if (typeof num === 'number' && !Number.isInteger(num)) {
		return wordsError(new FloatingPointNotSupportedError())
	}
	if (typeof num === 'string' && num.includes('.')) {
		return wordsError(new FloatingPointNotSupportedError())
	}
	return just(num)
}

export const constructBN = (value: Constructable): BN => {
	if (typeof value === 'number' || typeof value === 'string') {
		return new BN(value, 10)
	}
	return value
}

const safeNumberConstructBN = fmapSafeNumber(constructBN)

export const bitLengthCheck = (words: number) => (
	num: BN
): SafeNumber<InvalidSizeError, BN> =>
	num.bitLength() > words
		? wordsError(new InvalidSizeError(words, num.bitLength()))
		: just(num)

const safeNumberBitLengthCheck = (words: number) =>
	bindSafeNumber(bitLengthCheck(words))

export const negativeCheck = (num: BN): SafeNumber<NegativeUnsignedError, BN> =>
	num.isNeg() ? wordsError(new NegativeUnsignedError()) : just(num)

const safeNumberNegativeCheck = bindSafeNumber(negativeCheck)

export const constructInteger = <Words extends Integer>(signed: boolean) => (
	words: WordsEnum
) => (value: BN): SafeNumber<ErrorEnum, Words> => {
	const int = {
		words,
		signed,
		value
	} as Words
	return specializeInteger<Words>(int)
}

const safeNumberConstructUint = <Words extends Uint>(words: WordsEnum) =>
	bindSafeNumber(constructInteger<Words>(false)(words))

const safeNumberConstructInt = <Words extends Int>(words: WordsEnum) =>
	bindSafeNumber(constructInteger<Words>(true)(words))

/**
 * @section Safe Constructors
 */

export const safeUintConstructor = <Words extends Uint>(words: WordsEnum) => (
	value: Constructable
): SafeNumber<ErrorEnum, Words> =>
	// prettier-ignore
	safeNumberConstructUint<Words>(words)( 
		safeNumberNegativeCheck(
			safeNumberBitLengthCheck(words)(
				safeNumberConstructBN(
					floatingPointCheck(
						value
					)
				)
			)
		)
	)

/**
 * @section Typing Functions and Extractors
 */

export const loudlyExtractSafeNumber = <SuccessResult>(
	f: (x: Integer) => SuccessResult
) => (safeNumber: SafeNumber<ErrorEnum, Integer>) => {
	if (safeNumber.isError === true) throw safeNumber.error
	else return f(safeNumber.value)
}
export const extractSafeNumber = <ErrorResult, SuccessResult>(
	f: (x: ErrorEnum) => ErrorResult
) => (g: (x: Integer) => SuccessResult) => (
	safeNumber: SafeNumber<ErrorEnum, Integer>
) => (safeNumber.isError === true ? f(safeNumber.error) : g(safeNumber.value))

export const integerToBN = (x: Integer): BN => x.value
export const safeIntegerToBN = fmapSafeNumber<Integer, BN>(integerToBN)

export const specializeInteger = <Words extends Integer>(
	int: Words
): SafeNumber<ErrorEnum, Words> => {
	const { words, signed, value } = int
	if (words === 8 && signed === true) return just(int)
	if (words === 8 && signed === false) return just(int)
	if (words === 16 && signed === true) return just(int)
	if (words === 16 && signed === false) return just(int)
	if (words === 32 && signed === true) return just(int)
	if (words === 32 && signed === false) return just(int)
	if (words === 64 && signed === true) return just(int)
	if (words === 64 && signed === false) return just(int)
	if (words === 128 && signed === true) return just(int)
	if (words === 128 && signed === false) return just(int)
	if (words === 256 && signed === true) return just(int)
	if (words === 256 && signed === false) return just(int)
	return wordsError(
		new UnconstructableInteger(words, signed, value.toString(10))
	)
}
