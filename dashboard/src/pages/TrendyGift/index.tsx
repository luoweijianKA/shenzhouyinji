import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { Box } from '@mui/material';

import ExchangeVoucher from './ExchangeVoucher';
import DiscountVoucher from './DiscountVoucher';
import ExchangeRecord from './ExchangeRecord';
import DiscountRecord from './DiscountRecord';
import GeoFence from './GeoFence';

const TrendyGift: React.FC = () => {
  const { path } = useRouteMatch();

  return (
    <Box sx={{ p: 3 }}>
      <Switch>
        <Route exact path={`${path}/exchange-voucher`} component={ExchangeVoucher} />
        <Route exact path={`${path}/discount-voucher`} component={DiscountVoucher} />
        <Route exact path={`${path}/exchange-record`} component={ExchangeRecord} />
        <Route exact path={`${path}/discount-record`} component={DiscountRecord} />
        <Route exact path={`${path}/geo-fence`} component={GeoFence} />
      </Switch>
    </Box>
  );
};

export default TrendyGift;
