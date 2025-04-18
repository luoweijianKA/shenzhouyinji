import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Box,
    Breadcrumbs,
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
    CircularProgress
} from '@mui/material';
import { AddCircleOutline, CameraAlt, Close, RemoveCircleOutline } from '@mui/icons-material';
import { ContentState, convertFromHTML, convertFromRaw, convertToRaw, EditorState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { LinkButton, PageHeader, Title } from "../styled";
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';

/**
 * 统计卡片组件
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
 * 兑换券表格行数据结构
 */
interface ExchangeVoucherRow {
    id: string;
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
                        <FormLabel sx={{ mb: 1.5,mt:3, fontWeight: 'normal' }}>操作指引:</FormLabel>
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
 * 添加/编辑表单数据结构
 */
interface AddFormData {
    sceneryId: string;
    sceneryName: string;
    voucherName: string;
    keywordMatch: string;
    voucherImage: File | null;
    matchImage: File | null;
    useLimit: string;
    expireTime: string;
    voucherContents: { id: number; value: string }[];
}

const INITIAL_ADD_FORM_DATA: AddFormData = {
    sceneryId: '',
    sceneryName: '',
    voucherName: '',
    keywordMatch: '',
    voucherImage: null,
    matchImage: null,
    useLimit: '',
    expireTime: '',
    voucherContents: [{ id: Date.now(), value: '' }, { id: Date.now() + 1, value: '' }],
};

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

const mockStats = [
    {
        title: '生成兑换券（张）',
        value: '5231',
        icon: <CustomIcon src="https://gd-1258904493.cos.ap-guangzhou.myqcloud.com/shenzhouyinji/icon_be.png" />,
        bgColor: '#F41515'
    },
    {
        title: '兑换金额（元）',
        value: '12560',
        icon: <CustomIcon src="https://gd-1258904493.cos.ap-guangzhou.myqcloud.com/shenzhouyinji/icon_money.png" />,
        bgColor: '#FA7202'
    },
    {
        title: '已兑换数（张）',
        value: '3120',
        icon: <CustomIcon src="https://gd-1258904493.cos.ap-guangzhou.myqcloud.com/shenzhouyinji/icon_exchanged.png" />,
        bgColor: '#FFCC00'
    },
    {
        title: '未兑换数（张）',
        value: '2111',
        icon: <CustomIcon
            src="https://gd-1258904493.cos.ap-guangzhou.myqcloud.com/shenzhouyinji/icon_no_exchange.png" />,
        bgColor: '#7DD000'
    },
];

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

/**
 * 表格中状态对应的状态颜色
 */
const getStatusChipColor = (status: ExchangeVoucherRow['status']) => {
    switch (status) {
        case '正常': return 'success';
        case '已过期': return 'warning';
        case '已终止': return 'error';
        default: return 'default';
    }
};

/**
 * 添加内容表单项组件
 */
const VoucherContentItem = React.memo<{
    content: { id: number, value: string },
    index: number,
    total: number,
    onValueChange: (index: number, value: string) => void,
    onRemove: (id: number) => void,
    onAdd: () => void
}>(({ content, index, total, onValueChange, onRemove, onAdd }) => (
    <Box sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        mb: index === total - 1 ? 0 : 1.5
    }}>
        <TextField
            fullWidth
            required
            placeholder="例如：哈根达斯单球一个"
            value={content.value}
            onChange={(e) => onValueChange(index, e.target.value)}
            size="small"
            sx={{
                bgcolor: 'white',
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: '#E0E0E0',
                    },
                    '&:hover fieldset': {
                        borderColor: '#BDBDBD',
                    },
                }
            }}
        />
        <Box sx={{
            display: 'flex',
            gap: 1,
            minWidth: '65px',
            justifyContent: 'flex-start'
        }}>
            <IconButton
                size="small"
                color="error"
                onClick={() => onRemove(content.id)}
                sx={{
                    bgcolor: '#FFF5F5',
                    width: '28px',
                    height: '28px',
                    minWidth: '28px',
                    '&:hover': {
                        bgcolor: '#FDDAD8'
                    },
                    '&.Mui-disabled': {
                        bgcolor: '#F5F5F5'
                    }
                }}
                disabled={total <= 1}
            >
                <RemoveCircleOutline fontSize="small" />
            </IconButton>
            {index === total - 1 && (
                <IconButton
                    size="small"
                    color="error"
                    onClick={onAdd}
                    sx={{
                        bgcolor: '#FFF5F5',
                        width: '28px',
                        height: '28px',
                        minWidth: '28px',
                        '&:hover': {
                            bgcolor: '#FDDAD8'
                        }
                    }}
                >
                    <AddCircleOutline fontSize="small" sx={{ color: '#F44336' }} />
                </IconButton>
            )}
        </Box>
    </Box>
));

/**
 * 添加内容表单区域组件
 */
const VoucherContentsSection = React.memo<{
    contents: { id: number, value: string }[],
    onValueChange: (index: number, value: string) => void,
    onAdd: () => void,
    onRemove: (id: number) => void
}>(({ contents, onValueChange, onAdd, onRemove }) => (
    <Box sx={{
        bgcolor: '#F5F5F5',
        p: 2,
        borderRadius: 1,
        flexGrow: 1,
        position: 'relative',
        border: 'none'
    }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'normal', color: '#333' }}>
            生成兑换券内容：
        </Typography>
        <Box sx={{ mb: 1 }}>
            {contents.map((content, index) => (
                <VoucherContentItem
                    key={content.id}
                    content={content}
                    index={index}
                    total={contents.length}
                    onValueChange={onValueChange}
                    onRemove={onRemove}
                    onAdd={onAdd}
                />
            ))}
        </Box>
    </Box>
));

/**
 * 添加/编辑弹窗内容组件
 */
const AddDialogContent = React.memo<{
    formData: AddFormData,
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
    handleSelectChange: (e: SelectChangeEvent<string>) => void,
    handleVoucherContentChange: (index: number, value: string) => void,
    addVoucherContent: () => void,
    removeVoucherContent: (id: number) => void,
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>, fieldName: 'voucherImage' | 'matchImage') => void
}>(({
    formData,
    handleInputChange,
    handleSelectChange,
    handleVoucherContentChange,
    addVoucherContent,
    removeVoucherContent,
    handleFileChange
}) => (
    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormLabel sx={STYLES.formLabel}>所属景区:</FormLabel>
            <FormControl fullWidth size="small">
                <InputLabel id="add-scenery-select-label"
                    sx={{ ...(formData.sceneryId && { display: 'none' }) }}>请选择</InputLabel>
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
            <FormLabel required sx={STYLES.formLabel}>*兑换券名称:</FormLabel>
            <TextField required fullWidth name="voucherName" value={formData.voucherName}
                onChange={handleInputChange} size="small" />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormLabel sx={STYLES.formLabel}>比对凭证关键字:</FormLabel>
            <TextField fullWidth name="keywordMatch" value={formData.keywordMatch} onChange={handleInputChange}
                size="small" />
        </Box>

        {/* Moved Image Upload Fields Below Keyword Match */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                <FormLabel sx={{ ...STYLES.formLabel, pt: 0 }}>电子券图片:</FormLabel>
                <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CameraAlt sx={{ color: '#F44336' }} />}
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
                    startIcon={<CameraAlt sx={{ color: '#F44336' }} />}
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
            <TextField fullWidth name="useLimit" value={formData.useLimit} onChange={handleInputChange} multiline
                rows={3} size="small" />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormLabel sx={STYLES.formLabel}>有效时间:</FormLabel>
            <TextField fullWidth name="expireTime" type="text" value={formData.expireTime}
                onChange={handleInputChange} size="small" placeholder="例如：2024-12-31" />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>

            <VoucherContentsSection
                contents={formData.voucherContents}
                onValueChange={handleVoucherContentChange}
                onAdd={addVoucherContent}
                onRemove={removeVoucherContent}
            />
        </Box>
    </Box>
));

/**
 * 表格行操作按钮组件
 */
const RowActions = React.memo<{
    row: ExchangeVoucherRow,
    onOpenGuidance: (row: ExchangeVoucherRow) => void,
    onTerminate: (id: string) => void
}>(({ row, onOpenGuidance, onTerminate }) => (
    <>
        {row.status === '正常' &&
            <Button 
                size="small" 
                color="error" 
                sx={{ minWidth: 'auto', p: 0.5 }}
                onClick={() => onTerminate(row.id)}
            >
                中止
            </Button>
        }
        <Button
            size="small"
            color="info"
            sx={{ minWidth: 'auto', p: 0.5, ml: row.status === '正常' ? 1 : 0 }}
            onClick={() => onOpenGuidance(row)}
        >
            指引
        </Button>
    </>
));

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

interface NewTideSpotConfig {
    tideSpotId: string;
    tideSpotName: string;
    couponName: string;
    type: string;
    compareWord: string;
    couponImgPath: string;
    compareLogoPath: string;
    desc: string;
    effectiveTime: number;
    couponContent: string;
}

interface CreateTideSpotConfigResponse {
    createTideSpotConfig: {
        id: string;
    };
}

interface UpdateTideSpotConfig {
    id: string;
    guideVideoPath?: string;
    guideDesc?: string;
}

interface UpdateTideSpotConfigResponse {
    updateTideSpotConfig: {
        succed: boolean;
        message: string;
        __typename: string;
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
      __typename
    }
  }
`;

interface ExchangeVoucherProps {}

/**
 * 兑换券管理页面
 */
const ExchangeVoucher: React.FC<ExchangeVoucherProps> = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openGuidanceDialog, setOpenGuidanceDialog] = useState(false);
    const [currentGuidanceData, setCurrentGuidanceData] = useState<{ text: string; video: File | null } | null>(null);
    const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
    const [formData, setFormData] = useState<AddFormData>(INITIAL_ADD_FORM_DATA);
    const [createTideSpotConfig, { loading: submitting }] = useMutation<CreateTideSpotConfigResponse>(CREATE_TIDE_SPOT_CONFIG);
    const [updateTideSpotConfig] = useMutation<UpdateTideSpotConfigResponse>(UPDATE_TIDE_SPOT_CONFIG);

    const { loading, data, refetch } = useQuery<TideSpotConfigResponse>(TIDE_SPOT_CONFIG_LIST, {
        variables: {
            first: rowsPerPage,
            last: rowsPerPage,
            type: 'Exchange',
            after: ''
        },
        fetchPolicy: 'network-only'
    });

    // Convert API data to display format
    const displayRows = useMemo(() => {
        if (!data?.tideSpotConfigList?.edges) return [];
        console.log('渲染的数据',data.tideSpotConfigList.edges[0].node.id)
        return data.tideSpotConfigList.edges.map(({ node }: TideSpotConfigEdge) => {
            // 格式化创建时间
            const createTime = new Date(parseInt(node.createTime) * 1000).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).replace(/\//g, '-');

            // 格式化有效期时间
            const expireTime = new Date(parseInt(node.effectiveTime) * 1000).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).replace(/\//g, '-');

            return {
                id: node.id,
                sceneryName: node.tideSpotName,
                voucherName: node.couponName,
                useLimit: node.desc,
                expireTime: expireTime,
                totalCount: node.generateNum,
                exchangedCount: node.useNum,
                unexchangedCount: node.notUseNum,
                exchangedAmount: node.useAmount,
                triggerRule: node.generateRule,
                createTime: createTime,
                status: node.stateText as '正常' | '已过期' | '已终止',
                guidance: node.guideDesc ? {
                    text: node.guideDesc,
                    video: null
                } : undefined
            };
        });
    }, [data?.tideSpotConfigList?.edges]);

    // Update stats from API data
    const stats = useMemo(() => {
        if (!data?.tideSpotConfigList) return mockStats;
        return [
            {
                title: '生成兑换券（张）',
                value: data.tideSpotConfigList.totalGenerateNum.toString(),
                icon: <CustomIcon src="https://gd-1258904493.cos.ap-guangzhou.myqcloud.com/shenzhouyinji/icon_be.png" />,
                bgColor: '#F41515'
            },
            {
                title: '兑换金额（元）',
                value: data.tideSpotConfigList.totalUseAmount.toString(),
                icon: <CustomIcon src="https://gd-1258904493.cos.ap-guangzhou.myqcloud.com/shenzhouyinji/icon_money.png" />,
                bgColor: '#FA7202'
            },
            {
                title: '已兑换数（张）',
                value: data.tideSpotConfigList.totalUseNum.toString(),
                icon: <CustomIcon src="https://gd-1258904493.cos.ap-guangzhou.myqcloud.com/shenzhouyinji/icon_exchanged.png" />,
                bgColor: '#FFCC00'
            },
            {
                title: '未兑换数（张）',
                value: data.tideSpotConfigList.totalNotUseNum.toString(),
                icon: <CustomIcon src="https://gd-1258904493.cos.ap-guangzhou.myqcloud.com/shenzhouyinji/icon_no_exchange.png" />,
                bgColor: '#7DD000'
            },
        ];
    }, [data?.tideSpotConfigList]);

    const handleChangePage = useCallback((event: unknown, newPage: number) => {
        setPage(newPage);
        const cursor = newPage > page
            ? data?.tideSpotConfigList?.pageInfo?.endCursor
            : data?.tideSpotConfigList?.pageInfo?.startCursor;
        refetch({
            first: rowsPerPage,
            last: rowsPerPage,
            type: 'Exchange',
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
            type: 'Exchange',
            after: ''
        });
    }, [refetch]);

    const handleOpenAddDialog = useCallback(() => {
        setFormData(INITIAL_ADD_FORM_DATA);
        setOpenAddDialog(true);
    }, []);

    const handleCloseAddDialog = useCallback(() => {
        setOpenAddDialog(false);
    }, []);

    const handleOpenGuidanceDialog = useCallback((rowData: ExchangeVoucherRow) => {
        setCurrentGuidanceData(rowData.guidance || { text: '', video: null });
        setSelectedRowId(rowData.id);
        console.log(rowData)
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
            const input: UpdateTideSpotConfig = {
                id: selectedRowId.toString(),
                guideDesc: guidance.text,
                guideVideoPath: guidance.video ? await uploadFile(guidance.video) : undefined
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

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSelectChange = useCallback((e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        if (name === 'sceneryId') {
            // 根据选择的景区ID设置景区名称
            const selectedSceneryName = value === '1' ? '长隆欢乐世界' : '';
            setFormData((prevState: AddFormData) => ({
                ...prevState,
                sceneryId: value,
                sceneryName: selectedSceneryName
            }));
        } else {
            setFormData((prevState: AddFormData) => ({
                ...prevState,
                [name as keyof AddFormData]: value
            }));
        }
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

    const handleAddSubmit = useCallback(async () => {
        try {
            const input: NewTideSpotConfig = {
                tideSpotId: formData.sceneryId,
                tideSpotName: formData.sceneryName,
                couponName: formData.voucherName,
                type: 'Exchange',
                compareWord: formData.keywordMatch,
                couponImgPath: formData.voucherImage ? await uploadFile(formData.voucherImage) : '/',
                compareLogoPath: formData.matchImage ? await uploadFile(formData.matchImage) : '/',
                desc: formData.useLimit,
                effectiveTime: Math.floor(new Date(formData.expireTime).getTime() / 1000),
                couponContent: formData.voucherContents.map(content => content.value).join(',')
            };

            await createTideSpotConfig({
                variables: { input }
            });

            handleCloseAddDialog();
            await refetch();
        } catch (error) {
            console.error('Failed to create exchange voucher:', error);
        }
    }, [formData, createTideSpotConfig, handleCloseAddDialog, refetch]);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, fieldName: 'voucherImage' | 'matchImage') => {
        if (event.target.files && event.target.files[0]) {
            setFormData(prev => ({ ...prev, [fieldName]: event.target.files![0] }));
        } else {
            setFormData(prev => ({ ...prev, [fieldName]: null }));
        }
        event.target.value = '';
    }, []);

    const handleTerminate = useCallback(async (id: string) => {
        try {
            const result = await updateTideSpotConfig({
                variables: {
                    input: {
                        id,
                        enable: false
                    }
                }
            });

            if (result.data?.updateTideSpotConfig.succed) {
                await refetch();
            } else {
                console.error('Failed to terminate voucher:', result.data?.updateTideSpotConfig.message);
            }
        } catch (error) {
            console.error('Failed to terminate voucher:', error);
        }
    }, [updateTideSpotConfig, refetch]);

    return (
        <Box sx={{ pt: 8 }}>
            <PageHeader container>
                <Grid item xs={4}>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Typography color="text.primary">{"潮品礼遇"}</Typography>
                    </Breadcrumbs>
                    <Title variant='h1'>{"兑换券管理"}</Title>
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
                        onClick={handleOpenAddDialog}
                    >
                        {"添加"}
                    </LinkButton>
                </Grid>
            </PageHeader>

            {/* 添加弹窗 */}
            <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
                <DialogTitle sx={STYLES.dialogTitle}>
                    添加
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseAddDialog}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <AddDialogContent
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleSelectChange={handleSelectChange}
                        handleVoucherContentChange={handleVoucherContentChange}
                        addVoucherContent={addVoucherContent}
                        removeVoucherContent={removeVoucherContent}
                        handleFileChange={handleFileChange}
                    />
                </DialogContent>
                <DialogActions sx={STYLES.dialogActions}>
                    <Button onClick={handleCloseAddDialog} sx={{ mr: 1 }}>取消</Button>
                    <Button
                        variant="contained"
                        onClick={handleAddSubmit}
                        disabled={submitting}
                    >
                        {submitting ? '提交中...' : '确定'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 指引弹窗 */}
            <GuidanceDialog
                open={openGuidanceDialog}
                onClose={handleCloseGuidanceDialog}
                onSubmit={handleGuidanceSubmit}
                data={currentGuidanceData}
            />

            {/* 统计卡片 */}
            <Paper sx={STYLES.statsContainer}>
                <Grid item container justifyContent="space-evenly">
                    {stats.map((stat, index) => (
                        <Grid item sm={3} md={3} key={index}>
                            <StatCard {...stat} />
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            {/* 兑换券表格 */}
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
                                <TableCell sx={STYLES.truncatedCell} title={row.useLimit}>{row.useLimit}</TableCell>
                                <TableCell>{row.expireTime}</TableCell>
                                <TableCell>{row.totalCount}</TableCell>
                                <TableCell>{row.exchangedCount}</TableCell>
                                <TableCell>{row.unexchangedCount}</TableCell>
                                <TableCell>{row.exchangedAmount}</TableCell>
                                <TableCell sx={STYLES.truncatedCell} title={row.triggerRule}>{row.triggerRule}</TableCell>
                                <TableCell>{row.createTime}</TableCell>
                                <TableCell>
                                    <Chip label={row.status} color={getStatusChipColor(row.status)} size="small" />
                                </TableCell>
                                <TableCell>
                                    <RowActions 
                                        row={row} 
                                        onOpenGuidance={handleOpenGuidanceDialog} 
                                        onTerminate={handleTerminate}
                                    />
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
        </Box>
    );
};

// Helper function to upload files
const uploadFile = async (file: File): Promise<string> => {
    // TODO: Implement file upload logic
    return '/';
};

export default ExchangeVoucher;
