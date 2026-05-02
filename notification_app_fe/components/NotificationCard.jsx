"use client";

import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import WorkIcon from "@mui/icons-material/Work";
import GradeIcon from "@mui/icons-material/Grade";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const TYPE_CONFIG = {
  Placement: {
    color: "info",
    icon: <WorkIcon sx={{ fontSize: 14 }} />,
    chipColor: "#1565C0",
    bgColor: "rgba(21, 101, 192, 0.08)",
    borderColor: "rgba(33, 150, 243, 0.25)",
    label: "Placement",
  },
  Result: {
    color: "success",
    icon: <GradeIcon sx={{ fontSize: 14 }} />,
    chipColor: "#2E7D32",
    bgColor: "rgba(46, 125, 50, 0.08)",
    borderColor: "rgba(76, 175, 80, 0.25)",
    label: "Result",
  },
  Event: {
    color: "warning",
    icon: <EventIcon sx={{ fontSize: 14 }} />,
    chipColor: "#E65100",
    bgColor: "rgba(230, 81, 0, 0.08)",
    borderColor: "rgba(255, 152, 0, 0.25)",
    label: "Event",
  },
};

function timeAgo(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "just now";
}

export default function NotificationCard({ notification, isNew, onMarkRead, priorityScore }) {
  const { ID, Type, Message, Timestamp } = notification;
  const config = TYPE_CONFIG[Type] || TYPE_CONFIG.Event;

  const handleClick = () => {
    if (isNew && onMarkRead) onMarkRead(ID);
  };

  return (
    <Card
      onClick={handleClick}
      sx={{
        cursor: isNew ? "pointer" : "default",
        bgcolor: "background.paper",
        borderLeft: isNew ? `3px solid ${config.borderColor.replace("0.25", "0.9")}` : "3px solid transparent",
        position: "relative",
        overflow: "visible",
        "&:hover": {
          borderLeftColor: config.borderColor.replace("0.25", "1"),
        },
      }}
    >
      {/* New indicator glow */}
      {isNew && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: "inherit",
            background: `radial-gradient(ellipse at top left, ${config.bgColor}, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
      )}

      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        {/* Top row: type chip + new badge + time */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
          <Chip
            icon={config.icon}
            label={config.label}
            size="small"
            sx={{
              bgcolor: config.bgColor,
              color: config.color === "info" ? "#42A5F5" : config.color === "success" ? "#66BB6A" : "#FFA726",
              border: `1px solid ${config.borderColor}`,
              "& .MuiChip-icon": {
                color: "inherit",
              },
            }}
          />

          {isNew && (
            <Chip
              icon={<FiberNewIcon sx={{ fontSize: "16px !important" }} />}
              label="New"
              size="small"
              sx={{
                bgcolor: "rgba(108, 99, 255, 0.15)",
                color: "primary.light",
                border: "1px solid rgba(108,99,255,0.3)",
                "& .MuiChip-icon": { color: "inherit" },
              }}
            />
          )}

          <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 12, color: "text.disabled" }} />
            <Typography variant="caption" color="text.disabled">
              {timeAgo(Timestamp)}
            </Typography>
          </Box>
        </Box>

        {/* Message */}
        <Typography
          variant="body1"
          sx={{
            fontWeight: isNew ? 600 : 400,
            color: isNew ? "text.primary" : "text.secondary",
            lineHeight: 1.6,
            mb: priorityScore !== undefined ? 1.5 : 0,
          }}
        >
          {Message}
        </Typography>

        {/* Priority score bar (only on priority page) */}
        {priorityScore !== undefined && (
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="caption" color="text.disabled">
                Priority Score
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "primary.light", fontWeight: 700 }}
              >
                {(priorityScore * 100).toFixed(1)}%
              </Typography>
            </Box>
            <Tooltip title={`Priority score: ${priorityScore.toFixed(4)}`} arrow>
              <LinearProgress
                variant="determinate"
                value={priorityScore * 100}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.06)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 2,
                    background: "linear-gradient(90deg, #6C63FF, #FF6B9D)",
                  },
                }}
              />
            </Tooltip>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
