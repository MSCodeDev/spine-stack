import type { MassUnit } from './spinestack-unit'

export interface Weight {
  value: number
  unit: MassUnit
}

export interface WeightString {
  value: string
  unit: MassUnit
}
