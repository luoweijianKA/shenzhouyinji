import React, { useCallback } from 'react'
import {
    FormControl,
    OutlinedInput,
 } from '@mui/material'
import { escapeRegExp } from '../../utils'

const inputRegex = RegExp(`^[-]?\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group

export const Input = React.memo(function InnerInput({
  value,
  onUserInput,
  placeholder,
  ...rest
}: {
  value: string | number
  onUserInput: (input: string) => void
  error?: boolean
  fontSize?: string
  align?: 'right' | 'left'
} & Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'onChange' | 'as'>) {
  const enforcer = (nextUserInput: string) => {
    if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
      onUserInput(nextUserInput)
    }
  }

  const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    event.currentTarget.select()
  }, [])

  return (
    <FormControl variant="outlined">
      <OutlinedInput
        sx={{
          width: "120px",
          "& .MuiOutlinedInput-input": {
            textAlign: "right",
            fontSize: "0.875rem",
          },
          '& .MuiOutlinedInput-notchedOutline': {
              '& > legend': {
                  float: 'left !important',
              }
          },
        }}
        size="small"
        value={value}
        error={rest.error}
        maxRows={1}
        onChange={(e) => {
           enforcer(e.target.value.replace(/,/g, '.'))
        }}
        onFocus={handleFocus}
      />
    </FormControl>
    // <StyledInput
    //   {...rest}
    //   value={value}
    //   onChange={event => {
    //     // replace commas with periods, because uniswap exclusively uses period as the decimal separator
    //     enforcer(event.target.value.replace(/,/g, '.'))
    //   }}
    //   // universal input options
    //   inputMode="decimal"
    //   title="Token Amount"
    //   autoComplete="off"
    //   autoCorrect="off"
    //   // text-specific options
    //   type="text"
    //   pattern="^[0-9]*[.,]?[0-9]*$"
    //   placeholder={placeholder || ''}
    //   minLength={1}
    //   maxLength={79}
    //   spellCheck="false"
    // />
  )
})

export default Input