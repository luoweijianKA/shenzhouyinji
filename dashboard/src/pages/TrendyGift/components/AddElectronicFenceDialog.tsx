import React, {useState} from 'react';
import {
    Autocomplete,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    TextField,
} from '@mui/material';
import {gql, useQuery} from '@apollo/client';

const GET_SCENERYSPOTS = gql`
  query GetSceneryspots {
    sceneryspots {
      id
      name
    }
  }
`;

interface ScenerySpot {
    id: string;
    name: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: any) => void;
}

const AddElectronicFenceDialog: React.FC<Props> = ({open, onClose, onSubmit}) => {
    const [values, setValues] = useState({
        scenerySpot: null as ScenerySpot | null,
        location: '',
        fenceName: '',
        coordinates: '',
    });

    const {data} = useQuery(GET_SCENERYSPOTS);
    const sceneryspots = data?.sceneryspots || [];

    const handleChange = (field: string, value: any) => {
        setValues(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = () => {
        onSubmit(values);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>添加电子围栏</DialogTitle>
            <DialogContent>
                <Box sx={{pt: 2}}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Autocomplete
                                options={sceneryspots}
                                getOptionLabel={(option: ScenerySpot) => option.name}
                                value={values.scenerySpot}
                                onChange={(_, newValue) => handleChange('scenerySpot', newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="所属景区"
                                        required
                                        fullWidth
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="定位位置"
                                required
                                fullWidth
                                value={values.location}
                                onChange={(e) => handleChange('location', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="电子围栏"
                                required
                                fullWidth
                                value={values.fenceName}
                                onChange={(e) => handleChange('fenceName', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="定位坐标"
                                required
                                fullWidth
                                value={values.coordinates}
                                onChange={(e) => handleChange('coordinates', e.target.value)}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>取消</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    确定
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddElectronicFenceDialog;
