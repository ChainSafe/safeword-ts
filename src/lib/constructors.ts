import BN from 'bn.js'
import {
	Uint8,
	Uint16,
	Uint32,
	Uint64,
	Uint128,
	Uint256,
	Int8,
	Int16,
	Int32,
	Int64,
	Int128,
	Int256,
	Integer,
	Constructable,
	SafeNumber
} from './types'
import { ErrorEnum } from './error'
import { safeUintConstructor } from './helpers'

export const uint8: (
	value: Constructable
) => SafeNumber<ErrorEnum, Uint8> = safeUintConstructor<Uint8>(8)

export const uint16: (
	value: Constructable
) => SafeNumber<ErrorEnum, Uint16> = safeUintConstructor<Uint16>(16)

export const uint32: (
	value: Constructable
) => SafeNumber<ErrorEnum, Uint32> = safeUintConstructor<Uint32>(32)

export const uint64: (
	value: Constructable
) => SafeNumber<ErrorEnum, Uint64> = safeUintConstructor<Uint64>(64)

export const uint128: (
	value: Constructable
) => SafeNumber<ErrorEnum, Uint128> = safeUintConstructor<Uint128>(128)

export const uint256: (
	value: Constructable
) => SafeNumber<ErrorEnum, Uint256> = safeUintConstructor<Uint256>(256)
