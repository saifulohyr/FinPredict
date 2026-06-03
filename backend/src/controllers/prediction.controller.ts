import { Request, Response } from 'express';
import * as predictionService from '../services/prediction.service';
import { getLastGeneratedAt } from '../services/prediction.service';

export const generatePrediction = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const predictions = await predictionService.generatePrediction(userId);
    
    res.status(201).json({
      status: 'success',
      message: 'AI Predictions generated successfully',
      data: predictions,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ generatePrediction error:', message);
    res.status(500).json({ status: 'error', message });
  }
};

export const getPredictions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const predictions = await predictionService.getLatestPredictions(userId);
    const lastGeneratedAt = await getLastGeneratedAt(userId);
    
    res.json({
      status: 'success',
      data: {
        predictions,
        lastGeneratedAt,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ getPredictions error:', message);
    res.status(500).json({ status: 'error', message });
  }
};

export const getWarningStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const warningData = await predictionService.checkEarlyWarning(userId);

    res.json({
      status: 'success',
      data: warningData,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ getWarningStatus error:', message);
    res.status(500).json({ status: 'error', message });
  }
};
