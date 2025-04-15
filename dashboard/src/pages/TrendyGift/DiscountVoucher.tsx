import React from 'react';
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
    MenuItem,
    Paper,
    Select,
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
import {useState} from "react";

/**
 * 抵扣券管理页面
 *
 * 功能：
 * - 展示抵扣券的统计信息（生成数量、抵扣金额等）
 * - 列表展示抵扣券的详细信息
 * - 支持分页、每页行数调整
 * - 提供添加抵扣券的功能（弹窗表单）
 *
 * 主要组件：
 * - StatCard: 用于展示统计信息的卡片
 * - Dialog: 用于添加抵扣券的弹窗
 * - Table: 用于展示抵扣券列表
 *
 * 使用的状态：
 * - page: 当前页码
 * - rowsPerPage: 每页显示的行数
 * - open: 控制弹窗的显示与隐藏
 * - formData: 表单数据，用于添加抵扣券
 *
 * 主要方法：
 * - handleOpen: 打开弹窗
 * - handleClose: 关闭弹窗
 * - handleInputChange: 处理表单输入框的变更
 * - handleProductNameChange: 处理商品名称的变更
 * - handleProductBarcodeChange: 处理商品条码的变更
 * - addProduct: 添加商品条目
 * - removeProduct: 移除商品条目
 * - handleSubmit: 提交表单
 * - handleChangePage: 处理分页变更
 * - handleChangeRowsPerPage: 处理每页行数变更
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

interface DiscountRule {
    id: number;
    totalAmount: string;
    discountAmount: string;
}

interface ApplicableProduct {
    id: number;
    name: string;
    barcode: string;
}

interface FormData {
    sceneryId: string;
    voucherName: string;
    keywordMatch: string;
    voucherImage: string; // Assuming string for now, might need adjustment for file upload
    matchImage: string;   // Assuming string for now, might need adjustment for file upload
    useLimit: string;
    expireTime: string;
    discountRules: DiscountRule[];
    applicableProducts: ApplicableProduct[];
}

const DiscountVoucher: React.FC = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        sceneryId: '',
        voucherName: '',
        keywordMatch: '',
        voucherImage: '',
        matchImage: '',
        useLimit: '',
        expireTime: '',
        discountRules: [{ id: Date.now(), totalAmount: '', discountAmount: '' }] as DiscountRule[],
        applicableProducts: [{ id: Date.now(), name: '', barcode: '' }] as ApplicableProduct[],
    });

    const handleOpen = () => {
        setFormData({
            sceneryId: '',
            voucherName: '',
            keywordMatch: '',
            voucherImage: '',
            matchImage: '',
            useLimit: '',
            expireTime: '',
            discountRules: [{ id: Date.now(), totalAmount: '', discountAmount: '' }],
            applicableProducts: [{ id: Date.now(), name: '', barcode: '' }],
        });
        setOpen(true);
    };
    const handleClose = () => setOpen(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (e: any) => {
        setFormData(prev => ({ ...prev, sceneryId: e.target.value }));
    }

    const handleProductChange = (index: number, field: keyof Omit<ApplicableProduct, 'id'>, value: string) => {
        const updatedProducts = formData.applicableProducts.map((product, i) => 
            i === index ? { ...product, [field]: value } : product
        );
        setFormData(prev => ({ ...prev, applicableProducts: updatedProducts }));
    };

    const addProduct = () => {
        setFormData(prev => ({ 
            ...prev, 
            applicableProducts: [...prev.applicableProducts, { id: Date.now(), name: '', barcode: '' }] 
        }));
    };

    const removeProduct = (idToRemove: number) => {
        if (formData.applicableProducts.length <= 1) return;
        setFormData(prev => ({ 
            ...prev, 
            applicableProducts: prev.applicableProducts.filter(product => product.id !== idToRemove) 
        }));
    };

    const handleRuleChange = (index: number, field: keyof Omit<DiscountRule, 'id'>, value: string) => {
        const updatedRules = formData.discountRules.map((rule, i) => 
            i === index ? { ...rule, [field]: value } : rule
        );
        setFormData(prev => ({ ...prev, discountRules: updatedRules }));
    };

    const addRule = () => {
        setFormData(prev => ({ 
            ...prev, 
            discountRules: [...prev.discountRules, { id: Date.now(), totalAmount: '', discountAmount: '' }] 
        }));
    };

    const removeRule = (idToRemove: number) => {
        if (formData.discountRules.length <= 1) return;
        setFormData(prev => ({ 
            ...prev, 
            discountRules: prev.discountRules.filter(rule => rule.id !== idToRemove) 
        }));
    };

    const handleSubmit = () => {
        console.log("Submitting Discount Voucher:", formData);
        handleClose();
    };

    const stats = [
        {title: '生成抵扣券（张）', value: '6783', icon: <ConfirmationNumber/>, bgColor: '#F44336'},
        {title: '抵扣金额（元）', value: '6783', icon: <MonetizationOn/>, bgColor: '#FF9800'},
        {title: '已抵扣数（张）', value: '6783', icon: <LocalOffer/>, bgColor: '#FFEB3B'},
        {title: '未抵扣数（张）', value: '6783', icon: <ReceiptLong/>, bgColor: '#4CAF50'},
    ];

    const rows: DiscountVoucherRow[] = Array.from({ length: 579 * 20 }, (_, i) => ({
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

    const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const displayRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const getStatusChipColor = (status: DiscountVoucherRow['status']) => {
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
    };

    const renderDialogContent = () => (
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormLabel sx={{ minWidth: 120, textAlign: 'right', mr: 2 }}>所属景区:</FormLabel>
                <FormControl fullWidth size="small">
                    <Select name="sceneryId" value={formData.sceneryId} onChange={handleSelectChange} displayEmpty>
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
                            {formData.applicableProducts.length > 1 && (
                                <IconButton size="small" color="error" onClick={() => removeProduct(product.id)} sx={{ bgcolor: '#FEECEB', '&:hover': { bgcolor: '#FDDAD8' } }}>
                                    <RemoveCircleOutline fontSize="small" />
                                </IconButton>
                            )}
                            <IconButton size="small" color="primary" onClick={addProduct} sx={{ bgcolor: '#E3F2FD', '&:hover': { bgcolor: '#BBDEFB' } }}>
                                <AddCircleOutline fontSize="small" />
                            </IconButton>
                        </Box>
                    ))}
                </Box>
            </Box>

            {formData.discountRules.map((rule, index) => (
                <Box key={rule.id} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <FormLabel sx={{ minWidth: 120, textAlign: 'right', mr: 2, pt: 1 }}>生成抵扣券规则:</FormLabel> 
                    <Box sx={{ bgcolor: '#F8F9FA', p: 2, borderRadius: 1, flexGrow: 1 }}>
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
                                {formData.discountRules.length > 1 && (
                                    <IconButton size="small" color="error" onClick={() => removeRule(rule.id)} sx={{ bgcolor: '#FEECEB', '&:hover': { bgcolor: '#FDDAD8' } }}>
                                        <RemoveCircleOutline fontSize="small" />
                                    </IconButton>
                                )}
                                <IconButton size="small" color="primary" onClick={addRule} sx={{ bgcolor: '#E3F2FD', '&:hover': { bgcolor: '#BBDEFB' } }}>
                                    <AddCircleOutline fontSize="small" />
                                </IconButton>
                            </Grid>
                        </Grid>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>满 {rule.totalAmount || '_'} 抵扣 {rule.discountAmount || '_'}</Typography>
                     </Box>
                </Box>
            ))}
        </Box>
    );

    return (
        <Box sx={{p: 3, pt: 4}}>
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
                        sx={{bgcolor: '#F44336', '&:hover': {bgcolor: '#D32F2F'}}}
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
                {stats.map((stat, index) => (
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
                    count={rows.length}
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
