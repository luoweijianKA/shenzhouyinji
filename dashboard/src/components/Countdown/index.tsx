import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { AutoColumn } from '../Column';
import { RowBetween } from '../Row';

const Wrapper = styled.div`
  padding: 0;
`;

const Count = styled.div<{ size?: string }>`
  padding: ${({ size }) => (size === 'sm' ? '0' : '8px')};
  font-weight: 700;
  text-align: center;
  min-width: ${({ size }) => (size === 'sm' ? '25px' : '60px')};
  line-height: ${({ size }) => (size === 'sm' ? '14px' : '45px')};

  > div {
    font-size: 12px;
    font-weight: 500;
    text-align: center;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 0.875rem;
    min-width: 24px;
    width: 24px;
    line-height: 24px;
    padding: 0;
    margin: 0;
  `};
`;

const Clock = styled.div`
  display: flex;
`;

const ClockSeparator = styled.div<{ size?: string }>`
  display: flex;
  box-sizing: border-box;
  margin: 0;  
  font-size: ${({ size }) => (size === 'sm' ? '14px' : '24px')};
  font-weigth: 700;
  align-items: center;
  margin-top: -4px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 0.875rem;
    line-height: 24px;
    margin: 0;
  `};
`;

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

export function Countdown({
  exactEnd,
  size,
}: {
  exactEnd?: Date;
  size?: string;
}) {
  // const { t } = useTranslation()

  const end = useMemo(
    () => (exactEnd ? Math.floor(exactEnd.getTime() / 1000) : 0),
    [exactEnd]
  );
  const [time, setTime] = useState(() => Math.floor(Date.now() / 1000));

  useEffect((): (() => void) | void => {
    if (time <= end) {
      const timeout = setTimeout(
        () => setTime(Math.floor(Date.now() / 1000)),
        1000
      );
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [time, end]);

  let timeRemaining: number;
  timeRemaining = end - time;

  const days = (timeRemaining - (timeRemaining % DAY)) / DAY;
  timeRemaining -= days * DAY;
  const hours = (timeRemaining - (timeRemaining % HOUR)) / HOUR;
  timeRemaining -= hours * HOUR;
  const minutes = (timeRemaining - (timeRemaining % MINUTE)) / MINUTE;
  timeRemaining -= minutes * MINUTE;
  const seconds = timeRemaining;

  return (
    <Wrapper>
      <AutoColumn gap="8px" style={{ justifyContent: 'center' }}>
        <RowBetween align="center">
          <Clock>
            <Count size={size}>
              {hours > 0 || days > 0 ? (hours + days * 24).toString().padStart(2, '0') : '00'}
            </Count>
            <ClockSeparator size={size}>:</ClockSeparator>
            <Count size={size}>
              {minutes > 0 ? minutes.toString().padStart(2, '0') : '00'}
            </Count>
            <ClockSeparator size={size}>:</ClockSeparator>
            <Count size={size}>
              {seconds > 0 ? seconds.toString().padStart(2, '0') : '00'}
            </Count>
          </Clock>
        </RowBetween>
      </AutoColumn>
    </Wrapper>
  );
}
