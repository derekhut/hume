import { getDb } from '@/utils/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = getDb();
    
    const result = await db.query(`
      SELECT name, code, created_at
      FROM schools
      ORDER BY name ASC
    `);

    return NextResponse.json({
      success: true,
      schools: result.rows
    });

  } catch (error) {
    console.error('Error fetching schools:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schools' },
      { status: 500 }
    );
  }
}
