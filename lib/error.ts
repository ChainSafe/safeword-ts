import { Integer } from './types'

export class TypeNotSupportedError extends Error {
	constructor() {
		super('Handling this type is not supported.')
	}
}
export class InvalidSizeError extends Error {
	constructor(expectedSize: number, actualSize: number) {
		super(
			`Invalid size, expected size: ${expectedSize}, actual size: ${actualSize}`
		)
	}
}

export class NegativeUnsignedError extends Error {
	constructor() {
		super('Cannot construct negative unsigned integers')
	}
}
export class OverflowError extends Error {
	constructor(capacity: number, number: number, requiredSize: number) {
		super(
			`Overflow error: capacity ${capacity}, number: ${number}, required size: ${requiredSize}`
		)
	}
}
export class UnderflowError extends Error {
	constructor(capacity: number, number: number, requiredSize: number) {
		super(
			`Underflow error: capacity ${capacity}, number: ${number}, required size: ${requiredSize}`
		)
	}
}
export class InconsistentSizeError extends Error {
	constructor(requiredSize: number, inputSize: number) {
		super(
			`Cannot perform operations on different sized numbers. required size: ${requiredSize}, input size: ${inputSize}`
		)
	}
}
export class FloatingPointNotSupportedError extends Error {
	constructor() {
		super('This library does not support decimals.')
	}
}
export class DivisionByZeroError extends Error {
	constructor() {
		super('Division by zero.')
	}
}
export class UnconstructableInteger extends Error {
	constructor(words: number, signed: boolean, value: string) {
		super(
			`Could not construct Integer of size: ${words}, signed: ${signed}, value: ${value} `
		)
	}
}

export interface WordsError<Error> {
	isError: true
	error: Error
}
export const wordsError = (error: ErrorEnum): WordsError<ErrorEnum> => ({
	isError: true,
	error
})

export interface Just<Value> {
	isError: false
	value: Value
}
export const just = <ValueType>(value: ValueType): Just<ValueType> => ({
	isError: false,
	value
})

export type ErrorEnum =
	| TypeNotSupportedError
	| InvalidSizeError
	| NegativeUnsignedError
	| OverflowError
	| UnderflowError
	| InconsistentSizeError
	| FloatingPointNotSupportedError
	| DivisionByZeroError
	| UnconstructableInteger
