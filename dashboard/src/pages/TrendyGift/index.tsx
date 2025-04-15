import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { Box } from '@mui/material';

import ExchangeVoucher from './ExchangeVoucher';
import DiscountVoucher from './DiscountVoucher';
import ExchangeRecord from './ExchangeRecord';
import DeductionRecord from './DeductionRecord';
import ElectronicFence from "./ElectronicFence";

const TrendyGift: React.FC = () => {
  const { path } = useRouteMatch();

  return (
    <Box sx={{ p: 3 }}>
      <Switch>
        <Route exact path={`${path}/exchange-voucher`} component={ExchangeVoucher} />
        <Route exact path={`${path}/discount-voucher`} component={DiscountVoucher} />
        <Route exact path={`${path}/exchange-record`} component={ExchangeRecord} />
        <Route exact path={`${path}/discount-record`} component={DeductionRecord} />
        <Route exact path={`${path}/geo-fence`} component={ElectronicFence} />
      </Switch>
    </Box>
  );
};

export default TrendyGift;
