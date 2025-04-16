import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    Box,
    Button,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormLabel,
    IconButton,
    Breadcrumbs
} from '@mui/material';
import {  Close } from '@mui/icons-material';
import Loading from 'components/Loading';
import Empty from 'components/Empty';
import QQMap from 'components/QQMap';
import { PageHeader,Title,LinkButton } from '../styled';

/**
 * 电子围栏表格行数据结构
 */
interface ElectronicFenceData {
    id: string | number;
    sceneryName: string;
    fenceName: string;
    createTime: string;
    updateTime: string;
}

/**
 * 添加/编辑表单数据结构
 */
interface FenceFormData {
    sceneryName: string;
    locationSearch: string;
    fenceName: string;
    fenceCoordinates: string;
    tolerance: string;
}

const INITIAL_FENCE_FORM_DATA: FenceFormData = {
    sceneryName: '',
    locationSearch: '',
    fenceName: '',
    fenceCoordinates: '',
    tolerance: '',
};

// TODO: 考虑将模拟数据移出或通过API获取
const mockData: ElectronicFenceData[] = Array.from({ length: 100 }, (_, i) => ({
    id: `100000${i}`,
    sceneryName: '丹霞山风景区',
    fenceName: '239876897766655555778888899',
    createTime: '2026-03-14 12:00:00',
    updateTime: '2026-03-14 12:00:00'
}));

/**
 * 电子围栏管理页面
 */
const ElectronicFence: React.FC = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [searchParams, setSearchParams] = useState({ sceneryName: '' }); // 简化的搜索状态
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [formData, setFormData] = useState<FenceFormData>(INITIAL_FENCE_FORM_DATA);

    // TODO: 初始化为空数组，数据应通过API获取
    const [fenceData, setFenceData] = useState<ElectronicFenceData[]>([]);
    const [loading, setLoading] = useState(false); // 加载状态
    const [errorState, setErrorState] = useState<Error | null>(null); // 错误状态

    const refetch = useCallback(async () => { // 如果获取数据，则设为异步
        console.log("Refetching electronic fences with filters:", searchParams);
        setLoading(true);
        setErrorState(null);
        try {
            // TODO: 使用真实API调用逻辑替换
            // const fetchedData = await fetchFences({ ...searchParams, page, rowsPerPage });
            // setFenceData(fetchedData.records || []);
            // setTotalCount(fetchedData.totalCount || 0);

            // TODO: 暂时使用模拟数据，后续移除
            await new Promise(resolve => setTimeout(resolve, 500)); // 模拟延迟
            setFenceData(mockData.filter(item =>
                searchParams.sceneryName ? item.sceneryName.includes(searchParams.sceneryName) : true
            )); // <-- 示例 setFenceData 用法

        } catch (error) {
            console.error("Failed to fetch electronic fences:", error);
            setErrorState(error as Error);
        } finally {
            setLoading(false);
        }
    }, [searchParams]);

    // TODO: 在初始挂载和相关依赖项更改时获取数据
    useEffect(() => {
        refetch();
    }, [refetch]);

    // 记忆化显示的行
    const displayRows = useMemo(() => fenceData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [fenceData, page, rowsPerPage]);
    const currentTotalCount = fenceData.length; // 客户端分页计数

    const handleChangePage = useCallback((event: unknown, newPage: number) => {
        setPage(newPage);
    }, []);

    const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }, []);

    const handleSearch = useCallback(() => {
        setPage(0);
        refetch();
    }, [refetch]);

    const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleDialogInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleMapChange = useCallback((coordinates: string) => {
        setFormData(prev => ({ ...prev, fenceCoordinates: coordinates }));
        console.log("Fence Coordinates:", coordinates);
    }, []);

    const handleSearchLocation = useCallback(() => {
        console.log("Searching map location:", formData.locationSearch);
    }, [formData.locationSearch]);

    const handleOpenAddDialog = useCallback(() => {
        setFormData(INITIAL_FENCE_FORM_DATA); // Reset form on open
        setOpenAddDialog(true);
    }, []);

    const handleCloseAddDialog = useCallback(() => {
        setOpenAddDialog(false);
    }, []);

    const handleAddSubmit = useCallback(async () => { // Make async if submitting data
        console.log('Adding electronic fence:', formData);
        // Add logic to submit formData (e.g., API call)
        // try {
        //    await submitFence(formData);
        //    refetch(); // Refetch table data on success
        //    handleCloseAddDialog();
        // } catch (submitError) {
        //    console.error("Failed to submit fence:", submitError);
        //    // Show error to user in dialog?
        // }
        handleCloseAddDialog(); // Close for now
    }, [formData, handleCloseAddDialog]); // Add refetch if needed

    const handleViewFence = useCallback((id: string | number) => {
        console.log("View fence:", id);
    }, []);

    const handleEditFence = useCallback((fence: ElectronicFenceData) => {
        console.log("Edit fence:", fence);
        // Populate formData with fence data
        // setFormData({
        //    sceneryName: fence.sceneryName,
        //    fenceName: fence.fenceName,
        //    // ... map other fields, potentially fetch coordinates if not stored directly
        // });
        // setOpenAddDialog(true); // Open dialog in edit mode
    }, []);

    return (
        <Box sx={{pt: 8}}>
            <PageHeader container>
            <Grid item xs={4}>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Typography color="text.primary">{"潮品礼遇"}</Typography>
                    </Breadcrumbs>
                    <Title variant='h1'>{"电子围栏"}</Title>
                </Grid>
                <Grid item xs={8} sx={{display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end"}}>
                    <LinkButton
                        disableElevation
                        variant="contained"
                        startIcon={<Box
                            component="img"
                            src="https://gd-1258904493.cos.ap-guangzhou.myqcloud.com/shenzhouyinji/icon_add@3x.png"
                            alt="icon"
                            sx={{width: 20, height: 20}}
                        />}
                        onClick={handleOpenAddDialog}
                        sx={{width: 90, height: 36}}
                    >
                        {"添加"}
                    </LinkButton>
                </Grid>
            </PageHeader>
            <Paper sx={{p: 3, mb: 3}}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                             <Typography variant="body2" sx={{ minWidth: '80px', textAlign: 'right', mr: 1 }}>景区名称:</Typography>
                            <TextField
                                fullWidth
                                name="sceneryName"
                                value={searchParams.sceneryName}
                                onChange={handleSearchInputChange}
                                size="small"
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={8} sx={{display: 'flex', justifyContent: 'flex-end', pr: 0}}>
                        <Button
                            variant="contained"
                            onClick={handleSearch}
                            sx={{bgcolor: '#C01A12', '&:hover': {bgcolor: '#A51710'}, width: '100px', height: '36px'}}
                        >
                            搜索
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Box sx={{ position: 'relative', minHeight: '300px' }}>
                 {loading && <Loading />}
                 {errorState && <Typography color="error">Failed to load fences: {errorState.message}</Typography>}
                 {!loading && !errorState && fenceData.length === 0 && <Empty />}
                 {!loading && !errorState && fenceData.length > 0 && (
                     <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>编号</TableCell>
                                    <TableCell>景区名称</TableCell>
                                    <TableCell>电子围栏</TableCell>
                                    <TableCell>创建时间</TableCell>
                                    <TableCell>修改时间</TableCell>
                                    <TableCell>操作</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {displayRows.map((row: ElectronicFenceData) => (
                                    <TableRow key={row.id}>
                                        <TableCell>{row.id}</TableCell>
                                        <TableCell>{row.sceneryName}</TableCell>
                                        <TableCell>{row.fenceName}</TableCell>
                                        <TableCell>{row.createTime}</TableCell>
                                        <TableCell>{row.updateTime}</TableCell>
                                        <TableCell>
                                            <Button onClick={() => handleViewFence(row.id)} size="small" sx={{ color: '#C01A12', p: 0, minWidth: 'auto', '&:hover': { bgcolor: 'transparent' } }}>查看</Button>
                                            <Button onClick={() => handleEditFence(row)} size="small" sx={{ color: '#C01A12', p: 0, minWidth: 'auto', ml: 1, '&:hover': { bgcolor: 'transparent' } }}>编辑</Button>
                                        </TableCell>
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
             </Box>

            <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
                 <DialogTitle sx={{ m: 0, p: 2, borderBottom: '1px solid #E0E0E0' }}>
                     添加电子围栏
                     <IconButton
                         aria-label="close"
                         onClick={handleCloseAddDialog}
                         sx={{
                             position: 'absolute',
                             right: 8,
                             top: 8,
                         }}
                     >
                         <Close/>
                     </IconButton>
                 </DialogTitle>
                 <DialogContent sx={{ p: 3 }}>
                     <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                         {/* 景区 */}
                         <Box sx={{ display: 'flex', alignItems: 'center' }}>
                             <FormLabel sx={{ minWidth: 100, textAlign: 'right', mr: 2 }}>所属景区:</FormLabel>
                             <TextField
                                 fullWidth
                                 name="sceneryName"
                                 value={formData.sceneryName}
                                 onChange={handleDialogInputChange}
                                 placeholder="输入景区名称"
                                 size="small"
                             />
                         </Box>

                         {/* 定位搜索 */}
                         <Box sx={{ display: 'flex', alignItems: 'center' }}>
                             <FormLabel sx={{ minWidth: 100, textAlign: 'right', mr: 2 }}>定位位置:</FormLabel>
                             <TextField
                                 fullWidth
                                 name="locationSearch"
                                 value={formData.locationSearch}
                                 onChange={handleDialogInputChange}
                                 size="small"
                                 sx={{ mr: 1 }}
                             />
                             <Button
                                 variant="contained"
                                 sx={{
                                     bgcolor: '#C01A12',
                                     '&:hover': { bgcolor: '#A51710' },
                                     height: '40px',
                                     boxShadow: 'none'
                                 }}
                                 onClick={handleSearchLocation}
                                 size="medium"
                             >
                                 搜索
                             </Button>
                         </Box>

                         {/* 电子围栏名称 */}
                         <Box sx={{ display: 'flex', alignItems: 'center' }}>
                             <FormLabel required sx={{ minWidth: 100, textAlign: 'right', mr: 2 }}>*电子围栏:</FormLabel>
                             <TextField
                                 required
                                 fullWidth
                                 name="fenceName"
                                 value={formData.fenceName}
                                 onChange={handleDialogInputChange}
                                 size="small"
                             />
                         </Box>

                         {/* 地图组件 */}
                         <Box sx={{ height: 400, width: '100%', mt: 1 }}>
                             {openAddDialog && (
                                 <QQMap
                                     overlay="marker"
                                     onChange={handleMapChange}
                                     value={formData.fenceCoordinates}
                                 />
                             )}
                         </Box>

                         <Box sx={{mt: 15}}>
                              
                         </Box>

                         {/* 容错 */}
                         <Box sx={{ display: 'flex', alignItems: 'center' }}>
                             <FormLabel sx={{ minWidth: 100, textAlign: 'right', mr: 2 }}>定位容错:</FormLabel>
                             <TextField
                                 name="tolerance"
                                 value={formData.tolerance}
                                 onChange={handleDialogInputChange}
                                 size="small"
                                 type="number"
                                 placeholder="请填写整数，单位KM"
                                 InputProps={{ sx: { width: '200px' } }}
                             />
                             <Typography variant="body2" color="text.secondary" sx={{ml: 1}}>
                                 请填写整数，单位KM
                             </Typography>
                         </Box>

                     </Box>
                 </DialogContent>
                 <DialogActions sx={{ p: 3, pt: 2, borderTop: '1px solid #E0E0E0' }}>
                     <Button onClick={handleCloseAddDialog} sx={{ mr: 1 }}>取消</Button>
                     <Button variant="contained" onClick={handleAddSubmit}>确定</Button>
                 </DialogActions>
             </Dialog>
        </Box>
    );
};

export default ElectronicFence;
