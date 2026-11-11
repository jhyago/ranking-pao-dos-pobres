const oneDecimal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 })
const integer = new Intl.NumberFormat('pt-BR')

export const formatPct = (n) => `${oneDecimal.format(n)}%`
export const formatPoints = (n) => integer.format(n)
export const ordinal = (position) => `${position}º`
// Top three get a gold, silver or bronze seal; everyone else a plain one.
export const sealClass = (position) => (position <= 3 ? `seal rank-${position}` : 'seal')
