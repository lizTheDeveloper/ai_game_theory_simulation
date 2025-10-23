import { NextResponse } from 'next/server';
import { getCacheStats } from '@/lib/api/cache';

export async function GET() {
  return NextResponse.json({
    version: '1.0.0',
    endpoints: {
      overview: '/api/dashboard/overview',
      paradigms: '/api/dashboard/paradigms',
      'paradigms.detail': '/api/dashboard/paradigms/:id',
      criticalMetrics: '/api/dashboard/critical-metrics',
      agents: '/api/dashboard/agents',
      'agents.detail': '/api/dashboard/agents/:id',
      environment: '/api/dashboard/environment',
      government: '/api/dashboard/government',
      'government.detail': '/api/dashboard/government/:countryId',
      crises: '/api/dashboard/crises',
      technology: '/api/dashboard/technology',
      'technology.detail': '/api/dashboard/technology/:techId',
      history: '/api/dashboard/history',
    },
    cacheStats: getCacheStats(),
    timestamp: new Date().toISOString(),
  });
}
