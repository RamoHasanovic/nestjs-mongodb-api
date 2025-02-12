/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import * as mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { NotFoundException } from '@nestjs/common';

describe('UserService - Integration Tests', () => {
  let service: UserService;
  let mongoServer: MongoMemoryServer;
  let userModel: mongoose.Model<User>;

  // Pokrećemo MongoDB in-memory server pre svih testova
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<UserService>(UserService);

    // Povezivanje sa in-memory MongoDB serverom
    await mongoose.connect(uri);
    userModel = module.get(getModelToken(User.name));
  });

  // Zatvaranje konekcije sa bazom nakon svih testova
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Čistimo bazu pre svakog testa
    await userModel.deleteMany({});
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const newUser = { username: 'John Doe', age: 30, city: 'Tokyo' };

      const result = await service.create(newUser);

      expect(result.username).toBe('John Doe');
      expect(result.age).toBe(30);
      expect(result.city).toBe('Tokyo');
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const user1 = { username: 'John Doe', age: 30, city: 'Tokyo' };
      const user2 = { username: 'Jane Doe', age: 35, city: 'Madrid' };

      await userModel.create(user1);
      await userModel.create(user2);

      const result = await service.findAll();

      expect(result.length).toBe(2);
      expect(result[0].username).toBe('John Doe');
      expect(result[1].username).toBe('Jane Doe');
    });
  });

  describe('findById', () => {
    it('should return a user by ID', async () => {
      const newUser = await userModel.create({
        username: 'John Doe',
        age: 30,
        city: 'Tokyo',
      });

      const result = await service.findById(newUser.id);

      expect(result.username).toBe('John Doe');
      expect(result.age).toBe(30);
      expect(result.city).toBe('Tokyo');
    });

    it('should throw NotFoundException if user not found', async () => {
      try {
        // Koristimo validan MongoDB ObjectId koji ne postoji u bazi
        const invalidId = new mongoose.Types.ObjectId().toString(); // Kreira validan ID
        await service.findById(invalidId);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('updateById', () => {
    it('should update a user successfully', async () => {
      const newUser = await userModel.create({
        username: 'John Doe',
        age: 30,
        city: 'Tokyo',
      });

      const updatedUser = { username: 'John Updated', age: 33, city: 'Oslo' };
      const result = await service.updateById(newUser.id, updatedUser);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.username).toBe('John Updated');
        expect(result.age).toBe(33);
        expect(result.city).toBe('Oslo');
      }
    });
  });

  describe('deleteById', () => {
    it('should delete a user successfully', async () => {
      const newUser = await userModel.create({
        username: 'John Doe',
        age: 30,
        city: 'Tokyo',
      });

      const result = await service.deleteById(newUser.id);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.username).toBe('John Doe');
        expect(result.age).toBe(30);
        expect(result.city).toBe('Tokyo');
      }
    });

    it('should return null if user not found', async () => {
      const invalidId = new mongoose.Types.ObjectId().toString(); // Kreira validan ID koji ne postoji u bazi
      const result = await service.deleteById(invalidId);
      expect(result).toBeNull();
    });
  });
});
