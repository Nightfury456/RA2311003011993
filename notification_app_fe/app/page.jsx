"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Skeleton,
  Alert,
  Chip,
  Divider,
  Fade,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Navbar from "@/components/Navbar";
import NotificationCard from "@/components/NotificationCard";
import SearchAndFilter from "@/components/SearchAndFilter";
import { fetchNotifications, getViewedIds, markViewed } from "@/lib/api";
import { Log, initLogger } from "@/lib/logger";

export default function AllNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [viewedIds, setViewedIds] = useState(new Set());

  // Initialize logger with auth token on mount
  useEffect(() => {
    async function initAuth() {
      try {
        const res = await fetch("/api/auth-token");
        const { token } = await res.json();
        if (token) initLogger(token);
      } catch {
        /* silently skip if auth fails */
      }
    }
    initAuth();
  }, []);

  // Fetch notifications whenever the active filter changes
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      Log("frontend", "info", "page", "Loading all notifications page");
      const data = await fetchNotifications({ notification_type: activeFilter, limit: 50 });
      setNotifications(data);
      setViewedIds(getViewedIds());
      Log("frontend", "info", "page", `All notifications loaded: ${data.length} items`);
    } catch (err) {
      Log("frontend", "error", "page", `Failed to load notifications: ${err.message}`);
      setError("Could not load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkRead = (id) => {
    markViewed(id);
    setViewedIds((prev) => new Set([...prev, id]));
    Log("frontend", "info", "state", `Notification ${id} marked as viewed`);
  };

  // Client-side keyword search
  const filtered = notifications.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.Message?.toLowerCase().includes(q) ||
      n.Type?.toLowerCase().includes(q)
    );
  });

  const unreadCount = notifications.filter((n) => !viewedIds.has(n.ID)).length;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Navbar unreadCount={unreadCount} />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Page heading */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <NotificationsIcon sx={{ color: "primary.main", fontSize: 32 }} />
            <Typography variant="h4" sx={{ color: "text.primary" }}>
              All Notifications
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Stay updated with the latest campus announcements
          </Typography>
        </Box>

        {/* Search + type filter */}
        <SearchAndFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={(val) => {
            setActiveFilter(val);
            Log("frontend", "info", "state", `Filter changed to: ${val}`);
          }}
        />

        {/* Quick stats */}
        {!loading && !error && (
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <Chip
              label={`${filtered.length} notifications`}
              size="small"
              sx={{ bgcolor: "rgba(255,255,255,0.05)", color: "text.secondary" }}
            />
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} unread`}
                size="small"
                sx={{
                  bgcolor: "rgba(108,99,255,0.12)",
                  color: "primary.light",
                  border: "1px solid rgba(108,99,255,0.3)",
                }}
              />
            )}
          </Box>
        )}

        <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 3 }} />

        {/* Error state */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading skeleton cards */}
        {loading && (
          <Grid container spacing={2}>
            {[...Array(6)].map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Skeleton
                  variant="rounded"
                  height={140}
                  sx={{ bgcolor: "rgba(255,255,255,0.04)", borderRadius: 2 }}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Notification cards grid */}
        {!loading && !error && (
          <Fade in>
            <Box>
              {filtered.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <NotificationsIcon sx={{ fontSize: 56, color: "text.disabled", mb: 2 }} />
                  <Typography color="text.secondary">
                    {searchQuery ? "No notifications match your search." : "No notifications yet."}
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {filtered.map((n) => (
                    <Grid key={n.ID} size={{ xs: 12, sm: 6, md: 4 }}>
                      <NotificationCard
                        notification={n}
                        isNew={!viewedIds.has(n.ID)}
                        onMarkRead={handleMarkRead}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Fade>
        )}
      </Container>
    </Box>
  );
}
