// Selvstændig stub-server til røgtesten: serverer app/ og svarer på de
// API-kald som boot-flowet rammer. Ingen Supabase, ingen Claude.
const path = require("path");
const express = require(path.join(__dirname, "..", "node_modules", "express"));
const app = express();
app.use(express.json({ limit: "2mb" }));
let _demoProfile = { username: "demo", nickname: "Demo", profession: null, workplace: null };
app.post("/api/user/profile", (_q, r) => r.json(Object.assign({ ok: true }, _demoProfile)));
app.post("/api/user/update", (req, r) => { Object.assign(_demoProfile, req.body || {}); r.json({ ok: true }); });
app.get("/api/config", (_q, r) => r.json({}));
app.get("/api/health", (_q, r) => r.json({ ok: true }));
app.get("/api/state", (_q, r) => r.json({ data: null, updated_at: null }));
app.post("/api/stats-query", (_q, r) => r.json({ answer: "Din længste vagt var ons. 8. jan. på 9t 0m." }));
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
app.post("/api/visits/wine-from-label", (_q, r) => r.json({ name: "Barolo Cannubi", producer: "Damilano", vintage: "2018", land: "Italien", region: "Piemonte", grape: "Nebbiolo", type: "rod", about: "Klassisk Barolo fra Cannubi-marken." }));
app.post("/api/upload-photo", (_q, r) => r.json({ url: null }));
app.get("/api/users/check-username", (req, r) => r.json({ available: req.query.username !== "taken" }));
app.use(express.static(path.join(__dirname, "..", "app")));
app.get("/", (_q, r) => r.sendFile(path.join(__dirname, "..", "app", "mise.html")));
app.listen(3199, () => console.log("stub on 3199"));
