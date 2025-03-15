import React from 'react'
import styled from 'styled-components'

const IconWrapper = styled.div`
  width: 20px;
  height: 14px;
  position: relative;
`

const LineBar = styled.div`
  height: 2px;
  background-color: ${({ theme }) => theme.white};
  position: absolute;
  right: 0;
  transition: width .4s ease-in-out;

  left: 0;
  top: 0;
  width: 100%;

  &:nth-child(2){
    top: 6px;
    width: 14px
  }

  &:nth-child(3){
    top: 12px;;
    width: 10px
  }
`

export function MenuIcon() {
  return (
    <IconWrapper>
      <LineBar />
      <LineBar />
      <LineBar />
    </IconWrapper>
  )
}