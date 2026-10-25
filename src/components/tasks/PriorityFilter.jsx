import { FilterChips } from '../common/FilterChips'
import { PRIORITY_OPTIONS } from '../../utils/constants'

// Priority filter chips with an "all" option.
const OPTIONS = [{ value: 'all', labelKey: 'filters.all' }, ...PRIORITY_OPTIONS]

export function PriorityFilter({ value, onChange }) {
  return <FilterChips options={OPTIONS} value={value} onChange={onChange} />
}
