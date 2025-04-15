import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
} from '@mui/material';
import {Download, Search} from '@mui/icons-material';
import Loading from "components/Loading";
import Empty from "components/Empty";

/**
 * 兑换记录数据结构
 */
interface ExchangeRecordData {
    id: number;
    sceneryName: string;
    voucherName: string;
    expireTime: string;
    productName: string;
    verifier: string;
    user: string;
    userPhone: string;
    useTime: string;
}

/**
 * 搜索参数数据结构
 */
interface SearchParams {
    sceneryName: string;
    voucherRule: string;
    productName: string;
    verifier: string;
    user: string;
    userPhone: string;
    useTimeStart: string;
    useTimeEnd: string;
}

const INITIAL_SEARCH_PARAMS: SearchParams = {
    sceneryName: '',
    voucherRule: '',
    productName: '',
    verifier: '',
    user: '',
    userPhone: '',
    useTimeStart: '',
    useTimeEnd: '',
};

// Mock data
const mockData: ExchangeRecordData[] = Array.from({ length: 579 * 20 }, (_, i) => ({
    id: i + 1,
    sceneryName: '丹霞山风景区',
    voucherName: '玩偶兑换券',
    expireTime: '2026-03-14 12:00:00',
    productName: '杯子',
    verifier: '张三',
    user: '哈哈哈',
    userPhone: '13378987656',
    useTime: '2026-03-14 12:00:00',
}));

/**
 * 自定义TabPanel组件
 */
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
    hidden?: boolean;
}
function TabPanel(props: TabPanelProps) {
    const {children, value, index, hidden = false, ...other} = props;
    return (
        <div role="tabpanel" hidden={hidden || value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
            {!hidden && value === index && children}
        </div>
    );
}
function a11yProps(index: number) {
    return { id: `simple-tab-${index}`, 'aria-controls': `simple-tabpanel-${index}` };
}

/**
 * 兑换记录页面
 */
const ExchangeRecord: React.FC = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [tabValue, setTabValue] = useState(0);
    const [searchParams, setSearchParams] = useState<SearchParams>(INITIAL_SEARCH_PARAMS);

    const [recordData, setRecordData] = useState<ExchangeRecordData[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorState, setErrorState] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        console.log("Refetching data with filters:", searchParams, "Tab:", tabValue);
        setLoading(true);
        setErrorState(null);
        try {
            // TODO: 使用真实API调用逻辑替换
            // const fetchedData = await fetchExchangeRecords({ ... });
            // setRecordData(fetchedData.records || []);
            // setTotalCount(fetchedData.totalCount || 0);
            await new Promise(resolve => setTimeout(resolve, 500));
            setRecordData(mockData.filter(item => 
                 (tabValue === 0 ? item.useTime !== null : item.useTime === null)
            ));

        } catch (error) {
            console.error("Failed to fetch exchange records:", error);
            setErrorState(error as Error);
        } finally {
            setLoading(false);
        }
    }, [searchParams, tabValue]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSearch = useCallback(() => {
        setPage(0);
        refetch();
    }, [refetch]);

    const handleChangePage = useCallback((event: unknown, newPage: number) => {
        setPage(newPage);
    }, []);

    const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }, []);

    const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setPage(0);
    }, []);

    const handleExport = useCallback(() => {
        console.log("Exporting data with filters:", searchParams, "Tab:", tabValue);
    }, [searchParams, tabValue]);

    const displayRows = useMemo(() => recordData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [recordData, page, rowsPerPage]);
    const currentTotalCount = recordData.length;

    return (
        <Box sx={{p: 3, pt: 8}}>
            <Box sx={{mb: 2}}>
                <Typography variant="subtitle1" color="text.secondary">潮品礼遇</Typography>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Typography variant="h5" component="h2">
                        兑换券记录
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Download/>}
                        onClick={handleExport}
                        sx={{bgcolor: '#C01A12', '&:hover': {bgcolor: '#A51710'}}}
                    >
                        导出Excel
                    </Button>
                </Box>
            </Box>

            <Paper sx={{p: 3, mb: 3}}>
                <Grid container spacing={2} alignItems="center">
                     <Grid item xs={12} sm={6} md={3}>
                         <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                             <Typography variant="body2" sx={{ minWidth: '80px', textAlign: 'right', mr: 1 }}>景区名称:</Typography>
                             <TextField fullWidth name="sceneryName" value={searchParams.sceneryName} onChange={handleInputChange} size="small" />
                         </Box>
                     </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                         <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              <Typography variant="body2" sx={{ minWidth: '80px', textAlign: 'right', mr: 1 }}>兑换券规则:</Typography>
                             <TextField fullWidth name="voucherRule" value={searchParams.voucherRule} onChange={handleInputChange} size="small" />
                         </Box>
                     </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                             <Typography variant="body2" sx={{ minWidth: '80px', textAlign: 'right', mr: 1 }}>产品名称:</Typography>
                             <TextField fullWidth name="productName" value={searchParams.productName} onChange={handleInputChange} size="small" />
                         </Box>
                     </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                         <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                             <Typography variant="body2" sx={{ minWidth: '80px', textAlign: 'right', mr: 1 }}>核销人员:</Typography>
                             <TextField fullWidth name="verifier" value={searchParams.verifier} onChange={handleInputChange} size="small" />
                         </Box>
                     </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              <Typography variant="body2" sx={{ minWidth: '80px', textAlign: 'right', mr: 1 }}>使用人员:</Typography>
                             <TextField fullWidth name="user" value={searchParams.user} onChange={handleInputChange} size="small" />
                         </Box>
                     </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                         <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                             <Typography variant="body2" sx={{ minWidth: '90px', textAlign: 'right', mr: 1 }}>使用人员手机:</Typography>
                             <TextField fullWidth name="userPhone" value={searchParams.userPhone} onChange={handleInputChange} size="small" />
                          </Box>
                     </Grid>
                      <Grid item xs={12} sm={8} md={5}>
                         <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              <Typography variant="body2" sx={{ minWidth: '80px', textAlign: 'right', mr: 1 }}>使用时间:</Typography>
                             <TextField fullWidth name="useTimeStart" type="datetime-local" value={searchParams.useTimeStart} onChange={handleInputChange} InputLabelProps={{shrink: true}} size="small" sx={{ mr: 1 }} />
                             <Typography sx={{ mx: 1 }}>至</Typography>
                             <TextField fullWidth name="useTimeEnd" type="datetime-local" value={searchParams.useTimeEnd} onChange={handleInputChange} InputLabelProps={{ shrink: true }} size="small" sx={{ ml: 1 }} />
                         </Box>
                     </Grid>
                     <Grid item xs={12} sm={4} md={1} sx={{display: 'flex', justifyContent: 'flex-end'}}>
                         <Button variant="contained" onClick={handleSearch} startIcon={<Search/>} sx={{bgcolor: '#C01A12', '&:hover': {bgcolor: '#A51710'}}}>
                             搜索
                         </Button>
                     </Grid>
                </Grid>
            </Paper>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="exchange record tabs">
                    <Tab label="已兑换" {...a11yProps(0)} />
                    <Tab label="未兑换" {...a11yProps(1)} />
                </Tabs>
            </Box>

            <Box sx={{ position: 'relative', minHeight: '300px' }}>
                {loading && <Loading />}
                {errorState ? <Typography color="error">Failed to load records: {errorState.message}</Typography> : null}
                <TabPanel value={tabValue} index={0} hidden={loading || !!errorState}>
                     {!loading && !errorState && displayRows.length === 0 && <Empty />} 
                     {!loading && !errorState && displayRows.length > 0 && (
                         <TableContainer component={Paper}>
                             <Table>
                                 <TableHead>
                                     <TableRow>
                                         <TableCell>编号</TableCell>
                                         <TableCell>景区名称</TableCell>
                                         <TableCell>兑换券名称</TableCell>
                                         <TableCell>有效期时间</TableCell>
                                         <TableCell>产品名称</TableCell>
                                         <TableCell>核销人员</TableCell>
                                         <TableCell>使用人员</TableCell>
                                         <TableCell>使用人员手机</TableCell>
                                         <TableCell>使用时间</TableCell>
                                     </TableRow>
                                 </TableHead>
                                 <TableBody>
                                     {displayRows.map((row) => (
                                         <TableRow key={row.id}>
                                             <TableCell>{row.id}</TableCell>
                                             <TableCell>{row.sceneryName}</TableCell>
                                             <TableCell>{row.voucherName}</TableCell>
                                             <TableCell>{row.expireTime}</TableCell>
                                             <TableCell>{row.productName}</TableCell>
                                             <TableCell>{row.verifier}</TableCell>
                                             <TableCell>{row.user}</TableCell>
                                             <TableCell>{row.userPhone}</TableCell>
                                             <TableCell>{row.useTime}</TableCell>
                                         </TableRow>
                                     ))}
                                 </TableBody>
                             </Table>
                             <TablePagination
                                 rowsPerPageOptions={[20, 50, 100]}
                                 component="div"
                                 count={currentTotalCount}
                                 labelRowsPerPage="页面数量:"
                                 labelDisplayedRows={({from, to, count}) => `${from}-${to} / ${count}`}
                                 rowsPerPage={rowsPerPage}
                                 page={page}
                                 onPageChange={handleChangePage}
                                 onRowsPerPageChange={handleChangeRowsPerPage}
                             />
                         </TableContainer>
                     )}
                 </TabPanel>
             </Box>
        </Box>
    );
};

export default ExchangeRecord;
