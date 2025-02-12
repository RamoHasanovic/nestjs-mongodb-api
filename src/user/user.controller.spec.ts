/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as mongoose from 'mongoose'; // Za generisanje _id

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  const mockUserService = {
    findAll: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('getAllUsers', () => {
    it('should return an array of users', async () => {
      const userId1 = new mongoose.Types.ObjectId();
      const userId2 = new mongoose.Types.ObjectId();

      const result: User[] = [
        { _id: userId1, username: 'John', age: 25, city: 'New York' },
        { _id: userId2, username: 'Jane', age: 30, city: 'London' },
      ];
      mockUserService.findAll.mockResolvedValue(result);

      expect(await userController.getAllUsers()).toBe(result);
      expect(mockUserService.findAll).toHaveBeenCalled();
    });
  });

  describe('createUser', () => {
    it('should create and return a new user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'John Doe',
        age: 28,
        city: 'Tokyo',
      };
      const userId = new mongoose.Types.ObjectId();
      const result: User = { _id: userId, ...createUserDto };
      mockUserService.create.mockResolvedValue(result);

      expect(await userController.createUser(createUserDto)).toBe(result);
      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('getUser', () => {
    it('should return a user by ID', async () => {
      const userId = new mongoose.Types.ObjectId();
      const result: User = {
        _id: userId,
        username: 'John',
        age: 25,
        city: 'New York',
      };
      mockUserService.findById.mockResolvedValue(result);

      expect(await userController.getUser(userId.toString())).toBe(result);
      expect(mockUserService.findById).toHaveBeenCalledWith(userId.toString());
    });

    it('should throw an error if user not found', async () => {
      mockUserService.findById.mockResolvedValue(null);

      try {
        await userController.getUser('invalid-id');
      } catch (e) {
        expect(e.response.message).toBe('User not found');
      }
    });
  });

  describe('updateUser', () => {
    it('should update and return the user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const updateUserDto: UpdateUserDto = {
        username: 'Updated Name',
        age: 32,
        city: 'Berlin',
      };
      const result: User = { _id: userId, ...updateUserDto };
      mockUserService.updateById.mockResolvedValue(result);

      expect(
        await userController.updateUser(userId.toString(), updateUserDto),
      ).toBe(result);
      expect(mockUserService.updateById).toHaveBeenCalledWith(
        userId.toString(),
        updateUserDto,
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete and return the user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const result: User = {
        _id: userId,
        username: 'John',
        age: 25,
        city: 'New York',
      };
      mockUserService.deleteById.mockResolvedValue(result);

      expect(await userController.deleteUser(userId.toString())).toBe(result);
      expect(mockUserService.deleteById).toHaveBeenCalledWith(
        userId.toString(),
      );
    });

    it('should return null if user not found', async () => {
      mockUserService.deleteById.mockResolvedValue(null);

      expect(await userController.deleteUser('invalid-id')).toBeNull();
      expect(mockUserService.deleteById).toHaveBeenCalledWith('invalid-id');
    });
  });
});
