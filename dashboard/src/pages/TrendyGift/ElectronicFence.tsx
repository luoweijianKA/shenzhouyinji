import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
} from '@mui/material';
import AddElectronicFenceDialog from './components/AddElectronicFenceDialog';
import { Search, Plus } from 'react-feather';
import { gql, useQuery } from '@apollo/client';
import Loading from 'components/Loading';
import Empty from 'components/Empty';

const GET_ELECTRONIC_FENCES = gql`
  query GetElectronicFences($input: ElectronicFenceInput!) {
    electronicFences(input: $input) {
      id
      sceneryName
      fenceName
      createTime
      updateTime
    }
  }
`;

interface ElectronicFence {
  id: string;
  sceneryName: string;
  fenceName: string;
  createTime: string;
  updateTime: string;
}

const ElectronicFence: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [searchParams, setSearchParams] = useState({
    sceneryName: '',
  });
  const [openAddDialog, setOpenAddDialog] = useState(false);

  const mockData = [
    {
      id: '1',
      sceneryName: '广州塔',
      fenceName: '广州塔电子围栏',
      createTime: '2023-06-15 14:30:00',
      updateTime: '2023-06-15 14:30:00'
    },
    {
      id: '2',
      sceneryName: '长隆野生动物园',
      fenceName: '长隆野生动物园电子围栏',
      createTime: '2023-06-16 10:20:00',
      updateTime: '2023-06-16 10:20:00'
    },
    {
      id: '3',
      sceneryName: '白云山',
      fenceName: '白云山电子围栏',
      createTime: '2023-06-17 09:15:00',
      updateTime: '2023-06-17 09:15:00'
    }
  ];

  const { data, loading, refetch } = useQuery(GET_ELECTRONIC_FENCES, {
    variables: {
      input: searchParams
    },
    fetchPolicy: 'network-only'
  });

  const rows = data?.electronicFences || mockData;
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
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Box sx={{ p: 3, pt: 10 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          电子围栏
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => setOpenAddDialog(true)}
        >
          添加
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <TextField
              fullWidth
              size="small"
              label="景区名称"
              name="sceneryName"
              value={searchParams.sceneryName}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sx={{ textAlign: 'right' }}>
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

      {loading ? (
        <Box sx={{ p: 3 }}><Loading /></Box>
      ) : rows.length === 0 ? (
        <Box sx={{ p: 3 }}><Empty /></Box>
      ) : (
        <TableContainer>
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
              {displayRows.map((row: ElectronicFence) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.sceneryName}</TableCell>
                  <TableCell>{row.fenceName}</TableCell>
                  <TableCell>{row.createTime}</TableCell>
                  <TableCell>{row.updateTime}</TableCell>
                  <TableCell>
                    <Button size="small" color="primary">查看</Button>
                    <Button size="small" color="primary">编辑</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[20, 50, 100]}
            component="div"
            count={rows.length}
            labelRowsPerPage="每页行数"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} 共 ${count}`}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      )}
      <AddElectronicFenceDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onSubmit={(values) => {
          console.log('提交的值：', values);
          setOpenAddDialog(false);
        }}
      />
    </Box>
  );
};

export default ElectronicFence;