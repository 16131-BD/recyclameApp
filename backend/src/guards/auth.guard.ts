import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization'];
    
    if (!token) {
      throw new HttpException('No autorizado', HttpStatus.UNAUTHORIZED);
    }

    // Implementa tu lógica de validación de token aquí
    const isValid = this.validateToken(token);
    
    if (!isValid) {
      throw new HttpException('Token inválido', HttpStatus.UNAUTHORIZED);
    }

    return true;
  }

  private validateToken(token: string): boolean {
    // Implementa tu lógica de validación de token
    // Esto es un ejemplo básico
    return token && token.startsWith('Bearer ');
  }
}