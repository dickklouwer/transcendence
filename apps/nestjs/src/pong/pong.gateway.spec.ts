import { Test, TestingModule } from '@nestjs/testing';
import { MultiplayerPongGateway } from './multiplayerPong.gateway';

describe('PongGateway', () => {
  let gateway: MultiplayerPongGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MultiplayerPongGateway],
    }).compile();

    gateway = module.get<MultiplayerPongGateway>(MultiplayerPongGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
