import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getDashboards = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const result = await pool.query(
      'SELECT id, name, owner_id, config, created_at, updated_at, version FROM dashboards WHERE owner_id = $1 ORDER BY updated_at DESC',
      [userId]
    );

    res.json({ dashboards: result.rows });
  } catch (error) {
    console.error('Get dashboards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const result = await pool.query(
      'SELECT id, name, owner_id, config, created_at, updated_at, version FROM dashboards WHERE id = $1 AND owner_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    res.json({ dashboard: result.rows[0] });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const { name, config = {} } = req.body;
    const userId = req.user?.userId;

    if (!name) {
      return res.status(400).json({ error: 'Dashboard name is required' });
    }

    const result = await pool.query(
      'INSERT INTO dashboards (name, owner_id, config) VALUES ($1, $2, $3) RETURNING id, name, owner_id, config, created_at, updated_at, version',
      [name, userId, JSON.stringify(config)]
    );

    await pool.query(
      'INSERT INTO activity_logs (user_id, dashboard_id, action, details) VALUES ($1, $2, $3, $4)',
      [userId, result.rows[0].id, 'create_dashboard', JSON.stringify({ name })]
    );

    res.status(201).json({ dashboard: result.rows[0] });
  } catch (error) {
    console.error('Create dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, config } = req.body;
    const userId = req.user?.userId;

    const existing = await pool.query(
      'SELECT id FROM dashboards WHERE id = $1 AND owner_id = $2',
      [id, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }

    if (config !== undefined) {
      updates.push(`config = $${paramCount++}`);
      values.push(JSON.stringify(config));
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    updates.push(`version = version + 1`);

    values.push(id, userId);

    const result = await pool.query(
      `UPDATE dashboards SET ${updates.join(', ')} WHERE id = $${paramCount++} AND owner_id = $${paramCount++} RETURNING id, name, owner_id, config, created_at, updated_at, version`,
      values
    );

    await pool.query(
      'INSERT INTO activity_logs (user_id, dashboard_id, action, details) VALUES ($1, $2, $3, $4)',
      [userId, id, 'update_dashboard', JSON.stringify({ name, config })]
    );

    res.json({ dashboard: result.rows[0] });
  } catch (error) {
    console.error('Update dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const result = await pool.query(
      'DELETE FROM dashboards WHERE id = $1 AND owner_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    await pool.query(
      'INSERT INTO activity_logs (user_id, dashboard_id, action) VALUES ($1, $2, $3)',
      [userId, id, 'delete_dashboard']
    );

    res.json({ message: 'Dashboard deleted successfully' });
  } catch (error) {
    console.error('Delete dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};