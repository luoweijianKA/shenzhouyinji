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
  Tabs,
  Tab,
  Link,
} from '@mui/material';
import { Search, Download } from 'react-feather';
import { gql, useQuery } from '@apollo/client';
import Loading from 'components/Loading';
import Empty from 'components/Empty';
import DateRangeButton from 'components/DateRangeButton';

const GET_VOUCHER_RECORDS = gql`
  query GetVoucherRecords($input: VoucherRecordInput!) {
    voucherRecords(input: $input) {
      id
      sceneryName
      voucherRule
      validTime
      productName
      userName
      userPhone
      useTime
      status
    }
  }
`;

interface VoucherRecord {
  id: string;
  sceneryName: string;
  voucherRule: string;
  validTime: string;
  productName: string;
  userName: string;
  userPhone: string;
  useTime: string;
  status: string;
}

const VoucherRecord: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [tabValue, setTabValue] = useState(0);
  const [searchParams, setSearchParams] = useState({
    sceneryName: '',
    voucherRule: '',
    productName: '',
    userName: '',
    userPhone: '',
    useTimeStart: '',
    useTimeEnd: '',
    status: tabValue === 0 ? 'used' : 'unused',
  });

  const mockData = [
    {
      id: '1',
      sceneryName: '丹霞山风景区',
      voucherRule: '玩具兑换券',
      validTime: '2026-03-14',
      productName: '杯子',
      userName: '哈哈哈',
      userPhone: '13378987656',
      useTime: '2026-03-14 12:00:00',
      status: 'used'
    },
  ];

  const { data, loading, refetch } = useQuery(GET_VOUCHER_RECORDS, {
    variables: {
      input: searchParams
    },
    fetchPolicy: 'network-only'
  });

  const rows = data?.voucherRecords || mockData;
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSearchParams({
      ...searchParams,
      status: newValue === 0 ? 'used' : 'unused'
    });
  };

  const handleExport = () => {
    // 处理导出Excel逻辑
    console.log('导出Excel');
  };

  const handleViewDetail = (id: string) => {
    // 查看详情逻辑
    console.log('查看详情', id);
  };

  return (
    <Box sx={{ p: 3, pt: 10 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
          兑换券记录
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleExport}
          startIcon={<Download />}
        >
          导出Excel
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
          <Grid item xs={3}>
            <TextField
              fullWidth
              size="small"
              label="兑换券规则"
              name="voucherRule"
              value={searchParams.voucherRule}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              size="small"
              label="产品名称"
              name="productName"
              value={searchParams.productName}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              size="small"
              label="使用人"
              name="userName"
              value={searchParams.userName}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              size="small"
              label="使用人手机号"
              name="userPhone"
              value={searchParams.userPhone}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 2 }}>使用时间：</Typography>
              <DateRangeButton
                onChange={(dates: number[]) => {
                  if (dates && dates.length === 2) {
                    setSearchParams({
                      ...searchParams,
                      useTimeStart: dates[0].toString(),
                      useTimeEnd: dates[1].toString()
                    });
                  }
                }}
              />
            </Box>
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

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              fontWeight: 'bold',
              fontSize: '16px',
              minWidth: '120px',
            },
            '& .Mui-selected': {
              color: '#f44336 !important',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#f44336',
            }
          }}
        >
          <Tab label="已兑换" />
          <Tab label="未兑换" />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ p: 3 }}><Loading /></Box>
      ) : rows.length === 0 ? (
        <Box sx={{ p: 3 }}><Empty /></Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& .MuiTableCell-head': { fontWeight: 'bold' } }}>
                <TableCell>景区名称</TableCell>
                <TableCell>兑换券名称</TableCell>
                <TableCell>有效期限</TableCell>
                <TableCell>使用人</TableCell>
                <TableCell>产品名称</TableCell>
                <TableCell>使用人手机号</TableCell>
                <TableCell>使用时间</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayRows.map((row: VoucherRecord) => (
                <TableRow key={row.id}>
                  <TableCell>{row.sceneryName}</TableCell>
                  <TableCell>{row.voucherRule}</TableCell>
                  <TableCell>{row.validTime}</TableCell>
                  <TableCell>{row.userName}</TableCell>
                  <TableCell>{row.productName}</TableCell>
                  <TableCell>{row.userPhone}</TableCell>
                  <TableCell>{row.useTime}</TableCell>
                  <TableCell>
                    <Link 
                      component="button" 
                      onClick={() => handleViewDetail(row.id)}
                      sx={{ color: '#f44336', textDecoration: 'none', cursor: 'pointer' }}
                    >
                      查看
                    </Link>
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
    </Box>
  );
};

export default VoucherRecord;