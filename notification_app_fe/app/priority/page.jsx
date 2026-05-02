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
  Slider,
  Paper,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import Navbar from "@/components/Navbar";
import NotificationCard from "@/components/NotificationCard";
import SearchAndFilter from "@/components/SearchAndFilter";
import { fetchNotifications, getViewedIds, markViewed } from "@/lib/api";
import { getPriorityInbox } from "@/lib/priorityInbox";
import { Log, initLogger } from "@/lib/logger";

export default function PriorityPage() {
  const [allNotifications, setAllNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [viewedIds, setViewedIds] = useState(new Set());
  const [topN, setTopN] = useState(10);

  // Initialize logger
  useEffect(() => {
    async function initAuth() {
      try {
        const res = await fetch("/api/auth-token");
        const { token } = await res.json();
        if (token) initLogger(token);
      } catch {}
    }
    initAuth();
  }, []);

  // Load all notifications then score them client-side
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      Log("frontend", "info", "page", "Loading priority notifications page");
      const data = await fetchNotifications({ limit: 100 });
      setAllNotifications(data);
      setViewedIds(getViewedIds());
      Log("frontend", "info", "page", `Loaded ${data.length} notifications for priority scoring`);
    } catch (err) {
      Log("frontend", "error", "page", `Priority page load failed: ${err.message}`);
      setError("Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkRead = (id) => {
    markViewed(id);
    setViewedIds((prev) => new Set([...prev, id]));
    Log("frontend", "info", "state", `Priority notification ${id} marked as viewed`);
  };

  // Run the priority inbox algorithm
  const prioritized = getPriorityInbox(allNotifications, topN);

  // Apply type filter on priority results
  const typeFiltered =
    activeFilter === "All"
      ? prioritized
      : prioritized.filter((n) => n.Type === activeFilter);

  // Apply keyword search
  const filtered = typeFiltered.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return n.Message?.toLowerCase().includes(q) || n.Type?.toLowerCase().includes(q);
  });

  const unreadCount = allNotifications.filter((n) => !viewedIds.has(n.ID)).length;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Navbar unreadCount={unreadCount} />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Page heading */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <StarIcon sx={{ color: "#FF6B9D", fontSize: 32 }} />
            <Typography variant="h4" sx={{ color: "text.primary" }}>
              Priority Inbox
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Smart-ranked notifications — Placements first, then Results, then Events, weighted by recency
          </Typography>
        </Box>

        {/* Top-N control slider */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            bgcolor: "background.paper",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              Show top notifications
            </Typography>
            <Chip
              label={`Top ${topN}`}
              size="small"
              sx={{
                bgcolor: "rgba(255,107,157,0.12)",
                color: "#FF6B9D",
                border: "1px solid rgba(255,107,157,0.3)",
                fontWeight: 700,
              }}
            />
          </Box>
          <Slider
            value={topN}
            min={5}
            max={50}
            step={5}
            onChange={(_, val) => {
              setTopN(val);
              Log("frontend", "info", "state", `Top-N changed to ${val}`);
            }}
            marks={[
              { value: 5, label: "5" },
              { value: 10, label: "10" },
              { value: 20, label: "20" },
              { value: 50, label: "50" },
            ]}
            sx={{
              color: "#FF6B9D",
              "& .MuiSlider-thumb": { bgcolor: "#FF6B9D" },
              "& .MuiSlider-markLabel": { color: "text.disabled", fontSize: 11 },
            }}
          />
        </Paper>

        {/* Search + filter */}
        <SearchAndFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={(val) => {
            setActiveFilter(val);
            Log("frontend", "info", "state", `Priority filter changed to: ${val}`);
          }}
        />

        {/* Stats */}
        {!loading && !error && (
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <Chip
              label={`${filtered.length} shown`}
              size="small"
              sx={{ bgcolor: "rgba(255,255,255,0.05)", color: "text.secondary" }}
            />
            <Chip
              label={`${allNotifications.length} total`}
              size="small"
              sx={{ bgcolor: "rgba(255,255,255,0.05)", color: "text.secondary" }}
            />
          </Box>
        )}

        <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 3 }} />

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Loading skeletons */}
        {loading && (
          <Grid container spacing={2}>
            {[...Array(6)].map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Skeleton
                  variant="rounded"
                  height={170}
                  sx={{ bgcolor: "rgba(255,255,255,0.04)", borderRadius: 2 }}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Priority notification cards */}
        {!loading && !error && (
          <Fade in>
            <Box>
              {filtered.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <StarIcon sx={{ fontSize: 56, color: "text.disabled", mb: 2 }} />
                  <Typography color="text.secondary">
                    {searchQuery ? "No priority notifications match your search." : "No priority notifications found."}
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
                        priorityScore={n.priorityScore}
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
