import styled from 'styled-components';

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;
export const ColumnCenter = styled(Column)`
  width: 100%;
  align-items: center;
`;

export const AutoColumn = styled.div<{
  gap?: 'xs' | 'sm' | 'md' | 'lg' | string;
  justify?:
    | 'stretch'
    | 'center'
    | 'start'
    | 'end'
    | 'flex-start'
    | 'flex-end'
    | 'space-between';
}>`
  display: grid;
  grid-auto-rows: auto;
  grid-row-gap: ${({ gap }) =>
    (gap === 'xs' && '4px') ||
    (gap === 'sm' && '8px') ||
    (gap === 'md' && '12px') ||
    (gap === 'lg' && '24px') ||
    gap};
  justify-items: ${({ justify }) => justify && justify};
`;

export default Column;
