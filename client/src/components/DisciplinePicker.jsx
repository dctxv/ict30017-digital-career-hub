import { useId, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { DISCIPLINE_GROUPS, DISCIPLINES } from '../data/disciplines'
import './DisciplinePicker.css'

const MAX_LENGTH = 100

function normalise(text) {
  return (text ?? '').toLowerCase().trim()
}

/**
 * A searchable list of academic disciplines.
 *
 * It replaced a native select of seven broad buckets, which could not hold the
 * full list without running the length of the page, and could not be searched.
 * Typing filters a fixed-height, scrolling list in either language; a subject
 * the list does not have can still be entered as typed, because the server
 * stores this as free text and someone who studied it should not be told they
 * did not.
 *
 * Follows the ARIA combobox pattern: the text field owns a listbox, the arrow
 * keys move through the options, Enter picks one and Escape backs out.
 */
export default function DisciplinePicker({ id, value, onChange }) {
  const { lang, t } = useLanguage()
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const labelOf = useMemo(() => {
    const byValue = new Map(DISCIPLINES.map(entry => [entry.value, entry]))
    return (stored) => {
      const entry = byValue.get(stored)
      // Something typed in, or one of the old broad buckets: shown as stored.
      if (!entry) return stored ?? ''
      return lang === 'bn' ? entry.bn : entry.en
    }
  }, [lang])

  const needle = normalise(query)

  const groups = useMemo(() => DISCIPLINE_GROUPS
    .map(group => {
      const groupHit = normalise(group.en).includes(needle) || normalise(group.bn).includes(needle)
      const items = group.items
        .filter(([en, bn]) => !needle || groupHit || normalise(en).includes(needle) || normalise(bn).includes(needle))
        .map(([en, bn]) => ({ value: en, label: lang === 'bn' ? bn : en }))
      return { key: group.en, label: lang === 'bn' ? group.bn : group.en, items }
    })
    .filter(group => group.items.length > 0), [needle, lang])

  const exact = DISCIPLINES.some(entry => normalise(entry.en) === needle || normalise(entry.bn) === needle)
  const custom = needle && !exact ? query.trim().slice(0, MAX_LENGTH) : null

  // One flat sequence for the arrow keys, in the order the options render.
  const options = [
    ...(custom ? [{ value: custom, label: t('discipline.useCustom', { value: custom }), custom: true }] : []),
    ...groups.flatMap(group => group.items),
  ]

  const optionId = (index) => `${listId}-opt-${index}`

  const show = () => {
    setQuery('')
    setActive(0)
    setOpen(true)
  }

  const choose = (option) => {
    onChange(option.value)
    setQuery('')
    setOpen(false)
  }

  const moveTo = (index) => {
    setActive(index)
    // Keeps the highlighted option inside the scrolling box.
    requestAnimationFrame(() => {
      document.getElementById(optionId(index))?.scrollIntoView({ block: 'nearest' })
    })
  }

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!open) { show(); return }
      if (options.length) moveTo(Math.min(options.length - 1, active + 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (options.length) moveTo(Math.max(0, active - 1))
    } else if (event.key === 'Enter') {
      // Never submits the surrounding form while the list is open.
      if (open) {
        event.preventDefault()
        if (options[active]) choose(options[active])
      }
    } else if (event.key === 'Escape' && open) {
      event.preventDefault()
      setQuery('')
      setOpen(false)
    }
  }

  let index = custom ? 1 : 0

  return (
    <div className="dp">
      <div className="dp__control">
        <Search size={16} className="dp__icon" aria-hidden="true" />
        <input
          id={id}
          className="input dp__input"
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && options[active] ? optionId(active) : undefined}
          autoComplete="off"
          maxLength={MAX_LENGTH}
          placeholder={value ? labelOf(value) : t('discipline.searchPlaceholder')}
          value={open ? query : labelOf(value)}
          onFocus={show}
          onClick={() => { if (!open) show() }}
          onChange={event => { setQuery(event.target.value); setActive(0); setOpen(true) }}
          onKeyDown={onKeyDown}
          onBlur={() => { setOpen(false); setQuery('') }}
        />
        {value && !open && (
          <button
            type="button"
            className="dp__clear"
            aria-label={t('discipline.clear')}
            title={t('discipline.clear')}
            onClick={() => onChange('')}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {open && (
        <ul
          id={listId}
          className="dp__list"
          role="listbox"
          aria-label={t('discipline.listLabel')}
          // A press inside the list must not blur the field before the click
          // lands, or the list would close under the pointer.
          onMouseDown={event => event.preventDefault()}
        >
          {custom && (
            <li
              id={optionId(0)}
              role="option"
              aria-selected={false}
              className={`dp__option dp__option--custom${active === 0 ? ' dp__option--active' : ''}`}
              onMouseEnter={() => setActive(0)}
              onClick={() => choose(options[0])}
            >
              {options[0].label}
            </li>
          )}

          {groups.map(group => (
            <li key={group.key} role="presentation">
              <p className="dp__group" aria-hidden="true">{group.label}</p>
              <ul role="group" aria-label={group.label} className="dp__group-list">
                {group.items.map(item => {
                  const at = index++
                  const selected = item.value === value
                  return (
                    <li
                      key={item.value}
                      id={optionId(at)}
                      role="option"
                      aria-selected={selected}
                      className={`dp__option${at === active ? ' dp__option--active' : ''}${selected ? ' dp__option--selected' : ''}`}
                      onMouseEnter={() => setActive(at)}
                      onClick={() => choose(item)}
                    >
                      {item.label}
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}

          {options.length === 0 && (
            <li className="dp__empty" role="presentation">{t('discipline.noMatch')}</li>
          )}
        </ul>
      )}
    </div>
  )
}
