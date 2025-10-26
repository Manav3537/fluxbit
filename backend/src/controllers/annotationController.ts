import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getAnnotations = async (req: AuthRequest, res: Response) => {
  try {
    const { dashboardId } = req.params;

    const result = await pool.query(
      `SELECT a.*, u.email as user_email 
       FROM annotations a 
       JOIN users u ON a.user_id = u.id 
       WHERE a.dashboard_id = $1 
       ORDER BY a.created_at DESC`,
      [dashboardId]
    );

    res.json({ annotations: result.rows });
  } catch (error) {
    console.error('Get annotations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createAnnotation = async (req: AuthRequest, res: Response) => {
  try {
    const { dashboardId, dataPoint, content, xPos, yPos } = req.body;
    const userId = req.user?.userId;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const result = await pool.query(
      `INSERT INTO annotations (dashboard_id, user_id, data_point, content, x_pos, y_pos) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [dashboardId, userId, dataPoint, content, xPos, yPos]
    );

    // Get user email
    const userResult = await pool.query(
      'SELECT email FROM users WHERE id = $1',
      [userId]
    );

    const annotation = {
      ...result.rows[0],
      user_email: userResult.rows[0].email
    };

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, dashboard_id, action, details) VALUES ($1, $2, $3, $4)',
      [userId, dashboardId, 'create_annotation', JSON.stringify({ content })]
    );

    res.status(201).json({ annotation });
  } catch (error) {
    console.error('Create annotation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAnnotation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.userId;

    // Check ownership
    const existing = await pool.query(
      'SELECT id FROM annotations WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Annotation not found' });
    }

    const result = await pool.query(
      'UPDATE annotations SET content = $1 WHERE id = $2 RETURNING *',
      [content, id]
    );

    res.json({ annotation: result.rows[0] });
  } catch (error) {
    console.error('Update annotation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAnnotation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const result = await pool.query(
      'DELETE FROM annotations WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Annotation not found' });
    }

    res.json({ message: 'Annotation deleted successfully' });
  } catch (error) {
    console.error('Delete annotation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};