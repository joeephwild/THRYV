import { apiService } from './api';

// Types for savings goals
export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category?: string;
  description?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavingsGoalRequest {
  name: string;
  targetAmount: number;
  deadline?: string;
  category?: string;
  description?: string;
}

export interface UpdateSavingsGoalRequest {
  name?: string;
  targetAmount?: number;
  deadline?: string;
  category?: string;
  description?: string;
}

export interface DepositRequest {
  amount: number;
  description?: string;
}

class SavingsService {
  // Get all savings goals
  async getSavingsGoals(): Promise<SavingsGoal[]> {
    try {
      const response = await apiService.get<{ goals: SavingsGoal[] }>('/savings', true);
      return response.goals;
    } catch (error) {
      console.error('Error fetching savings goals:', error);
      throw error;
    }
  }

  // Create a new savings goal
  async createSavingsGoal(goalData: CreateSavingsGoalRequest): Promise<SavingsGoal> {
    try {
      const response = await apiService.post<{ goal: SavingsGoal }>('/savings', goalData, true);
      return response.goal;
    } catch (error) {
      console.error('Error creating savings goal:', error);
      throw error;
    }
  }

  // Update a savings goal
  async updateSavingsGoal(goalId: string, goalData: UpdateSavingsGoalRequest): Promise<SavingsGoal> {
    try {
      const response = await apiService.put<{ goal: SavingsGoal }>(`/savings/${goalId}`, goalData, true);
      return response.goal;
    } catch (error) {
      console.error('Error updating savings goal:', error);
      throw error;
    }
  }

  // Delete a savings goal
  async deleteSavingsGoal(goalId: string): Promise<void> {
    try {
      await apiService.delete(`/savings/${goalId}`, true);
    } catch (error) {
      console.error('Error deleting savings goal:', error);
      throw error;
    }
  }

  // Make a deposit to a savings goal
  async depositToGoal(goalId: string, depositData: DepositRequest): Promise<SavingsGoal> {
    try {
      const response = await apiService.post<{ goal: SavingsGoal }>(`/savings/${goalId}/deposit`, depositData, true);
      return response.goal;
    } catch (error) {
      console.error('Error depositing to savings goal:', error);
      throw error;
    }
  }

  // Get savings goal by ID
  async getSavingsGoalById(goalId: string): Promise<SavingsGoal> {
    try {
      const response = await apiService.get<{ goal: SavingsGoal }>(`/savings/${goalId}`, true);
      return response.goal;
    } catch (error) {
      console.error('Error fetching savings goal:', error);
      throw error;
    }
  }

  // Get savings statistics
  async getSavingsStats(): Promise<{
    totalSaved: number;
    totalGoals: number;
    completedGoals: number;
    monthlyProgress: number;
  }> {
    try {
      const response = await apiService.get<{
        totalSaved: number;
        totalGoals: number;
        completedGoals: number;
        monthlyProgress: number;
      }>('/savings/stats', true);
      return response;
    } catch (error) {
      console.error('Error fetching savings stats:', error);
      throw error;
    }
  }
}

export const savingsService = new SavingsService();
export default savingsService;
