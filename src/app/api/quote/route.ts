import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const quoteSchema = z.object({
  event: z.object({
    type: z.string(),
    duration: z.number().min(1).max(30),
    expectedVisitors: z.number().min(1),
    venue: z.string().optional(),
    date: z.string().optional(),
  }),
  services: z.array(
    z.object({
      id: z.string(),
      options: z.record(z.union([z.string(), z.number(), z.boolean()])),
    })
  ),
  addOns: z.array(z.string()),
  contact: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    company: z.string().optional(),
    phone: z.string().optional(),
    notes: z.string().optional(),
  }),
  estimatedTotal: z.number(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = quoteSchema.parse(body);

    // In production, this would save to DB and trigger notifications
    console.log('Quote request:', validated);

    const quoteId = `NQ-${Date.now().toString(36).toUpperCase()}`;

    return NextResponse.json(
      {
        success: true,
        quoteId,
        message: 'Quote request received',
        estimatedTotal: validated.estimatedTotal,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
