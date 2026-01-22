import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/authSharedClient';
import { getServerSupabaseClient } from '@/lib/supabaseAppClient';
import { calculateNextReview } from '@/lib/srs';

interface GradeRequest {
  item_id: string;
  score: number;
  error_tags?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: GradeRequest = await request.json();
    const { item_id, score, error_tags = [] } = body;

    if (!item_id || typeof score !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token using shared auth
    const { user, error: authError } = await verifyAuthToken(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const supabase = getServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Get current SRS item
    const { data: item, error: fetchError } = await supabase
      .from('srs_items')
      .select('*')
      .eq('id', item_id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !item) {
      return NextResponse.json({ error: 'SRS item not found' }, { status: 404 });
    }

    // Calculate next review
    const { interval_days, ease } = calculateNextReview(
      item.interval_days,
      item.ease,
      score
    );

    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + interval_days);

    // Update SRS item
    const { error: updateError } = await supabase
      .from('srs_items')
      .update({
        interval_days,
        ease,
        last_score: score,
        due_at: dueAt.toISOString(),
        error_tags,
        updated_at: new Date().toISOString()
      })
      .eq('id', item_id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('SRS update error:', updateError);
      return NextResponse.json({ error: 'Failed to update SRS item' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      interval_days,
      ease,
      due_at: dueAt.toISOString()
    });

  } catch (error) {
    console.error('SRS grade error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
