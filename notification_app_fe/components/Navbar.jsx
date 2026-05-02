"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Badge,
  Chip,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";
import SchoolIcon from "@mui/icons-material/School";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar({ unreadCount = 0 }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "rgba(26,29,39,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Toolbar sx={{ maxWidth: 1200, width: "100%", mx: "auto", px: { xs: 2, md: 3 } }}>
        {/* Brand */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexGrow: 1 }}>
          <SchoolIcon sx={{ color: "primary.main", fontSize: 28 }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #6C63FF 0%, #FF6B9D 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.3px",
            }}
          >
            CampusNotify
          </Typography>
        </Box>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <Chip
            label={`${unreadCount} new`}
            size="small"
            sx={{
              mr: 2,
              bgcolor: "rgba(108, 99, 255, 0.15)",
              color: "primary.light",
              border: "1px solid rgba(108,99,255,0.3)",
            }}
          />
        )}

        {/* Nav buttons */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            startIcon={
              <Badge badgeContent={unreadCount > 0 ? unreadCount : null} color="primary" max={99}>
                <NotificationsIcon />
              </Badge>
            }
            onClick={() => router.push("/")}
            variant={pathname === "/" ? "contained" : "text"}
            sx={{
              ...(pathname === "/"
                ? {
                    background: "linear-gradient(135deg, #6C63FF, #9D97FF)",
                    boxShadow: "0 4px 15px rgba(108,99,255,0.35)",
                  }
                : { color: "text.secondary" }),
            }}
          >
            All
          </Button>
          <Button
            startIcon={<StarIcon />}
            onClick={() => router.push("/priority")}
            variant={pathname === "/priority" ? "contained" : "text"}
            sx={{
              ...(pathname === "/priority"
                ? {
                    background: "linear-gradient(135deg, #FF6B9D, #FF9800)",
                    boxShadow: "0 4px 15px rgba(255,107,157,0.35)",
                  }
                : { color: "text.secondary" }),
            }}
          >
            Priority
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
