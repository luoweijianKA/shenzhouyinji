import React, { useState, useCallback, useMemo } from 'react'
import {
    Box,
    Button,
    Grid,
    Paper,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Tabs,
    TextField,
    Typography,
    Breadcrumbs,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import cnLocale from 'date-fns/locale/zh-CN';
import { LinkButton, PageHeader, Title, DatePickerWrapper } from "../styled";
import Loading from 'components/Loading';
import Empty from 'components/Empty';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const COUPON_LIST = gql`
  query CouponList(
    $first: Int = 20
    $after: ID
    $last: Int = 20
    $before: ID
    $type: String
    $stateCode: String
    $tideSpotName: String
    $tideSpotId: String
    $generateRule: String
    $buyGoodName: String
    $verificationWechatName: String
    $userWechatName: String
    $userPhone: String
    $useTimeStart: Int
    $useTimeEnd: Int
    $userWechat: String
    $backSearch: Boolean
    $tideSpotConfigId: String
  ) {
    couponList(
      first: $first
      after: $after
      last: $last
      before: $before
      type: $type
      stateCode: $stateCode
      tideSpotName: $tideSpotName
      tideSpotId: $tideSpotId
      generateRule: $generateRule
      buyGoodName: $buyGoodName
      verificationWechatName: $verificationWechatName
      userWechat: $userWechat
      userWechatName: $userWechatName
      userPhone: $userPhone
      useTimeStart: $useTimeStart
      useTimeEnd: $useTimeEnd
      backSearch: $backSearch
      tideSpotConfigId: $tideSpotConfigId
    ) {
      totalCount
      edges {
        node {
          id
          type
          typeText
          tideSpotName
          couponName
          desc
          effectiveTime
          createTime
          qrCodePath
          state
          stateText
          userWechatName
          buyGoodName
          verificationWechatName
          userPhone
          useTime
        }
        __typename
      }
      pageInfo {
        startCursor
        endCursor
        hasPreviousPage
        hasNextPage
        __typename
      }
      __typename
    }
  }
`;

/**
 * 抵扣记录数据结构
 */
interface DeductionRecordData {
    id: string | number;
    sceneryName: string;
    deductionName: string;
    validTime: string;
    user: string;
    productName: string;
    verifier: string;
    userPhone: string;
    useTime: string;
    state: 'Used' | 'Normal' | 'Expired';
    stateText: string;
}

/**
 * 搜索参数数据结构
 */
interface SearchParams {
    tideSpotName: string;
    generateRule: string;
    buyGoodName: string;
    verificationWechatName: string;
    userWechatName: string;
    userPhone: string;
    useTimeStart: number;
    useTimeEnd: number;
    userWechat: string;
    tideSpotConfigId: string;
}

const INITIAL_SEARCH_PARAMS: SearchParams = {
    tideSpotName: '',
    generateRule: '',
    buyGoodName: '',
    verificationWechatName: '',
    userWechatName: '',
    userPhone: '',
    useTimeStart: 0,
    useTimeEnd: 0,
    userWechat: '',
    tideSpotConfigId: ''
};

// Remove unused mock data
// const mockData: DeductionRecordData[] = Array.from({ length: 579 * 20 }, (_, i) => ({
//     id: `mock-${i + 1}`,
//     sceneryName: '丹霞山风景区',
//     deductionName: '玩偶兑换券',
//     validTime: '2026-03-14 12:00:00',
//     user: '哈哈哈',
//     productName: '杯子',
//     verifier: '张三',
//     userPhone: '13378987656',
//     useTime: '2026-03-14 12:00:00'
// }));

interface CouponNode {
    id: string;
    type: string;
    typeText: string;
    tideSpotName: string;
    couponName: string;
    desc: string;
    effectiveTime: string;
    createTime: string;
    qrCodePath: string;
    state: 'Used' | 'Normal' | 'Expired';
    stateText: string;
    userWechatName: string;
    buyGoodName: string;
    verificationWechatName: string;
    userPhone: string;
    useTime: string;
}

interface CouponEdge {
    node: CouponNode;
    __typename: string;
}

/**
 * 生成Tabs可访问性属性
 */
function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

/**
 * 抵扣记录页面
 */
const DeductionRecord: React.FC = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [tabValue, setTabValue] = useState(0);
    const [searchParams, setSearchParams] = useState<SearchParams>(INITIAL_SEARCH_PARAMS);

    const { loading, data, refetch } = useQuery(COUPON_LIST, {
        variables: {
            first: rowsPerPage,
            last: rowsPerPage,
            type: 'Deduction',
            after: '',
            stateCode: tabValue === 0 ? 'Used' : 'Normal',
            backSearch: true,
            ...searchParams
        },
        fetchPolicy: 'network-only'
    });

    // Convert API data to display format
    const displayRows = useMemo(() => {
        console.log('Raw data from API:', data); // Debug log
        if (!data?.couponList?.edges) return [];
        
        const transformedData = data.couponList.edges
            .map(({ node }: CouponEdge) => {
                console.log('Processing node:', node); // Debug log
                return {
                    id: node.id,
                    sceneryName: node.tideSpotName || '未知景区',
                    deductionName: node.couponName,
                    validTime: new Date(parseInt(node.effectiveTime) * 1000).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    }).replace(/\//g, '-'),
                    user: node.userWechatName || '',
                    productName: node.buyGoodName || '',
                    verifier: node.verificationWechatName || '',
                    userPhone: node.userPhone || '',
                    useTime: node.useTime ? new Date(parseInt(node.useTime) * 1000).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    }).replace(/\//g, '-') : '',
                    state: node.state,
                    stateText: node.stateText
                };
            })
            .filter((row: DeductionRecordData) => {
                const matchesSearch = Object.entries(searchParams).every(([key, value]) => {
                    if (!value) return true;
                    const rowValue = row[key as keyof DeductionRecordData];
                    return rowValue?.toString().toLowerCase().includes(value.toLowerCase());
                });
                return matchesSearch;
            });
        
        console.log('Transformed data:', transformedData); // Debug log
        return transformedData;
    }, [data?.couponList?.edges, tabValue, searchParams]);

    const handleChangePage = useCallback((event: unknown, newPage: number) => {
        setPage(newPage);
        const cursor = newPage > page
            ? data?.couponList?.pageInfo?.endCursor
            : data?.couponList?.pageInfo?.startCursor;
        refetch({
            first: rowsPerPage,
            last: rowsPerPage,
            type: 'Deduction',
            after: cursor || '',
            stateCode: tabValue === 0 ? 'Used' : 'Normal',
            backSearch: true,
            ...searchParams
        });
    }, [page, data?.couponList?.pageInfo, refetch, rowsPerPage, tabValue, searchParams]);

    const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(0);
        refetch({
            first: newRowsPerPage,
            last: newRowsPerPage,
            type: 'Deduction',
            after: '',
            stateCode: tabValue === 0 ? 'Used' : 'Normal',
            backSearch: true,
            ...searchParams
        });
    }, [refetch, tabValue, searchParams]);

    const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setPage(0);
        refetch({
            first: rowsPerPage,
            last: rowsPerPage,
            type: 'Deduction',
            after: '',
            stateCode: newValue === 0 ? 'Used' : 'Normal',
            backSearch: true,
            ...searchParams
        });
    }, [refetch, rowsPerPage, searchParams]);

    const handleExport = useCallback(() => {
        console.log("Exporting data with filters:", searchParams, "Tab:", tabValue);
        // TODO: 在此处添加实际的导出逻辑（例如，使用像xlsx这样的库）
    }, [searchParams, tabValue]);

    return (
        <Box sx={{ pt: 8}}>
            <PageHeader container>
                <Grid item xs={4}>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Typography color="text.primary">潮品礼遇</Typography>
                    </Breadcrumbs>
                    <Title variant='h1'>抵扣券记录</Title>
                </Grid>
                <Grid item xs={8} sx={{display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end", pr: "10px"}}>
                    <LinkButton
                        disableElevation
                        variant="contained"
                        onClick={handleExport}
                    >
                        导出Excel
                    </LinkButton>
                </Grid>
            </PageHeader>

            <Paper sx={{p: 3, mb: 3}}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Typography variant="body2" sx={{ minWidth: '80px', textAlign: 'right', mr: 1 }}>景区名称:</Typography>
                            <TextField 
                                fullWidth 
                                name="tideSpotName" 
                                value={searchParams.tideSpotName} 
                                onChange={(e) => setSearchParams({ ...searchParams, tideSpotName: e.target.value })} 
                                size="small" 
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Typography variant="body2" sx={{ minWidth: '80px', textAlign: 'right', mr: 1 }}>生成规则:</Typography>
                            <TextField 
                                fullWidth 
                                name="generateRule" 
                                value={searchParams.generateRule} 
                                onChange={(e) => setSearchParams({ ...searchParams, generateRule: e.target.value })} 
                                size="small" 
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Typography variant="body2" sx={{ minWidth: '80px', textAlign: 'right', mr: 1 }}>产品名称:</Typography>
                            <TextField 
                                fullWidth 
                                name="buyGoodName" 
                                value={searchParams.buyGoodName} 
                                onChange={(e) => setSearchParams({ ...searchParams, buyGoodName: e.target.value })} 
                                size="small" 
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Typography variant="body2" sx={{ minWidth: '80px', textAlign: 'right', mr: 1 }}>核销人员:</Typography>
                            <TextField 
                                fullWidth 
                                name="verificationWechatName" 
                                value={searchParams.verificationWechatName} 
                                onChange={(e) => setSearchParams({ ...searchParams, verificationWechatName: e.target.value })} 
                                size="small" 
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Typography variant="body2" sx={{ minWidth: '80px', textAlign: 'right', mr: 1 }}>使用人员:</Typography>
                            <TextField 
                                fullWidth 
                                name="userWechatName" 
                                value={searchParams.userWechatName} 
                                onChange={(e) => setSearchParams({ ...searchParams, userWechatName: e.target.value })} 
                                size="small" 
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Typography variant="body2" sx={{ minWidth: '90px', textAlign: 'right', mr: 1 }}>使用人员手机:</Typography>
                            <TextField 
                                fullWidth 
                                name="userPhone" 
                                value={searchParams.userPhone} 
                                onChange={(e) => setSearchParams({ ...searchParams, userPhone: e.target.value })} 
                                size="small" 
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={8} md={5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Typography variant="body2" sx={{ minWidth: '80px', textAlign: 'right', mr: 1 }}>使用时间:</Typography>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={cnLocale}>
                                <DatePickerWrapper>
                                    <DesktopDatePicker
                                        inputFormat="yyyy-MM-dd"
                                        value={searchParams.useTimeStart ? new Date(searchParams.useTimeStart * 1000) : null}
                                        onChange={(val) => setSearchParams({ ...searchParams, useTimeStart: val ? Math.floor(val.getTime() / 1000) : 0 })}
                                        renderInput={(params) => <TextField {...params} size="small" />}
                                    />
                                </DatePickerWrapper>
                                <Typography sx={{ mx: 1 }}>至</Typography>
                                <DatePickerWrapper>
                                    <DesktopDatePicker
                                        inputFormat="yyyy-MM-dd"
                                        value={searchParams.useTimeEnd ? new Date(searchParams.useTimeEnd * 1000) : null}
                                        onChange={(val) => setSearchParams({ ...searchParams, useTimeEnd: val ? Math.floor(val.getTime() / 1000) : 0 })}
                                        renderInput={(params) => <TextField {...params} size="small" />}
                                    />
                                </DatePickerWrapper>
                            </LocalizationProvider>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={4} md={1} sx={{display: 'flex', justifyContent: 'flex-end'}}>
                        <Button 
                            variant="contained" 
                            onClick={() => refetch({
                                first: rowsPerPage,
                                last: rowsPerPage,
                                type: 'Deduction',
                                after: '',
                                stateCode: tabValue === 0 ? 'Used' : 'Normal',
                                backSearch: true,
                                ...searchParams
                            })}  
                            sx={{bgcolor: '#C01A12', '&:hover': {bgcolor: '#A51710'}, width: '100px', height: '36px'}}
                        >
                            刷新
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Box sx={{ position: 'relative', minHeight: '300px', bgcolor: 'white', pl: '37px', pr: '37px', borderRadius: '10px', boxShadow: 'rgb(90 114 123 / 11%) 0px 7px 30px 0px' }}>
                <Box sx={{ borderBottom: 2, borderColor: 'divider', mb: 0 }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="deduction record tabs">
                        <Tab label="已抵扣" {...a11yProps(0)} />
                        <Tab label="未抵扣" {...a11yProps(1)} />
                    </Tabs>
                </Box>
                <Box sx={{ position: 'relative', minHeight: '300px' }}>
                    {loading && <Loading />}
                    {!loading && displayRows.length === 0 && <Empty />}
                    {!loading && displayRows.length > 0 && (
                        <TableContainer component={Paper} sx={{p: 2, border: 0}}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>景区名称</TableCell>
                                        <TableCell>抵扣券名称</TableCell>
                                        <TableCell>有效期时间</TableCell>
                                        <TableCell>使用人员</TableCell>
                                        <TableCell>产品名称</TableCell>
                                        <TableCell>核销人员</TableCell>
                                        <TableCell>使用人员手机</TableCell>
                                        <TableCell>使用时间</TableCell>
                                        <TableCell>操作</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {displayRows.map((row: DeductionRecordData) => (
                                        <TableRow key={row.id}>
                                            <TableCell>{row.sceneryName}</TableCell>
                                            <TableCell>{row.deductionName}</TableCell>
                                            <TableCell>{row.validTime}</TableCell>
                                            <TableCell>{row.user}</TableCell>
                                            <TableCell>{row.productName}</TableCell>
                                            <TableCell>{row.verifier}</TableCell>
                                            <TableCell>{row.userPhone}</TableCell>
                                            <TableCell>{row.useTime}</TableCell>
                                            <TableCell>
                                                <Button size="small" sx={{ color: '#F44336', textDecoration: 'underline', p: 0, minWidth: 'auto', '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}>查看</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <TablePagination
                                rowsPerPageOptions={[20, 50, 100]}
                                component="div"
                                count={data?.couponList?.totalCount || 0}
                                labelRowsPerPage="页面数量:"
                                labelDisplayedRows={({from, to, count}) => `${from}-${to} / ${count}`}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </TableContainer>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default DeductionRecord;
