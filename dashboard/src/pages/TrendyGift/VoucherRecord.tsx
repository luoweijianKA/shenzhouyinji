import React, { useState, useCallback, useEffect } from 'react';
import {
    Box,
    Button,
    Grid,
    Link,
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
import { Download, Search } from 'react-feather';
import { gql, useQuery } from '@apollo/client';
import Loading from 'components/Loading';
import Empty from 'components/Empty';
import DateRangeButton from 'components/DateRangeButton';

/**
 * 兑换券记录管理页面组件
 *
 * 功能：
 * - 展示兑换券的使用记录
 * - 支持已兑换和未兑换两种状态的记录查询
 * - 提供搜索功能，支持按多种条件筛选记录
 * - 支持分页显示记录
 * - 提供导出Excel功能
 *
 * 使用的状态：
 * - page: 当前页码
 * - rowsPerPage: 每页显示的行数
 * - tabValue: 当前选中的标签页（已兑换或未兑换）
 * - searchParams: 搜索表单数据，包括景区名称、兑换券规则、产品名称、使用人等
 *
 * 主要方法：
 * - handleInputChange: 处理搜索表单输入框的变更
 * - handleSearch: 处理搜索操作
 * - handleChangePage: 处理分页变更
 * - handleChangeRowsPerPage: 处理每页行数变更
 * - handleTabChange: 处理标签页切换
 * - handleExport: 导出Excel文件
 * - handleViewDetail: 查看兑换券记录详情
 *
 * GraphQL查询：
 * - GET_VOUCHER_RECORDS: 查询兑换券记录数据
 *
 * 模拟数据：
 * - mockData: 用于展示的兑换券记录数据
 *
 * 主要组件：
 * - Tabs/Tab: 标签页组件，用于切换已兑换和未兑换记录
 * - Table: 表格组件，用于展示兑换券记录
 * - TablePagination: 表格分页组件
 * - TextField: 输入框组件，用于搜索条件输入
 * - Button: 按钮组件，用于触发搜索和导出操作
 * - Link: 链接组件，用于查看详情
 * - Loading: 加载状态组件
 * - Empty: 空数据状态组件
 * - DateRangeButton: 日期范围选择组件
 */

const GET_VOUCHER_RECORDS = gql`
  query GetVoucherRecords($input: VoucherRecordInput!) {
    voucherRecords(input: $input) {
      id
      sceneryName
      voucherRule
      validTime
      productName
      userName
      userPhone
      useTime
      status
    }
  }
`;

/**
 * 兑换券记录数据结构 (GraphQL返回)
 */
interface VoucherRecordData {
    id: string;
    sceneryName: string;
    voucherRule: string;
    validTime: string;
    productName: string;
    userName: string;
    userPhone: string;
    useTime: string;
    status: string;
}

/**
 * GraphQL查询结果结构
 */
interface GetVoucherRecordsQuery {
    voucherRecords: {
        records: VoucherRecordData[];
        totalCount?: number;
    }
}

/**
 * 搜索参数数据结构
 */
interface SearchParams {
    sceneryName: string;
    voucherRule: string;
    productName: string;
    userName: string;
    userPhone: string;
    useTimeStart: string;
    useTimeEnd: string;
    status: string;
}

const INITIAL_SEARCH_PARAMS: Omit<SearchParams, 'status'> = {
    sceneryName: '',
    voucherRule: '',
    productName: '',
    userName: '',
    userPhone: '',
    useTimeStart: '',
    useTimeEnd: '',
};

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
 * 自定义TabPanel组件
 */
function TabPanel(props: TabPanelProps) {
    const {children, value, index, hidden = false, ...other} = props;
    return (
        <div role="tabpanel" hidden={hidden || value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
            {!hidden && value === index && children}
        </div>
    );
}

/**
 * 生成Tabs可访问性属性
 */
function a11yProps(index: number) {
    return { id: `simple-tab-${index}`, 'aria-controls': `simple-tabpanel-${index}` };
}

/**
 * 兑换券记录页面
 */
const VoucherRecord: React.FC = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [tabValue, setTabValue] = useState(0); // 0: 已使用, 1: 未使用
    const [searchParams, setSearchParams] = useState<SearchParams>(() => ({
         ...INITIAL_SEARCH_PARAMS,
         status: 'used',
    }));

    const { data, loading, error } = useQuery<GetVoucherRecordsQuery>(GET_VOUCHER_RECORDS, {
        variables: { input: searchParams },
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true,
    });

    useEffect(() => {
        if (error) {
            console.error("Error fetching voucher records:", error);
        }
    }, [error]);

    const rows: VoucherRecordData[] = data?.voucherRecords?.records || [];
    const totalCount = data?.voucherRecords?.totalCount || 0;

    const displayRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const handleChangePage = useCallback((event: unknown, newPage: number) => {
        setPage(newPage);
    }, []);

    const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    }, []);

    const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setPage(0);
        setSearchParams(prev => ({
            ...prev,
            status: newValue === 0 ? 'used' : 'unused'
        }));
    }, []);

    const handleSearch = useCallback(() => {
        setPage(0);
        console.log("Triggering search with params:", searchParams);
    }, [searchParams]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: value }));
    }, []);

     const handleDateRangeChange = useCallback((dates: number[] | null) => {
        setSearchParams(prev => ({
            ...prev,
            useTimeStart: dates && dates.length === 2 ? new Date(dates[0]).toISOString() : '',
            useTimeEnd: dates && dates.length === 2 ? new Date(dates[1]).toISOString() : '',
        }));
    }, []);

    const handleExport = useCallback(() => {
        console.log("Exporting data with filters:", searchParams);
    }, [searchParams]);

    const handleViewDetail = useCallback((id: string) => {
        console.log('Viewing detail for ID:', id);
    }, []);

    return (
        <Box sx={{ pt: 8}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                 <Typography variant="subtitle1" color="text.secondary" sx={{ position: 'absolute', top: 24 }}>潮品礼遇</Typography>
                <Typography variant="h5" component="h2">兑换券记录</Typography>
                <Button
                    variant="contained"
                    onClick={handleExport}
                    startIcon={<Download size={18} />}
                    sx={{bgcolor: '#C01A12', '&:hover': {bgcolor: '#A51710'}}}
                >
                    导出Excel
                </Button>
            </Box>

            <Paper sx={{p: 3, mb: 3}}>
                <Grid container spacing={2} alignItems="center">
                     <Grid item xs={12} sm={6} md={3}>
                         <TextField fullWidth size="small" label="景区名称" name="sceneryName" value={searchParams.sceneryName} onChange={handleInputChange} />
                     </Grid>
                     <Grid item xs={12} sm={6} md={3}>
                         <TextField fullWidth size="small" label="兑换券规则" name="voucherRule" value={searchParams.voucherRule} onChange={handleInputChange} />
                     </Grid>
                     <Grid item xs={12} sm={6} md={3}>
                         <TextField fullWidth size="small" label="产品名称" name="productName" value={searchParams.productName} onChange={handleInputChange} />
                     </Grid>
                     <Grid item xs={12} sm={6} md={3}>
                         <TextField fullWidth size="small" label="使用人" name="userName" value={searchParams.userName} onChange={handleInputChange} />
                     </Grid>
                     <Grid item xs={12} sm={6} md={3}>
                         <TextField fullWidth size="small" label="使用人手机号" name="userPhone" value={searchParams.userPhone} onChange={handleInputChange} />
                     </Grid>
                     <Grid item xs={12} sm={6} md={5} sx={{ display: 'flex', alignItems: 'center' }}>
                         <Typography variant="body2" sx={{ mr: 1, whiteSpace: 'nowrap' }}>使用时间:</Typography>
                         <DateRangeButton onChange={handleDateRangeChange} />
                     </Grid>
                     <Grid item xs={12} sm={6} md={1} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                         <Button
                             variant="contained"
                             onClick={handleSearch}
                             startIcon={<Search size={18} />}
                             sx={{bgcolor: '#C01A12', '&:hover': {bgcolor: '#A51710'}}}
                         >
                             搜索
                         </Button>
                     </Grid>
                </Grid>
            </Paper>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="voucher record tabs">
                    <Tab label="已使用" {...a11yProps(0)} />
                    <Tab label="未使用" {...a11yProps(1)} />
                </Tabs>
            </Box>

            <Box sx={{ position: 'relative', minHeight: '300px' }}>
                 {loading && <Loading />}
                 <TabPanel value={tabValue} index={tabValue} hidden={loading}>
                     {!loading && rows.length === 0 && <Empty />}
                     {!loading && rows.length > 0 && (
                         <TableContainer component={Paper}>
                             <Table>
                                 <TableHead>
                                     <TableRow>
                                         <TableCell>编号</TableCell>
                                         <TableCell>景区名称</TableCell>
                                         <TableCell>兑换券规则</TableCell>
                                         <TableCell>有效期时间</TableCell>
                                         <TableCell>产品名称</TableCell>
                                         <TableCell>使用人</TableCell>
                                         <TableCell>使用人手机</TableCell>
                                         <TableCell>使用时间</TableCell>
                                         <TableCell>操作</TableCell>
                                     </TableRow>
                                 </TableHead>
                                 <TableBody>
                                     {displayRows.map((row) => (
                                         <TableRow key={row.id}>
                                             <TableCell>{row.id}</TableCell>
                                             <TableCell>{row.sceneryName}</TableCell>
                                             <TableCell>{row.voucherRule}</TableCell>
                                             <TableCell>{row.validTime}</TableCell>
                                             <TableCell>{row.productName}</TableCell>
                                             <TableCell>{row.userName}</TableCell>
                                             <TableCell>{row.userPhone}</TableCell>
                                             <TableCell>{row.useTime}</TableCell>
                                             <TableCell>
                                                 <Link component="button" variant="body2" onClick={() => handleViewDetail(row.id)} sx={{ textDecoration: 'underline' }}>
                                                     查看
                                                 </Link>
                                             </TableCell>
                                         </TableRow>
                                     ))}
                                 </TableBody>
                             </Table>
                             <TablePagination
                                 component="div"
                                 count={totalCount}
                                 rowsPerPage={rowsPerPage}
                                 page={page}
                                 onPageChange={handleChangePage}
                                 onRowsPerPageChange={handleChangeRowsPerPage}
                                 rowsPerPageOptions={[20, 50, 100]}
                                 labelRowsPerPage="页面数量:"
                                 labelDisplayedRows={({from, to, count}) => `${from}-${to} / ${count}`}
                             />
                         </TableContainer>
                     )}
                 </TabPanel>
             </Box>
        </Box>
    );
};

export default VoucherRecord;
