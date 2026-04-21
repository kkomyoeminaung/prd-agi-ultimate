class DevOpsAgent:
    def generate_dockerfile(self):
        """Multi-Stage Dockerfile with Caching."""
        return """FROM node:20 AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM node:20-slim\nWORKDIR /app\nCOPY --from=builder /app/dist ./dist\nCMD ["node", "dist/server.js"]"""

devops_agent = DevOpsAgent()
