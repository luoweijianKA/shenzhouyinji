import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
    Typography,
    Breadcrumbs,
    CircularProgress
} from '@mui/material';
import {
    AddCircleOutline,
    Close,
    RemoveCircleOutline,
    CameraAlt
} from '@mui/icons-material';
import { LinkButton, PageHeader, Title, DatePickerWrapper } from "../styled";
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import zhCN from 'date-fns/locale/zh-CN';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { ContentState, convertFromHTML, convertFromRaw, convertToRaw, EditorState } from 'draft-js';
import FileUploader from '../../utils/fileUpload';

/**
 * 自定义图标组件
 */
const CustomIcon = React.memo<{ src: string }>(({ src }) => (
    <Box
        component="img"
        src={src}
        alt="图标"
        sx={{
            width: 50,
            height: 50,
            objectFit: 'contain',
        }}
    />
));

/**
 * 统计信息卡片
 */
interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    bgColor: string;
}

const StatCard = React.memo<StatCardProps>(({ title, value, icon, bgColor }) => (
    <Paper elevation={0} sx={{ p: 2, display: 'flex', alignItems: 'center', boxShadow: 'none' }}>
        <Box sx={{
            mr: '15px',
            p: 1.5,
            bgcolor: bgColor,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            width: 54,
            height: 54
        }}>
            {icon}
        </Box>
        <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '16px', mb: 0, color: '#333' }}>
                {title}
            </Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ fontSize: '32px', color: '#333' }}>
                {value}
            </Typography>
        </Box>
    </Paper>
));

/**
 * 抵扣券表格行数据结构
 */
interface DiscountVoucherRow {
    id: string;
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
    guidance?: { text: string; video: File | null };
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
    sceneryName: string;
    voucherName: string;
    keywordMatch: string;
    voucherImage: File | null;
    matchImage: File | null;
    useLimit: string;
    expireTime: string;
    discountRules: DiscountRule[];
    applicableProducts: ApplicableProduct[];
}

const INITIAL_FORM_DATA: FormData = {
    sceneryId: '',
    sceneryName: '',
    voucherName: '',
    keywordMatch: '',
    voucherImage: null,
    matchImage: null,
    useLimit: '',
    expireTime: '',
    discountRules: [{ id: Date.now(), totalAmount: '', discountAmount: '' }],
    applicableProducts: [{ id: Date.now(), name: '', barcode: '' }],
};

interface TideSpotConfigNode {
    id: string;
    tideSpotName: string;
    couponName: string;
    desc: string;
    effectiveTime: string;
    generateNum: number;
    useNum: number;
    notUseNum: number;
    useAmount: number;
    generateRule: string;
    createTime: string;
    stateText: string;
    state: string;
    guideDesc: string | null;
    guideVideoPath: string | null;
}

interface TideSpotConfigEdge {
    node: TideSpotConfigNode;
}

interface TideSpotConfigPageInfo {
    startCursor: string;
    endCursor: string;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

interface TideSpotConfigList {
    totalCount: number;
    edges: TideSpotConfigEdge[];
    pageInfo: TideSpotConfigPageInfo;
    totalUseNum: number;
    totalUseAmount: number;
    totalGenerateNum: number;
    totalNotUseNum: number;
}

interface TideSpotConfigResponse {
    tideSpotConfigList: TideSpotConfigList;
}

const TIDE_SPOT_CONFIG_LIST = gql`
  query TideSpotConfigList($first: Int = 20, $after: ID, $last: Int = 20, $before: ID, $type: String) {
    tideSpotConfigList(
      first: $first
      after: $after
      last: $last
      before: $before
      type: $type
    ) {
      totalCount
      edges {
        node {
          id
          tideSpotName
          couponName
          desc
          effectiveTime
          generateNum
          useNum
          notUseNum
          useAmount
          generateRule
          createTime
          stateText
          state
          guideDesc
          guideVideoPath
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasPreviousPage
        hasNextPage
      }
      totalUseNum
      totalUseAmount
      totalGenerateNum
      totalNotUseNum
    }
  }
`;

interface NewTideSpotConfig {
    tideSpotId: string;
    tideSpotName: string;
    couponName: string;
    type: 'Deduction';
    compareWord: string;
    couponImgPath: string;
    compareLogoPath: string;
    desc: string;
    effectiveTime: number;
    tideSpotGoodListJson: string;
    minimumAmount: number;
    deductionAmount: number;
}

interface CreateTideSpotConfigResponse {
    createTideSpotConfig: {
        id: string;
    };
}

const CREATE_TIDE_SPOT_CONFIG = gql`
  mutation CreateTideSpotConfig($input: NewTideSpotConfig!) {
    createTideSpotConfig(input: $input) {
      id
    }
  }
`;

const UPDATE_TIDE_SPOT_CONFIG = gql`
  mutation updateTideSpotConfig($input: UpdateTideSpotConfig!) {
    updateTideSpotConfig(input: $input) {
      succed
      message
    }
  }
`;

interface UpdateTideSpotConfig {
    id: string;
    enable: boolean;
    guideDesc?: string;
    guideVideoPath?: string;
}

// Mock data - consider moving or fetching
// TODO: 考虑将模拟数据移出或通过API获取
const mockStats = [
    {
        title: '生成抵扣券（张）',
        value: '6783',
        icon: <CustomIcon src="https://gd-1258904493.cos.ap-guangzhou.myqcloud.com/shenzhouyinji/icon_be.png" />,
        bgColor: '#F41515'
    },
    {
        title: '抵扣金额（元）',
        value: '6783',
        icon: <CustomIcon src="https://gd-1258904493.cos.ap-guangzhou.myqcloud.com/shenzhouyinji/icon_money.png" />,
        bgColor: '#FA7202'
    },
    {
        title: '已抵扣数（张）',
        value: '6783',
        icon: <CustomIcon src="https://gd-1258904493.cos.ap-guangzhou.myqcloud.com/shenzhouyinji/icon_exchanged.png" />,
        bgColor: '#FFCC00'
    },
    {
        title: '未抵扣数（张）',
        value: '6783',
        icon: <CustomIcon src="https://gd-1258904493.cos.ap-guangzhou.myqcloud.com/shenzhouyinji/icon_no_exchange.png" />,
        bgColor: '#7DD000'
    },
];

// 常量样式对象
const STYLES = {
    formLabel: { minWidth: 120, textAlign: 'right', mr: 2, alignSelf: 'flex-start', pt: '7px' },
    dialogTitle: { m: 0, p: 2, borderBottom: '1px solid #E0E0E0' },
    dialogActions: { p: 3, pt: 2, borderTop: '1px solid #E0E0E0' },
    statsContainer: {
        height: '150px',
        bgcolor: 'white',
        borderRadius: '10px',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        mb: '16px',
        mt: '20px',
        p: '34px',
        display: 'flex',
        alignItems: 'center'
    },
    truncatedCell: {
        maxWidth: 150,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    },
    uploadButton: {
        width: 100, height: 100, border: '1px dashed #E0E0E0', bgcolor: '#FFF5F5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', textTransform: 'none', color: 'text.secondary',
        '&:hover': { bgcolor: '#FFF0F0' }
    },
    imagePreview: {
        width: 100,
        height: 100,
        objectFit: 'cover',
        border: '1px solid #E0E0E0',
        borderRadius: '4px'
    }
};

// Extracted Dialog Content Component Props Interface
interface DiscountDialogContentProps {
    formData: FormData;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleSelectChange: (e: SelectChangeEvent<string>) => void;
    handleProductChange: (index: number, field: keyof Omit<ApplicableProduct, 'id'>, value: string) => void;
    addProduct: () => void;
    removeProduct: (idToRemove: number) => void;
    handleRuleChange: (index: number, field: keyof Omit<DiscountRule, 'id'>, value: string) => void;
    addRule: () => void;
    removeRule: (idToRemove: number) => void;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>, fieldName: 'voucherImage' | 'matchImage') => void;
}

// Extracted Dialog Content Component
const DiscountDialogContent = React.memo<DiscountDialogContentProps>(({
    formData,
    handleInputChange,
    handleSelectChange,
    handleProductChange,
    addProduct,
    removeProduct,
    handleRuleChange,
    addRule,
    removeRule,
    handleFileChange
}) => (
    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormLabel sx={STYLES.formLabel}>所属景区:</FormLabel>
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
            <FormLabel required sx={STYLES.formLabel}>*抵扣券名称:</FormLabel>
            <TextField required fullWidth name="voucherName" value={formData.voucherName} onChange={handleInputChange} size="small" />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormLabel sx={STYLES.formLabel}>比对凭证关键字:</FormLabel>
            <TextField fullWidth name="keywordMatch" value={formData.keywordMatch} onChange={handleInputChange} size="small" />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                <FormLabel sx={{ ...STYLES.formLabel, pt: 0 }}>电子券图片:</FormLabel>
                <Button
                    variant="outlined"
                    component="label"
                    startIcon={!formData.voucherImage && <CameraAlt sx={{ color: '#F44336' }} />}
                    sx={STYLES.uploadButton}
                >
                    <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'voucherImage')}
                    />
                    {formData.voucherImage && (
                        <Box
                            component="img"
                            src={URL.createObjectURL(formData.voucherImage)}
                            alt="Voucher Preview"
                            sx={STYLES.imagePreview}
                        />
                    )}
                </Button>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                <FormLabel sx={{ ...STYLES.formLabel, pt: 0, minWidth: 'auto', mr: 1 }}>比对图标:</FormLabel>
                <Button
                    variant="outlined"
                    component="label"
                    startIcon={!formData.matchImage && <CameraAlt sx={{ color: '#F44336' }} />}
                    sx={STYLES.uploadButton}
                >
                    <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'matchImage')}
                    />
                    {formData.matchImage && (
                        <Box
                            component="img"
                            src={URL.createObjectURL(formData.matchImage)}
                            alt="Match Icon Preview"
                            sx={STYLES.imagePreview}
                        />
                    )}
                </Button>
            </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <FormLabel sx={STYLES.formLabel}>使用说明:</FormLabel>
            <TextField fullWidth name="useLimit" value={formData.useLimit} onChange={handleInputChange} multiline rows={3} size="small" />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormLabel sx={STYLES.formLabel}>有效时间:</FormLabel>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhCN}>
                <DatePickerWrapper>
                    <DesktopDatePicker
                        value={formData.expireTime ? new Date(formData.expireTime) : null}
                        onChange={(newValue) => {
                            if (newValue) {
                                handleInputChange({
                                    target: {
                                        name: 'expireTime',
                                        value: newValue.toISOString()
                                    }
                                } as React.ChangeEvent<HTMLInputElement>);
                            }
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                fullWidth
                                size="small"
                                error={false}
                                helperText={null}
                            />
                        )}
                    />
                </DatePickerWrapper>
            </LocalizationProvider>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1 }}>
                {formData.applicableProducts.map((product, index) => (
                    <Box
                        key={product.id}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            bgcolor: '#F8F9FA',
                            p: 2,
                            borderRadius: 1
                        }}
                    >
                        <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                                <FormLabel sx={{ display: 'block', mb: 0.5, fontSize: '0.875rem' }}>适用于商品名称:</FormLabel>
                                <TextField
                                    placeholder="商品名称"
                                    value={product.name}
                                    onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                                    size="small"
                                    fullWidth
                                    sx={{ bgcolor: 'white' }}
                                />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <FormLabel sx={{ display: 'block', mb: 0.5, fontSize: '0.875rem' }}>适用于商品条码:</FormLabel>
                                <TextField
                                    placeholder="商品条码"
                                    value={product.barcode}
                                    onChange={(e) => handleProductChange(index, 'barcode', e.target.value)}
                                    size="small"
                                    fullWidth
                                    sx={{ bgcolor: 'white' }}
                                />
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5, minWidth: 72, justifyContent: 'flex-start', mt: 3}}>
                            <IconButton
                                size="small"
                                color="primary"
                                onClick={addProduct}
                                sx={{ bgcolor: '#E3F2FD', '&:hover': { bgcolor: '#BBDEFB' } }}
                            >
                                <AddCircleOutline fontSize="small" />
                            </IconButton>
                            {index === formData.applicableProducts.length - 1 && formData.applicableProducts.length > 1 && (
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => removeProduct(product.id)}
                                    sx={{ bgcolor: '#FEECEB', '&:hover': { bgcolor: '#FDDAD8' } }}
                                >
                                    <RemoveCircleOutline fontSize="small" />
                                </IconButton>
                            )}
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1 }}>
                {formData.discountRules.map((rule, index) => (
                    <Box
                        key={rule.id}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            bgcolor: '#F8F9FA',
                            p: 2,
                            borderRadius: 1
                        }}
                    >
                        <Box sx={{flex: 1}}>
                            <Grid container spacing={2} alignItems="flex-start">
                                <Grid item xs={12} sm={6}>
                                    <FormLabel sx={{ display: 'block', mb: 0.5, fontSize: '0.875rem' }}>生成抵扣券总金额要求:</FormLabel>
                                    <TextField
                                        fullWidth
                                        placeholder="例如200"
                                        value={rule.totalAmount}
                                        onChange={(e) => handleRuleChange(index, 'totalAmount', e.target.value)}
                                        size="small"
                                        sx={{ bgcolor: 'white' }}
                                        type="number"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormLabel sx={{ display: 'block', mb: 0.5, fontSize: '0.875rem' }}>生成抵扣券抵扣金额:</FormLabel>
                                    <TextField
                                        fullWidth
                                        required
                                        placeholder="例如20"
                                        value={rule.discountAmount}
                                        onChange={(e) => handleRuleChange(index, 'discountAmount', e.target.value)}
                                        size="small"
                                        sx={{ bgcolor: 'white' }}
                                        type="number"
                                    />
                                </Grid>
                            </Grid>
                            <Typography variant="body2" color="error" sx={{ mt: 1, fontSize: '0.8rem' }}>
                                满{rule.totalAmount || '__'}抵扣{rule.discountAmount || '__'}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5, minWidth: 72, justifyContent: 'flex-start' }}>
                            <IconButton
                                size="small"
                                color="primary"
                                onClick={addRule}
                                sx={{ bgcolor: '#E3F2FD', '&:hover': { bgcolor: '#BBDEFB' } }}
                            >
                                <AddCircleOutline fontSize="small" />
                            </IconButton>
                            {index === formData.discountRules.length - 1 && formData.discountRules.length > 1 && (
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => removeRule(rule.id)}
                                    sx={{ bgcolor: '#FEECEB', '&:hover': { bgcolor: '#FDDAD8' } }}
                                >
                                    <RemoveCircleOutline fontSize="small" />
                                </IconButton>
                            )}
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    </Box>
));

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
const GuidanceDialog = React.memo<GuidanceDialogProps>(({ open, onClose, onSubmit, data }) => {
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
            setVideoFile(event.target.files[0]);
        } else {
            setVideoFile(null);
        }
    }, []);

    const handleSubmit = useCallback(() => {
        const contentState = editorState.getCurrentContent();
        const hasText = contentState.hasText();
        const rawContent = hasText ? JSON.stringify(convertToRaw(contentState)) : '';
        console.log('Submitting guidance:', { text: rawContent, video: videoFile });
        onSubmit({ text: rawContent, video: videoFile });
        onClose();
    }, [editorState, videoFile, onSubmit, onClose]);

    const DIALOG_STYLES = {
        title: { m: 0, p: 2, borderBottom: '1px solid #E0E0E0' },
        actions: { p: 3, pt: 2, borderTop: '1px solid #E0E0E0' }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={DIALOG_STYLES.title}>
                指引
                <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3, pt: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <FormLabel sx={{ mb: 1.5, mt: 3, fontWeight: 'normal' }}>操作指引:</FormLabel>
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
                                borderRadius: '0 0 4px 4px',
                                backgroundColor: 'white'
                            }}
                            toolbarStyle={{
                                border: '1px solid #E0E0E0',
                                borderBottom: 'none',
                                borderRadius: '4px 4px 0 0',
                                marginBottom: 0,
                            }}
                            toolbar={{
                                options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'embedded', 'emoji', 'image', 'remove', 'history'],
                                inline: { options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace', 'superscript', 'subscript'] },
                                blockType: { options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code'] },
                                list: { options: ['unordered', 'ordered', 'indent', 'outdent'] },
                                textAlign: { options: ['left', 'center', 'right', 'justify'] },
                            }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FormLabel sx={{ minWidth: 'auto', mr: 1.5, fontWeight: 'normal' }}>操作视频:</FormLabel>
                        <Button
                            variant="outlined"
                            component="label"
                            sx={STYLES.uploadButton}
                        >
                            <CameraAlt sx={{ color: '#F44336' }} />
                            <input type="file" hidden accept="video/*" onChange={handleVideoUpload} />
                        </Button>
                        {videoFile && <Typography variant="body2" sx={{ ml: 2 }}>{videoFile.name}</Typography>}
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={DIALOG_STYLES.actions}>
                <Button onClick={onClose} sx={{ mr: 1 }}>取消</Button>
                <Button variant="contained" onClick={handleSubmit}>确定</Button>
            </DialogActions>
        </Dialog>
    );
});

/**
 * 抵扣券管理页面
 */
const DiscountVoucher: React.FC = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [open, setOpen] = useState(false);
    const [openGuidanceDialog, setOpenGuidanceDialog] = useState(false);
    const [currentGuidanceData, setCurrentGuidanceData] = useState<{ text: string; video: File | null } | null>(null);
    const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
    const [submitting, setSubmitting] = useState(false);
    const [createTideSpotConfig] = useMutation<CreateTideSpotConfigResponse>(CREATE_TIDE_SPOT_CONFIG);
    const [updateTideSpotConfig] = useMutation(UPDATE_TIDE_SPOT_CONFIG);

    const { loading, data, refetch } = useQuery<TideSpotConfigResponse>(TIDE_SPOT_CONFIG_LIST, {
        variables: {
            first: rowsPerPage,
            last: rowsPerPage,
            type: 'Deduction',
            after: ''
        },
        fetchPolicy: 'network-only'
    });

    // Convert API data to display format
    const displayRows = useMemo(() => {
        if (!data?.tideSpotConfigList?.edges) return [];
        return data.tideSpotConfigList.edges.map(({ node }: TideSpotConfigEdge) => ({
            id: node.id,
            sceneryName: node.tideSpotName || '未知景区',
            voucherName: node.couponName,
            useLimit: node.desc,
            expireTime: new Date(parseInt(node.effectiveTime) * 1000).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).replace(/\//g, '-'),
            totalCount: node.generateNum,
            discountedCount: node.useNum,
            undiscountedCount: node.notUseNum,
            discountAmount: node.useAmount,
            triggerRule: node.generateRule,
            createTime: new Date(parseInt(node.createTime) * 1000).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).replace(/\//g, '-'),
            status: node.stateText as '正常' | '已过期' | '已终止',
            guidance: node.guideDesc ? { text: node.guideDesc, video: node.guideVideoPath ? new File([node.guideVideoPath], node.guideVideoPath.split('/').pop() || '') : null } : undefined
        }));
    }, [data?.tideSpotConfigList?.edges]);

    // Update stats from API data
    const stats = useMemo(() => {
        if (!data?.tideSpotConfigList) return mockStats;
        return [
            {
                title: '生成抵扣券（张）',
                value: data.tideSpotConfigList.totalGenerateNum.toString(),
                icon: <CustomIcon src="https://gd-1258904493.cos.ap-guangzhou.myqcloud.com/shenzhouyinji/icon_be.png" />,
                bgColor: '#F41515'
            },
            {
                title: '抵扣金额（元）',
                value: data.tideSpotConfigList.totalUseAmount.toString(),
                icon: <CustomIcon src="https://gd-1258904493.cos.ap-guangzhou.myqcloud.com/shenzhouyinji/icon_money.png" />,
                bgColor: '#FA7202'
            },
            {
                title: '已抵扣数（张）',
                value: data.tideSpotConfigList.totalUseNum.toString(),
                icon: <CustomIcon src="https://gd-1258904493.cos.ap-guangzhou.myqcloud.com/shenzhouyinji/icon_exchanged.png" />,
                bgColor: '#FFCC00'
            },
            {
                title: '未抵扣数（张）',
                value: data.tideSpotConfigList.totalNotUseNum.toString(),
                icon: <CustomIcon src="https://gd-1258904493.cos.ap-guangzhou.myqcloud.com/shenzhouyinji/icon_no_exchange.png" />,
                bgColor: '#7DD000'
            },
        ];
    }, [data?.tideSpotConfigList]);

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

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, fieldName: 'voucherImage' | 'matchImage') => {
        if (event.target.files && event.target.files[0]) {
            setFormData(prev => ({ ...prev, [fieldName]: event.target.files![0] }));
        } else {
            setFormData(prev => ({ ...prev, [fieldName]: null }));
        }
        event.target.value = '';
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!formData.sceneryId || !formData.voucherName) {
            console.error('Required fields are missing');
            return;
        }

        try {
            setSubmitting(true);
            const input: NewTideSpotConfig = {
                tideSpotId: formData.sceneryId,
                tideSpotName: formData.sceneryId === '1' ? '丹霞山风景区' : '未知景区',
                couponName: formData.voucherName,
                type: 'Deduction',
                compareWord: formData.keywordMatch || '',
                couponImgPath: formData.voucherImage ? (await FileUploader.uploadFile(formData.voucherImage, { tag: 'image' })).file.uri : '/',
                compareLogoPath: formData.matchImage ? (await FileUploader.uploadFile(formData.matchImage, { tag: 'image' })).file.uri : '/',
                desc: formData.useLimit || '',
                effectiveTime: formData.expireTime ? Math.floor(new Date(formData.expireTime).getTime() / 1000) : Math.floor(Date.now() / 1000),
                tideSpotGoodListJson: JSON.stringify(formData.applicableProducts.map(product => ({
                    goodName: product.name || '',
                    goodBarCode: product.barcode || ''
                }))).replace(/"/g, '\\"'),
                minimumAmount: formData.discountRules[0]?.totalAmount ? parseFloat(formData.discountRules[0].totalAmount) : 0,
                deductionAmount: formData.discountRules[0]?.discountAmount ? parseFloat(formData.discountRules[0].discountAmount) : 0
            };

            await createTideSpotConfig({
                variables: { input }
            });

            handleClose();
            await refetch();
        } catch (error) {
            console.error('Failed to create discount voucher:', error);
        } finally {
            setSubmitting(false);
        }
    }, [formData, createTideSpotConfig, handleClose, refetch]);

    const handleChangePage = useCallback((event: unknown, newPage: number) => {
        setPage(newPage);
        const cursor = newPage > page
            ? data?.tideSpotConfigList?.pageInfo?.endCursor
            : data?.tideSpotConfigList?.pageInfo?.startCursor;
        refetch({
            first: rowsPerPage,
            last: rowsPerPage,
            type: 'Deduction',
            after: cursor || ''
        });
    }, [page, data?.tideSpotConfigList?.pageInfo, refetch, rowsPerPage]);

    const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(0);
        refetch({
            first: newRowsPerPage,
            last: newRowsPerPage,
            type: 'Deduction',
            after: ''
        });
    }, [refetch]);

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

    const handleTerminate = useCallback(async (id: string) => {
        try {
            const input: UpdateTideSpotConfig = {
                id: id.toString(),
                enable: false
            };

            await updateTideSpotConfig({
                variables: { input }
            });
            await refetch();
        } catch (error) {
            console.error('Failed to terminate discount voucher:', error);
        }
    }, [updateTideSpotConfig, refetch]);

    const handleOpenGuidanceDialog = useCallback((rowData: DiscountVoucherRow) => {
        setCurrentGuidanceData(rowData.guidance || { text: '', video: null });
        setSelectedRowId(rowData.id);
        setOpenGuidanceDialog(true);
    }, []);

    const handleCloseGuidanceDialog = useCallback(() => {
        setOpenGuidanceDialog(false);
        setCurrentGuidanceData(null);
        setSelectedRowId(null);
    }, []);

    const handleGuidanceSubmit = useCallback(async (guidance: { text: string; video: File | null }) => {
        if (!selectedRowId) {
            console.error('No selected row ID');
            return;
        }

        try {
            let guideVideoPath: string | undefined;
            
            if (guidance.video) {
                const uploadResult = await FileUploader.uploadFile(guidance.video, { tag: 'video' });
                if (!uploadResult.success) {
                    throw new Error(uploadResult.message || 'Failed to upload video');
                }
                guideVideoPath = uploadResult.file.uri;
            }

            const input: UpdateTideSpotConfig = {
                id: selectedRowId,
                enable: true,
                guideDesc: guidance.text,
                guideVideoPath
            };

            console.log('Submitting guidance update:', input);

            const result = await updateTideSpotConfig({
                variables: { input }
            });

            console.log('Guidance update result:', result);

            if (result.data?.updateTideSpotConfig.succed) {
                setOpenGuidanceDialog(false);
                setCurrentGuidanceData(null);
                await refetch();
            } else {
                console.error('Failed to update guidance:', result.data?.updateTideSpotConfig.message);
            }
        } catch (error) {
            console.error('Failed to update guidance:', error);
        }
    }, [selectedRowId, updateTideSpotConfig, refetch]);

    return (
        <Box sx={{ pt: 8 }}>
            <PageHeader container>
                <Grid item xs={4}>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Typography color="text.primary">{"潮品礼遇"}</Typography>
                    </Breadcrumbs>
                    <Title variant='h1'>{"抵扣券管理"}</Title>
                </Grid>
                <Grid item xs={8} sx={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end" }}>
                    <LinkButton
                        disableElevation
                        variant="contained"
                        startIcon={<Box
                            component="img"
                            src="https://gd-1258904493.cos.ap-guangzhou.myqcloud.com/shenzhouyinji/icon_add@3x.png"
                            alt="icon"
                            sx={{ width: 20, height: 20 }}
                        />}
                        onClick={handleOpen}
                    >
                        {"添加"}
                    </LinkButton>
                </Grid>
            </PageHeader>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle sx={STYLES.dialogTitle}>
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
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <DiscountDialogContent
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleSelectChange={handleSelectChange}
                        handleProductChange={handleProductChange}
                        addProduct={addProduct}
                        removeProduct={removeProduct}
                        handleRuleChange={handleRuleChange}
                        addRule={addRule}
                        removeRule={removeRule}
                        handleFileChange={handleFileChange}
                    />
                </DialogContent>
                <DialogActions sx={STYLES.dialogActions}>
                    <Button onClick={handleClose} sx={{ mr: 1 }}>取消</Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? '提交中...' : '确定'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Paper sx={STYLES.statsContainer}>
                <Grid item container justifyContent="space-evenly">
                    {stats.map((stat: StatCardProps, index: number) => (
                        <Grid item sm={3} md={3} key={index}>
                            <StatCard {...stat} />
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            <TableContainer component={Paper} sx={{
                mt: 3,
                pl: '37px', pr: '37px',
                borderRadius: '10px',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                '& .MuiTable-root': {
                    p: 2
                },
                position: 'relative'
            }}>
                {loading && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bgcolor: 'rgba(255, 255, 255, 0.7)',
                            zIndex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <CircularProgress />
                    </Box>
                )}
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
                                <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.useLimit}>{row.useLimit}</TableCell>
                                <TableCell>{row.expireTime}</TableCell>
                                <TableCell>{row.totalCount}</TableCell>
                                <TableCell>{row.discountedCount}</TableCell>
                                <TableCell>{row.undiscountedCount}</TableCell>
                                <TableCell>{row.discountAmount}</TableCell>
                                <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.triggerRule}>{row.triggerRule}</TableCell>
                                <TableCell>{row.createTime}</TableCell>
                                <TableCell>
                                    <Chip label={row.status} color={getStatusChipColor(row.status)} size="small" />
                                </TableCell>
                                <TableCell>
                                    {row.status === '正常' && (
                                        <Button
                                            size="small"
                                            color="error"
                                            sx={{ minWidth: 'auto', p: 0.5 }}
                                            onClick={() => handleTerminate(row.id)}
                                        >
                                            中止
                                        </Button>
                                    )}
                                    <Button
                                        size="small"
                                        color="info"
                                        sx={{ minWidth: 'auto', p: 0.5, ml: row.status === '正常' ? 1 : 0 }}
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
                    count={data?.tideSpotConfigList?.totalCount || 0}
                    labelRowsPerPage="页面数量:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            {/* 指引弹窗 */}
            <GuidanceDialog
                open={openGuidanceDialog}
                onClose={handleCloseGuidanceDialog}
                onSubmit={handleGuidanceSubmit}
                data={currentGuidanceData}
            />
        </Box>
    );
};

export default DiscountVoucher;
