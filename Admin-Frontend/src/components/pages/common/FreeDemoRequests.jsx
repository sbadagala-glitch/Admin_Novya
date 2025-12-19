import React, { useState, useEffect } from "react";
import {
  Card, CardContent, Typography, Chip, Grid, Box,
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Select, MenuItem, InputLabel, FormControl,
  InputAdornment, useMediaQuery, useTheme,
  Paper, Table, TableBody, TableCell, TableHead,
  TableRow, TableContainer
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function FreeDemoRequests({ role }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [demoData, setDemoData] = useState([]);
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [openReject, setOpenReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [currentReject, setCurrentReject] = useState(null);

  /* ===========================
     🔄 FETCH DATA
     =========================== */
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    fetch(`${API_BASE}/api/admin/demo/`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((item) => ({
          id: item.id || item.demo_id,
          name: item.full_name,
          email: item.email,
          number: item.phone_number,
          course: item.course_of_interest,
          time: item.preferred_time,
          message: item.message,
          status: item.status,
          reason: item.reason,
        }));

        setDemoData(formatted.filter((d) => d.status === "pending"));
        setHistory(formatted.filter((d) => d.status !== "pending"));
      });
  };

  /* ===========================
     🔄 UPDATE STATUS
     =========================== */
  const updateStatusAPI = async (requestId, status, reason = "-") => {
    await fetch(`${API_BASE}/api/admin/demo/${requestId}/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reason }),
    });
    loadData();
  };

  const handleStatusChange = (row, newStatus) => {
    if (newStatus === "rejected") {
      setCurrentReject(row);
      setOpenReject(true);
      return;
    }
    updateStatusAPI(row.id, newStatus);
  };

  const handleRejectConfirm = () => {
    updateStatusAPI(currentReject.id, "rejected", rejectReason);
    setRejectReason("");
    setOpenReject(false);
  };

  /* ===========================
     🔍 FILTER
     =========================== */
  const filterData = (data) =>
    data.filter((row) => {
      const match =
        row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.course.toLowerCase().includes(searchTerm.toLowerCase());

      const statusOk =
        statusFilter === "All" || row.status === statusFilter.toLowerCase();

      return match && statusOk;
    });

  const statusColors = {
    pending: "warning",
    completed: "success",
    rejected: "error",
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
        {role.charAt(0).toUpperCase() + role.slice(1)} Free Demo Requests
      </Typography>

      {/* SEARCH */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* PENDING */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Pending Demo Requests
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filterData(demoData).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.course}</TableCell>
                    <TableCell>
                      <Select
                        fullWidth
                        value={row.status}
                        onChange={(e) =>
                          handleStatusChange(row, e.target.value)
                        }
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="completed">Approve</MenuItem>
                        <MenuItem value="rejected">Reject</MenuItem>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* HISTORY */}
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Demo History
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filterData(history).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.course}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        color={statusColors[row.status]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* REJECT MODAL */}
      <Dialog open={openReject} onClose={() => setOpenReject(false)}>
        <DialogTitle>Reject Demo Request</DialogTitle>
        <DialogContent>
          <TextField
            label="Reason"
            fullWidth
            multiline
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReject(false)}>Cancel</Button>
          <Button color="error" onClick={handleRejectConfirm}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
