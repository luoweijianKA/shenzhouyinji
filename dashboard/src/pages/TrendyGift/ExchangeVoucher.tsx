import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
import { EditorState, ContentState, convertToRaw, convertFromHTML, convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

/**
 * 统计卡片组件
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
 * 兑换券表格行数据结构
 */
interface ExchangeVoucherRow {
    id: number;
    sceneryName: string;
    voucherName: string;
    useLimit: string;
    expireTime: string;
    totalCount: number;
    exchangedCount: number;
    unexchangedCount: number;
    exchangedAmount: number;
    triggerRule: string;
    createTime: string;
    status: '正常' | '已过期' | '已终止';
    guidance?: { text: string; video: File | null };
}

/**
 * 指引弹窗属性
 */
interface GuidanceDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (guidance: { text: string; video: File | null }) => void;
    data: { text: string; video: File | null } | null;
}

/**
 * 指引编辑/查看弹窗
 */
const GuidanceDialog: React.FC<GuidanceDialogProps> = ({ open, onClose, onSubmit, data }) => {
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const [videoFile, setVideoFile] = useState<File | null>(null);

    useEffect(() => {
        if (open) {
            let initialEditorState = EditorState.createEmpty();
            if (data?.text) {
                try {
                    const rawContent = JSON.parse(data.text);
                    const contentState = convertFromRaw(rawContent);
                    initialEditorState = EditorState.createWithContent(contentState);
                } catch (e) {
                    console.warn("Failed to parse guidance text as JSON/raw, attempting HTML.", e);
                    try {
                        const blocksFromHTML = convertFromHTML(data.text);
                        if (blocksFromHTML.contentBlocks) {
                            const state = ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap);
                            initialEditorState = EditorState.createWithContent(state);
                        } else {
                            console.warn("Could not convert HTML to ContentState.");
                        }
                    } catch (htmlError) {
                        console.error("Error converting HTML:", htmlError);
                    }
                }
            }
            setEditorState(initialEditorState);
            setVideoFile(data?.video || null);
        } else {
            setEditorState(EditorState.createEmpty());
            setVideoFile(null);
        }
    }, [data, open]);

    const onEditorStateChange = useCallback((newEditorState: EditorState) => {
        setEditorState(newEditorState);
    }, []);

    const handleVideoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            console.log("Video file selected:", event.target.files[0]);
            setVideoFile(event.target.files[0]);
        } else {
            setVideoFile(null);
        }
    }, []);

    const handleSubmit = useCallback(() => {
        const contentState = editorState.getCurrentContent();
        const hasText = contentState.hasText();
        const rawContent = hasText ? JSON.stringify(convertToRaw(contentState)) : '';
        onSubmit({ text: rawContent, video: videoFile });
    }, [editorState, videoFile, onSubmit]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2, borderBottom: '1px solid #E0E0E0' }}>
                指引
                <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3, pt: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <FormLabel sx={{ mb: 1 }}>操作指引:</FormLabel>
                        <Editor
                            editorState={editorState}
                            onEditorStateChange={onEditorStateChange}
                            wrapperClassName="rdw-wrapper"
                            editorClassName="rdw-editor"
                            toolbarClassName="rdw-toolbar"
                            editorStyle={{
                                border: '1px solid #E0E0E0',
                                minHeight: '250px',
                                padding: '0 15px',
                                borderRadius: '4px',
                                backgroundColor: 'white'
                            }}
                            toolbarStyle={{
                                border: '1px solid #E0E0E0',
                                borderRadius: '4px 4px 0 0',
                                marginBottom: 0
                            }}
                            toolbar={{
                                options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'remove', 'history'],
                                inline: { options: ['bold', 'italic', 'underline', 'strikethrough'] },
                                list: { options: ['unordered', 'ordered'] },
                            }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FormLabel sx={{ minWidth: 80, textAlign: 'left', mr: 2 }}>操作视频:</FormLabel>
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<CameraAlt sx={{ color: '#F44336' }} />}
                            sx={{
                                width: 100, height: 100, border: '1px dashed #E0E0E0', bgcolor: '#FFF5F5',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexDirection: 'column', textTransform: 'none', color: 'text.secondary',
                                '&:hover': { bgcolor: '#FFF0F0' }
                            }}
                        >
                            <input type="file" hidden accept="video/*" onChange={handleVideoUpload} />
                        </Button>
                        {videoFile && <Typography variant="body2" sx={{ ml: 2 }}>{videoFile.name}</Typography>}
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 2, borderTop: '1px solid #E0E0E0' }}>
                <Button onClick={onClose} sx={{ mr: 1 }}>取消</Button>
                <Button variant="contained" onClick={handleSubmit}>确定</Button>
            </DialogActions>
        </Dialog>
    );
};

/**
 * 添加/编辑表单数据结构
 */
interface AddFormData {
    sceneryId: string;
    voucherName: string;
    keywordMatch: string;
    voucherImage: string;
    matchImage: string;
    useLimit: string;
    expireTime: string;
    voucherContents: { id: number; value: string }[];
}

const INITIAL_ADD_FORM_DATA: AddFormData = {
    sceneryId: '',
    voucherName: '',
    keywordMatch: '',
    voucherImage: '',
    matchImage: '',
    useLimit: '',
    expireTime: '',
    voucherContents: [{ id: Date.now(), value: '' }],
};

const mockStats = [
    {title: '生成兑换券（张）', value: '5231', icon: <ConfirmationNumber/>, bgColor: '#F44336'},
    {title: '兑换金额（元）', value: '12560', icon: <MonetizationOn/>, bgColor: '#FF9800'},
    {title: '已兑换数（张）', value: '3120', icon: <LocalOffer/>, bgColor: '#FFEB3B'},
    {title: '未兑换数（张）', value: '2111', icon: <ReceiptLong/>, bgColor: '#4CAF50'},
];

const mockRows: ExchangeVoucherRow[] = Array.from({ length: 20 * 15 }, (_, i) => ({
    id: i + 1,
    sceneryName: '长隆欢乐世界',
    voucherName: '快速通行证',
    useLimit: '指定项目可用',
    expireTime: '2025-12-31 23:59:59',
    totalCount: 500,
    exchangedCount: 250,
    unexchangedCount: 250,
    exchangedAmount: 12500,
    triggerRule: '购买指定套餐',
    createTime: '2024-01-15 10:00:00',
    status: i % 4 === 0 ? '正常' : (i % 4 === 1 ? '已过期' : '已终止'),
    guidance: i % 5 === 0 ? { text: JSON.stringify(convertToRaw(ContentState.createFromText(`这是第 ${i+1} 行的指引`))), video: null } : undefined,
}));

/**
 * 兑换券管理页面
 */
const ExchangeVoucher: React.FC = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openGuidanceDialog, setOpenGuidanceDialog] = useState(false);
    const [currentGuidanceData, setCurrentGuidanceData] = useState<{ text: string; video: File | null } | null>(null);
    const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
    const [formData, setFormData] = useState<AddFormData>(INITIAL_ADD_FORM_DATA);

    const [voucherRows, setVoucherRows] = useState<ExchangeVoucherRow[]>(mockRows);

    const handleOpenAddDialog = useCallback(() => {
        setFormData(INITIAL_ADD_FORM_DATA);
        setOpenAddDialog(true);
    }, []);

    const handleCloseAddDialog = () => setOpenAddDialog(false);

    const handleOpenGuidanceDialog = (rowData: ExchangeVoucherRow) => {
        setCurrentGuidanceData(rowData.guidance || { text: '', video: null });
        setSelectedRowId(rowData.id);
        setOpenGuidanceDialog(true);
    };

    const handleCloseGuidanceDialog = () => {
        setOpenGuidanceDialog(false);
        setCurrentGuidanceData(null);
        setSelectedRowId(null);
    };

    const handleGuidanceSubmit = useCallback((guidance: { text: string; video: File | null }) => {
        console.log("Updating guidance for row:", selectedRowId, guidance);
        setVoucherRows(prevRows => prevRows.map(row =>
            row.id === selectedRowId ? { ...row, guidance } : row
        ));
        handleCloseGuidanceDialog();
    }, [selectedRowId, handleCloseGuidanceDialog]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSelectChange = useCallback((e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name as keyof AddFormData]: value }));
    }, []);

    const handleVoucherContentChange = useCallback((index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            voucherContents: prev.voucherContents.map((content, i) =>
                i === index ? { ...content, value } : content
            )
        }));
    }, []);

    const addVoucherContent = useCallback(() => {
        setFormData(prev => ({
            ...prev,
            voucherContents: [...prev.voucherContents, { id: Date.now(), value: '' }]
        }));
    }, []);

    const removeVoucherContent = useCallback((idToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            voucherContents: prev.voucherContents.length > 1
                ? prev.voucherContents.filter(content => content.id !== idToRemove)
                : prev.voucherContents
        }));
    }, []);

    const handleAddSubmit = useCallback(() => {
        console.log("Submitting New Voucher:", formData);
        handleCloseAddDialog();
    }, [formData, handleCloseAddDialog]);

    const handleChangePage = useCallback((event: unknown, newPage: number) => setPage(newPage), []);

    const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }, []);

    const displayRows = useMemo(() => voucherRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [voucherRows, page, rowsPerPage]);

    const getStatusChipColor = useCallback((status: ExchangeVoucherRow['status']) => {
        switch (status) {
            case '正常': return 'success';
            case '已过期': return 'warning';
            case '已终止': return 'error';
            default: return 'default';
        }
    }, []);

    /**
     * 渲染添加/编辑弹窗内容
     */
    const renderAddDialogContent = () => (
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormLabel sx={{ minWidth: 120, textAlign: 'right', mr: 2 }}>所属景区:</FormLabel>
                <FormControl fullWidth size="small">
                    <InputLabel id="add-scenery-select-label" sx={{ ...(formData.sceneryId && { display: 'none' }) }}>请选择</InputLabel>
                    <Select
                        labelId="add-scenery-select-label"
                        name="sceneryId"
                        value={formData.sceneryId}
                        onChange={handleSelectChange}
                        displayEmpty
                        label={formData.sceneryId ? undefined : "请选择"}
                    >
                        <MenuItem value="" disabled>请选择</MenuItem>
                        <MenuItem value="1">长隆欢乐世界</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormLabel required sx={{ minWidth: 120, textAlign: 'right', mr: 2 }}>*兑换券名称:</FormLabel>
                <TextField required fullWidth name="voucherName" value={formData.voucherName} onChange={handleInputChange} size="small" />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormLabel sx={{ minWidth: 120, textAlign: 'right', mr: 2 }}>比对凭证关键字:</FormLabel>
                <TextField fullWidth name="keywordMatch" value={formData.keywordMatch} onChange={handleInputChange} size="small" />
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
                <FormLabel required sx={{ minWidth: 120, textAlign: 'right', mr: 2, pt: 1 }}>*兑换券内容:</FormLabel>
                <Box sx={{ bgcolor: '#F8F9FA', p: 2, borderRadius: 1, flexGrow: 1 }}>
                    {formData.voucherContents.map((content, index) => (
                        <Box key={content.id} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: index === formData.voucherContents.length - 1 ? 0 : 1.5 }}>
                            <TextField
                                fullWidth
                                required
                                placeholder="例如：哈根达斯单球一个"
                                value={content.value}
                                onChange={(e) => handleVoucherContentChange(index, e.target.value)}
                                size="small"
                                sx={{ bgcolor: 'white' }}
                            />
                            <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeVoucherContent(content.id)}
                                sx={{ bgcolor: '#FEECEB', '&:hover': { bgcolor: '#FDDAD8' } }}
                                disabled={formData.voucherContents.length <= 1}
                            >
                                <RemoveCircleOutline fontSize="small" />
                            </IconButton>
                        </Box>
                    ))}
                    <Button
                        startIcon={<AddCircleOutline fontSize="small" />}
                        onClick={addVoucherContent}
                        size="small"
                        variant="outlined"
                        sx={{ mt: 1.5, alignSelf: 'flex-start' }}
                    >
                        添加内容
                    </Button>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box sx={{p: 3, pt: 8}}>
            <Box sx={{mb: 2}}>
                <Typography variant="subtitle1" color="text.secondary">潮品礼遇</Typography>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Typography variant="h5" component="h2">
                    兑换券管理
                </Typography>
                <Button
                    variant="contained"
                        startIcon={<AddCircleOutline/>}
                        onClick={handleOpenAddDialog}
                        sx={{bgcolor: '#C01A12', '&:hover': {bgcolor: '#A51710'}}}
                >
                    添加
                </Button>
                </Box>
            </Box>

            <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
                <DialogTitle sx={{m: 0, p: 2, borderBottom: '1px solid #E0E0E0'}}>
                    添加
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseAddDialog}
                        sx={{position: 'absolute', right: 8, top: 8}}
                    >
                        <Close/>
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{p: 3}}>
                    {renderAddDialogContent()}
                </DialogContent>
                <DialogActions sx={{p: 3, pt: 2, borderTop: '1px solid #E0E0E0'}}>
                    <Button onClick={handleCloseAddDialog} sx={{mr: 1}}>取消</Button>
                    <Button variant="contained" onClick={handleAddSubmit}>确定</Button>
                </DialogActions>
            </Dialog>

            <GuidanceDialog
                open={openGuidanceDialog}
                onClose={handleCloseGuidanceDialog}
                onSubmit={handleGuidanceSubmit}
                data={currentGuidanceData}
            />

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
                            <TableCell>编号</TableCell>
                            <TableCell>景区名称</TableCell>
                            <TableCell>兑换券名称</TableCell>
                            <TableCell>使用说明</TableCell>
                            <TableCell>有效期时间</TableCell>
                            <TableCell>生成数量(张)</TableCell>
                            <TableCell>已兑换数量(张)</TableCell>
                            <TableCell>未兑换数量(张)</TableCell>
                            <TableCell>已兑换金额(元)</TableCell>
                            <TableCell>触发生成规则</TableCell>
                            <TableCell>创建时间</TableCell>
                            <TableCell>状态</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayRows.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{row.id}</TableCell>
                                <TableCell>{row.sceneryName}</TableCell>
                                <TableCell>{row.voucherName}</TableCell>
                                <TableCell sx={{maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={row.useLimit}>{row.useLimit}</TableCell>
                                <TableCell>{row.expireTime}</TableCell>
                                <TableCell>{row.totalCount}</TableCell>
                                <TableCell>{row.exchangedCount}</TableCell>
                                <TableCell>{row.unexchangedCount}</TableCell>
                                <TableCell>{row.exchangedAmount}</TableCell>
                                <TableCell sx={{maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={row.triggerRule}>{row.triggerRule}</TableCell>
                                <TableCell>{row.createTime}</TableCell>
                                <TableCell>
                                    <Chip label={row.status} color={getStatusChipColor(row.status)} size="small" />
                                </TableCell>
                                <TableCell>
                                    {row.status === '正常' && <Button size="small" color="error" sx={{minWidth: 'auto', p: 0.5}}>中止</Button>}
                                    <Button
                                        size="small"
                                        color="info"
                                        sx={{minWidth: 'auto', p: 0.5, ml: row.status === '正常' ? 1 : 0}}
                                        onClick={() => handleOpenGuidanceDialog(row)}
                                    >
                                        指引
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[20, 50, 100]}
                    component="div"
                    count={voucherRows.length}
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

export default ExchangeVoucher;
