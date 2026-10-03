/**
 * Палитра стеблей для интерактива «Сборка букета».
 * kind управляет рисунком SVG-гравюры, hue — тон бутона.
 * [ДЕМО] цены за стебель.
 */
export type StemKind = 'peony' | 'ranunculus' | 'tulip' | 'delphinium' | 'eucalyptus' | 'grass'

export type Stem = {
  id: string
  name: string
  kind: StemKind
  /** Тон бутона в гравюре */
  hue: string
  /** [ДЕМО] цена за стебель */
  price: number
}

export const STEMS: Stem[] = [
  { id: 'peony', name: 'Пион', kind: 'peony', hue: '#e17a8e', price: 620 },
  { id: 'ranunculus', name: 'Ранункулюс', kind: 'ranunculus', hue: '#e8d9c4', price: 380 },
  { id: 'tulip', name: 'Тюльпан', kind: 'tulip', hue: '#c9556b', price: 240 },
  { id: 'delphinium', name: 'Дельфиниум', kind: 'delphinium', hue: '#8d9bc2', price: 340 },
  { id: 'eucalyptus', name: 'Эвкалипт', kind: 'eucalyptus', hue: '#6f7d6a', price: 190 },
  { id: 'grass', name: 'Берграс', kind: 'grass', hue: '#5a6b52', price: 90 },
]

/** Максимум стеблей в композиции — дальше ваза «полна» */
export const MAX_STEMS = 9
