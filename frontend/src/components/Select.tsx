interface SelectProps<T> {
  id: string;
  label: string;
  options: T[];
  value: string; // the selected option's value ('' = nothing selected)
  onChange: (value: string) => void;
  getValue: (option: T) => string;
  getLabel: (option: T) => string;
  isOptionDisabled?: (option: T) => boolean;
  placeholder?: string;
  disabled?: boolean;
}

// Reusable generic dropdown: Select<Book>, Select<Member>, Select<string> ...
export function Select<T>({
  id,
  label,
  options,
  value,
  onChange,
  getValue,
  getLabel,
  isOptionDisabled,
  placeholder = 'Select...',
  disabled = false,
}: SelectProps<T>) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={getValue(option)} value={getValue(option)} disabled={isOptionDisabled?.(option)}>
            {getLabel(option)}
          </option>
        ))}
      </select>
    </div>
  );
}
