import { NextRequest, NextResponse } from 'next/server';

interface LoginRequestBody {
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequestBody = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { message: 'Password is required' },
        { status: 400 }
      );
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable is not set');
      return NextResponse.json(
        { message: 'Server configuration error: Admin password not set. Please configure ADMIN_PASSWORD in environment variables.' },
        { status: 500 }
      );
    }

    // Simple password check (for production, use bcrypt or similar)
    if (password !== adminPassword) {
      return NextResponse.json(
        { message: 'Invalid password' },
        { status: 401 }
      );
    }

    // Create response with authentication cookie
    const response = NextResponse.json(
      { message: 'Authentication successful' },
      { status: 200 }
    );

    // Set HTTP-only secure cookie
    response.cookies.set('admin-auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Login failed' },
      { status: 500 }
    );
  }
}
