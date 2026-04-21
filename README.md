# PRD-AGI Complete Ultimate Edition

A unified AI system combining self-learning chat, conceptual causal modeling (6-D tensors), and a full software development pipeline. This Ultimate Edition integrates 20 advanced features across the Core Engine and Software Agents, including Chain-of-Thought reasoning, Graph-based causal reasoning, RLHF-lite, Multi-agent ensemble, Multi-modal input handling, Kanban task resolving, E2E scaffolding, and One-Click ZIP packaging.

## 🚀 How to Run in Google Colab

1.  Open the `colab_setup.ipynb` notebook in Google Colab.
2.  Follow the instructions in the notebook:
    *   Mount Google Drive to persist data at `/content/drive/MyDrive/prd_agi_data/`.
    *   Add your `GEMINI_API_KEY` and `NGROK_AUTH_TOKEN` to Colab Secrets.
    *   Run the installation cells.
3.  The final cell will launch `python colab_start.py` and tunnel port 3000 to the public web via `ngrok`.
4.  Navigate to the generated public terminal URL to view the React frontend UI.

## 🏗️ Architecture

*   **Backend (Node/Express)**: Port 3000. API Gateway, Dream Mode loop, and Frontend server.
*   **PRD Core (FastAPI)**: Port 8001. Handles 6-D relational tensors.
*   **Software Agents (FastAPI)**: Port 8002. Product Manager, Architect, Developer, QA, and DevOps agents.
*   **Data**: Persistently stored in SQLite on Google Drive.

## 🧠 Dream Mode

When the system is idle, it automatically processes the learning queue, distilling knowledge from Teacher models (Gemini, etc.) and uploaded documents into the core knowledge base and causal manifold.

## 💻 Software Dev Pipeline

Input an idea in the Pipeline tab. The system will sequentially trigger:
1.  **Product Manager**: Generates PRD and User Stories.
2.  **Architect**: Designs the system and technical stack.
3.  **Developer**: Implements modules iteratively.
4.  **QA**: Generates and runs test suites.
5.  **DevOps**: Packages the app into a downloadable ZIP with Docker configs.

---
Built by Myo Min Aung & AI Build Assistant.
