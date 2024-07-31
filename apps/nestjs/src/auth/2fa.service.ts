import { Injectable } from "@nestjs/common";
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

@Injectable() 
export class TwoFactorAuthenticationService {
    generateSecret() {
        const secret = speakeasy.generateSecret({
            name: 'Transendence',
            length: 20,
        });

        return {
            otpauthUrl: secret.otpauth_url,
            base32: secret.base32,
        };
    }

    async generateQrcode(otpauthUrl: string) {
        return await qrcode.toDataURL(otpauthUrl);
    }
    
    verifytoken(secret: string, token: string) {
        return speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
        });
    }
}

