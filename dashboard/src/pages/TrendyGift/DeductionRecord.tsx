import React, {useState} from 'react';
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
import { Search, Download } from '@mui/icons-material';
import Loading from 'components/Loading';
import Empty from 'components/Empty';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
    hidden?: boolean;
}

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

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const DeductionRecord: React.FC = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);

    const [tabValue, setTabValue] = useState(0);

    const [searchParams, setSearchParams] = useState({
        sceneryName: '',
        deductionRule: '',
        productName: '',
        verifier: '',
        user: '',
        userPhone: '',
        useTimeStart: '',
        useTimeEnd: '',
    });

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

    const loading = false;
    const refetch = () => console.log("Refetching data based on filters and tab...");

    const rows = mockData;
    const displayRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setPage(0);
        refetch();
    };

    const handleSearch = () => {
        setPage(0);
        refetch();
        console.log("Searching with:", searchParams)
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchParams({
            ...searchParams,
            [e.target.name]: e.target.value
        });
    };

    return (
        <Box sx={{p: 3, pt: 4}}>
            <Box sx={{mb: 2}}>
                <Typography variant="subtitle1" color="text.secondary">潮品礼遇</Typography>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Typography variant="h5" component="h2">
                        抵扣券记录
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Download/>}
                        sx={{bgcolor: '#F44336', '&:hover': {bgcolor: '#D32F2F'}}}
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
                            <TextField
                                fullWidth
                                name="useTimeStart"
                                type="datetime-local"
                                value={searchParams.useTimeStart}
                                onChange={handleInputChange}
                                InputLabelProps={{shrink: true}}
                                size="small"
                                sx={{ mr: 1 }}
                            />
                            <Typography sx={{ mx: 1 }}>至</Typography>
                            <TextField
                                fullWidth
                                name="useTimeEnd"
                                type="datetime-local"
                                value={searchParams.useTimeEnd}
                                onChange={handleInputChange}
                                InputLabelProps={{ shrink: true }}
                                size="small"
                                sx={{ ml: 1 }}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={4} md={1} sx={{display: 'flex', justifyContent: 'flex-end'}}>
                        <Button variant="contained" onClick={handleSearch} startIcon={<Search/>} sx={{bgcolor: '#F44336', '&:hover': {bgcolor: '#D32F2F'}}}>
                            搜索
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Box sx={{width: '100%'}}>
                <Box sx={{borderBottom: 1, borderColor: 'divider', mb: 3}}>
                    <Tabs value={tabValue} onChange={handleTabChange} sx={{minHeight: '40px'}} indicatorColor="primary" textColor="primary">
                        <Tab label="已抵扣" {...a11yProps(0)} sx={{minHeight: '40px', py: 1}}/>
                        <Tab label="未抵扣" {...a11yProps(1)} sx={{minHeight: '40px', py: 1}}/>
                    </Tabs>
                </Box>
                <Box sx={{ position: 'relative', minHeight: '300px' }}>
                    {loading && <Loading />}
                    {!loading && rows.length === 0 && <Empty />}
                    {!loading && rows.length > 0 && (
                        <TabPanel value={tabValue} index={tabValue}>
                            <TableContainer component={Paper}>
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
                                    count={rows.length}
                                    labelRowsPerPage="页面数量:"
                                    labelDisplayedRows={({from, to, count}) => `${from}-${to} / ${count}`}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                />
                            </TableContainer>
                        </TabPanel>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default DeductionRecord;
