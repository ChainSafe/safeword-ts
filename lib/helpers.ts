import { BN } from 'bn.js'
import {
	Constructable,
	SafeNumber,
	liftSafeNumber,
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
	MetaInteger
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
	WordsError,
	wordsError,
	UnconstructableInteger,
	Just,
	just,
	ErrorEnum
} from './error'

Function.prototype['c'] = function<Input, Output>(f: (x: Input) => Output) {
	return (x: Input) => this(f(x))
}

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

const lFloatingPointCheck = liftSafeNumber(floatingPointCheck)

export const constructBN = (value: Constructable): SafeNumber<any, BN> => {
	if (typeof value === 'number' || typeof value === 'string') {
		return just(new BN(value, 10))
	}
	return just(value)
}

const lConstructBN = liftSafeNumber(constructBN)

export const byteLengthCheck = (words: number) => (
	num: BN
): SafeNumber<InvalidSizeError, BN> =>
	num.byteLength() > words
		? wordsError(new InvalidSizeError(words, num.byteLength()))
		: just(num)

const lByteLengthCheck = (words: number) =>
	liftSafeNumber(byteLengthCheck(words))

export const negativeCheck = (num: BN): SafeNumber<NegativeUnsignedError, BN> =>
	num.isNeg() ? wordsError(new NegativeUnsignedError()) : just(num)

const lNegativeCheck = liftSafeNumber(negativeCheck)

export const constructInteger = <Words extends Integer>(words: WordsEnum) => (
	signed: boolean
) => (value: BN): Just<Words> => {
	const int = {
		words,
		signed,
		value
	}
	return just(specializeInteger<Words>(int))
}

const lConstructInteger = <Words extends Integer>(words: WordsEnum) => (
	signed: boolean
) => liftSafeNumber(constructInteger<Words>(words)(signed))

/**
 * @section Safe Constructors
 */

export const safeUintConstructor = <Words extends Integer>(
	words: WordsEnum
) => (value: Constructable): SafeNumber<ErrorEnum, Words> =>
	lConstructInteger<Words>(words)(false)(
		lNegativeCheck(
			lByteLengthCheck(words)(lConstructBN(lFloatingPointCheck(just(value))))
		)
	)
// negativeCheck['.'](byteLengthCheck(words))
// 		['.'](constructBN)
// 		['.'](floatingPointCheck)

/**
 * @section Typing Functions
 */

export const loudlyExtractSafeNumber = (
	safeNumber: SafeNumber<ErrorEnum, Integer>
) => {
	if (safeNumber.isError) throw safeNumber
	return safeNumber
}
export const extractSafeNumber = (safeNumber: SafeNumber<ErrorEnum, Integer>) =>
	safeNumber.isError ? safeNumber : safeNumber

export const specializeInteger = <Words extends Integer>(int: {
	words: WordsEnum
	signed: boolean
	value: BN
}): Integer => {
	const { words, signed, value } = int
	if (words === 8 && signed === true) return <Int8>{ words, signed, value }
	if (words === 8 && signed === false) return <Uint8>{ words, signed, value }
	if (words === 16 && signed === true) return <Int16>{ words, signed, value }
	if (words === 16 && signed === false) return <Uint16>{ words, signed, value }
	if (words === 32 && signed === true) return <Int32>{ words, signed, value }
	if (words === 32 && signed === false) return <Uint32>{ words, signed, value }
	if (words === 64 && signed === true) return <Int64>{ words, signed, value }
	if (words === 64 && signed === false) return <Uint64>{ words, signed, value }
	if (words === 128 && signed === true) return <Int128>{ words, signed, value }
	if (words === 128 && signed === false)
		return <Uint128>{ words, signed, value }
	if (words === 256 && signed === true) return <Int256>{ words, signed, value }
	if (words === 256 && signed === false)
		return <Uint256>{ words, signed, value }
}
