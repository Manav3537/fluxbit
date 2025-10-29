import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import pool from '../config/database';
import {
  processNaturalLanguageQuery,
  generateInsights,
  detectAnomalies,
  recommendCharts
} from '../services/aiService';

export const queryData = async (req: AuthRequest, res: Response) => {
  try {
    const { dataSourceId, query } = req.body;
    const userId = req.user?.userId;

    if (!dataSourceId || !query) {
      return res.status(400).json({ error: 'Data source ID and query are required' });
    }

    const dataSourceResult = await pool.query(
      `SELECT ds.*, d.owner_id 
       FROM data_sources ds 
       JOIN dashboards d ON ds.dashboard_id = d.id 
       WHERE ds.id = $1`,
      [dataSourceId]
    );

    if (dataSourceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Data source not found' });
    }

    const dataSource = dataSourceResult.rows[0];

    if (dataSource.owner_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const data = dataSource.data;
    const metadata = dataSource.metadata;

    const result = await processNaturalLanguageQuery(
      query,
      metadata.headers,
      data
    );

    res.json(result);
  } catch (error) {
    console.error('Query data error:', error);
    res.status(500).json({ error: 'Failed to process query' });
  }
};

export const getInsights = async (req: AuthRequest, res: Response) => {
  try {
    const { dataSourceId } = req.params;
    const userId = req.user?.userId;

    const dataSourceResult = await pool.query(
      `SELECT ds.*, d.owner_id 
       FROM data_sources ds 
       JOIN dashboards d ON ds.dashboard_id = d.id 
       WHERE ds.id = $1`,
      [dataSourceId]
    );

    if (dataSourceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Data source not found' });
    }

    const dataSource = dataSourceResult.rows[0];

    if (dataSource.owner_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const data = dataSource.data;
    const metadata = dataSource.metadata;

    const insights = await generateInsights(data, metadata.headers);

    res.json(insights);
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
};

export const getAnomalies = async (req: AuthRequest, res: Response) => {
  try {
    const { dataSourceId } = req.params;
    const userId = req.user?.userId;

    const dataSourceResult = await pool.query(
      `SELECT ds.*, d.owner_id 
       FROM data_sources ds 
       JOIN dashboards d ON ds.dashboard_id = d.id 
       WHERE ds.id = $1`,
      [dataSourceId]
    );

    if (dataSourceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Data source not found' });
    }

    const dataSource = dataSourceResult.rows[0];

    if (dataSource.owner_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const data = dataSource.data;
    const metadata = dataSource.metadata;

    const anomalies = await detectAnomalies(data, metadata.headers);

    res.json(anomalies);
  } catch (error) {
    console.error('Get anomalies error:', error);
    res.status(500).json({ error: 'Failed to detect anomalies' });
  }
};

export const getChartRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const { dataSourceId } = req.params;
    const userId = req.user?.userId;

    const dataSourceResult = await pool.query(
      `SELECT ds.*, d.owner_id 
       FROM data_sources ds 
       JOIN dashboards d ON ds.dashboard_id = d.id 
       WHERE ds.id = $1`,
      [dataSourceId]
    );

    if (dataSourceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Data source not found' });
    }

    const dataSource = dataSourceResult.rows[0];

    if (dataSource.owner_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const data = dataSource.data;
    const metadata = dataSource.metadata;

    const recommendations = await recommendCharts(data, metadata.headers);

    res.json({ recommendations });
  } catch (error) {
    console.error('Get chart recommendations error:', error);
    res.status(500).json({ error: 'Failed to get chart recommendations' });
  }
};