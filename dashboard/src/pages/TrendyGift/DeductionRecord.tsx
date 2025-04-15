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
} from '@mui/material';
import { Search } from 'react-feather';
import { gql, useQuery } from '@apollo/client';
import Loading from 'components/Loading';
import Empty from 'components/Empty';

const GET_DEDUCTION_RECORDS = gql`
  query GetDeductionRecords($input: DeductionRecordInput!) {
    deductionRecords(input: $input) {
      sceneryName
      deductionName
      validTime
      user
      productName
      verifier
      userPhone
      useTime
    }
  }
`;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const DeductionRecord: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [tabValue, setTabValue] = useState(0);
  const [searchParams, setSearchParams] = useState({
    sceneryName: '',
    deductionRule: '',
    productName: '',
    verifier: '',
    user: '',
    userPhone: '',
    useTimeStart: '',
    useTimeEnd: '',
  });

  const { data, loading, refetch } = useQuery(GET_DEDUCTION_RECORDS, {
    variables: {
      input: {
        ...searchParams,
        status: tabValue === 0 ? 'used' : 'unused'
      }
    },
    fetchPolicy: 'network-only'
  });

  const rows = data?.deductionRecords || [
    {
      sceneryName: '丹霞山风景区',
      deductionName: '玩偶兑换券',
      validTime: '2026-03-14 12:00:00',
      user: '哈哈哈',
      productName: '杯子',
      verifier: '张三',
      userPhone: '13378987656',
      useTime: '2026-03-14 12:00:00',
      operation: '查看',
    },
    // 可以添加更多模拟数据
  ];

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearch = () => {
    refetch({
      input: {
        ...searchParams,
        status: tabValue === 0 ? 'used' : 'unused'
      }
    });
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
          抵扣记录
        </Typography>
        <Button
          variant="contained"
          onClick={() => window.print()}
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
              label="抵扣券规则"
              name="deductionRule"
              value={searchParams.deductionRule}
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
              label="核销人员"
              name="verifier"
              value={searchParams.verifier}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              size="small"
              label="使用人员"
              name="user"
              value={searchParams.user}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              size="small"
              label="使用人员手机"
              name="userPhone"
              value={searchParams.userPhone}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              size="small"
              type="datetime-local"
              label="使用时间"
              name="useTimeStart"
              value={searchParams.useTimeStart}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              size="small"
              type="datetime-local"
              label="至"
              name="useTimeEnd"
              value={searchParams.useTimeEnd}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
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

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="已抵扣" {...a11yProps(0)} />
            <Tab label="未抵扣" {...a11yProps(1)} />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>景区名称</TableCell>
                  <TableCell>抵扣券名称</TableCell>
                  <TableCell>有效期时间</TableCell>
                  <TableCell>使用人员</TableCell>
                  <TableCell>产品名称</TableCell>
                  <TableCell>核销人员</TableCell>
                  <TableCell>使用人员手机</TableCell>
                  <TableCell>使用时间</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.sceneryName}</TableCell>
                    <TableCell>{row.deductionName}</TableCell>
                    <TableCell>{row.validTime}</TableCell>
                    <TableCell>{row.user}</TableCell>
                    <TableCell>{row.productName}</TableCell>
                    <TableCell>{row.verifier}</TableCell>
                    <TableCell>{row.userPhone}</TableCell>
                    <TableCell>{row.useTime}</TableCell>
                    <TableCell>
                      <Button size="small" color="primary">查看</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[20, 50, 100]}
              component="div"
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>景区名称</TableCell>
                  <TableCell>抵扣券名称</TableCell>
                  <TableCell>有效期时间</TableCell>
                  <TableCell>使用人员</TableCell>
                  <TableCell>产品名称</TableCell>
                  <TableCell>核销人员</TableCell>
                  <TableCell>使用人员手机</TableCell>
                  <TableCell>使用时间</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.sceneryName}</TableCell>
                    <TableCell>{row.deductionName}</TableCell>
                    <TableCell>{row.validTime}</TableCell>
                    <TableCell>{row.user}</TableCell>
                    <TableCell>{row.productName}</TableCell>
                    <TableCell>{row.verifier}</TableCell>
                    <TableCell>{row.userPhone}</TableCell>
                    <TableCell>{row.useTime}</TableCell>
                    <TableCell>
                      <Button size="small" color="primary">查看</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[20, 50, 100]}
              component="div"
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default DeductionRecord;
