import './config/env.js';
import app from './app.js';
import { prisma } from './lib/prisma.js';

const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
  const b = "\x1b[1m";   // bold
  const g = "\x1b[32m";  // green
  const c = "\x1b[36m";  // cyan
  const y = "\x1b[33m";  // yellow
  const d = "\x1b[2m";   // dim
  const r = "\x1b[0m";   // reset
  const base = `http://localhost:${port}`;

  console.log(`\n${b}${g}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${r}`);
  console.log(`${b}${g}  GETFLY PROJECT — Server Ready${r}`);
  console.log(`${b}${g}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${r}\n`);

  console.log(`${b}  SYSTEM${r}`);
  console.log(`  ${d}Health check  ${r}  ${c}GET   ${r}${base}/health`);
  console.log(`  ${d}About         ${r}  ${c}GET   ${r}${base}/about\n`);

  console.log(`${b}  AUTHENTICATION${r}`);
  console.log(`  ${d}Register      ${r}  ${y}POST  ${r}${base}/api/auth/register`);
  console.log(`  ${d}Login         ${r}  ${y}POST  ${r}${base}/api/auth/login\n`);

  console.log(`${b}  PROJECTS${r}`);
  console.log(`  ${d}List Projects ${r}  ${c}GET   ${r}${base}/api/projects`);
  console.log(`  ${d}Create Project${r}  ${y}POST  ${r}${base}/api/projects`);
  console.log(`  ${d}Get Project   ${r}  ${c}GET   ${r}${base}/api/projects/:id`);
  console.log(`  ${d}Update Project${r}  ${y}PUT   ${r}${base}/api/projects/:id`);
  console.log(`  ${d}Delete Project${r}  ${y}DELETE${r}${base}/api/projects/:id\n`);

  console.log(`${b}  DAILY PROGRESS REPORTS (DPRs)${r}`);
  console.log(`  ${d}List DPRs     ${r}  ${c}GET   ${r}${base}/api/projects/:id/dpr`);
  console.log(`  ${d}Create DPR    ${r}  ${y}POST  ${r}${base}/api/projects/:id/dpr\n`);

  console.log(`${b}${g}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${r}\n`);
});

const gracefulShutdown = (signal: string) => {
  console.log(`\nReceived ${signal}, starting graceful shutdown...`);

  server.close((err) => {
    if (err) {
      console.error("Error during HTTP server shutdown:", err);
      process.exitCode = 1;
    } else {
      console.log("HTTP server closed gracefully.");
    }
    
    if (prisma) {
        prisma.$disconnect().then(() => {
          console.log("Prisma disconnected.");
          process.exit(process.exitCode ?? 0);
        }).catch((e) => {
          console.error("Error disconnecting Prisma:", e);
          process.exit(1);
        });
      } else {
        process.exit(process.exitCode ?? 0);
      }
  });

  // Failsafe: force exit if shutdown takes too long
  setTimeout(() => {
    console.warn("Forcing shutdown after timeout.");
    process.exit(process.exitCode ?? 0);
  }, 10_000).unref();
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
