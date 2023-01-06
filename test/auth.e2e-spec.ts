import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

const session =
  'AYABeBRGydX6F5mW7n5yYkO60hUAHQABAAdTZXJ2aWNlABBDb2duaXRvVXNlclBvb2xzAAEAB2F3cy1rbXMAS2Fybjphd3M6a21zOnVzLWVhc3QtMTo3NDU2MjM0Njc1NTU6a2V5L2IxNTVhZmNhLWJmMjktNGVlZC1hZmQ4LWE5ZTA5MzY1M2RiZQC4AQIBAHiG0oCCDoro3IaeecGyxCZJOVZkUqttbPnF4J7Ar-5byAGNXLlE5yj6IDWW_d4J0B0fAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMCyQv96W_sYldVp4FAgEQgDtrDNkhHCPvbDp6RThgRiqYkZPKcNUr9iMamS67qRRDCXros_PlUwQ0Tn_n6310hlXmutHDQTgmHqzCcQIAAAAADAAAEAAAAAAAAAAAAAAAAAAdp-AQlPRpEQOqSRlb5Qcr_____wAAAAEAAAAAAAAAAAAAAAEAAAEXj2RxRYF9bG6LF8wuXM4h7MNaon7doGWMFR83Wr4KgNkPe0HyferyH22Hyg4pBtjbmhcmSaospVPOZqZNgrvHtHPN3fby-KVpOdz5rHYsJlWc6arEsjAs7NMmJ0dqX7k-WpHLo8EQ8dSwNvzKAP4cGPs8OgCnzIpEzGliTCfE0XyQ8TQXg2IdHDgsHg9_HvTRZ_irT6Y3l1U4L2dZUrNtZ6SNHcm8TR1ip2oWTNNcF7lVMl6lWJg2JMVmp_5PRUqbSkejzKcguYqucB4FLcHTQ87yRHUoeTHYYzT9P_PSIMw2hhjcMBVlhjPwpcunX8sppSqJZz16W0k39xVh7TOsUNLDNwWwM-OPuSC-ZW8P4v4p4bkU-0H84XJoHWqoYdH1KDlij5POMQ';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('/login (POST)', () => {
    it('should return 2 errors (phoneNumber should not be empty and phoneNumber must be valid) ', async () => {
      const requestBody = {};

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toHaveLength(2);
      expect(response.body.message[0]).toBe(
        'phoneNumber must be a valid phone number',
      );
      expect(response.body.message[1]).toBe('phoneNumber should not be empty');
    });

    it('should return 1 error (phoneNumber must be valid) ', async () => {
      const requestBody = { phoneNumber: '+52552301822' };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toHaveLength(1);
      expect(response.body.message[0]).toBe(
        'phoneNumber must be a valid phone number',
      );
    });

    it('should return success response', async () => {
      const requestBody = { phoneNumber: '+525523018225' };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.session).toBe(session);
    });
  });
});
