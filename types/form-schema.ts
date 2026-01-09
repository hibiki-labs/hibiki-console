/**
 * Parsed field configuration for dynamic forms
 */
export interface ParsedField {
  /** Unique field identifier */
  id: string;
  /** Display label for the field */
  label: string;
  /** Input type: 'text' or 'number' */
  inputType: 'text' | 'number';
  /** Maximum character/digit length */
  maxLength?: number;
  /** Number of decimal places (for number inputs) */
  decimalScale?: number;
  /** Whether the field is required */
  required?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Default value */
  defaultValue?: string | number;
}
