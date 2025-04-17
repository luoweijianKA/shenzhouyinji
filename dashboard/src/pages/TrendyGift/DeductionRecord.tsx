import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { debounce } from 'lodash';
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
import {LinkButton, PageHeader, Title, DatePickerWrapper} from "../styled";
import Loading from 'components/Loading';
import Empty from 'components/Empty';

/**
 * 自定义TabPanel组件属性
 */
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
    hidden?: boolean;
}

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
}

/**
 * 自定义TabPanel组件
 */
function TabPanel(props: TabPanelProps) {
    const {children, value, index, hidden = false, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={hidden || value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {!hidden && value === index && children}
        </div>
    );
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
 * 搜索参数数据结构
 */
interface SearchParams {
    sceneryName: string;
    deductionRule: string;
    productName: string;
    verifier: string;
    user: string;
    userPhone: string;
    useTimeStart: string;
    useTimeEnd: string;
}

const INITIAL_SEARCH_PARAMS: SearchParams = {
    sceneryName: '',
    deductionRule: '',
    productName: '',
    verifier: '',
    user: '',
    userPhone: '',
    useTimeStart: '',
    useTimeEnd: '',
};

// Keep mock data definition for reference or development
const mockData: DeductionRecordData[] = Array.from({ length: 579 * 20 }, (_, i) => ({
    id: `mock-${i + 1}`,
    sceneryName: '丹霞山风景区',
    deductionName: '玩偶兑换券',
    validTime: '2026-03-14 12:00:00',
    user: '哈哈哈',
    productName: '杯子',
    verifier: '张三',
    userPhone: '13378987656',
    useTime: '2026-03-14 12:00:00'
}));

/**
 * 抵扣记录页面
 */
const DeductionRecord: React.FC = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [tabValue, setTabValue] = useState(0);
    const [searchParams, setSearchParams] = useState<SearchParams>(INITIAL_SEARCH_PARAMS);

    // Initialize with empty array, data should be fetched
    const [recordData, setRecordData] = useState<DeductionRecordData[]>([]);
    const [loading, setLoading] = useState(false); // Use state for loading
    const [errorState, setErrorState] = useState<Error | null>(null); // Use state for error
    // const [totalCount, setTotalCount] = useState(0); // Use state for total count if server-side pagination

    const refetch = useCallback(async () => { // Make async if fetching data
        console.log("Refetching data with filters:", searchParams, "Tab:", tabValue);
        setLoading(true); // Start loading
        setErrorState(null); // Clear previous errors
        try {
            // TODO: 使用真实API调用逻辑替换
            // const fetchedData = await fetchDeductionRecords({
            //     ...searchParams,
            //     status: tabValue === 0 ? 'used' : 'unused',
            //     page,
            //     rowsPerPage
            // });
            // setRecordData(fetchedData.records || []); // Update state with fetched data
            // setTotalCount(fetchedData.totalCount || 0); // If pagination is server-side

            // TODO: 暂时使用模拟数据，后续移除
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
            setRecordData(mockData.filter(item =>
                (tabValue === 0 ? item.useTime !== null : item.useTime === null) // Simple filter based on tab
                // Add filtering based on searchParams here if mock data is used extensively
            )); // <-- Example usage of setRecordData

        } catch (error) {
            console.error("Failed to fetch deduction records:", error);
            setErrorState(error as Error); // Handle error state
        } finally {
            setLoading(false); // Stop loading
        }
    }, [searchParams, tabValue]); // Add page, rowsPerPage if using them in fetch

    // TODO: 根据需要取消注释以在依赖项更改时获取数据
    useEffect(() => {
        refetch();
    }, [refetch]); // refetch includes searchParams and tabValue as dependencies

    // TODO: 如果使用服务器端分页，请使用totalCount
    const displayRows = useMemo(() => recordData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [recordData, page, rowsPerPage]);
    const currentTotalCount = recordData.length; // For client-side pagination
    // const currentTotalCount = totalCount; // For server-side pagination

    const handleChangePage = useCallback((event: unknown, newPage: number) => {
        setPage(newPage);
        // TODO: 如果不是所有数据都加载到客户端，则考虑重新获取新页面的数据
        // refetch();
    }, []);

    const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        // TODO: 使用新的rowsPerPage重新获取数据
        // refetch(); // Refetch data with new rowsPerPage
    }, []);

    const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setPage(0); // Reset page when tab changes
        // TODO: 为新选项卡重新获取数据
        // refetch(); // Refetch data for the new tab
    }, []);

    const debouncedSearch = useMemo(
        () => debounce(() => {
            setPage(0); // Reset page on new search
            refetch();
        }, 500),
        [refetch]
    );

    const handleSearch = useCallback(() => {
        debouncedSearch();
    }, [debouncedSearch]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        debouncedSearch();
        const { name, value } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: value }));
    }, []);

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
                                name="sceneryName"
                                value={searchParams.sceneryName}
                                onChange={handleInputChange}
                                size="small"
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Typography variant="body2" sx={{ minWidth: '80px', textAlign: 'right', mr: 1 }}>抵扣券规则:</Typography>
                            <TextField
                                fullWidth
                                name="deductionRule"
                                value={searchParams.deductionRule}
                                onChange={handleInputChange}
                                size="small"
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Typography variant="body2" sx={{ minWidth: '80px', textAlign: 'right', mr: 1 }}>产品名称:</Typography>
                            <TextField
                                fullWidth
                                name="productName"
                                value={searchParams.productName}
                                onChange={handleInputChange}
                                size="small"
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Typography variant="body2" sx={{ minWidth: '80px', textAlign: 'right', mr: 1 }}>核销人员:</Typography>
                            <TextField
                                fullWidth
                                name="verifier"
                                value={searchParams.verifier}
                                onChange={handleInputChange}
                                size="small"
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Typography variant="body2" sx={{ minWidth: '80px', textAlign: 'right', mr: 1 }}>使用人员:</Typography>
                            <TextField
                                fullWidth
                                name="user"
                                value={searchParams.user}
                                onChange={handleInputChange}
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
                                onChange={handleInputChange}
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
                                        value={searchParams.useTimeStart ? new Date(searchParams.useTimeStart) : null}
                                        onChange={(val) => handleInputChange({ target: { name: 'useTimeStart', value: val ? val.toISOString().split('T')[0] : '' } } as any)}
                                        renderInput={(params) => <TextField {...params} size="small" />}
                                    />
                                </DatePickerWrapper>
                                <Typography sx={{ mx: 1 }}>至</Typography>
                                <DatePickerWrapper>
                                    <DesktopDatePicker
                                        inputFormat="yyyy-MM-dd"
                                        value={searchParams.useTimeEnd ? new Date(searchParams.useTimeEnd) : null}
                                        onChange={(val) => handleInputChange({ target: { name: 'useTimeEnd', value: val ? val.toISOString().split('T')[0] : '' } } as any)}
                                        renderInput={(params) => <TextField {...params} size="small" />}
                                    />
                                </DatePickerWrapper>
                            </LocalizationProvider>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={4} md={1} sx={{display: 'flex', justifyContent: 'flex-end'}}>
                        <Button variant="contained" onClick={handleSearch}  sx={{bgcolor: '#C01A12', '&:hover': {bgcolor: '#A51710'}, width: '100px', height: '36px'}}>
                            搜索
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
                    {/* Show error message if fetch failed */}
                    {errorState && <Typography color="error">Failed to load records: {errorState.message}</Typography>}
                    {/* Use TabPanel for content switching */}
                    <TabPanel value={tabValue} index={0} hidden={loading || !!errorState}>
                        {!loading && !errorState && displayRows.length === 0 && <Empty />}
                        {!loading && !errorState && displayRows.length > 0 && (
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
                                    count={currentTotalCount} // Use state variable for count
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
                    {/* Add TabPanel for index 1 if needed */}
                    {/*
                    <TabPanel value={tabValue} index={1} hidden={loading || !!errorState}>
                        ... content for tab 1 ...
                    </TabPanel>
                    */}
                </Box>
            </Box>
        </Box>
    );
};

export default DeductionRecord;
