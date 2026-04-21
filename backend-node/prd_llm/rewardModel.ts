import { db } from '../database';

export class RewardModel {
  // Simple neural-network approximation mapping (C, U, Feedback) -> Reward
  private w_c = 0.5;
  private w_u = -0.3;
  
  async computeReward(tensor: any, feedback: number): Promise<number> {
    // Reward = Base Quality + Feedback Shift
    const baseQuality = (tensor.C * this.w_c) + (tensor.U * this.w_u);
    const reward = baseQuality + feedback;
    return reward;
  }

  async updatePolicy(tensor: any, reward: number, learningRate: number = 0.01) {
    // Policy gradient approximation: w <- w + eta * reward * (C - 0.5)
    try {
      const row = await db.get(`SELECT weights_json FROM paccaya_weights WHERE id = 1`);
      if (row?.weights_json) {
        let weights = JSON.parse(row.weights_json);
        const c_diff = tensor.C - 0.5;
        weights = weights.map((w: number) => Math.max(0.001, w + learningRate * reward * c_diff));
        
        // Normalize
        const sum = weights.reduce((a: number, b: number) => a + b, 0);
        weights = weights.map((w: number) => w / sum);
        
        await db.run(
          `UPDATE paccaya_weights SET weights_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1`,
          [JSON.stringify(weights)]
        );
      }
    } catch(e) {
      console.error('RLHF Update failed', e);
    }
  }
}

export const rewardModel = new RewardModel();
