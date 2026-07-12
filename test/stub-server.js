// Selvstændig stub-server til røgtesten: serverer app/ og svarer på de
// API-kald som boot-flowet rammer. Ingen Supabase, ingen Claude.
const path = require("path");
const express = require(path.join(__dirname, "..", "node_modules", "express"));
const app = express();
app.use(express.json({ limit: "2mb" }));
app.post("/api/user/profile", (_q, r) => r.json({ username: "demo", nickname: "Demo" }));
app.get("/api/config", (_q, r) => r.json({}));
app.get("/api/health", (_q, r) => r.json({ ok: true }));
app.get("/api/state", (_q, r) => r.json({ data: null, updated_at: null }));
app.post("/api/state", (_q, r) => r.json({ ok: true, updated_at: new Date().toISOString() }));
app.get("/api/teams/list", (_q, r) => r.json({ teams: [] }));
app.get("/api/teams/mine", (_q, r) => r.json({ teams: [] }));
app.get("/api/lab/dishes", (_q, r) => r.json({ dishes: [] }));
app.get("/api/lab/kitchen", (_q, r) => r.json({ dishes: [], noTeam: true }));
app.get("/api/lab/cookbooks", (_q, r) => r.json({ dishes: [] }));
app.post("/api/client-error", (_q, r) => r.json({ ok: true }));
app.post("/api/events", (_q, r) => r.json({ ok: true }));
app.post("/api/push/subscribe", (_q, r) => r.json({ ok: true }));
app.post("/api/pro/waitlist", (_q, r) => r.json({ ok: true }));
app.use(express.static(path.join(__dirname, "..", "app")));
app.get("/", (_q, r) => r.sendFile(path.join(__dirname, "..", "app", "mise.html")));
app.listen(3199, () => console.log("stub on 3199"));
