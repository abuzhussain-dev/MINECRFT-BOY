# Minecraft AI Bot Commander

An AI-powered dashboard for Mineflayer bots with Gemini AI integration.

## Termux Setup Instructions

1. **Install Node.js:**
   ```bash
   pkg update && pkg upgrade
   pkg install nodejs
   ```

2. **Clone the Repository:**
   ```bash
   git clone https://github.com/abuzhussain-dev/MINECRFT-BOY.git
   cd MINECRFT-BOY
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Environment Setup:**
   Create a `.env` file:
   ```bash
   nano .env
   ```
   Add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_key_here
   ```

5. **Run the Dashboard:**
   ```bash
   npm run dev
   ```
   Then open `http://localhost:3000` in your phone's browser.

## Features
- **Neural Command:** Use natural language to tell the bot what to do.
- **Auto-Grind:** Bot automatically searches and mines nearby ores.
- **Guard Mode:** Uses `mineflayer-pvp` to defend against hostile mobs/players.
- **Sophisticated Dashboard:** Real-time telemetry and logs.
