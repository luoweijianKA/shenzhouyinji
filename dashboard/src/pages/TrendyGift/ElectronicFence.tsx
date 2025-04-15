import React, {useState} from 'react';
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
} from '@mui/material';
import { Search, Close } from '@mui/icons-material';
import { AddCircleOutline } from '@mui/icons-material';
import Loading from 'components/Loading';
import Empty from 'components/Empty';
import QQMap from 'components/QQMap';

interface ElectronicFenceData {
    id: string | number;
    sceneryName: string;
    fenceName: string;
    createTime: string;
    updateTime: string;
}

interface FenceFormData {
    sceneryName: string;
    locationSearch: string;
    fenceName: string;
    fenceCoordinates: string;
    tolerance: string;
}

const ElectronicFence: React.FC = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [searchParams, setSearchParams] = useState({
        sceneryName: '',
    });
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [formData, setFormData] = useState<FenceFormData>({
        sceneryName: '',
        locationSearch: '',
        fenceName: '',
        fenceCoordinates: '',
        tolerance: '',
    });

    const mockData: ElectronicFenceData[] = Array.from({ length: 100 }, (_, i) => ({
        id: `100000${i}`,
        sceneryName: '丹霞山风景区',
        fenceName: '239876897766655555778888899',
        createTime: '2026-03-14 12:00:00',
        updateTime: '2026-03-14 12:00:00'
    }));

    const loading = false;
    const refetch = () => console.log("Refetching electronic fences...");

    const rows = mockData;
    const displayRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearch = () => {
        setPage(0);
        refetch();
        console.log("Searching fences with:", searchParams);
    };

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchParams({
            ...searchParams,
            [e.target.name]: e.target.value
        });
    };

    const handleDialogInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMapChange = (coordinates: string) => {
        setFormData(prev => ({ ...prev, fenceCoordinates: coordinates }));
        console.log("Fence Coordinates:", coordinates);
    };

    const handleSearchLocation = () => {
        console.log("Searching location:", formData.locationSearch);
    };

    const handleOpenAddDialog = () => {
        setFormData({
            sceneryName: '',
            locationSearch: '',
            fenceName: '',
            fenceCoordinates: '',
            tolerance: '',
        });
        setOpenAddDialog(true);
    }

    const handleCloseAddDialog = () => {
        setOpenAddDialog(false);
    }

    const handleAddSubmit = () => {
        console.log('Adding electronic fence:', formData);
        handleCloseAddDialog();
    };

    return (
        <Box sx={{p: 3, pt: 4}}>
            <Box sx={{mb: 2}}>
                <Typography variant="subtitle1" color="text.secondary">潮品礼遇</Typography>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Typography variant="h5" component="h2">
                        电子围栏
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddCircleOutline/>}
                        onClick={handleOpenAddDialog}
                        sx={{bgcolor: '#F44336', '&:hover': {bgcolor: '#D32F2F'}}}
                    >
                        添加
                    </Button>
                </Box>
            </Box>

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
                    <Grid item xs={12} sm={8} sx={{display: 'flex', justifyContent: 'flex-end'}}>
                        <Button
                            variant="contained"
                            startIcon={<Search/>}
                            onClick={handleSearch}
                            sx={{bgcolor: '#F44336', '&:hover': {bgcolor: '#D32F2F'}}}
                        >
                            搜索
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Box sx={{ position: 'relative', minHeight: '300px' }}>
                 {loading && <Loading />}
                 {!loading && rows.length === 0 && <Empty />}
                 {!loading && rows.length > 0 && (
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
                                            <Button size="small" sx={{ color: '#F44336', textDecoration: 'underline', p: 0, minWidth: 'auto', '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}>查看</Button>
                                            <Button size="small" sx={{ color: '#F44336', textDecoration: 'underline', p: 0, minWidth: 'auto', ml: 1, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}>编辑</Button>
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
                         {/* Scenic Area */}
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

                         {/* Location Search */}
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
                                     bgcolor: '#F44336', 
                                     '&:hover': { bgcolor: '#D32F2F' },
                                     height: '40px' // Match text field height
                                 }}
                                 onClick={handleSearchLocation}
                                 size="medium" // Match text field height
                             >
                                 搜索
                             </Button>
                         </Box>

                         {/* Fence Name */}
                         <Box sx={{ display: 'flex', alignItems: 'center' }}>
                             <FormLabel required sx={{ minWidth: 100, textAlign: 'right', mr: 2 }}>*电子围栏名称:</FormLabel>
                             <TextField
                                 required
                                 fullWidth
                                 name="fenceName"
                                 value={formData.fenceName}
                                 onChange={handleDialogInputChange}
                                 size="small"
                             />
                         </Box>

                         {/* Map Component */}
                         <Box sx={{ height: 400, width: '100%', mt: 1, border: '1px solid #ccc' }}>
                             {/* Render QQMap only when dialog is open to ensure container exists */}
                             {openAddDialog && (
                                 <QQMap
                                     overlay="marker"
                                     onChange={handleMapChange}
                                     value={formData.fenceCoordinates} // Pass current coordinates if editing
                                 />
                             )}
                         </Box>

                         {/* Tolerance */}
                         <Box sx={{ display: 'flex', alignItems: 'center' }}>
                             <FormLabel sx={{ minWidth: 100, textAlign: 'right', mr: 2 }}>定位容错:</FormLabel>
                             <TextField
                                 name="tolerance"
                                 value={formData.tolerance}
                                 onChange={handleDialogInputChange}
                                 size="small"
                                 type="number"
                                 placeholder="请输入整数，单位KM" // Placeholder from image
                                 InputProps={{ sx: { width: '200px' } }} // Limit width
                             />
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
