/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { getModelToken } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { NotFoundException } from '@nestjs/common';

describe('UserController Integration Tests', () => {
  let userController: UserController;
  let userService: UserService;
  let mongoServer: MongoMemoryServer;
  let userModel: mongoose.Model<User>;

  // Pokrećemo MongoDB in-memory server pre svih testova
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useFactory: () =>
            mongoose.model(
              User.name,
              new mongoose.Schema({
                username: { type: String, required: true },
                age: { type: Number, required: true },
                city: { type: String, required: true },
              }),
            ),
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);

    // Povezivanje sa in-memory MongoDB serverom
    await mongoose.connect(uri);
    userModel = module.get(getModelToken(User.name));
  });

  // Zatvaranje konekcije sa bazom nakon svih testova
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // Čistimo bazu pre svakog testa
  beforeEach(async () => {
    await userModel.deleteMany({});
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        username: 'John Doe',
        age: 30,
        city: 'Tokyo',
      };

      const createdUser = await userController.createUser(createUserDto);
      expect(createdUser.username).toBe('John Doe');
      expect(createdUser.age).toBe(30);
      expect(createdUser.city).toBe('Tokyo');
    });
  });

  describe('getAllUsers', () => {
    it('should return an array of users', async () => {
      const user1 = await userModel.create({
        username: 'John Doe',
        age: 30,
        city: 'Tokyo',
      });
      const user2 = await userModel.create({
        username: 'Jane Doe',
        age: 25,
        city: 'Paris',
      });

      const result = await userController.getAllUsers();
      expect(result.length).toBe(2);
      expect(result[0].username).toBe(user1.username);
      expect(result[1].username).toBe(user2.username);
    });
  });

  describe('getUser', () => {
    it('should return a user by ID', async () => {
      const newUser = await userModel.create({
        username: 'John Doe',
        age: 30,
        city: 'Tokyo',
      });

      const result = await userController.getUser(newUser._id.toString()); // Koristimo _id.toString()
      expect(result.username).toBe('John Doe');
      expect(result.age).toBe(30);
      expect(result.city).toBe('Tokyo');
    });

    it('should throw NotFoundException if user not found', async () => {
      const invalidId = new mongoose.Types.ObjectId(); // Kreiramo validan ali nepostojeći ObjectId
      try {
        await userController.getUser(invalidId.toString()); // Poslali smo validan, ali nepostojeći ID
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('updateUser', () => {
    it('should update and return the user', async () => {
      const newUser = await userModel.create({
        username: 'John Doe',
        age: 30,
        city: 'Tokyo',
      });

      const updateUserDto: UpdateUserDto = {
        username: 'John Updated',
        age: 32,
        city: 'Berlin',
      };
      const updatedUser = await userController.updateUser(
        newUser._id.toString(), // Poslali smo _id.toString() kao validan ID
        updateUserDto,
      );

      expect(updatedUser).not.toBeNull(); // Ovaj assertion osigurava da updatedUser nije null
      if (updatedUser) {
        // Ako nije null, možemo koristiti njegovu vrednost
        expect(updatedUser.username).toBe('John Updated');
        expect(updatedUser.age).toBe(32);
        expect(updatedUser.city).toBe('Berlin');
      }
    });

    it('should return null if user not found', async () => {
      const invalidId = new mongoose.Types.ObjectId(); // Kreiramo validan, ali nepostojeći ObjectId
      const updateUserDto: UpdateUserDto = {
        username: 'Updated Name',
        age: 40,
        city: 'London',
      };
      const result = await userController.updateUser(
        invalidId.toString(),
        updateUserDto,
      );
      expect(result).toBeNull(); // Očekujemo da rezultat bude null jer korisnik nije pronađen
    });
  });

  describe('deleteUser', () => {
    it('should delete and return the user', async () => {
      const newUser = await userModel.create({
        username: 'John Doe',
        age: 30,
        city: 'Tokyo',
      });

      const result = await userController.deleteUser(newUser._id.toString()); // Poslali smo _id.toString()
      expect(result).not.toBeNull(); // Očekujemo da rezultat nije null
      if (result) {
        // Ako rezultat nije null, možemo koristiti njegovu vrednost
        expect(result.username).toBe('John Doe');
        expect(result.age).toBe(30);
        expect(result.city).toBe('Tokyo');
      }
    });

    it('should return null if user not found', async () => {
      const invalidId = new mongoose.Types.ObjectId(); // Kreiramo validan, ali nepostojeći ObjectId
      const result = await userController.deleteUser(invalidId.toString());
      expect(result).toBeNull(); // Očekujemo da rezultat bude null jer korisnik ne postoji
    });
  });
});
