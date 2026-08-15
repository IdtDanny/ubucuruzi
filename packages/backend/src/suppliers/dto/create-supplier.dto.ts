import { IsString, IsOptional, IsEmail, IsNumber, IsBoolean } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  tin?: string;

  @IsString()
  phone!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSupplierDto extends CreateSupplierDto {}