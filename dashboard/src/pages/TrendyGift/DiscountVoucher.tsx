import React, { useState, useCallback } from 'react';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormLabel,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import {
    AddCircleOutline,
    Close,
    RemoveCircleOutline,
    ConfirmationNumber,
    MonetizationOn,
    LocalOffer,
    ReceiptLong,
    CameraAlt
} from '@mui/icons-material';

/**
 * 统计信息卡片
 */
interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({title, value, icon, bgColor}) => (
    <Paper sx={{p: 2, display: 'flex', alignItems: 'center'}}>
        <Box sx={{
            mr: 2,
            p: 1.5,
            bgcolor: bgColor,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
        }}>
            {icon}
        </Box>
        <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                {title}
            </Typography>
            <Typography variant="h5" fontWeight="bold">
                {value}
            </Typography>
        </Box>
    </Paper>
);

/**
 * 抵扣券表格行数据结构
 */
interface DiscountVoucherRow {
    id: number;
    sceneryName: string;
    voucherName: string;
    useLimit: string;
    expireTime: string;
    totalCount: number;
    discountedCount: number;
    undiscountedCount: number;
    discountAmount: number;
    triggerRule: string;
    createTime: string;
    status: '正常' | '已过期' | '已终止';
}

/**
 * 抵扣规则数据结构
 */
interface DiscountRule {
    id: number;
    totalAmount: string;
    discountAmount: string;
}

/**
 * 适用商品数据结构
 */
interface ApplicableProduct {
    id: number;
    name: string;
    barcode: string;
}

/**
 * 添加/编辑表单数据结构
 */
interface FormData {
    sceneryId: string;
    voucherName: string;
    keywordMatch: string;
    voucherImage: string;
    matchImage: string;
    useLimit: string;
    expireTime: string;
    discountRules: DiscountRule[];
    applicableProducts: ApplicableProduct[];
}

const INITIAL_FORM_DATA: FormData = {
    sceneryId: '',
    voucherName: '',
    keywordMatch: '',
    voucherImage: '',
    matchImage: '',
    useLimit: '',
    expireTime: '',
    discountRules: [{ id: Date.now(), totalAmount: '', discountAmount: '' }],
    applicableProducts: [{ id: Date.now(), name: '', barcode: '' }],
};

// Mock data - consider moving or fetching
// TODO: 考虑将模拟数据移出或通过API获取
const mockStats = [
    {title: '生成抵扣券（张）', value: '6783', icon: <ConfirmationNumber/>, bgColor: '#F44336'},
    {title: '抵扣金额（元）', value: '6783', icon: <MonetizationOn/>, bgColor: '#FF9800'},
    {title: '已抵扣数（张）', value: '6783', icon: <LocalOffer/>, bgColor: '#FFEB3B'},
    {title: '未抵扣数（张）', value: '6783', icon: <ReceiptLong/>, bgColor: '#4CAF50'},
];
const mockRows: DiscountVoucherRow[] = Array.from({ length: 579 * 20 }, (_, i) => ({
    id: i + 1,
    sceneryName: '丹霞山风景区',
    voucherName: '玩偶兑换券',
    useLimit: '只能在景区使用',
    expireTime: '2026-03-14 12:00:00',
    totalCount: 1000,
    discountedCount: 300,
    undiscountedCount: 700,
    discountAmount: 700,
    triggerRule: '关键字: 丹霞山, 上传图片: 图片, 关键字: 丹霞山, 图标: logo',
    createTime: '2026-03-14 12:00:00',
    status: i % 3 === 0 ? '正常' : (i % 3 === 1 ? '已过期' : '已终止'),
}));

/**
 * 抵扣券管理页面
 */
const DiscountVoucher: React.FC = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

    const handleOpen = useCallback(() => {
        setFormData(INITIAL_FORM_DATA);
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => setOpen(false), []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSelectChange = useCallback((e: SelectChangeEvent<string>) => {
         const { name, value } = e.target;
         setFormData(prev => ({ ...prev, [name as keyof FormData]: value }));
    }, []);

    const handleProductChange = useCallback((index: number, field: keyof Omit<ApplicableProduct, 'id'>, value: string) => {
        setFormData(prev => ({
            ...prev,
            applicableProducts: prev.applicableProducts.map((product, i) =>
                i === index ? { ...product, [field]: value } : product
            )
        }));
    }, []);

    const addProduct = useCallback(() => {
        setFormData(prev => ({
            ...prev,
            applicableProducts: [...prev.applicableProducts, { id: Date.now(), name: '', barcode: '' }]
        }));
    }, []);

    const removeProduct = useCallback((idToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            applicableProducts: prev.applicableProducts.length > 1
                ? prev.applicableProducts.filter(product => product.id !== idToRemove)
                : prev.applicableProducts
        }));
    }, []);

    const handleRuleChange = useCallback((index: number, field: keyof Omit<DiscountRule, 'id'>, value: string) => {
        setFormData(prev => ({
            ...prev,
            discountRules: prev.discountRules.map((rule, i) =>
                i === index ? { ...rule, [field]: value } : rule
            )
        }));
    }, []);

    const addRule = useCallback(() => {
        setFormData(prev => ({
            ...prev,
            discountRules: [...prev.discountRules, { id: Date.now(), totalAmount: '', discountAmount: '' }]
        }));
    }, []);

    const removeRule = useCallback((idToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            discountRules: prev.discountRules.length > 1
                ? prev.discountRules.filter(rule => rule.id !== idToRemove)
                : prev.discountRules
        }));
    }, []);

    const handleSubmit = useCallback(() => {
        console.log("Submitting Discount Voucher:", formData);
        handleClose();
    }, [formData, handleClose]);

    const handleChangePage = useCallback((event: unknown, newPage: number) => setPage(newPage), []);

    const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }, []);

    const displayRows = mockRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const getStatusChipColor = useCallback((status: DiscountVoucherRow['status']) => {
        switch (status) {
            case '正常':
                return 'success';
            case '已过期':
                return 'warning';
            case '已终止':
                return 'error';
            default:
                return 'default';
        }
    }, []);

    /**
     * 渲染添加/编辑弹窗内容
     */
    const renderDialogContent = () => (
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormLabel sx={{ minWidth: 120, textAlign: 'right', mr: 2 }}>所属景区:</FormLabel>
                <FormControl fullWidth size="small">
                    <InputLabel id="scenery-select-label" sx={{ ...(formData.sceneryId && { display: 'none' }) }}>请选择</InputLabel>
                    <Select
                        labelId="scenery-select-label"
                        name="sceneryId"
                        value={formData.sceneryId}
                        onChange={handleSelectChange}
                        displayEmpty
                        label={formData.sceneryId ? undefined : "请选择"}
                    >
                        <MenuItem value="" disabled>请选择</MenuItem>
                        <MenuItem value="1">丹霞山风景区</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormLabel required sx={{ minWidth: 120, textAlign: 'right', mr: 2 }}>*抵扣券名称:</FormLabel>
                <TextField required fullWidth name="voucherName" value={formData.voucherName} onChange={handleInputChange} size="small" />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormLabel sx={{ minWidth: 120, textAlign: 'right', mr: 2 }}>比对凭证关键字:</FormLabel>
                <TextField fullWidth name="keywordMatch" value={formData.keywordMatch} onChange={handleInputChange} size="small" />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <FormLabel sx={{ minWidth: 120, textAlign: 'right', mr: 2, pt: 1 }}>电子券图片:</FormLabel>
                <Box sx={{ display: 'flex', gap: 2, flexGrow: 1 }}>
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                        <Box sx={{ width: '100%', height: 120, bgcolor: '#FFF5F5', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px dashed #E0E0E0', mb: 0.5 }}>
                            <CameraAlt sx={{ color: '#F44336' }} />
                        </Box>
                    </Box>
                    <Box sx={{ flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center' }}>
                        <FormLabel sx={{ minWidth: 'auto', mr: 1 }}>比对图标:</FormLabel>
                        <Box sx={{ width: '100%', height: 120, bgcolor: '#FFF5F5', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px dashed #E0E0E0', mb: 0.5 }}>
                            <CameraAlt sx={{ color: '#F44336' }} />
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <FormLabel sx={{ minWidth: 120, textAlign: 'right', mr: 2, pt: 1 }}>使用说明:</FormLabel>
                <TextField fullWidth name="useLimit" value={formData.useLimit} onChange={handleInputChange} multiline rows={3} size="small" />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormLabel sx={{ minWidth: 120, textAlign: 'right', mr: 2 }}>有效时间:</FormLabel>
                <TextField fullWidth name="expireTime" type="datetime-local" value={formData.expireTime} onChange={handleInputChange} InputLabelProps={{ shrink: true }} size="small" />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <FormLabel sx={{ minWidth: 120, textAlign: 'right', mr: 2, pt: 1 }}>适用于商品:</FormLabel>
                <Box sx={{ bgcolor: '#F8F9FA', p: 2, borderRadius: 1, flexGrow: 1 }}>
                    {formData.applicableProducts.map((product, index) => (
                        <Box key={product.id} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: index === formData.applicableProducts.length - 1 ? 0 : 1.5 }}>
                            <TextField
                                placeholder="商品名称"
                                value={product.name}
                                onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                                size="small"
                                sx={{ bgcolor: 'white', flex: 1 }}
                            />
                            <TextField
                                placeholder="商品条码"
                                value={product.barcode}
                                onChange={(e) => handleProductChange(index, 'barcode', e.target.value)}
                                size="small"
                                sx={{ bgcolor: 'white', flex: 1 }}
                            />
                            <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => removeProduct(product.id)} 
                                sx={{ bgcolor: '#FEECEB', '&:hover': { bgcolor: '#FDDAD8' } }}
                                disabled={formData.applicableProducts.length <= 1}
                            >
                                <RemoveCircleOutline fontSize="small" />
                            </IconButton>
                        </Box>
                    ))}
                    <Button 
                        startIcon={<AddCircleOutline fontSize="small" />} 
                        onClick={addProduct} 
                        size="small" 
                        variant="outlined"
                        sx={{ mt: 1.5, alignSelf: 'flex-start' }}
                    >
                        添加商品
                    </Button>
                </Box>
            </Box>

            <FormLabel sx={{ minWidth: 120, textAlign: 'right', mr: 2, alignSelf: 'flex-start', pt: 1 }}>生成抵扣券规则:</FormLabel>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1 }}>
                {formData.discountRules.map((rule, index) => (
                    <Box key={rule.id} sx={{ bgcolor: '#F8F9FA', p: 2, borderRadius: 1 }}>
                        <Grid container spacing={1} alignItems="center"> 
                            <Grid item xs={12} sm={5}>
                                <TextField
                                    fullWidth
                                    placeholder="例如200"
                                    label="总金额要求"
                                    value={rule.totalAmount}
                                    onChange={(e) => handleRuleChange(index, 'totalAmount', e.target.value)}
                                    size="small"
                                    sx={{ bgcolor: 'white' }}
                                    type="number"
                                />
                            </Grid>
                            <Grid item xs={12} sm={5}>
                                <TextField
                                    fullWidth
                                    placeholder="例如20"
                                    label="抵扣金额"
                                    value={rule.discountAmount}
                                    onChange={(e) => handleRuleChange(index, 'discountAmount', e.target.value)}
                                    size="small"
                                    sx={{ bgcolor: 'white' }}
                                    type="number"
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={2} sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}> 
                                 <IconButton 
                                    size="small" 
                                    color="error" 
                                    onClick={() => removeRule(rule.id)} 
                                    sx={{ bgcolor: '#FEECEB', '&:hover': { bgcolor: '#FDDAD8' } }} 
                                    disabled={formData.discountRules.length <= 1}
                                >
                                    <RemoveCircleOutline fontSize="small" />
                                </IconButton>
                            </Grid>
                        </Grid>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>满 {rule.totalAmount || '_'} 抵扣 {rule.discountAmount || '_'}</Typography>
                    </Box>
                ))}
                 <Button 
                    startIcon={<AddCircleOutline fontSize="small" />} 
                    onClick={addRule} 
                    size="small" 
                    variant="outlined" 
                    sx={{ alignSelf: 'flex-start' }}
                >
                    添加规则
                </Button>
            </Box>
        </Box>
    );

    return (
        <Box sx={{p: 3, pt: 8}}>
            <Box sx={{mb: 2}}>
                <Typography variant="subtitle1" color="text.secondary">潮品礼遇</Typography>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Typography variant="h5" component="h2">
                        抵扣券管理
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddCircleOutline/>}
                        onClick={handleOpen}
                        sx={{bgcolor: '#C01A12', '&:hover': {bgcolor: '#A51710'}}}
                    >
                        添加
                    </Button>
                </Box>
            </Box>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle sx={{m: 0, p: 2, borderBottom: '1px solid #E0E0E0'}}>
                    添加
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                        }}
                    >
                        <Close/>
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{p: 3}}>
                    {renderDialogContent()}
                </DialogContent>
                <DialogActions sx={{p: 3, pt: 2, borderTop: '1px solid #E0E0E0'}}>
                    <Button onClick={handleClose} sx={{mr: 1}}>取消</Button>
                    <Button variant="contained" onClick={handleSubmit}>确定</Button>
                </DialogActions>
            </Dialog>

            <Grid container spacing={3} sx={{mb: 3}}>
                {mockStats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <StatCard {...stat} />
                    </Grid>
                ))}
            </Grid>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>景区名称</TableCell>
                            <TableCell>抵扣券名称</TableCell>
                            <TableCell>使用说明</TableCell>
                            <TableCell>有效期时间</TableCell>
                            <TableCell>生成数量(张)</TableCell>
                            <TableCell>已抵扣数量(张)</TableCell>
                            <TableCell>未抵扣数量(张)</TableCell>
                            <TableCell>已抵扣金额(元)</TableCell>
                            <TableCell>触发生成规则</TableCell>
                            <TableCell>创建时间</TableCell>
                            <TableCell>状态</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayRows.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{row.sceneryName}</TableCell>
                                <TableCell>{row.voucherName}</TableCell>
                                <TableCell sx={{maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={row.useLimit}>{row.useLimit}</TableCell>
                                <TableCell>{row.expireTime}</TableCell>
                                <TableCell>{row.totalCount}</TableCell>
                                <TableCell>{row.discountedCount}</TableCell>
                                <TableCell>{row.undiscountedCount}</TableCell>
                                <TableCell>{row.discountAmount}</TableCell>
                                <TableCell sx={{maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={row.triggerRule}>{row.triggerRule}</TableCell>
                                <TableCell>{row.createTime}</TableCell>
                                <TableCell>
                                    <Chip label={row.status} color={getStatusChipColor(row.status)} size="small" />
                                </TableCell>
                                <TableCell>
                                    {row.status === '正常' && <Button size="small" color="error" sx={{minWidth: 'auto', p: 0.5}}>中止</Button>}
                                    <Button size="small" color="info" sx={{minWidth: 'auto', p: 0.5, ml: row.status === '正常' ? 1 : 0}}>指引</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[20, 50, 100]}
                    component="div"
                    count={mockRows.length}
                    labelRowsPerPage="页面数量:"
                    labelDisplayedRows={({from, to, count}) => `${from}-${to} / ${count}`}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>
        </Box>
    );
};

export default DiscountVoucher;
