import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') ||
                req.cookies.get('accessToken')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Here you'd verify the JWT and fetch the user from backend
  // For demo, we'll return a mock user
  return NextResponse.json({ firstName: 'Admin' });
}