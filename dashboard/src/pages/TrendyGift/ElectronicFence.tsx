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
import { gql, useQuery } from '@apollo/client'; // 导入 gql 和 useQuery
import Loading from 'components/Loading';
import Empty from 'components/Empty';
import QQMap from 'components/QQMap';
import { PageHeader,Title,LinkButton } from '../styled';
import { formattedDateTime } from 'utils'; // 导入日期格式化函数

/**
 * GraphQL 查询：获取潮汐点（电子围栏）列表
 */
const GET_TIDE_SPOT_LIST = gql`
  query TideSpotList($first: Int = 20, $after: ID, $last: Int = 20, $before: ID, $name: String) {
    tideSpotList(
      first: $first
      after: $after
      last: $last
      before: $before
      name: $name
    ) {
      totalCount
      edges {
        node {
          id
          name
          electricFence
          createTime
          updateTime
          positionTolerance
          __typename
        }
        __typename
      }
      pageInfo {
        startCursor
        endCursor
        hasPreviousPage
        hasNextPage
        __typename
      }
      __typename
    }
  }
`;

/**
 * 电子围栏节点数据结构 (对应 GraphQL node)
 */
interface TideSpotNode {
    id: string;
    name: string;
    electricFence: string;
    createTime: number; // 假设是时间戳
    updateTime: number; // 假设是时间戳
    positionTolerance: number; // 假设是数字
    __typename: string;
}

/**
 * 分页信息结构
 */
interface PageInfo {
  startCursor?: string;
  endCursor?: string;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  __typename: string;
}

/**
 * GraphQL 查询返回的数据结构
 */
interface TideSpotListQueryData {
  tideSpotList: {
    totalCount: number;
    edges: {
      node: TideSpotNode;
      __typename: string;
    }[];
    pageInfo: PageInfo;
    __typename: string;
  };
}

/**
 * 组件内部状态，包含分页和搜索参数
 */
interface ComponentState {
    first: number; // 每页数量 (对应 rowsPerPage)
    after?: string; // 下一页光标
    last: number; // 用于向前翻页时设置 first=null, last=rowsPerPage
    before?: string; // 上一页光标
    name?: string; // 搜索名称 (对应 searchParams.sceneryName)
    page: number; // 当前页码 (基于0)
    totalCount: number; // 总记录数
    startCursor?: string; // 当前页的起始光标
    endCursor?: string; // 当前页的结束光标
    hasPreviousPage: boolean;
    hasNextPage: boolean;
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

/**
 * 电子围栏管理页面
 */
const ElectronicFence: React.FC = () => {
    // 分页和搜索状态管理，参考 User/index.tsx
    const [state, setState] = useState<ComponentState>({
        first: 20, // 默认每页20条
        last: 20,
        page: 0,
        totalCount: 0,
        hasPreviousPage: false,
        hasNextPage: false,
    });

    const { first, after, last, before, name, totalCount } = state;

    // 添加/编辑弹窗状态
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [formData, setFormData] = useState<FenceFormData>(INITIAL_FENCE_FORM_DATA);
    const [isEditing, setIsEditing] = useState(false); // 标记是否为编辑状态
    const [editingId, setEditingId] = useState<string | null>(null); // 标记正在编辑的ID

    // 执行 GraphQL 查询
    const { data, loading, error, refetch } = useQuery<TideSpotListQueryData>(GET_TIDE_SPOT_LIST, {
        variables: { first: after || !before ? first : null, after, last: last, before, name }, // 根据分页方向调整 first/last
        fetchPolicy: "network-only", // 或者 "cache-and-network"
        notifyOnNetworkStatusChange: true,
    });

    // 处理 GraphQL 返回的数据和分页信息
    useEffect(() => {
        if (data?.tideSpotList) {
            const { totalCount, pageInfo } = data.tideSpotList;
            setState(prev => ({
                ...prev,
                totalCount,
                startCursor: pageInfo.startCursor,
                endCursor: pageInfo.endCursor,
                hasPreviousPage: pageInfo.hasPreviousPage,
                hasNextPage: pageInfo.hasNextPage,
            }));
        }
    }, [data]);

    // 从 GraphQL 数据中提取电子围栏列表
    const fenceData: TideSpotNode[] = useMemo(() => {
        return data?.tideSpotList?.edges?.map(edge => edge.node) || [];
    }, [data]);

    // 处理加载错误
    useEffect(() => {
        if (error) {
            console.error("Failed to fetch electronic fences:", error);
            // 可以在这里设置错误状态，例如 setErrorState(error)
        }
    }, [error]);

    // 分页改变处理
    const handleChangePage = useCallback((event: unknown, newPage: number) => {
        setState(prev => {
             let newAfter = prev.after;
             let newBefore = prev.before;

             if (newPage === 0) { // 回到第一页
                newAfter = undefined;
                newBefore = undefined;
            } else if (newPage > prev.page && prev.hasNextPage) { // 下一页
                newAfter = prev.endCursor;
                newBefore = undefined;
            } else if (newPage < prev.page && prev.hasPreviousPage) { // 上一页
                newAfter = undefined;
                newBefore = prev.startCursor;
            } else {
                 // 如果页码无效或没有更多页，则不改变 after/before
                 console.warn("Invalid page change attempted or no more pages.");
                 return prev; // 保持当前状态
             }

             return {
                 ...prev,
                 page: newPage,
                 after: newAfter,
                 before: newBefore,
             };
        });
    }, []);

    // 每页行数改变处理
    const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setState(prev => ({
            ...prev,
            first: newRowsPerPage,
            last: newRowsPerPage, // 同步 last
            page: 0, // 回到第一页
            after: undefined,
            before: undefined,
        }));
    }, []);

    // 搜索处理
    const handleSearch = useCallback(() => {
        // 搜索时重置分页状态并触发 refetch (通过变量变化自动触发)
        setState(prev => ({
            ...prev,
            page: 0,
            after: undefined,
            before: undefined,
            // name 已经在 handleSearchInputChange 中设置
        }));
        // useQuery 会因为 name 变量变化自动重新查询
    }, []);

    // 搜索输入框变化处理
    const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setState(prev => ({ ...prev, name: value || undefined })); // 更新搜索名称
    }, []);

    // --- 添加/编辑弹窗相关逻辑 ---

    const handleDialogInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleMapChange = useCallback((coordinates: string) => {
        setFormData(prev => ({ ...prev, fenceCoordinates: coordinates }));
        console.log("Fence Coordinates:", coordinates);
    }, []);

    const handleSearchLocation = useCallback(() => {
        // TODO: 实现地图位置搜索逻辑
        console.log("Searching map location:", formData.locationSearch);
    }, [formData.locationSearch]);

    const handleOpenAddDialog = useCallback(() => {
        setIsEditing(false);
        setEditingId(null);
        setFormData(INITIAL_FENCE_FORM_DATA); // 重置表单
        setOpenAddDialog(true);
    }, []);

    const handleCloseAddDialog = useCallback(() => {
        setOpenAddDialog(false);
        setIsEditing(false);
        setEditingId(null);
    }, []);

    const handleAddSubmit = useCallback(async () => { // 假设提交也是异步的
        console.log(isEditing ? 'Updating electronic fence:' : 'Adding electronic fence:', formData);
        // TODO: 实现添加或更新的 API 调用逻辑
        // try {
        //    if (isEditing && editingId) {
        //        // await updateFenceMutation({ variables: { id: editingId, input: mapFormDataToInput(formData) } });
        //    } else {
        //        // await addFenceMutation({ variables: { input: mapFormDataToInput(formData) } });
        //    }
        //    refetch(); // 成功后刷新列表
        //    handleCloseAddDialog();
        // } catch (submitError) {
        //    console.error("Failed to submit fence:", submitError);
        //    // 处理提交错误，例如显示错误消息
        // }
        handleCloseAddDialog(); // 暂时直接关闭
    }, [formData, isEditing, editingId, handleCloseAddDialog, refetch]);

    const handleViewFence = useCallback((id: string | number) => {
        // TODO: 实现查看逻辑，可能跳转到详情页或打开只读弹窗
        console.log("View fence:", id);
    }, []);

    const handleEditFence = useCallback((fence: TideSpotNode) => {
        console.log("Edit fence:", fence);
        setIsEditing(true);
        setEditingId(fence.id);
        // 将列表数据填充到表单
        // 注意：fenceName 和 fenceCoordinates 的映射关系需要确认
        setFormData({
           sceneryName: fence.name,
           locationSearch: '', // 编辑时可能不需要或需要重新获取
           fenceName: fence.electricFence, // 假设 electricFence 是名称
           fenceCoordinates: '', // 需要获取或转换 electricFence 数据
           tolerance: fence.positionTolerance?.toString() || '', // 转换为字符串
        });
        setOpenAddDialog(true); // 打开弹窗进行编辑
    }, []);

    // --- 渲染逻辑 ---

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
                                value={state.name || ''}
                                onChange={handleSearchInputChange}
                                size="small"
                                placeholder="输入景区名称搜索"
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
                 {error && <Typography color="error" sx={{ p: 2 }}>加载电子围栏列表失败: {error.message}</Typography>}
                 {!loading && !error && fenceData.length === 0 && <Empty />}
                 {!loading && !error && fenceData.length > 0 && (
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
                                {fenceData.map((row: TideSpotNode) => (
                                    <TableRow key={row.id}>
                                        <TableCell>{row.id}</TableCell>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell>{row.electricFence}</TableCell>
                                        <TableCell>{formattedDateTime(new Date(row.createTime * 1000))}</TableCell>
                                        <TableCell>{formattedDateTime(new Date(row.updateTime * 1000))}</TableCell>
                                        <TableCell>
                                            <Button onClick={() => handleViewFence(row.id)} size="small" sx={{ color: '#C01A12', p: 0, minWidth: 'auto', '&:hover': { bgcolor: 'transparent' } }}>查看</Button>
                                            <Button onClick={() => handleEditFence(row)} size="small" sx={{ color: '#C01A12', p: 0, minWidth: 'auto', ml: 1, '&:hover': { bgcolor: 'transparent' } }}>编辑</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[10, 20, 50, 100]}
                            component="div"
                            count={totalCount}
                            labelRowsPerPage="页面数量:"
                            labelDisplayedRows={({from, to, count}) => `${from}-${to} / ${count}`}
                            rowsPerPage={state.first}
                            page={state.page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </TableContainer>
                 )}
             </Box>

            <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
                 <DialogTitle sx={{ m: 0, p: 2, borderBottom: '1px solid #E0E0E0' }}>
                     {isEditing ? '编辑电子围栏' : '添加电子围栏'}
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

                         <Box sx={{ display: 'flex', alignItems: 'center' }}>
                             <FormLabel sx={{ minWidth: 100, textAlign: 'right', mr: 2 }}>定位位置:</FormLabel>
                             <TextField
                                 fullWidth
                                 name="locationSearch"
                                 value={formData.locationSearch}
                                 onChange={handleDialogInputChange}
                                 size="small"
                                 sx={{ mr: 1 }}
                                 placeholder="输入地址搜索地图位置"
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

                         <Box sx={{ display: 'flex', alignItems: 'center' }}>
                             <FormLabel required sx={{ minWidth: 100, textAlign: 'right', mr: 2 }}>*电子围栏:</FormLabel>
                             <TextField
                                 required
                                 fullWidth
                                 name="fenceName"
                                 value={formData.fenceName}
                                 onChange={handleDialogInputChange}
                                 size="small"
                                 placeholder="输入电子围栏名称"
                             />
                         </Box>

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
                     <Button variant="contained" onClick={handleAddSubmit}>{isEditing ? '更新' : '确定'}</Button>
                 </DialogActions>
             </Dialog>
        </Box>
    );
};

export default ElectronicFence;
