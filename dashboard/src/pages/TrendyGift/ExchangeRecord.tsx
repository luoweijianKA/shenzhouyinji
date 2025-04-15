import React from 'react';
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
import { Download } from '@mui/icons-material';

const ExchangeRecord: React.FC = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [tabValue, setTabValue] = React.useState(0);
  const [formData, setFormData] = React.useState({
    sceneryName: '',
    voucherRule: '',
    productName: '',
    verifier: '',
    user: '',
    userPhone: '',
    useTimeStart: '',
    useTimeEnd: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = () => {
    // 处理搜索逻辑
    console.log(formData);
  };

  // 模拟数据
  const rows = [
    {
      id: 1,
      sceneryName: '丹霞山风景区',
      voucherName: '门票抵扣券',
      expireTime: '2026-03-14 12:00:00',
      productName: '杯子',
      verifier: '张三',
      user: '李四',
      userPhone: '13378987656',
      useTime: '2026-03-14 12:00:00',
    },
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

  return (
    <Box sx={{ p: 3, pt: 10 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          兑换记录
        </Typography>
        <Button
          variant="contained"
          startIcon={<Download />}
        >
          导出Excel
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="景区名称"
              name="sceneryName"
              value={formData.sceneryName}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="兑换券规则"
              name="voucherRule"
              value={formData.voucherRule}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="产品名称"
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="核销人员"
              name="verifier"
              value={formData.verifier}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="使用人员"
              name="user"
              value={formData.user}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="使用人员手机"
              name="userPhone"
              value={formData.userPhone}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="使用时间起"
              name="useTimeStart"
              type="datetime-local"
              value={formData.useTimeStart}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="使用时间止"
              name="useTimeEnd"
              type="datetime-local"
              value={formData.useTimeEnd}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" onClick={handleSearch}>
              搜索
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="已兑换" />
          <Tab label="未兑换" />
        </Tabs>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>景区名称</TableCell>
              <TableCell>兑换券名称</TableCell>
              <TableCell>有效期时间</TableCell>
              <TableCell>产品名称</TableCell>
              <TableCell>核销人员</TableCell>
              <TableCell>使用人员</TableCell>
              <TableCell>使用人员手机</TableCell>
              <TableCell>使用时间</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.sceneryName}</TableCell>
                <TableCell>{row.voucherName}</TableCell>
                <TableCell>{row.expireTime}</TableCell>
                <TableCell>{row.productName}</TableCell>
                <TableCell>{row.verifier}</TableCell>
                <TableCell>{row.user}</TableCell>
                <TableCell>{row.userPhone}</TableCell>
                <TableCell>{row.useTime}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default ExchangeRecord;
