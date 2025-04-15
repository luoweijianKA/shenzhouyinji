import React from 'react';
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
import {useState} from "react";
import Loading from "components/Loading";
import Empty from "components/Empty";

/**
 * 兑换记录管理页面组件
 *
 * 功能：
 * - 展示兑换记录的详细信息
 * - 支持已兑换和未兑换两种状态的记录查询
 * - 提供搜索功能，支持按多种条件筛选记录
 * - 支持分页显示记录
 * - 提供导出Excel功能
 *
 * 使用的状态：
 * - page: 当前页码
 * - rowsPerPage: 每页显示的行数
 * - tabValue: 当前选中的标签页（已兑换或未兑换）
 * - formData: 搜索表单数据，包括景区名称、兑换券规则、产品名称等
 *
 * 主要方法：
 * - handleInputChange: 处理搜索表单输入框的变更
 * - handleSearch: 处理搜索操作
 * - handleChangePage: 处理分页变更
 * - handleChangeRowsPerPage: 处理每页行数变更
 * - handleTabChange: 处理标签页切换
 *
 * 模拟数据：
 * - rows: 用于展示的兑换记录数据
 *
 * 主要组件：
 * - Tabs/Tab: 标签页组件，用于切换已兑换和未兑换记录
 * - Table: 表格组件，用于展示兑换记录
 * - TablePagination: 表格分页组件
 * - TextField: 输入框组件，用于搜索条件输入
 * - Button: 按钮组件，用于触发搜索和导出操作
 */

interface ExchangeRecord {
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

const ExchangeRecord: React.FC = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20); // Default to 20 as per design
    const [tabValue, setTabValue] = useState(0);
    const [formData, setFormData] = useState({
        sceneryName: '',
        voucherRule: '',
        productName: '',
        verifier: '',
        user: '',
        userPhone: '',
        useTimeStart: '',
        useTimeEnd: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSearch = () => {
        console.log(formData);
        // Add refetch logic here if needed
    };

    // Mock data, replace with actual data fetching logic
    const rows: ExchangeRecord[] = Array.from({ length: 579 * 20 }, (_, i) => ({
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

    // Mock loading state, replace with actual loading state
    const loading = false;

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const displayRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box sx={{p: 3, pt: 4}}> {/* Adjusted top padding */}
            <Box sx={{mb: 2}}> {/* Added secondary title */}
                <Typography variant="subtitle1" color="text.secondary">潮品礼遇</Typography>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Typography variant="h5" component="h2">
                        兑换券记录
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Download/>}
                    >
                        导出Excel
                    </Button>
                </Box>
            </Box>

            <Paper sx={{p: 3, mb: 3}}>
                <Grid container spacing={2} alignItems="center"> {/* Use alignItems='center' for vertical centering */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Typography variant="body2" sx={{ minWidth: '80px', textAlign: 'right', mr: 1 }}>景区名称:</Typography>
                            <TextField
                                fullWidth
                                name="sceneryName"
                                value={formData.sceneryName}
                                onChange={handleInputChange}
                                size="small"
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                             <Typography variant="body2" sx={{ minWidth: '80px', textAlign: 'right', mr: 1 }}>兑换券规则:</Typography>
                            <TextField
                                fullWidth
                                name="voucherRule"
                                value={formData.voucherRule}
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
                                value={formData.productName}
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
                                value={formData.verifier}
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
                                value={formData.user}
                                onChange={handleInputChange}
                                size="small"
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Typography variant="body2" sx={{ minWidth: '90px', textAlign: 'right', mr: 1 }}>使用人员手机:</Typography> {/* Adjusted width slightly */}
                            <TextField
                                fullWidth
                                name="userPhone"
                                value={formData.userPhone}
                                onChange={handleInputChange}
                                size="small"
                            />
                         </Box>
                    </Grid>
                    <Grid item xs={12} sm={8} md={5}> {/* Adjusted grid size for date range */}
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                             <Typography variant="body2" sx={{ minWidth: '80px', textAlign: 'right', mr: 1 }}>使用时间:</Typography>
                            <TextField
                                fullWidth
                                name="useTimeStart"
                                type="datetime-local"
                                value={formData.useTimeStart}
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
                                value={formData.useTimeEnd}
                                onChange={handleInputChange}
                                InputLabelProps={{ shrink: true }}
                                size="small"
                                sx={{ ml: 1 }}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={4} md={1} sx={{display: 'flex', justifyContent: 'flex-end'}}> {/* Adjusted grid size */}
                        <Button variant="contained" onClick={handleSearch} startIcon={<Search/>}>
                            搜索
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Box sx={{borderBottom: 1, borderColor: 'divider', mb: 3}}>
                <Tabs value={tabValue} onChange={handleTabChange} sx={{minHeight: '40px'}}> {/* Adjusted tab height */}
                    <Tab label="已兑换" sx={{minHeight: '40px', py: 1}}/>
                    <Tab label="未兑换" sx={{minHeight: '40px', py: 1}}/>
                </Tabs>
            </Box>

            {loading ? (
                <Box sx={{p: 3}}><Loading/></Box>
            ) : rows.length === 0 ? (
                <Box sx={{p: 3}}><Empty/></Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>景区名称</TableCell>
                                <TableCell>兑换券名称</TableCell>
                                <TableCell>有效期时间</TableCell>
                                <TableCell>使用人员</TableCell> {/* Swapped with 产品名称 */} 
                                <TableCell>产品名称</TableCell> {/* Swapped with 使用人员 */} 
                                <TableCell>核销人员</TableCell>
                                <TableCell>使用人员手机</TableCell>
                                <TableCell>使用时间</TableCell>
                                <TableCell>操作</TableCell> {/* Added 操作 column */}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {displayRows.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.sceneryName}</TableCell>
                                    <TableCell>{row.voucherName}</TableCell>
                                    <TableCell>{row.expireTime}</TableCell>
                                    <TableCell>{row.user}</TableCell>
                                    <TableCell>{row.productName}</TableCell>
                                    <TableCell>{row.verifier}</TableCell>
                                    <TableCell>{row.userPhone}</TableCell>
                                    <TableCell>{row.useTime}</TableCell>
                                    <TableCell>
                                        <Button size="small" color="primary">查看</Button> {/* Added 查看 button */}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[20, 50, 100]} // Updated options
                        component="div"
                        count={rows.length}
                        labelRowsPerPage="页面数量:" // Chinese label
                        labelDisplayedRows={({from, to, count}) => `${from}-${to} / ${count}`}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        // Adding pagination actions styling if needed
                        // ActionsComponent={TablePaginationActions}
                    />
                </TableContainer>
            )}
        </Box>
    );
};

export default ExchangeRecord;
