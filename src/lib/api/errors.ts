import { NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown) {
  console.error('[API Error]', error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode }
    );
  }

  // Unknown error
  return NextResponse.json(
    {
      error: 'Internal Server Error',
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}

export function validateRequired(params: Record<string, any>, required: string[]) {
  const missing = required.filter(key => params[key] === undefined);
  if (missing.length > 0) {
    throw new ApiError(400, `Missing required parameters: ${missing.join(', ')}`);
  }
}
