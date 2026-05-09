import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import mineflayer from "mineflayer";
import { pathfinder, Movements, goals } from "mineflayer-pathfinder";
import collectBlock from "mineflayer-collectblock";
import minecraftData from "minecraft-data";
import pvp from "mineflayer-pvp";
import armorManager from "mineflayer-armor-manager";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  // Bot Manager
  let bot: any = null;
  const botLogs: string[] = [];

  const addLog = (message: string) => {
    const log = `[${new Date().toLocaleTimeString()}] ${message}`;
    botLogs.push(log);
    if (botLogs.length > 200) botLogs.shift();
    io.emit("bot:log", log);
  };

  const updateBotTelemetry = () => {
    if (!bot) return;
    io.emit("bot:telemetry", {
      pos: bot.entity.position,
      health: bot.health,
      food: bot.food,
      username: bot.username,
      xp: bot.experience,
    });
  };

  io.on("connection", (socket) => {
    socket.emit("bot:logs", botLogs);
    if (bot) updateBotTelemetry();

    socket.on("bot:connect", (data: { host: string; port: number; username: string }) => {
      if (bot) bot.quit();

      addLog(`INITIATING CONNECTION: ${data.host}:${data.port}...`);
      
      try {
        bot = mineflayer.createBot({
          host: data.host,
          port: data.port,
          username: data.username,
        });

        // Load Plugins
        bot.loadPlugin(pathfinder);
        bot.loadPlugin(collectBlock.plugin);
        bot.loadPlugin(pvp.plugin);
        bot.loadPlugin(armorManager);

        const mcData = minecraftData(bot.version);

        bot.on("login", () => {
          addLog(`SYSTEM ONLINE: Authenticated as ${bot.username}`);
          io.emit("bot:status", { connected: true, username: bot.username });
        });

        bot.on("spawn", () => {
          addLog("SPAWN_DETECTED: Environmental scan complete.");
          const defaultMove = new Movements(bot, mcData);
          bot.pathfinder.setMovements(defaultMove);
          updateBotTelemetry();
        });

        bot.on("chat", (username: string, message: string) => {
          if (username === bot.username) return;
          addLog(`INBOUND_CHAT [${username}]: ${message}`);
        });

        bot.on("death", () => addLog("CRITICAL_ERROR: Bot died. Waiting for respawn..."));
        
        bot.on("kicked", (reason: string) => {
          addLog(`FORCE_TERMINATION: Kicked - ${reason}`);
          bot = null;
          io.emit("bot:status", { connected: false });
        });

        setInterval(updateBotTelemetry, 2000);

      } catch (err: any) {
        addLog(`CONNECTION_FAILED: ${err.message}`);
      }
    });

    socket.on("bot:disconnect", () => {
      if (bot) {
        bot.quit();
        bot = null;
        addLog("SESSION_ENDED: User disconnect command.");
        io.emit("bot:status", { connected: false });
      }
    });

    socket.on("bot:chat", (message: string) => {
      if (bot) bot.chat(message);
    });

    socket.on("bot:action", (cmd: any) => {
      if (!bot) return;
      const mcData = minecraftData(bot.version);
      
      addLog(`EXECUTING_SUBROUTINE: ${JSON.stringify(cmd)}`);

      if (cmd.action === "goto") {
        bot.pathfinder.setGoal(new goals.GoalBlock(cmd.x, cmd.y, cmd.z));
      } else if (cmd.action === "mine") {
        const blockType = mcData.blocksByName[cmd.block];
        if (blockType) {
          const blocks = bot.findBlocks({
            matching: blockType.id,
            maxDistance: 64,
            count: cmd.count || 1
          });
          if (blocks.length > 0) {
            bot.collectBlock.collect(bot.blockAt(blocks[0]));
          } else {
            addLog(`RESOURCE_NOT_FOUND: ${cmd.block}`);
          }
        }
      } else if (cmd.action === "stop") {
        bot.pathfinder.setGoal(null);
      } else if (cmd.action === "chat") {
        bot.chat(cmd.message);
      }
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
