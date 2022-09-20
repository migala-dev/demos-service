import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { IsNotEmpty, IsPhoneNumber } from 'class-validator';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';

const session = 'AYABeBRGydX6F5mW7n5yYkO60hUAHQABAAdTZXJ2aWNlABBDb2duaXRvVXNlclBvb2xzAAEAB2F3cy1rbXMAS2Fybjphd3M6a21zOnVzLWVhc3QtMTo3NDU2MjM0Njc1NTU6a2V5L2IxNTVhZmNhLWJmMjktNGVlZC1hZmQ4LWE5ZTA5MzY1M2RiZQC4AQIBAHiG0oCCDoro3IaeecGyxCZJOVZkUqttbPnF4J7Ar-5byAGNXLlE5yj6IDWW_d4J0B0fAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMCyQv96W_sYldVp4FAgEQgDtrDNkhHCPvbDp6RThgRiqYkZPKcNUr9iMamS67qRRDCXros_PlUwQ0Tn_n6310hlXmutHDQTgmHqzCcQIAAAAADAAAEAAAAAAAAAAAAAAAAAAdp-AQlPRpEQOqSRlb5Qcr_____wAAAAEAAAAAAAAAAAAAAAEAAAEXj2RxRYF9bG6LF8wuXM4h7MNaon7doGWMFR83Wr4KgNkPe0HyferyH22Hyg4pBtjbmhcmSaospVPOZqZNgrvHtHPN3fby-KVpOdz5rHYsJlWc6arEsjAs7NMmJ0dqX7k-WpHLo8EQ8dSwNvzKAP4cGPs8OgCnzIpEzGliTCfE0XyQ8TQXg2IdHDgsHg9_HvTRZ_irT6Y3l1U4L2dZUrNtZ6SNHcm8TR1ip2oWTNNcF7lVMl6lWJg2JMVmp_5PRUqbSkejzKcguYqucB4FLcHTQ87yRHUoeTHYYzT9P_PSIMw2hhjcMBVlhjPwpcunX8sppSqJZz16W0k39xVh7TOsUNLDNwWwM-OPuSC-ZW8P4v4p4bkU-0H84XJoHWqoYdH1KDlij5POMQ';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    public login(@Body() { phoneNumber }: LoginDto): { session: string } {
        return { session };
    }
}
