import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import pool from '../config/database';
import { parseFile, deleteFile } from '../utils/dataParser';

export const uploadData = async (req: AuthRequest, res: Response) => {
  try {
    const { dashboardId } = req.body;
    const userId = req.user?.userId;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!dashboardId) {
      return res.status(400).json({ error: 'Dashboard ID is required' });
    }

    const dashboardCheck = await pool.query(
      'SELECT id FROM dashboards WHERE id = $1 AND owner_id = $2',
      [dashboardId, userId]
    );

    if (dashboardCheck.rows.length === 0) {
      deleteFile(req.file.path);
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    const parsedData = await parseFile(req.file.path);

    const result = await pool.query(
      `INSERT INTO data_sources (dashboard_id, name, type, file_path, data, metadata) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, name, type, metadata, created_at`,
      [
        dashboardId,
        req.file.originalname,
        req.file.mimetype.includes('csv') ? 'csv' : 'excel',
        req.file.path,
        JSON.stringify(parsedData.rows),
        JSON.stringify({
          headers: parsedData.headers,
          rowCount: parsedData.rowCount,
          fileSize: req.file.size,
          originalName: req.file.originalname
        })
      ]
    );

    await pool.query(
      'INSERT INTO activity_logs (user_id, dashboard_id, action, details) VALUES ($1, $2, $3, $4)',
      [userId, dashboardId, 'upload_data', JSON.stringify({ fileName: req.file.originalname })]
    );

    res.status(201).json({
      message: 'File uploaded successfully',
      dataSource: result.rows[0],
      preview: parsedData.rows.slice(0, 5), 
      metadata: {
        headers: parsedData.headers,
        rowCount: parsedData.rowCount
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    if (req.file) {
      deleteFile(req.file.path);
    }

    res.status(500).json({ error: 'Failed to upload file' });
  }
};

export const getDataSources = async (req: AuthRequest, res: Response) => {
  try {
    const { dashboardId } = req.params;
    const userId = req.user?.userId;

    const dashboardCheck = await pool.query(
      'SELECT id FROM dashboards WHERE id = $1 AND owner_id = $2',
      [dashboardId, userId]
    );

    if (dashboardCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    const result = await pool.query(
      'SELECT id, name, type, metadata, created_at FROM data_sources WHERE dashboard_id = $1 ORDER BY created_at DESC',
      [dashboardId]
    );

    res.json({ dataSources: result.rows });
  } catch (error) {
    console.error('Get data sources error:', error);
    res.status(500).json({ error: 'Failed to fetch data sources' });
  }
};

export const getDataSource = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const result = await pool.query(
      `SELECT ds.*, d.owner_id 
       FROM data_sources ds 
       JOIN dashboards d ON ds.dashboard_id = d.id 
       WHERE ds.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data source not found' });
    }

    const dataSource = result.rows[0];

    if (dataSource.owner_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ dataSource });
  } catch (error) {
    console.error('Get data source error:', error);
    res.status(500).json({ error: 'Failed to fetch data source' });
  }
};

export const deleteDataSource = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const dataSourceResult = await pool.query(
      `SELECT ds.*, d.owner_id 
       FROM data_sources ds 
       JOIN dashboards d ON ds.dashboard_id = d.id 
       WHERE ds.id = $1`,
      [id]
    );

    if (dataSourceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Data source not found' });
    }

    const dataSource = dataSourceResult.rows[0];

    if (dataSource.owner_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (dataSource.file_path) {
      deleteFile(dataSource.file_path);
    }

    await pool.query('DELETE FROM data_sources WHERE id = $1', [id]);

    res.json({ message: 'Data source deleted successfully' });
  } catch (error) {
    console.error('Delete data source error:', error);
    res.status(500).json({ error: 'Failed to delete data source' });
  }
};