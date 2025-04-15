import React from 'react';
import {Route, Switch, useRouteMatch} from 'react-router-dom';
import {Box} from '@mui/material';

import ExchangeVoucher from './ExchangeVoucher';
import DiscountVoucher from './DiscountVoucher';
import ExchangeRecord from './ExchangeRecord';
import DeductionRecord from './DeductionRecord';
import ElectronicFence from "./ElectronicFence";

/**
 * 潮流礼品管理页面组件
 *
 * 功能：
 * - 提供多个子页面的路由管理，包括兑换券、折扣券、兑换记录、抵扣记录和电子围栏管理
 * - 使用 `react-router-dom` 的 `Switch` 和 `Route` 组件实现页面切换
 * - 使用 Material-UI 的 `Box` 组件进行页面布局
 *
 * 使用的状态：
 * - path: 当前路由的基础路径，由 `useRouteMatch` 提供
 *
 * 主要组件：
 * - ExchangeVoucher: 兑换券管理页面
 * - DiscountVoucher: 折扣券管理页面
 * - ExchangeRecord: 兑换记录管理页面
 * - DeductionRecord: 抵扣记录管理页面
 * - ElectronicFence: 电子围栏管理页面
 *
 * 主要方法：
 * - 无需额外方法，直接通过路由配置实现页面切换
 */

const TrendyGift: React.FC = () => {
    const {path} = useRouteMatch();

    return (
        <Box sx={{p: 3}}>
            <Switch>
                <Route exact path={`${path}/exchange-voucher`} component={ExchangeVoucher}/>
                <Route exact path={`${path}/discount-voucher`} component={DiscountVoucher}/>
                <Route exact path={`${path}/exchange-record`} component={ExchangeRecord}/>
                <Route exact path={`${path}/discount-record`} component={DeductionRecord}/>
                <Route exact path={`${path}/geo-fence`} component={ElectronicFence}/>
            </Switch>
        </Box>
    );
};

export default TrendyGift;
