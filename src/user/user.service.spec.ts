/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let mockUserModel;

  beforeEach(async () => {
    mockUserModel = {
      create: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const mockUser = { username: 'John Doe', age: 30, city: 'Tokyo' };
      mockUserModel.create.mockResolvedValue(mockUser);

      const result = await service.create(mockUser);

      expect(result).toEqual(mockUser);
      expect(mockUserModel.create).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { username: 'John Doe', city: 'Tokyo' },
        { username: 'Jane Doe', city: 'Berlin' },
      ];
      mockUserModel.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockUserModel.find).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      const mockUser = { username: 'John Doe', city: 'Tokyo' };
      mockUserModel.findById.mockResolvedValue(mockUser);

      const result = await service.findById('valid-id');

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findById).toHaveBeenCalledWith('valid-id');
    });

    it('should throw an error if user not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      try {
        await service.findById('invalid-id');
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('updateById', () => {
    it('should update the user if found', async () => {
      const mockUser = { username: 'John Doe', age: 30, city: 'Tokyo' };
      const updatedUser = { username: 'John Doe', age: 35, city: 'Oslo' };

      mockUserModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const result = await service.updateById('valid-id', updatedUser);

      expect(result).toEqual(updatedUser);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'valid-id',
        updatedUser,
        expect.any(Object),
      );
    });

    it('should return null if user not found', async () => {
      mockUserModel.findByIdAndUpdate.mockResolvedValue(null);

      const result = await service.updateById('invalid-id', {
        username: 'New Name',
        age: 30,
        city: 'Tokyo',
      });

      expect(result).toBeNull();
    });
  });

  describe('deleteById', () => {
    it('should delete the user if found', async () => {
      const mockUser = { username: 'John Doe', age: 30, city: 'Tokyo' };
      mockUserModel.findByIdAndDelete.mockResolvedValue(mockUser);

      const result = await service.deleteById('valid-id');

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith('valid-id');
    });

    it('should return null if user not found', async () => {
      mockUserModel.findByIdAndDelete.mockResolvedValue(null);

      const result = await service.deleteById('invalid-id');

      expect(result).toBeNull();
    });
  });
});
