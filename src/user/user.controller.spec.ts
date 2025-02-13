/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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
      const result: User[] = [
        { username: 'John', age: 25, city: 'New York' },
        { username: 'Jane', age: 30, city: 'London' },
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
      const result: User = { ...createUserDto }; // Nema _id, samo DTO
      mockUserService.create.mockResolvedValue(result);

      expect(await userController.createUser(createUserDto)).toBe(result);
      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('getUser', () => {
    it('should return a user by ID', async () => {
      const result: User = {
        username: 'John',
        age: 25,
        city: 'New York',
      };
      mockUserService.findById.mockResolvedValue(result);

      expect(await userController.getUser('valid-id')).toBe(result);
      expect(mockUserService.findById).toHaveBeenCalledWith('valid-id');
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
      const updateUserDto: UpdateUserDto = {
        username: 'Updated Name',
        age: 32,
        city: 'Berlin',
      };
      const result: User = { ...updateUserDto }; // Nema _id, samo DTO
      mockUserService.updateById.mockResolvedValue(result);

      expect(await userController.updateUser('valid-id', updateUserDto)).toBe(
        result,
      );
      expect(mockUserService.updateById).toHaveBeenCalledWith(
        'valid-id',
        updateUserDto,
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete and return the user', async () => {
      const result: User = {
        username: 'John',
        age: 25,
        city: 'New York',
      };
      mockUserService.deleteById.mockResolvedValue(result);

      expect(await userController.deleteUser('valid-id')).toBe(result);
      expect(mockUserService.deleteById).toHaveBeenCalledWith('valid-id');
    });

    it('should return null if user not found', async () => {
      mockUserService.deleteById.mockResolvedValue(null);

      expect(await userController.deleteUser('invalid-id')).toBeNull();
      expect(mockUserService.deleteById).toHaveBeenCalledWith('invalid-id');
    });
  });
});
