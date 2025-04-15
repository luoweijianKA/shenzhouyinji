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
import {useState, useEffect} from "react";
import { EditorState, ContentState, convertToRaw, convertFromHTML, convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

/**
 * 兑换券管理页面组件
 *
 * 功能：
 * - 展示兑换券的统计信息（生成数量、兑换金额等）
 * - 列表展示兑换券的详细信息
 * - 支持分页、每页行数调整
 * - 提供添加兑换券的功能（弹窗表单）
 *
 * 使用的状态：
 * - page: 当前页码
 * - rowsPerPage: 每页显示的行数
 * - open: 控制弹窗的显示与隐藏
 * - formData: 表单数据，用于添加兑换券
 *
 * 主要方法：
 * - handleOpen: 打开弹窗
 * - handleClose: 关闭弹窗
 * - handleInputChange: 处理表单输入框的变更
 * - handleVoucherContentChange: 处理兑换券内容的变更
 * - addVoucherContent: 添加兑换券内容条目
 * - removeVoucherContent: 移除兑换券内容条目
 * - handleSubmit: 提交表单
 * - handleChangePage: 处理分页变更
 * - handleChangeRowsPerPage: 处理每页行数变更
 *
 * 模拟数据：
 * - stats: 用于展示的统计信息
 * - rows: 用于展示的兑换券列表数据
 *
 * 主要组件：
 * - StatCard: 用于展示统计信息的卡片
 * - Dialog: 用于添加兑换券的弹窗
 * - Table: 用于展示兑换券列表
 * - TablePagination: 表格分页组件
 * - TextField: 输入框组件，用于表单输入
 * - Select/MenuItem: 下拉选择组件，用于选择景区
 * - Button: 按钮组件，用于触发操作
 * - IconButton: 图标按钮组件，用于添加或移除兑换券内容
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
    guidance?: { text: string; video: any };
}

interface GuidanceDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (guidance: { text: string; video: any }) => void;
    data: { text: string; video: any } | null;
}

const GuidanceDialog: React.FC<GuidanceDialogProps> = ({ open, onClose, onSubmit, data }) => {
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const [videoFile, setVideoFile] = useState<any>(null);

    useEffect(() => {
        if (open) {
            let initialEditorState = EditorState.createEmpty();
            if (data?.text) {
                try {
                     // Assume data.text is a JSON string representation of RawDraftContentState
                     const rawContent = JSON.parse(data.text);
                     // Use convertFromRaw to create ContentState from the parsed raw JSON object
                     const contentState = convertFromRaw(rawContent); 
                     initialEditorState = EditorState.createWithContent(contentState);
                } catch (e) {
                    // If JSON parsing or convertFromRaw fails, assume it might be HTML
                    console.warn("Failed to parse guidance text as JSON/raw content, attempting HTML conversion.", e);
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
             // Reset state when dialog closes (optional, but good practice)
             setEditorState(EditorState.createEmpty());
             setVideoFile(null);
        }
    }, [data, open]);

    const onEditorStateChange = (newEditorState: EditorState) => {
        setEditorState(newEditorState);
    };

    const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            console.log("Video file selected:", event.target.files[0]);
            setVideoFile(event.target.files[0]);
        }
    };

    const handleSubmit = () => {
        const contentState = editorState.getCurrentContent();
        const hasText = contentState.hasText(); 
        const rawContent = hasText ? JSON.stringify(convertToRaw(contentState)) : ''; 
        onSubmit({ text: rawContent, video: videoFile }); 
    };

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
                                options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', /*'embedded', 'emoji',*/ 'remove', 'history'],
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
                        {/* Optional: Display selected video file name */}
                        {videoFile && typeof videoFile !== 'string' && <Typography variant="body2" sx={{ ml: 2 }}>{videoFile.name}</Typography>}
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

const ExchangeVoucher: React.FC = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openGuidanceDialog, setOpenGuidanceDialog] = useState(false);
    const [selectedVoucherGuidance, setSelectedVoucherGuidance] = useState<{ text: string; video: any } | null>(null);
    const [formData, setFormData] = useState({
        sceneryId: '',
        voucherName: '',
        keywordMatch: '',
        voucherImage: '',
        matchImage: '',
        useLimit: '',
        expireTime: '',
        voucherContents: ['']
    });

    const handleOpenAddDialog = () => setOpenAddDialog(true);
    const handleCloseAddDialog = () => setOpenAddDialog(false);

    const handleOpenGuidanceDialog = (rowData: ExchangeVoucherRow) => {
        setSelectedVoucherGuidance(rowData.guidance || { text: '', video: null });
        setOpenGuidanceDialog(true);
    };

    const handleCloseGuidanceDialog = () => {
        setOpenGuidanceDialog(false);
        setSelectedVoucherGuidance(null);
    };

    const handleGuidanceSubmit = (guidance: { text: string; video: any }) => {
        console.log("Submitting guidance:", guidance);
        handleCloseGuidanceDialog();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSelectChange = (e: any) => {
        setFormData({...formData, sceneryId: e.target.value});
    }

    const handleVoucherContentChange = (index: number, value: string) => {
        const newContents = [...formData.voucherContents];
        newContents[index] = value;
        setFormData({
            ...formData,
            voucherContents: newContents
        });
    };

    const addVoucherContent = () => {
        setFormData({
            ...formData,
            voucherContents: [...formData.voucherContents, '']
        });
    };

    const removeVoucherContent = (index: number) => {
        const newContents = formData.voucherContents.filter((_, i) => i !== index);
        if (newContents.length >= 1) {
            setFormData({
                ...formData,
                voucherContents: newContents
            });
        }
    };

    const handleAddSubmit = () => {
        console.log("Adding voucher:", formData);
        handleCloseAddDialog();
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const stats = [
        {title: '生成兑换券（张）', value: '6783', icon: <ConfirmationNumber/>, bgColor: '#F44336'},
        {title: '兑换金额（元）', value: '6783', icon: <MonetizationOn/>, bgColor: '#FF9800'},
        {title: '已兑换数（张）', value: '6783', icon: <LocalOffer/>, bgColor: '#FFEB3B'},
        {title: '未兑换数（张）', value: '6783', icon: <ReceiptLong/>, bgColor: '#4CAF50'},
    ];

    const rows: ExchangeVoucherRow[] = Array.from({ length: 579 * 20 }, (_, i) => ({
        id: i + 1,
        sceneryName: '丹霞山风景区',
        voucherName: '玩偶兑换券',
        useLimit: '只能在景区使用',
        expireTime: '2026-03-14 12:00:00',
        totalCount: 1000,
        exchangedCount: 300,
        unexchangedCount: 700,
        exchangedAmount: 700,
        triggerRule: '关键字: 丹霞山, 上传图片: 图片, 关键字: 丹霞山, 图标: logo',
        createTime: '2026-03-14 12:00:00',
        status: i % 3 === 0 ? '正常' : (i % 3 === 1 ? '已过期' : '已终止'),
        guidance: { text: `这是第 ${i+1} 条指引的初始内容。`, video: null }
    }));

    const displayRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const getStatusChipColor = (status: ExchangeVoucherRow['status']) => {
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

    const renderAddDialogContent = () => (
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormLabel sx={{ minWidth: 120, textAlign: 'right', mr: 2 }}>所属景区:</FormLabel>
                <FormControl fullWidth size="small">
                    <Select
                        name="sceneryId"
                        value={formData.sceneryId}
                        onChange={handleSelectChange}
                        displayEmpty
                    >
                        <MenuItem value="" disabled>请选择</MenuItem>
                        <MenuItem value="1">丹霞山风景区</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormLabel required sx={{ minWidth: 120, textAlign: 'right', mr: 2 }}>*兑换券名称:</FormLabel>
                <TextField
                    required
                    fullWidth
                    name="voucherName"
                    value={formData.voucherName}
                    onChange={handleInputChange}
                    size="small"
                />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormLabel sx={{ minWidth: 120, textAlign: 'right', mr: 2 }}>比对凭证关键字:</FormLabel>
                <TextField
                    fullWidth
                    name="keywordMatch"
                    value={formData.keywordMatch}
                    onChange={handleInputChange}
                    size="small"
                />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <FormLabel sx={{ minWidth: 120, textAlign: 'right', mr: 2, pt: 1 }}>电子券图片:</FormLabel>
                <Box sx={{ display: 'flex', gap: 2, flexGrow: 1 }}>
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                        <Box
                            sx={{
                                width: '100%',
                                height: 120,
                                bgcolor: '#FFF5F5',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                border: '1px dashed #E0E0E0',
                                mb: 0.5
                            }}
                        >
                            <CameraAlt sx={{ color: '#F44336' }} />
                        </Box>
                    </Box>
                    <Box sx={{ flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center' }}>
                        <FormLabel sx={{ minWidth: 'auto', mr: 1 }}>比对图标:</FormLabel>
                        <Box
                            sx={{
                                width: '100%',
                                height: 120,
                                bgcolor: '#FFF5F5',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                border: '1px dashed #E0E0E0',
                                mb: 0.5
                            }}
                        >
                            <CameraAlt sx={{ color: '#F44336' }} />
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <FormLabel sx={{ minWidth: 120, textAlign: 'right', mr: 2, pt: 1 }}>使用说明:</FormLabel>
                <TextField
                    fullWidth
                    name="useLimit"
                    value={formData.useLimit}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    size="small"
                />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormLabel sx={{ minWidth: 120, textAlign: 'right', mr: 2 }}>有效时间:</FormLabel>
                <TextField
                    fullWidth
                    name="expireTime"
                    type="datetime-local"
                    value={formData.expireTime}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <FormLabel sx={{ minWidth: 120, textAlign: 'right', mr: 2, pt: 1 }}>生成兑换券内容:</FormLabel>
                <Box sx={{ bgcolor: '#F8F9FA', p: 2, borderRadius: 1, flexGrow: 1 }}>
                    {formData.voucherContents.map((content, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: index === formData.voucherContents.length - 1 ? 0 : 1.5 }}>
                            <TextField
                                fullWidth
                                placeholder="例如: 可乐一瓶"
                                value={content}
                                onChange={(e) => handleVoucherContentChange(index, e.target.value)}
                                size="small"
                                sx={{ bgcolor: 'white' }}
                            />
                            {formData.voucherContents.length > 1 && (
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => removeVoucherContent(index)}
                                    sx={{ bgcolor: '#FEECEB', '&:hover': { bgcolor: '#FDDAD8' } }}
                                >
                                    <RemoveCircleOutline fontSize="small" />
                                </IconButton>
                            )}
                            <IconButton
                                size="small"
                                color="primary"
                                onClick={addVoucherContent}
                                sx={{ bgcolor: '#E3F2FD', '&:hover': { bgcolor: '#BBDEFB' } }}
                            >
                                <AddCircleOutline fontSize="small" />
                            </IconButton>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box sx={{p: 3, pt: 4}}>
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
                        sx={{bgcolor: '#F44336', '&:hover': {bgcolor: '#D32F2F'}}}
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
                data={selectedVoucherGuidance}
            />

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
                                <TableCell>{row.sceneryName}</TableCell>
                                <TableCell>{row.voucherName}</TableCell>
                                <TableCell sx={{maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={row.useLimit}>{row.useLimit}</TableCell>
                                <TableCell>{row.expireTime}</TableCell>
                                <TableCell>{row.totalCount}</TableCell>
                                <TableCell>{row.exchangedCount}</TableCell>
                                <TableCell>{row.unexchangedCount}</TableCell>
                                <TableCell>{row.exchangedAmount}</TableCell>
                                <TableCell sx={{maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={row.triggerRule}>{row.triggerRule}</TableCell>
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

export default ExchangeVoucher;
