import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JwtService } from '@nestjs/jwt';
import { db } from '../prisma/db.js';
import * as bcrypt from 'bcrypt';

vi.mock('../prisma/db.js', () => ({
  db: {
    orm: {
      public: {
        User: {
          where: vi.fn(),
          create: vi.fn(),
        },
      },
    },
  },
}));

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
let jwtService: JwtService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
  AuthService,
  {
    provide: JwtService,
    useValue: {
      signAsync: vi.fn(),
    },
  },
],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register a new user as STAFF', async () => {
  const firstMock = vi.fn().mockResolvedValue(null);
  vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);

  vi.mocked(db.orm.public.User.where).mockReturnValue({
    first: firstMock,
  } as any);

  vi.mocked(db.orm.public.User.create).mockResolvedValue({
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: 'STAFF',
    passwordHash: 'hashed-password',
  } as any);

  const result = await service.register({
    email: 'test@example.com',
    name: 'Test User',
    password: 'Password123',
  });

  expect(result).toEqual({
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: 'STAFF',
  });
  expect(db.orm.public.User.create).toHaveBeenCalled();
  expect(bcrypt.hash).toHaveBeenCalledWith('Password123', 10);
});

it('should reject registration when email already exists', async () => {
  const firstMock = vi.fn().mockResolvedValue({
    id: 1,
    email: 'test@example.com',
  });

  vi.mocked(db.orm.public.User.where).mockReturnValue({
    first: firstMock,
  } as any);

  await expect(
    service.register({
      email: 'test@example.com',
      name: 'Test User',
      password: 'Password123',
    }),
  ).rejects.toThrow('Email already registered');
});
expect(db.orm.public.User.create).not.toHaveBeenCalled();

it('should reject login when user does not exist', async () => {
  const firstMock = vi.fn().mockResolvedValue(null);

  vi.mocked(db.orm.public.User.where).mockReturnValue({
    first: firstMock,
  } as any);

  await expect(
    service.login({
      email: 'unknown@example.com',
      password: 'Password123',
    }),
  ).rejects.toThrow('Invalid email or password');
});

it('should reject login when password is incorrect', async () => {
  const firstMock = vi.fn().mockResolvedValue({
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: 'STAFF',
    passwordHash: 'hashed-password',
  });

  vi.mocked(db.orm.public.User.where).mockReturnValue({
    first: firstMock,
  } as any);

  vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

  await expect(
    service.login({
      email: 'test@example.com',
      password: 'WrongPassword',
    }),
  ).rejects.toThrow('Invalid email or password');
});

it('should login successfully with valid credentials', async () => {
  const firstMock = vi.fn().mockResolvedValue({
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: 'STAFF',
    passwordHash: 'hashed-password',
  });

  vi.mocked(db.orm.public.User.where).mockReturnValue({
    first: firstMock,
  } as any);

  vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
  vi.mocked(jwtService.signAsync).mockResolvedValue('mock-access-token');

  const result = await service.login({
    email: 'test@example.com',
    password: 'Password123',
  });

  expect(result).toEqual({
    accessToken: 'mock-access-token',
    user: {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      role: 'STAFF',
    },
  });
  });

});
