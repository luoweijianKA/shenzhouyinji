import React, { useState } from 'react';
import {
  Grid,
  Breadcrumbs,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  FormControl,
  OutlinedInput,
  Box,
  TablePagination,
  Button,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import { RefreshCw, Search, Plus } from 'react-feather';
import { PageWrapper } from 'theme/components';
import { PageHeader, Title, LinkButton } from 'pages/styled';

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number,
  ) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;
  const pageCount = rowsPerPage === -1 ? 1 : Math.ceil(count / rowsPerPage);

  const handleFirstPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <Typography
        variant='body2'
        sx={{
          display: 'inline-block',
          padding: '0.5rem 1rem',
        }}
      >
        {page + 1} / {pageCount}
      </Typography>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

interface State {
  page: number;
  rowsPerPage: number;
  sceneryName: string;
}

const ElectronicFence: React.FC = () => {
  const [values, setValues] = useState<State>({
    page: 0,
    rowsPerPage: 10,
    sceneryName: '',
  });

  // 模拟数据
  const rows = [
    {
      id: '1000001',
      sceneryName: '丹霞山风景区',
      fence: '239876897766555577888899',
      createTime: '2026-03-14 12:00:00',
      updateTime: '2026-03-14 12:00:00',
    },
  ];

  const handleSearch = () => {
    // 处理搜索逻辑
    console.log(values.sceneryName);
  };

  const handleRefresh = () => {
    // 处理刷新逻辑
  };

  const handleAdd = () => {
    // 处理添加逻辑
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setValues({ ...values, page: newPage });
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({
      ...values,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0,
    });
  };

  const handleView = (id: string) => {
    // 处理查看逻辑
    console.log('查看', id);
  };

  const handleEdit = (id: string) => {
    // 处理编辑逻辑
    console.log('编辑', id);
  };

  return (
    <PageWrapper>
      <PageHeader container>
        <Grid item xs={4}>
          <Breadcrumbs aria-label="breadcrumb">
            <Typography color="text.primary">景区管理</Typography>
          </Breadcrumbs>
          <Title variant="h1">电子围栏</Title>
        </Grid>
        <Grid item xs={8} sx={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', justifyContent: 'end' }}>
          <LinkButton
            disableElevation
            variant="contained"
            startIcon={<RefreshCw />}
            onClick={handleRefresh}
          >
            刷新
          </LinkButton>
          <LinkButton
            disableElevation
            variant="contained"
            startIcon={<Plus />}
            onClick={handleAdd}
          >
            添加
          </LinkButton>
        </Grid>
      </PageHeader>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <OutlinedInput
                placeholder="景区名称"
                value={values.sceneryName}
                onChange={(e) => setValues({ ...values, sceneryName: e.target.value })}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<Search />}
              onClick={handleSearch}
            >
              搜索
            </Button>
          </Grid>
        </Grid>
      </Paper>

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
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.sceneryName}</TableCell>
                <TableCell>{row.fence}</TableCell>
                <TableCell>{row.createTime}</TableCell>
                <TableCell>{row.updateTime}</TableCell>
                <TableCell>
                  <Button
                    variant="text"
                    color="primary"
                    onClick={() => handleView(row.id)}
                  >
                    查看
                  </Button>
                  <Button
                    variant="text"
                    color="primary"
                    onClick={() => handleEdit(row.id)}
                  >
                    编辑
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={rows.length}
          rowsPerPage={values.rowsPerPage}
          page={values.page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          ActionsComponent={TablePaginationActions}
        />
      </TableContainer>
    </PageWrapper>
  );
};

export default ElectronicFence;
