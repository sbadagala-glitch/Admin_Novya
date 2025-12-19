// import React, { useState, useEffect } from "react";
// import {
//   Card, CardContent, Typography, Chip, Grid, Box,
//   Button, Dialog, DialogActions, DialogContent, DialogTitle,
//   TextField, Select, MenuItem, InputLabel, FormControl,
//   InputAdornment, useMediaQuery, useTheme,
//   Paper, Table, TableBody, TableCell, TableHead,
//   TableRow, TableContainer
// } from "@mui/material";
// import SearchIcon from "@mui/icons-material/Search";

// export default function FreeDemoAdmin() {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("md"));

//   const [demoData, setDemoData] = useState([]);        // pending
//   const [history, setHistory] = useState([]);          // completed/rejected
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All");

//   const [openReject, setOpenReject] = useState(false);
//   const [rejectReason, setRejectReason] = useState("");
//   const [currentReject, setCurrentReject] = useState(null);

//   // Fetch data
//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = () => {
//     fetch("http://localhost:8000/api/admin/demo/")
//       .then((res) => res.json())
//       .then((data) => {
//         const formatted = data.map((item) => ({
//           id: item.id,
//           name: item.full_name,
//           email: item.email,
//           number: item.phone_number,
//           course: item.course_of_interest,
//           time: item.preferred_time,
//           message: item.message,
//           status: item.status,
//           reason: item.reason,
//         }));

//         setDemoData(formatted.filter((d) => d.status === "pending"));
//         setHistory(formatted.filter((d) => d.status !== "pending"));
//       });
//   };

//   // API update
//   const updateStatusAPI = async (requestId, status, reason = "-") => {
//     await fetch(`http://localhost:8000/api/admin/demo/${requestId}/update`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ status, reason }),
//     });

//     loadData();
//   };

//   // Handle change
//   const handleStatusChange = (row, newStatus) => {
//     if (newStatus === "rejected") {
//       setCurrentReject(row);
//       setOpenReject(true);
//       return;
//     }

//     updateStatusAPI(row.id, newStatus);
//   };

//   const handleRejectConfirm = () => {
//     updateStatusAPI(currentReject.id, "rejected", rejectReason);
//     setRejectReason("");
//     setOpenReject(false);
//   };

//   const filterData = (data) => {
//     return data.filter((row) => {
//       const matches = (
//         row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         row.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         row.course.toLowerCase().includes(searchTerm.toLowerCase())
//       );

//       const matchesStatus =
//         statusFilter === "All" || row.status === statusFilter.toLowerCase();

//       return matches && matchesStatus;
//     });
//   };

//   const analytics = {
//     Pending: [...demoData, ...history].filter((d) => d.status === "pending").length,
//     Completed: [...demoData, ...history].filter((d) => d.status === "completed").length,
//     Rejected: [...demoData, ...history].filter((d) => d.status === "rejected").length,
//   };

//   const statusColors = {
//     pending: "warning",
//     completed: "success",
//     rejected: "error",
//   };

//   return (
//     <Box sx={{ p: 3 }}>
//       <Typography variant="h4" sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}>
//         Free Demo Admin Portal
//       </Typography>

//       {/* Analytics */}
//       <Grid container spacing={2} sx={{ mb: 3 }}>
//         {Object.keys(analytics).map((key) => (
//           <Grid item xs={4} key={key}>
//             <Card sx={{ textAlign: "center", p: 2 }}>
//               <Typography variant="h6">{key}</Typography>
//               <Typography variant="h4" sx={{ color: "#e74c3c" }}>
//                 {analytics[key]}
//               </Typography>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>

//       {/* Search */}
//       <Card sx={{ p: 2, mb: 3 }}>
//         <Grid container spacing={2}>
//           <Grid item xs={12} md={6}>
//             <TextField
//               fullWidth
//               label="Search"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <SearchIcon />
//                   </InputAdornment>
//                 ),
//               }}
//             />
//           </Grid>

//           <Grid item xs={12} md={6}>
//             <FormControl fullWidth>
//               <InputLabel>Status Filter</InputLabel>
//               <Select
//                 value={statusFilter}
//                 label="Status Filter"
//                 onChange={(e) => setStatusFilter(e.target.value)}
//               >
//                 <MenuItem value="All">All</MenuItem>
//                 <MenuItem value="pending">Pending</MenuItem>
//                 <MenuItem value="completed">Completed</MenuItem>
//                 <MenuItem value="rejected">Rejected</MenuItem>
//               </Select>
//             </FormControl>
//           </Grid>
//         </Grid>
//       </Card>

//       {/* ---------------------------------------------------------- */}
//       {/* 🔥 NEW — PENDING DEMO REQUESTS IN TABLE FORMAT              */}
//       {/* ---------------------------------------------------------- */}
//       <Card sx={{ mb: 4 }}>
//         <CardContent>
//           <Typography variant="h5" sx={{ mb: 2 }}>
//             Pending Demo Requests
//           </Typography>

//           <TableContainer component={Paper}>
//             <Table>
//               <TableHead sx={{ background: "#34495e" }}>
//                 <TableRow>
//                   <TableCell sx={{ color: "white" }}>Name</TableCell>
//                   <TableCell sx={{ color: "white" }}>Email</TableCell>
//                   <TableCell sx={{ color: "white" }}>Course</TableCell>
//                   <TableCell sx={{ color: "white" }}>Action</TableCell>
//                 </TableRow>
//               </TableHead>

//               <TableBody>
//                 {filterData(demoData).length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={4} align="center">
//                       No pending requests
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   filterData(demoData).map((row) => (
//                     <TableRow key={row.id}>
//                       <TableCell>{row.name}</TableCell>
//                       <TableCell>{row.email}</TableCell>
//                       <TableCell>{row.course}</TableCell>

//                       <TableCell>
//                         <FormControl fullWidth>
//                           <Select
//                             value={row.status}
//                             onChange={(e) => handleStatusChange(row, e.target.value)}
//                           >
//                             <MenuItem value="pending">Pending</MenuItem>
//                             <MenuItem value="completed">Approve</MenuItem>
//                             <MenuItem value="rejected">Reject</MenuItem>
//                           </Select>
//                         </FormControl>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           </TableContainer>
//         </CardContent>
//       </Card>

//       {/* HISTORY TABLE */}
//       <Card>
//         <CardContent>
//           <Typography variant="h5" sx={{ mb: 2 }}>Demo Request History</Typography>

//           <TableContainer component={Paper}>
//             <Table>
//               <TableHead sx={{ background: "#2c3e50" }}>
//                 <TableRow>
//                   <TableCell sx={{ color: "white" }}>Name</TableCell>
//                   <TableCell sx={{ color: "white" }}>Email</TableCell>
//                   <TableCell sx={{ color: "white" }}>Course</TableCell>
//                   <TableCell sx={{ color: "white" }}>Status</TableCell>
//                   <TableCell sx={{ color: "white" }}>Action</TableCell>
//                 </TableRow>
//               </TableHead>

//               <TableBody>
//                 {filterData(history).map((row) => (
//                   <TableRow key={row.id}>
//                     <TableCell>{row.name}</TableCell>
//                     <TableCell>{row.email}</TableCell>
//                     <TableCell>{row.course}</TableCell>

//                     <TableCell>
//                       <Chip label={row.status} color={statusColors[row.status]} />
//                     </TableCell>

//                     <TableCell>
//                       <FormControl fullWidth>
//                         <Select
//                           value={row.status}
//                           onChange={(e) => handleStatusChange(row, e.target.value)}
//                         >
//                           <MenuItem value="pending">Pending</MenuItem>
//                           <MenuItem value="completed">Completed</MenuItem>
//                           <MenuItem value="rejected">Rejected</MenuItem>
//                         </Select>
//                       </FormControl>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </TableContainer>
//         </CardContent>
//       </Card>

//       {/* Reject Popup */}
//       <Dialog open={openReject} onClose={() => setOpenReject(false)}>
//         <DialogTitle>Reject Demo Request</DialogTitle>
//         <DialogContent>
//           <TextField
//             label="Reason"
//             fullWidth
//             multiline
//             rows={3}
//             value={rejectReason}
//             onChange={(e) => setRejectReason(e.target.value)}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenReject(false)}>Cancel</Button>
//           <Button color="error" onClick={handleRejectConfirm}>Reject</Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }



import FreeDemoRequests from "../common/FreeDemoRequests";

const StudentFreeDemo = () => {
  return <FreeDemoRequests role="student" />;
};

export default StudentFreeDemo;
