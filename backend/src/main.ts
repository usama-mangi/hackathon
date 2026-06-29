import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

function formatErrors(
  errors: ValidationError[],
  parentProperty = '',
): { property: string; message: string }[] {
  const formatted: { property: string; message: string }[] = [];

  for (const error of errors) {
    const propertyPath = parentProperty
      ? `${parentProperty}.${error.property}`
      : error.property;

    if (error.constraints) {
      formatted.push({
        property: propertyPath,
        message: Object.values(error.constraints).join(', '),
      });
    }

    if (error.children && error.children.length > 0) {
      formatted.push(...formatErrors(error.children, propertyPath));
    }
  }

  return formatted;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Required for Better Auth to handle raw request bodies
  });

  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ResponseInterceptor(reflector));
  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        const formattedErrors = formatErrors(errors);
        return new BadRequestException({ message: formattedErrors });
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
