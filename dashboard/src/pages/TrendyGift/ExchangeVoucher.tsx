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

const ExchangeVoucher: React.FC = () => {
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
    voucherContents: ['']
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
    setFormData({
      ...formData,
      voucherContents: newContents
    });
  };

  const handleSubmit = () => {
    // 处理表单提交
    console.log(formData);
    handleClose();
  };

  // 模拟数据
  const stats = [
    { title: '生成兑换券（张）', value: '6783', color: '#ffebee' },
    { title: '兑换金额（元）', value: '6783', color: '#fff3e0' },
    { title: '已兑换数（张）', value: '6783', color: '#fff8e1' },
    { title: '未兑换数（张）', value: '6783', color: '#f1f8e9' },
  ];

  const rows = [
    {
      id: 1,
      sceneryName: '丹霞山风景区',
      voucherName: '玩偶兑换券',
      useLimit: '只能在景区使用',
      expireTime: '2026-03-14 12:00:00',
      totalCount: 1000,
      exchangedCount: 300,
      unexchangedCount: 700,
      exchangedAmount: 700,
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
          兑换券管理
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
              label="兑换券名称"
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

            <Box sx={{ bgcolor: '#F8F9FA', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                生成兑换券内容
              </Typography>
              {formData.voucherContents.map((content, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    placeholder="例如"
                    value={content}
                    onChange={(e) => handleVoucherContentChange(index, e.target.value)}
                    size="small"
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeVoucherContent(index)}
                    disabled={formData.voucherContents.length === 1}
                  >
                    <RemoveCircleOutline />
                  </IconButton>
                  {index === formData.voucherContents.length - 1 && (
                    <IconButton size="small" color="primary" onClick={addVoucherContent}>
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
              <TableCell>兑换券名称</TableCell>
              <TableCell>使用说明</TableCell>
              <TableCell>有效期时间</TableCell>
              <TableCell>生成数量（张）</TableCell>
              <TableCell>已兑换数量（张）</TableCell>
              <TableCell>未兑换数量（张）</TableCell>
              <TableCell>已兑换金额（元）</TableCell>
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
                <TableCell>{row.exchangedCount}</TableCell>
                <TableCell>{row.unexchangedCount}</TableCell>
                <TableCell>{row.exchangedAmount}</TableCell>
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

export default ExchangeVoucher;
