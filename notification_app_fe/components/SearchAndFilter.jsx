"use client";

import {
  Box,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import WorkIcon from "@mui/icons-material/Work";
import GradeIcon from "@mui/icons-material/Grade";
import EventIcon from "@mui/icons-material/Event";
import AppsIcon from "@mui/icons-material/Apps";

const FILTER_TYPES = [
  { value: "All", label: "All", icon: <AppsIcon sx={{ fontSize: 16 }} /> },
  { value: "Placement", label: "Placement", icon: <WorkIcon sx={{ fontSize: 16 }} /> },
  { value: "Result", label: "Result", icon: <GradeIcon sx={{ fontSize: 16 }} /> },
  { value: "Event", label: "Event", icon: <EventIcon sx={{ fontSize: 16 }} /> },
];

export default function SearchAndFilter({ searchQuery, onSearchChange, activeFilter, onFilterChange }) {
  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, mb: 3 }}>
      {/* Search bar */}
      <TextField
        fullWidth
        placeholder="Search notifications..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        size="small"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "text.disabled", fontSize: 20 }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          maxWidth: { sm: 360 },
          "& .MuiOutlinedInput-root": {
            bgcolor: "background.paper",
            "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
            "&:hover fieldset": { borderColor: "rgba(108,99,255,0.4)" },
            "&.Mui-focused fieldset": { borderColor: "primary.main" },
          },
        }}
      />

      {/* Filter chips */}
      <ToggleButtonGroup
        value={activeFilter}
        exclusive
        onChange={(_, val) => val && onFilterChange(val)}
        size="small"
        sx={{ flexWrap: "wrap", gap: 0.5 }}
      >
        {FILTER_TYPES.map(({ value, label, icon }) => (
          <ToggleButton
            key={value}
            value={value}
            sx={{
              px: 2,
              py: 0.75,
              border: "1px solid rgba(255,255,255,0.08) !important",
              borderRadius: "8px !important",
              gap: 0.75,
              color: "text.secondary",
              "&.Mui-selected": {
                bgcolor: "rgba(108,99,255,0.15)",
                color: "primary.light",
                borderColor: "rgba(108,99,255,0.35) !important",
              },
              "&:hover": {
                bgcolor: "rgba(108,99,255,0.08)",
              },
            }}
          >
            {icon}
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
