import React from 'react';
import { Box, Typography, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, IconButton } from '@mui/material';
import { Add, Close, AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';

interface StatCardProps {
  title: string;
  value: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color }) => (
  <Paper sx={{ p: 2, bgcolor: color }}>
    <Typography variant="subtitle1" gutterBottom>
      {title}
    </Typography>
    <Typography variant="h4">
      {value}
    </Typography>
  </Paper>
);

const DiscountVoucher: React.FC = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    sceneryId: '',
    voucherName: '',
    keywordMatch: '',
    voucherImage: '',
    matchImage: '',
    useLimit: '',
    expireTime: '',
    totalAmount: '',
    discountAmount: '',
    productNames: [''],
    productBarcodes: ['']
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProductNameChange = (index: number, value: string) => {
    const newNames = [...formData.productNames];
    newNames[index] = value;
    setFormData({
      ...formData,
      productNames: newNames
    });
  };

  const handleProductBarcodeChange = (index: number, value: string) => {
    const newBarcodes = [...formData.productBarcodes];
    newBarcodes[index] = value;
    setFormData({
      ...formData,
      productBarcodes: newBarcodes
    });
  };

  const addProduct = () => {
    setFormData({
      ...formData,
      productNames: [...formData.productNames, ''],
      productBarcodes: [...formData.productBarcodes, '']
    });
  };

  const removeProduct = (index: number) => {
    const newNames = formData.productNames.filter((_, i) => i !== index);
    const newBarcodes = formData.productBarcodes.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      productNames: newNames,
      productBarcodes: newBarcodes
    });
  };

  const handleSubmit = () => {
    // 处理表单提交
    console.log(formData);
    handleClose();
  };

  // 模拟数据
  const stats = [
    { title: '生成抵扣券（张）', value: '6783', color: '#ffebee' },
    { title: '抵扣金额（元）', value: '6783', color: '#fff3e0' },
    { title: '已抵扣数（张）', value: '6783', color: '#fff8e1' },
    { title: '未抵扣数（张）', value: '6783', color: '#f1f8e9' },
  ];

  const rows = [
    {
      id: 1,
      sceneryName: '丹霞山风景区',
      voucherName: '门票抵扣券',
      useLimit: '只能在景区使用',
      expireTime: '2026-03-14 12:00:00',
      totalCount: 1000,
      discountedCount: 300,
      undiscountedCount: 700,
      discountAmount: 700,
      status: '正常',
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

  return (
    <Box sx={{ p: 3, pt: 10 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          抵扣券管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpen}
        >
          添加
        </Button>
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2, borderBottom: '1px solid #E0E0E0' }}>
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>所属景区</InputLabel>
              <Select
                name="sceneryId"
                value={formData.sceneryId}
                label="所属景区"
                onChange={(e) => setFormData({ ...formData, sceneryId: e.target.value })}
              >
                <MenuItem value="1">丹霞山风景区</MenuItem>
              </Select>
            </FormControl>

            <TextField
              required
              fullWidth
              label="抵扣券名称"
              name="voucherName"
              value={formData.voucherName}
              onChange={handleInputChange}
            />

            <TextField
              fullWidth
              label="比对残缺关键字"
              name="keywordMatch"
              value={formData.keywordMatch}
              onChange={handleInputChange}
            />

            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  电子券图片
                </Typography>
                <Box
                  sx={{
                    width: '100%',
                    height: 160,
                    bgcolor: '#FFF5F5',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: '1px dashed #E0E0E0'
                  }}
                >
                  <Add sx={{ color: '#999' }} />
                </Box>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  比对图片
                </Typography>
                <Box
                  sx={{
                    width: '100%',
                    height: 160,
                    bgcolor: '#FFF5F5',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: '1px dashed #E0E0E0'
                  }}
                >
                  <Add sx={{ color: '#999' }} />
                </Box>
              </Box>
            </Box>

            <TextField
              fullWidth
              label="使用说明"
              name="useLimit"
              value={formData.useLimit}
              onChange={handleInputChange}
              multiline
              rows={3}
            />

            <TextField
              fullWidth
              label="有效时间"
              name="expireTime"
              type="datetime-local"
              value={formData.expireTime}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              required
              fullWidth
              label="抵扣金额"
              name="discountAmount"
              type="number"
              value={formData.discountAmount}
              onChange={handleInputChange}
            />

            <Box sx={{ bgcolor: '#F8F9FA', p: 2, borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2">生成抵扣券总金额要求</Typography>
                <TextField
                  size="small"
                  placeholder="例如200"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  sx={{ width: '200px' }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>满200抵扣20</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2">生成抵扣券抵扣金额</Typography>
                <TextField
                  size="small"
                  placeholder="例如20"
                  value={formData.discountAmount}
                  onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                  sx={{ width: '200px' }}
                />
              </Box>
            </Box>

            <Box sx={{ bgcolor: '#F8F9FA', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                适用于商品名称和条码
              </Typography>
              {formData.productNames.map((name, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    size="small"
                    placeholder="商品名称"
                    value={name}
                    onChange={(e) => handleProductNameChange(index, e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    placeholder="商品条码"
                    value={formData.productBarcodes[index]}
                    onChange={(e) => handleProductBarcodeChange(index, e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeProduct(index)}
                    disabled={formData.productNames.length === 1}
                  >
                    <RemoveCircleOutline />
                  </IconButton>
                  {index === formData.productNames.length - 1 && (
                    <IconButton size="small" color="primary" onClick={addProduct}>
                      <AddCircleOutline />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #E0E0E0' }}>
          <Button onClick={handleClose} sx={{ mr: 1 }}>取消</Button>
          <Button variant="contained" onClick={handleSubmit}>确定</Button>
        </DialogActions>
      </Dialog>

      <Grid container spacing={3} sx={{ mb: 4 }}>
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
              <TableCell>抵扣券名称</TableCell>
              <TableCell>使用说明</TableCell>
              <TableCell>有效期时间</TableCell>
              <TableCell>生成数量（张）</TableCell>
              <TableCell>已抵扣数量（张）</TableCell>
              <TableCell>未抵扣数量（张）</TableCell>
              <TableCell>已抵扣金额（元）</TableCell>
              <TableCell>创建时间</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.sceneryName}</TableCell>
                <TableCell>{row.voucherName}</TableCell>
                <TableCell>{row.useLimit}</TableCell>
                <TableCell>{row.expireTime}</TableCell>
                <TableCell>{row.totalCount}</TableCell>
                <TableCell>{row.discountedCount}</TableCell>
                <TableCell>{row.undiscountedCount}</TableCell>
                <TableCell>{row.discountAmount}</TableCell>
                <TableCell>{row.expireTime}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>
                  <Button size="small" color="primary">正常</Button>
                  <Button size="small" color="error">中止</Button>
                  <Button size="small" color="info">指引</Button>
                </TableCell>
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

export default DiscountVoucher;
