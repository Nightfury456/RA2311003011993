# Notification System Design

## Stage 1 — Priority Inbox Algorithm

### Problem

Students receive a large number of campus notifications daily across three categories: Placement, Result, and Event. Not all notifications carry the same urgency. A Placement notice about a hiring drive expiring today is far more important than a general event announcement. The platform needs a way to surface the most relevant notifications at the top without requiring manual curation.

### Solution: Priority Inbox

The Priority Inbox is a scoring algorithm that ranks notifications by combining two signals:

1. **Category weight** — how inherently important is the notification type?
2. **Recency** — how recently was the notification created?

#### Category Weights

| Type      | Weight | Reasoning                                     |
|-----------|--------|-----------------------------------------------|
| Placement | 3      | Career-critical, often time-bound deadlines   |
| Result    | 2      | Academically significant outcomes             |
| Event     | 1      | General announcements, lower urgency          |

#### Recency Score (normalized 0–1)

Each notification's timestamp is normalized relative to the oldest and newest notifications in the current dataset:

```
recencyScore = (notificationTime - minTime) / (maxTime - minTime)
```

- Most recent notification → recencyScore = 1.0  
- Oldest notification → recencyScore = 0.0

#### Combined Score Formula

```
priorityScore = (weight / maxWeight) × 0.6 + recencyScore × 0.4
```

Where `maxWeight = 3` (Placement).

The **60/40 split** ensures that type importance outweighs recency, but a very recent lower-priority notification can still outrank a stale high-priority one.

#### Example

| Notification              | Type      | Norm. Weight | Recency | Score  |
|---------------------------|-----------|--------------|---------|--------|
| TCS Hiring Drive          | Placement | 1.00         | 0.95    | 0.98   |
| End-Sem Results Published | Result    | 0.67         | 0.80    | 0.72   |
| Farewell Party            | Event     | 0.33         | 0.90    | 0.56   |
| Old Placement Notice      | Placement | 1.00         | 0.10    | 0.64   |

#### Handling New Notifications

As new notifications arrive, `minTime` and `maxTime` are recalculated dynamically, which naturally shifts recency scores. This means:
- Old Placements don't permanently dominate — they get pushed down as fresher ones arrive.
- Recent Events can briefly outrank stale Results.

This ensures the inbox stays fresh without any manual intervention.

#### Implementation

See: `notification_app_fe/lib/priorityInbox.js`

```js
export function getPriorityInbox(notifications, topN = 10) {
  const timestamps = notifications.map(n => new Date(n.Timestamp).getTime());
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);

  const scored = notifications.map(n => {
    const weight = WEIGHTS[n.Type] ?? 1;
    const normalizedWeight = weight / MAX_WEIGHT;
    const rScore = recencyScore(n.Timestamp, minTime, maxTime);
    const priorityScore = normalizedWeight * 0.6 + rScore * 0.4;
    return { ...n, priorityScore };
  });

  return scored.sort((a, b) => b.priorityScore - a.priorityScore).slice(0, topN);
}
```

---

## Stage 2 — Application Architecture

### Tech Stack

- **Framework**: Next.js 14 (App Router) with JavaScript
- **UI**: Material UI v5 (MUI) — **no other CSS library used**
- **State**: React `useState` + `useCallback`
- **Persistence**: `localStorage` for viewed notification state
- **Logging**: Custom middleware (`lib/logger.js`) integrated into every page and API call

### Folder Structure

```
notification_app_fe/
├── app/
│   ├── page.jsx                   ← All Notifications
│   ├── priority/page.jsx          ← Priority Inbox
│   ├── api/
│   │   ├── notifications/route.js ← Proxies evaluation-service/notifications
│   │   └── auth-token/route.js    ← Handles bearer token for logging
│   ├── layout.js
│   └── globals.css
├── components/
│   ├── ThemeRegistry.jsx          ← MUI dark theme setup
│   ├── Navbar.jsx                 ← Navigation with active states
│   ├── NotificationCard.jsx       ← Notification display card
│   └── SearchAndFilter.jsx        ← Search + type filter
└── lib/
    ├── logger.js                  ← FIRST FUNCTION: Logging middleware
    ├── api.js                     ← API client with logging
    ├── priorityInbox.js           ← Priority inbox algorithm
    └── auth.js                    ← Authentication utility
```

### Pages

#### `/` — All Notifications
- Fetches all notifications via `GET /api/notifications`
- Search by keyword (filters on Message and Type)
- Filter by type: All / Placement / Result / Event
- Shows **unread count badge** in Navbar
- Clicking a new notification marks it as viewed

#### `/priority` — Priority Inbox
- Fetches all notifications and applies the Stage 1 algorithm client-side
- **Top-N slider** (5–50) lets users control how many top results to view
- Each card shows a **priority score bar** (0–100%)
- Same search + filter as the All page

### New vs. Viewed Notifications

- Tracked in `localStorage` under key `campus_viewed_ids`
- Unread cards have a **colored left border** matching their category
- Unread cards show a **"New" chip** and **bold message text**
- Clicking any card marks it read

### Logging Integration

The Logging Middleware (`lib/logger.js`) is the **first function written** in this codebase.

Every meaningful action calls `Log(stack, level, package, message)`:

| Event                    | stack       | level  | package |
|--------------------------|-------------|--------|---------|
| Page load                | `frontend`  | `info` | `page`  |
| API fetch                | `frontend`  | `info` | `api`   |
| Filter/search change     | `frontend`  | `info` | `state` |
| Mark notification read   | `frontend`  | `info` | `state` |
| Error in fetch           | `frontend`  | `error`| `api`   |
| Priority score computed  | `frontend`  | `info` | `utils` |

### Responsive Design

| Breakpoint | Columns |
|------------|---------|
| xs (<600px) | 1 column |
| sm (600–899px) | 2 columns |
| md (≥900px) | 3 columns |

### API

#### Notification API (via proxy)
```
GET /api/notifications?notification_type=Placement&page=1&limit=50
```
Proxied to: `http://20.207.122.201/evaluation-service/notifications`

#### Auth token (internal)
```
GET /api/auth-token
```
Returns bearer token used by the logging middleware.
