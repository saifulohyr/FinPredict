import { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const notifications = await notificationService.getNotifications(userId);
    
    res.json({
      status: 'success',
      data: notifications,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Notification] getNotifications error:', message);
    res.status(500).json({ status: 'error', message });
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const { id } = req.params;
    
    const notification = await notificationService.markAsRead(userId, id as string);
    
    res.json({
      status: 'success',
      data: notification,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'Notification not found') {
      res.status(404).json({ status: 'error', message });
      return;
    }
    console.error('[Notification] markAsRead error:', message);
    res.status(500).json({ status: 'error', message });
  }
};
