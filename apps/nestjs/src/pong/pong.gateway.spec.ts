import { Test, TestingModule } from '@nestjs/testing';
import { PongGateway } from './pong.gateway';

describe('PongGateway', () => {
  let gateway: PongGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PongGateway],
    }).compile();

    gateway = module.get<PongGateway>(PongGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
