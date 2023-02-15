import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export async function getJwtonfig(
	configService: ConfigService
): Promise<JwtModuleOptions> {
	return {
		secret: configService.get('JWT_SECRET'),
	};
}
