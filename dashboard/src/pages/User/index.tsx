import React, { useState, useMemo } from "react";
import { RefreshCw, Search, ChevronRight } from "react-feather";
import {
    Grid,
    Box,
    Breadcrumbs,
    Typography,
    CardContent,
    CardActions,
    Paper,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TablePagination,
    IconButton,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Tooltip,
    FormControl,
    OutlinedInput,
    InputLabel,
    Select,
    // MenuItem,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import { gql, useQuery } from "@apollo/client";
import { formattedDate } from "utils";
import { PageWrapper } from "theme/components";
import Loading from "components/Loading";
import { PageHeader, Title, LinkButton, StyledCard } from "pages/styled";

const GET_ACCOUNTS = gql`
    query GetAccounts(
        $first: Int = 20
        $after: ID
        $last: Int = 20
        $before: ID
        $search: String
    ) {
        accounts(
            first: $first
            after: $after
            last: $last
            before: $before
            search: $search
        ) {
            totalCount
            edges {
                node {
                    id
                    wechat
                    wechat_name
                    wechat_avatar
                    status
                    create_time
                }
            }
            pageInfo {
                startCursor
                endCursor
                hasPreviousPage
                hasNextPage
            }
        }
    }
`;

interface Account {
    id: string;
    wechat: string;
    wechat_name: string;
    wechat_avatar: string;
    status: number;
    create_time: number;
    city?: string;
    phone?: string;
}

interface TablePaginationActionsProps {
    count: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (
        event: React.MouseEvent<HTMLButtonElement>,
        newPage: number
    ) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
    const theme = useTheme();
    const { count, page, rowsPerPage, onPageChange } = props;
    const pageCount = rowsPerPage === -1 ? 1 : Math.ceil(count / rowsPerPage);

    const handleFirstPageButtonClick = (
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        onPageChange(event, 0);
    };

    const handleBackButtonClick = (
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    return (
        <Box sx={{ flexShrink: 0 }}>
            <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={page === 0}
                aria-label="first page"
            >
                {theme.direction === "rtl" ? (
                    <LastPageIcon />
                ) : (
                    <FirstPageIcon />
                )}
            </IconButton>
            <IconButton
                onClick={handleBackButtonClick}
                disabled={page === 0}
                aria-label="previous page"
            >
                {theme.direction === "rtl" ? (
                    <KeyboardArrowRight />
                ) : (
                    <KeyboardArrowLeft />
                )}
            </IconButton>
            <Typography
                variant="body2"
                sx={{
                    display: "inline-block",
                    padding: "0.5rem 1rem",
                }}
            >
                {page + 1} / {pageCount}
            </Typography>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page"
            >
                {theme.direction === "rtl" ? (
                    <KeyboardArrowLeft />
                ) : (
                    <KeyboardArrowRight />
                )}
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="last page"
            >
                {theme.direction === "rtl" ? (
                    <FirstPageIcon />
                ) : (
                    <LastPageIcon />
                )}
            </IconButton>
        </Box>
    );
}

interface State {
    first: number;
    after?: string;
    last: number;
    before?: string;
    search?: string;
    page: number;
    totalCount: number;
    startCursor?: string;
    endCursor?: string;
}

export default function User() {
    const [values, setValues] = useState<State>({
        first: 20,
        last: 20,
        page: 0,
        totalCount: 0,
    });
    const { first, after, last, before, search } = values;
    const { data, loading, refetch } = useQuery(GET_ACCOUNTS, {
        variables: { first, after, last, before, search },
        fetchPolicy: "no-cache",
    });

    const accounts: Account[] = useMemo(() => {
        if (data) {
            const { totalCount, edges, pageInfo } = data.accounts;
            setValues({
                ...values,
                totalCount,
                startCursor: pageInfo.hasPreviousPage
                    ? pageInfo.startCursor
                    : undefined,
                endCursor: pageInfo.hasNextPage
                    ? pageInfo.endCursor
                    : undefined,
            });
            return edges.map(({ node }: { node: Account }) => node);
        }
        return [];
    }, [data]);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        const search = value && value.length > 0 ? value : undefined;
        setValues({
            ...values,
            after: undefined,
            before: undefined,
            page: 0,
            search,
        });
    };

    const handleRefresh = () => {
        const { first, after, last, before, search } = values;
        refetch({ first, after, last, before, search });
    };

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number
    ) => {
        if (newPage === 0) {
            setValues({
                ...values,
                after: undefined,
                before: undefined,
                page: newPage,
            });
        } else if (newPage === values.page - 1) {
            setValues({
                ...values,
                after: undefined,
                before: values.startCursor,
                page: newPage,
            });
        } else {
            setValues({
                ...values,
                after: values.endCursor,
                before: undefined,
                page: newPage,
            });
        }
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const val = parseInt(event.target.value, 10);
        const limit = val === -1 ? values.totalCount : val;
        setValues({
            ...values,
            first: limit,
            after: undefined,
            last: limit,
            before: undefined,
            page: 0,
        });
    };

    return (
        <PageWrapper>
            <PageHeader container>
                <Grid item xs={4}>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Typography color="text.primary">
                            {"用户管理"}
                        </Typography>
                    </Breadcrumbs>
                    <Title variant="h1">{"注册会员"}</Title>
                </Grid>
                <Grid
                    item
                    xs={8}
                    sx={{
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "flex-end",
                        justifyContent: "end",
                    }}
                >
                    <FormControl size="small" sx={{ minWidth: 235 }}>
                        <InputLabel id="Sceneryspot-select-label">
                            {"省"}
                        </InputLabel>
                        <Select
                            labelId="Sceneryspot-select-label"
                            id="Sceneryspot-select"
                            // value={values.sceneryspotId}
                            // label={"省"}
                            // onChange={handleSceneryspotChange}
                        >
                            {/* {sceneryspots &&
                                sceneryspots.map((v: Sceneryspot) => (
                                    <MenuItem key={v.id} value={v.id}>
                                        {v.name}
                                    </MenuItem>
                                ))} */}
                        </Select>
                    </FormControl>
                    <FormControl>
                        <OutlinedInput
                            sx={{
                                "& .MuiOutlinedInput-input": {
                                    padding: "8.5px 14px",
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                    top: 0,
                                    "& > legend": {
                                        float: "left !important",
                                    },
                                },
                            }}
                            notched={false}
                            placeholder="用户名称"
                            startAdornment={<Search />}
                            onChange={handleSearch}
                        />
                    </FormControl>
                    <LinkButton
                        disableElevation
                        variant="contained"
                        startIcon={<RefreshCw size={20} />}
                        onClick={handleRefresh}
                    >
                        {"刷新"}
                    </LinkButton>
                </Grid>
            </PageHeader>
            {!loading ? (
                <StyledCard>
                    <CardContent>
                        <TableContainer
                            component={Paper}
                            sx={{ boxShadow: "none" }}
                        >
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{"用户"}</TableCell>
                                        <TableCell>{"手机号码"}</TableCell>
                                        <TableCell>{"注册时间"}</TableCell>
                                        <TableCell>{"所在城市"}</TableCell>
                                        <TableCell>{""}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {accounts.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            sx={{
                                                "&:last-child td, &:last-child th": {
                                                    border: 0,
                                                },
                                            }}
                                        >
                                            <TableCell
                                                scope="row"
                                                component="th"
                                            >
                                                <ListItem
                                                    alignItems="flex-start"
                                                    sx={{ p: 0 }}
                                                >
                                                    <ListItemAvatar
                                                        sx={{ mt: 0, mr: 1 }}
                                                    >
                                                        <Avatar
                                                            alt={
                                                                row.wechat_name
                                                            }
                                                            src={
                                                                process.env
                                                                    .REACT_APP_RESOURCES_DOMAIN +
                                                                row.wechat_avatar
                                                            }
                                                            sx={{
                                                                width: 56,
                                                                height: 56,
                                                            }}
                                                        />
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={
                                                            row.wechat_name
                                                        }
                                                        secondary={
                                                            <Typography
                                                                sx={{
                                                                    display:
                                                                        "inline",
                                                                    mr: 1,
                                                                }}
                                                                variant="caption"
                                                            >
                                                                {row.wechat}
                                                            </Typography>
                                                        }
                                                    />
                                                </ListItem>
                                            </TableCell>
                                            <TableCell
                                                scope="row"
                                                component="th"
                                            >
                                                <Typography variant="subtitle2">
                                                    {row.phone}
                                                </Typography>
                                            </TableCell>
                                            <TableCell
                                                scope="row"
                                                component="th"
                                            >
                                                <Typography variant="subtitle2">
                                                    {formattedDate(
                                                        new Date(
                                                            row.create_time *
                                                                1000
                                                        )
                                                    )}
                                                </Typography>
                                            </TableCell>
                                            <TableCell
                                                scope="row"
                                                component="th"
                                            >
                                                <Typography variant="subtitle2">
                                                    {row.city}
                                                </Typography>
                                            </TableCell>
                                            <TableCell
                                                scope="row"
                                                sx={{ textAlign: "right" }}
                                            >
                                                <Tooltip
                                                    arrow
                                                    title={"用户详情"}
                                                >
                                                    <IconButton
                                                        href={`#/user/${row.id}`}
                                                    >
                                                        <ChevronRight
                                                            size={20}
                                                        />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                    {accounts.length > 0 && (
                        <CardActions
                            sx={{
                                justifyContent: "center",
                                gap: "0.5rem",
                                p: 2,
                            }}
                        >
                            <TablePagination
                                component="div"
                                rowsPerPageOptions={[
                                    10,
                                    20,
                                    50,
                                    100,
                                    { label: "全部", value: -1 },
                                ]}
                                count={values.totalCount}
                                rowsPerPage={values.first}
                                page={values.page}
                                SelectProps={{
                                    inputProps: {
                                        "aria-label": "page size",
                                    },
                                    native: true,
                                }}
                                labelRowsPerPage={"页面数量:"}
                                labelDisplayedRows={() => ""}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                ActionsComponent={TablePaginationActions}
                            />
                        </CardActions>
                    )}
                </StyledCard>
            ) : (
                <Loading />
            )}
        </PageWrapper>
    );
}
